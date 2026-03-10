export interface Ingredient {
  name: string;
  status: 'good' | 'caution' | 'neutral';
  description: string;
}

export interface AnalysisResult {
  productName: string;
  overallScore: number; // 1-10
  summary: string;
  goodIngredients: Ingredient[];
  cautionIngredients: Ingredient[];
  details: {
    sugar: string;
    sodium: string;
    additives: string;
    calories?: string;
  };
}

export interface ComparisonResult {
  productA: AnalysisResult;
  productB: AnalysisResult;
  winner: 'A' | 'B';
  winnerReason: string;
}

export type AnalysisMode = 'single' | 'battle';
