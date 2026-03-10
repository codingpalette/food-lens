import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isComparisonResult } from '@/components/analysis-result-content';
import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import {
  listAnalysisHistory,
  type AnalysisHistoryRow,
} from '@/services/supabase/analysisHistory';
import type { AnalysisResult, ComparisonResult } from '@/types/analysis';

function HistoryCard({
  item,
  onPress,
}: {
  item: AnalysisHistoryRow;
  onPress: () => void;
}) {
  const result = item.result;
  let single: AnalysisResult;
  let comparison: ComparisonResult | null = null;

  if (isComparisonResult(result)) {
    comparison = result;
    single = comparison.winner === 'A' ? comparison.productA : comparison.productB;
  } else {
    single = result;
  }

  const details = single.details;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.productName}>
          {comparison ? `승자: ${single.productName}` : single.productName}
        </Text>
        <View style={styles.cardHeaderRight}>
          <Text style={styles.score}>{single.overallScore}/10</Text>
          <ChevronRight size={18} color={BrandColors.gray} />
        </View>
      </View>
      <Text style={styles.summary}>
        {comparison ? comparison.winnerReason : single.summary}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{item.mode === 'battle' ? '비교 분석' : '단일 분석'}</Text>
        <Text style={styles.metaText}>
          {new Date(item.created_at).toLocaleDateString('ko-KR')}
        </Text>
      </View>
      <Text style={styles.detailText}>
        당류 {details.sugar} · 나트륨 {details.sodium} · 첨가물 {details.additives}
      </Text>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { initialized, user } = useAuth();
  const isFocused = useIsFocused();
  const [items, setItems] = useState<AnalysisHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setItems([]);
        setLoading(false);
        setRefreshing(false);
        setError(null);
        return;
      }

      try {
        setError(null);
        const rows = await listAnalysisHistory(user.id);
        setItems(rows);
      } catch {
        setError('기록을 불러오지 못했습니다. 정책과 테이블 구조를 확인해주세요.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    if (isFocused) {
      setLoading(true);
      load();
    }
  }, [isFocused, reloadNonce, user]);

  const onRefresh = () => {
    setRefreshing(true);
    setReloadNonce((value) => value + 1);
  };

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
        <Text style={styles.emptyTitle}>로그인이 필요합니다</Text>
        <Text style={styles.emptyText}>
          로그인한 사용자만 서버에 저장된 분석 기록을 볼 수 있습니다.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>내 분석 기록</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>새로고침</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>저장된 기록이 없습니다</Text>
            <Text style={styles.emptyText}>
              로그인 상태에서 분석을 실행하면 여기에서 다시 볼 수 있습니다.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              onPress={() => router.push(`/history/${item.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.grayLight,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.white,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: BrandColors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.charcoal,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: BrandColors.emeraldLight,
  },
  refreshButtonText: {
    color: BrandColors.emeraldDark,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 18,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  score: {
    fontSize: 16,
    fontWeight: '800',
    color: BrandColors.emerald,
  },
  summary: {
    marginTop: 10,
    color: BrandColors.gray,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metaText: {
    color: BrandColors.gray,
    fontSize: 12,
    fontWeight: '600',
  },
  detailText: {
    marginTop: 10,
    color: BrandColors.charcoal,
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.charcoal,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    color: BrandColors.gray,
    lineHeight: 20,
  },
  errorText: {
    color: BrandColors.red,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
