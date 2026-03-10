import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnalysisResultContent } from '@/components/analysis-result-content';
import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import { analyzeSingleProduct, compareProducts } from '@/services/aiApi';
import { persistAnalysisRecord } from '@/services/supabase/analysisHistory';
import { isSupabaseConfigured } from '@/services/supabase/client';
import type {
  AnalysisMode,
  AnalysisResult,
  ComparisonResult,
} from '@/types/analysis';

export default function ResultScreen() {
  const router = useRouter();
  const { initialized, user } = useAuth();
  const { imageUri, imageUriA, imageUriB, mode } = useLocalSearchParams<{
    imageUri: string;
    imageUriA?: string;
    imageUriB?: string;
    mode: AnalysisMode;
  }>();
  const primaryImageUri = mode === 'battle' ? imageUriA ?? '' : imageUri ?? '';

  const [loading, setLoading] = useState(true);
  const [singleResult, setSingleResult] = useState<AnalysisResult | null>(null);
  const [comparisonResult, setComparisonResult] =
    useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const persistedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const analyze = async () => {
      try {
        setLoading(true);
        setError(null);
        setSaveMessage(null);
        persistedKeyRef.current = null;
        if (mode === 'battle') {
          if (!imageUriA || !imageUriB) {
            throw new Error('비교할 두 장의 사진이 모두 필요합니다.');
          }
          const result = await compareProducts(imageUriA, imageUriB);
          setComparisonResult(result);
        } else {
          const result = await analyzeSingleProduct(imageUri ?? '');
          setSingleResult(result);
        }
      } catch (analysisError) {
        setError(
          analysisError instanceof Error
            ? analysisError.message
            : '분석 중 오류가 발생했습니다. 다시 시도해주세요.'
        );
      } finally {
        setLoading(false);
      }
    };
    analyze();
  }, [imageUri, imageUriA, imageUriB, mode]);

  useEffect(() => {
    const result = mode === 'battle' ? comparisonResult : singleResult;

    if (!primaryImageUri || !result) {
      return;
    }

    const persistKey =
      mode === 'battle'
        ? `${mode}:${imageUriA ?? ''}:${imageUriB ?? ''}`
        : `${mode ?? 'single'}:${imageUri ?? ''}`;
    if (persistedKeyRef.current === persistKey) {
      return;
    }

    if (!isSupabaseConfigured) {
      setSaveMessage('저장 기능이 비활성화되어 있습니다.');
      return;
    }

    if (!initialized) {
      return;
    }

    if (!user) {
      setSaveMessage('로그인하면 분석 기록이 계정에 저장됩니다.');
      return;
    }

    let cancelled = false;

    const persist = async () => {
      try {
        await persistAnalysisRecord({
          imageUri: primaryImageUri,
          mode: mode ?? 'single',
          result,
          userId: user.id,
        });

        if (!cancelled) {
          persistedKeyRef.current = persistKey;
          setSaveMessage('분석 기록이 계정에 저장되었습니다.');
        }
      } catch (persistError) {
        console.warn('Failed to persist analysis record', persistError);
        if (!cancelled) {
          setSaveMessage('분석은 완료되었지만 기록 저장은 실패했습니다.');
        }
      }
    };

    persist();

    return () => {
      cancelled = true;
    };
  }, [
    comparisonResult,
    imageUri,
    imageUriA,
    imageUriB,
    initialized,
    mode,
    primaryImageUri,
    singleResult,
    user,
  ]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={BrandColors.emerald} />
        <Text style={styles.loadingText}>AI가 성분을 분석하고 있습니다...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {mode === 'battle' && comparisonResult ? (
        <AnalysisResultContent result={comparisonResult} />
      ) : singleResult ? (
        <AnalysisResultContent result={singleResult} />
      ) : null}

      {saveMessage ? (
        <View style={styles.saveNotice}>
          <Text style={styles.saveNoticeText}>{saveMessage}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace('/')}
        activeOpacity={0.8}
      >
        <ArrowLeft size={20} color={BrandColors.white} />
        <Text style={styles.homeButtonText}>홈으로 돌아가기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.grayLight,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    padding: 24,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: BrandColors.gray,
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: BrandColors.red,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: BrandColors.emerald,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  saveNotice: {
    backgroundColor: BrandColors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: BrandColors.grayBorder,
  },
  saveNoticeText: {
    color: BrandColors.gray,
    fontSize: 14,
    textAlign: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BrandColors.emerald,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  homeButtonText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
