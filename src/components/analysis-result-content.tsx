import { Trophy, Star } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/theme';
import type { AnalysisResult, ComparisonResult } from '@/types/analysis';

export function isComparisonResult(
  result: AnalysisResult | ComparisonResult
): result is ComparisonResult {
  return 'winner' in result;
}

function getDetailLabel(key: string) {
  switch (key) {
    case 'sugar':
      return '당류';
    case 'sodium':
      return '나트륨';
    case 'additives':
      return '첨가물';
    case 'calories':
      return '칼로리';
    default:
      return key;
  }
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 7 ? BrandColors.emerald : score >= 4 ? '#F59E0B' : BrandColors.red;

  return (
    <View style={[styles.scoreBadge, { backgroundColor: color }]}>
      <Star size={16} color={BrandColors.white} />
      <Text style={styles.scoreText}>{score}/10</Text>
    </View>
  );
}

function IngredientCard({
  result,
  label,
}: {
  result: AnalysisResult;
  label?: string;
}) {
  const details = Object.entries(result.details).filter(([, value]) => Boolean(value));

  return (
    <View style={styles.card}>
      {label ? <Text style={styles.cardLabel}>{label}</Text> : null}
      <View style={styles.cardHeader}>
        <Text style={styles.productName}>{result.productName}</Text>
        <ScoreBadge score={result.overallScore} />
      </View>

      <Text style={styles.summary}>{result.summary}</Text>

      <View style={styles.detailsRow}>
        {details.map(([key, value]) => (
          <View key={key} style={styles.detailItem}>
            <Text style={styles.detailLabel}>{getDetailLabel(key)}</Text>
            <Text style={styles.detailValue}>{value}</Text>
          </View>
        ))}
      </View>

      {result.goodIngredients.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>좋은 성분</Text>
          {result.goodIngredients.map((ingredient) => (
            <View key={ingredient.name} style={styles.ingredientRow}>
              <View style={[styles.dot, styles.goodDot]} />
              <View style={styles.ingredientInfo}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientDesc}>{ingredient.description}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {result.cautionIngredients.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주의 성분</Text>
          {result.cautionIngredients.map((ingredient) => (
            <View key={ingredient.name} style={styles.ingredientRow}>
              <View style={[styles.dot, styles.cautionDot]} />
              <View style={styles.ingredientInfo}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientDesc}>{ingredient.description}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function AnalysisResultContent({
  result,
}: {
  result: AnalysisResult | ComparisonResult;
}) {
  if (isComparisonResult(result)) {
    const winner = result.winner === 'A' ? result.productA : result.productB;

    return (
      <>
        <View style={styles.winnerBanner}>
          <Trophy size={28} color={BrandColors.emerald} />
          <Text style={styles.winnerText}>승자: {winner.productName}</Text>
          <Text style={styles.winnerReason}>{result.winnerReason}</Text>
        </View>
        <IngredientCard result={result.productA} label="제품 A" />
        <IngredientCard result={result.productB} label="제품 B" />
      </>
    );
  }

  return <IngredientCard result={result} />;
}

const styles = StyleSheet.create({
  winnerBanner: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: BrandColors.emerald,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  winnerText: {
    fontSize: 20,
    fontWeight: '800',
    color: BrandColors.emerald,
    textAlign: 'center',
  },
  winnerReason: {
    fontSize: 14,
    color: BrandColors.gray,
    textAlign: 'center',
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.emerald,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  productName: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: BrandColors.charcoal,
    flex: 1,
    flexShrink: 1,
    paddingTop: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 2,
  },
  scoreText: {
    color: BrandColors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  summary: {
    fontSize: 14,
    color: BrandColors.gray,
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: BrandColors.grayLight,
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    gap: 8,
  },
  detailItem: {
    width: '47%',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: BrandColors.gray,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  section: {
    marginTop: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.charcoal,
    marginBottom: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  goodDot: {
    backgroundColor: BrandColors.emerald,
  },
  cautionDot: {
    backgroundColor: BrandColors.red,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: '600',
    color: BrandColors.charcoal,
  },
  ingredientDesc: {
    fontSize: 13,
    color: BrandColors.gray,
    marginTop: 2,
  },
});
