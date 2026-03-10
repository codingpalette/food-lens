// @ts-nocheck
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANALYSIS_BUCKET = 'analysis-images';
const ANALYSIS_TABLE = 'analysis_history';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authorization = request.headers.get('Authorization');

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      throw new Error('Supabase function secrets are not configured.');
    }

    if (!authorization) {
      return jsonResponse(
        {
          error: 'Missing authorization header.',
        },
        401
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse(
        {
          error: 'User not found.',
        },
        401
      );
    }

    const { data: historyRows, error: historyError } = await admin
      .from(ANALYSIS_TABLE)
      .select('image_path')
      .eq('user_id', user.id);

    if (historyError) {
      throw historyError;
    }

    const imagePaths = (historyRows ?? [])
      .map((row) => row.image_path)
      .filter((path) => typeof path === 'string' && path.length > 0);

    if (imagePaths.length > 0) {
      const { error: storageError } = await admin.storage
        .from(ANALYSIS_BUCKET)
        .remove(imagePaths);

      if (storageError) {
        throw storageError;
      }
    }

    const { error: deleteHistoryError } = await admin
      .from(ANALYSIS_TABLE)
      .delete()
      .eq('user_id', user.id);

    if (deleteHistoryError) {
      throw deleteHistoryError;
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      throw deleteUserError;
    }

    return jsonResponse({
      success: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse(
      {
        error: message,
      },
      500
    );
  }
});

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
