export interface TagItem {
  tag: string;
  reason: string;
  ruleType?: string;
  conditionMet?: 'A' | 'B' | 'Both';
  estimatedVolume?: number;
  estimatedView?: number;
  verifiedInDatabase?: boolean;
  exactViews2Years?: number;
  exactSearchVolume?: number;
}

export interface AnalyzeResponse {
  success: boolean;
  mode: 'demo' | 'production';
  detectedCategory: string;
  appliedTemplates: string[];
  formattedTags: string;
  tags: TagItem[];
  seoManagerExplanation: string;
  analyzedAt: string;
  isFallbackRuleEngine?: boolean;
  notice?: string;
}

export interface SampleArticle {
  id: number;
  url: string;
  title: string;
  content: string;
  category?: string;
  tags: Array<{
    tag: string;
    reason: string;
  }>;
  createdAt: string;
}

export interface TaxTagMetric {
  tag: string;
  type: 'tag' | 'taxonomy';
  views_2years: number;
  search_volume_monthly: number;
  category: string;
}
