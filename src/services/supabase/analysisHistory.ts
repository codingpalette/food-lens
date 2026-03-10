import AsyncStorage from '@react-native-async-storage/async-storage';
import { File as ExpoFile } from 'expo-file-system';

import { getSupabaseClient } from '@/services/supabase/client';
import type {
  AnalysisMode,
  AnalysisResult,
  ComparisonResult,
} from '@/types/analysis';

const ANALYSIS_BUCKET = 'analysis-images';
const ANALYSIS_TABLE = 'analysis_history';
const DEVICE_ID_KEY = 'supabase_device_id';

export type PersistedAnalysisInput = {
  imageUri: string;
  mode: AnalysisMode;
  result: AnalysisResult | ComparisonResult;
  userId: string;
};

export type PersistedAnalysisRecord = {
  deviceId: string;
  id: string;
  imagePath: string | null;
};

export type AnalysisHistoryRow = {
  created_at: string;
  id: string;
  image_path: string | null;
  mode: AnalysisMode;
  result: AnalysisResult | ComparisonResult;
  user_id: string;
};

async function getDeviceId() {
  const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existingId) {
    return existingId;
  }

  const deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

function getFileExtension(imageUri: string) {
  const sanitizedUri = imageUri.split('?')[0] ?? '';
  const extension = sanitizedUri.split('.').pop()?.toLowerCase();

  if (extension === 'png' || extension === 'webp' || extension === 'heic') {
    return extension;
  }

  return 'jpg';
}

function getContentType(extension: string) {
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    default:
      return 'image/jpeg';
  }
}

async function uploadImage(userId: string, imageUri: string, mode: AnalysisMode) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const extension = getFileExtension(imageUri);
  const imagePath = `${userId}/${mode}-${Date.now()}.${extension}`;
  const file = new ExpoFile(imageUri);
  const fileBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(ANALYSIS_BUCKET)
    .upload(imagePath, fileBuffer, {
      contentType: getContentType(extension),
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return imagePath;
}

export async function persistAnalysisRecord(
  input: PersistedAnalysisInput
): Promise<PersistedAnalysisRecord | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const deviceId = await getDeviceId();
  const imagePath = await uploadImage(input.userId, input.imageUri, input.mode);

  const { data, error } = await supabase
    .from(ANALYSIS_TABLE)
    .insert({
      device_id: deviceId,
      image_path: imagePath,
      mode: input.mode,
      result: input.result,
      user_id: input.userId,
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return {
    deviceId,
    id: String(data.id),
    imagePath,
  };
}

export async function listAnalysisHistory(userId: string): Promise<AnalysisHistoryRow[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(ANALYSIS_TABLE)
    .select('id, created_at, image_path, mode, result, user_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AnalysisHistoryRow[];
}

export async function getAnalysisHistoryItem(
  userId: string,
  id: string
): Promise<AnalysisHistoryRow | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from(ANALYSIS_TABLE)
    .select('id, created_at, image_path, mode, result, user_id')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as AnalysisHistoryRow | null) ?? null;
}
