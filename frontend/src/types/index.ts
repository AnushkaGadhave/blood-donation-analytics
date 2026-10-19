export type ActiveView = 
  | 'dashboard'
  | 'dataset'
  | 'behaviour'
  | 'models'
  | 'predict'
  | 'labs'
  | 'about';

export interface HealthStatus {
  status: string;
  app?: string;
  app_name?: string;
  version: string;
  dataset_present?: boolean;
  dataset_path?: string;
  environment?: string;
}

export interface DataDictionaryItem {
  name: string;
  original_header: string;
  rfm_code: string;
  description: string;
  type: string;
  unit: string;
  min: number;
  max: number;
  role: string;
}

export interface NumericFeatureStats {
  count: number;
  mean: number;
  std: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  skewness: number;
}

export interface DatasetOverview {
  title: string;
  source_citation: string;
  uci_url: string;
  domain: string;
  total_instances: number;
  total_attributes: number;
  target_variable: string;
  class_distribution: {
    positive_donors_count: number;
    positive_donors_pct: number;
    negative_donors_count: number;
    negative_donors_pct: number;
    imbalance_ratio: string;
  };
  quality_audit: {
    missing_values_total: number;
    missing_by_column: Record<string, number>;
    duplicate_profiles_count: number;
    duplicate_definition: string;
    collinearity_invariant: string;
  };
  descriptive_statistics: Record<string, NumericFeatureStats>;
  data_dictionary: DataDictionaryItem[];
}

export interface DonorRecord {
  donor_id: number;
  recency_months: number;
  frequency_times: number;
  monetary_cc: number;
  time_months: number;
  donated_march_2007: number;
}

export interface PaginatedRecordsResponse {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
  records: DonorRecord[];
}

export interface HistogramBin {
  bin_range: string;
  bin_start: number;
  bin_end: number;
  count: number;
  percentage: number;
}

export interface FeatureDistribution {
  feature: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  mean: number;
  median: number;
  std: number;
  skewness: number;
  bins: HistogramBin[];
}

export interface FeatureClassComparison {
  feature: string;
  label: string;
  donors_y1: NumericFeatureStats;
  non_donors_y0: NumericFeatureStats;
  difference_in_means: number;
  relative_change_pct: number;
}

export interface ClassComparisonResponse {
  total_instances: number;
  donors_count: number;
  non_donors_count: number;
  features_comparison: FeatureClassComparison[];
}

export interface ScatterPoint {
  donor_id: number;
  recency: number;
  frequency: number;
  monetary: number;
  time: number;
  donated: number;
  class_label: string;
}

export interface CorrelationItem {
  feature: string;
  correlation_with_target: number;
  interpretation: string;
}

export interface CorrelationMatrixResponse {
  columns: string[];
  labels: string[];
  pearson_matrix: Array<Record<string, string | number>>;
  collinearity_note: string;
  target_correlations: CorrelationItem[];
}

export interface BehaviourAnalyticsSummary {
  univariate_distributions: Record<string, FeatureDistribution>;
  class_comparisons: ClassComparisonResponse;
  scatter_relations: ScatterPoint[];
  correlation_matrix: CorrelationMatrixResponse;
  key_insights: Array<{ title: string; detail: string }>;
}

export interface ConfusionMatrixInfo {
  matrix: number[][];
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
  true_positives: number;
  total_test_samples: number;
}

export interface ModelMetrics {
  accuracy: number;
  balanced_accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  f1_score: number;
  roc_auc: number;
}

export interface ClassifierBenchmark {
  model_name: string;
  description: string;
  metrics: ModelMetrics;
  confusion_matrix: ConfusionMatrixInfo;
  roc_curve: Array<{ fpr: number; tpr: number }>;
  pr_curve: Array<{ recall: number; precision: number }>;
  hyperparameters: Record<string, string>;
}

export interface ModelComparisonResponse {
  dataset_split: {
    train_records: number;
    test_records: number;
    split_ratio: string;
    train_positives: number;
    train_negatives: number;
    test_positives: number;
    test_negatives: number;
    random_state: number;
  };
  models_comparison: ClassifierBenchmark[];
  best_model_name: string;
  feature_importance: Array<{ feature: string; importance: number; percentage: number }>;
  evaluation_tradeoff_summary: {
    primary_metric: string;
    tradeoff_explanation: string;
  };
}

export interface PredictionPayload {
  recency_months: number;
  frequency_times: number;
  monetary_cc: number;
  time_months: number;
}

export interface PredictionResponse {
  success: boolean;
  errors?: string[];
  inputs?: PredictionPayload;
  monetary_consistency_note?: string;
  prediction?: {
    class_code: number;
    class_label: string;
    probability_percentage: number;
    non_donation_probability: number;
    confidence_tier: string;
    donor_category: string;
    operational_recommendation: string;
    model_used: string;
  };
  disclaimer?: string;
}

export interface LabSummaryItem {
  id: number;
  title: string;
  topic: string;
  status: string;
}

export interface LabDetailResponse {
  lab_id: number;
  title: string;
  aim: string;
  observation: string;
  conclusion: string;
  [key: string]: any;
}
