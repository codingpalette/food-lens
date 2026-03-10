import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';

import { getSupabaseClient } from '@/services/supabase/client';

const DELETE_ACCOUNT_FUNCTION = 'delete-account';

type DeleteAccountResponse = {
  success?: boolean;
};

export async function deleteCurrentAccount() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('로그인 설정을 확인해주세요.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('로그인 세션이 없습니다. 다시 로그인한 뒤 시도해주세요.');
  }

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError) {
    throw new Error('로그인 세션을 갱신하지 못했습니다. 다시 로그인한 뒤 시도해주세요.');
  }

  if (!refreshed.session?.access_token) {
    throw new Error('유효한 로그인 세션이 없습니다. 다시 로그인한 뒤 시도해주세요.');
  }

  const { data, error } = await supabase.functions.invoke<DeleteAccountResponse>(
    DELETE_ACCOUNT_FUNCTION,
    {
      body: {},
      timeout: 15000,
    }
  );

  if (error) {
    throw await toAccountDeletionError(error);
  }

  if (!data?.success) {
    throw new Error('회원탈퇴 처리 결과를 확인하지 못했습니다.');
  }

  const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
  if (signOutError) {
    throw new Error(signOutError.message);
  }
}

async function toAccountDeletionError(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    const response = error.context as Response;
    const message = await readFunctionErrorMessage(response);

    if (message?.toLowerCase().includes('invalid jwt')) {
      return new Error('로그인 세션이 만료되었습니다. 로그아웃 후 다시 로그인해서 시도해주세요.');
    }

    if (response.status === 404) {
      return new Error('회원탈퇴 함수를 아직 배포하지 않았습니다.');
    }

    if (response.status === 401) {
      return new Error(message ?? '로그인 세션을 확인한 뒤 다시 시도해주세요.');
    }

    if (response.status >= 500) {
      return new Error(
        message ??
          '회원탈퇴 서버 처리에 실패했습니다. Edge Function 배포와 secret 설정을 확인해주세요.'
      );
    }

    return new Error(message ?? '회원탈퇴 처리 중 오류가 발생했습니다.');
  }

  if (error instanceof FunctionsRelayError) {
    return new Error('회원탈퇴 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }

  if (error instanceof FunctionsFetchError) {
    return new Error('네트워크 오류로 회원탈퇴 요청을 보내지 못했습니다.');
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('회원탈퇴 처리 중 알 수 없는 오류가 발생했습니다.');
}

async function readFunctionErrorMessage(response: Response) {
  try {
    const contentType = response.headers.get('Content-Type') ?? '';
    if (contentType.includes('application/json')) {
      const body = (await response.json()) as { error?: string; message?: string };
      return body.error ?? body.message ?? null;
    }

    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
}
