import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnalysisResultContent } from '@/components/analysis-result-content';
import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import {
  getAnalysisHistoryItem,
  type AnalysisHistoryRow,
} from '@/services/supabase/analysisHistory';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { initialized, user } = useAuth();
  const [item, setItem] = useState<AnalysisHistoryRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!initialized) {
        return;
      }

      if (!user || !id) {
        setItem(null);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);
        const row = await getAnalysisHistoryItem(user.id, id);

        if (!row) {
          setError('해당 기록을 찾을 수 없습니다.');
          setItem(null);
          return;
        }

        setItem(row);
      } catch {
        setError('기록 상세를 불러오지 못했습니다.');
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, initialized, user]);

  if (!initialized || loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={BrandColors.emerald} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>로그인이 필요합니다</Text>
        <Text style={styles.description}>
          로그인한 사용자만 저장된 기록 상세를 볼 수 있습니다.
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error ?? '기록을 찾을 수 없습니다.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>저장된 분석</Text>
          <Text style={styles.metaTitle}>
            {item.mode === 'battle' ? '비교 분석 기록' : '단일 분석 기록'}
          </Text>
          <Text style={styles.metaDescription}>
            {new Date(item.created_at).toLocaleString('ko-KR')}
          </Text>
        </View>

        <AnalysisResultContent result={item.result} />
      </ScrollView>
    </SafeAreaView>
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.white,
    paddingHorizontal: 24,
  },
  metaCard: {
    backgroundColor: BrandColors.charcoal,
    borderRadius: 18,
    padding: 20,
    gap: 6,
  },
  metaLabel: {
    color: BrandColors.emeraldLight,
    fontSize: 13,
    fontWeight: '700',
  },
  metaTitle: {
    color: BrandColors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  metaDescription: {
    color: '#D1D5DB',
    fontSize: 13,
  },
  title: {
    color: BrandColors.charcoal,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    color: BrandColors.gray,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorText: {
    color: BrandColors.red,
    fontSize: 15,
    textAlign: 'center',
  },
});
