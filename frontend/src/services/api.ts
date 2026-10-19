import type {
  HealthStatus,
  DatasetOverview,
  PaginatedRecordsResponse,
  BehaviourAnalyticsSummary,
  ModelComparisonResponse,
  PredictionPayload,
  PredictionResponse,
  LabSummaryItem,
  LabDetailResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = `API Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore parse error
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getHealth: (): Promise<HealthStatus> => fetchJson<HealthStatus>('/health'),

  // Dataset
  getDatasetOverview: (): Promise<DatasetOverview> => fetchJson<DatasetOverview>('/dataset/overview'),

  getDatasetRecords: (params?: {
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_dir?: string;
    search?: string;
    target_filter?: number;
  }): Promise<PaginatedRecordsResponse> => {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.page_size) q.append('page_size', params.page_size.toString());
    if (params?.sort_by) q.append('sort_by', params.sort_by);
    if (params?.sort_dir) q.append('sort_dir', params.sort_dir);
    if (params?.search) q.append('search', params.search);
    if (params?.target_filter !== undefined && params?.target_filter !== null) {
      q.append('target_filter', params.target_filter.toString());
    }
    return fetchJson<PaginatedRecordsResponse>(`/dataset/records?${q.toString()}`);
  },

  getExportCsvUrl: (targetFilter?: number): string => {
    const q = targetFilter !== undefined && targetFilter !== null ? `?target_filter=${targetFilter}` : '';
    return `${API_BASE}/dataset/export${q}`;
  },

  // Donor Behaviour Analytics
  getAnalyticsSummary: (): Promise<BehaviourAnalyticsSummary> =>
    fetchJson<BehaviourAnalyticsSummary>('/analytics/summary'),

  // ML Models
  getModelComparison: (): Promise<ModelComparisonResponse> =>
    fetchJson<ModelComparisonResponse>('/models/comparison'),

  retrainModels: (): Promise<ModelComparisonResponse> =>
    fetchJson<ModelComparisonResponse>('/models/retrain', { method: 'POST' }),

  // Live Prediction
  predictDonor: (payload: PredictionPayload): Promise<PredictionResponse> =>
    fetchJson<PredictionResponse>('/predict', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // DWDM Labs Suite
  getLabsList: (): Promise<{ labs: LabSummaryItem[] }> =>
    fetchJson<{ labs: LabSummaryItem[] }>('/labs'),

  getLabDetails: (labId: number): Promise<LabDetailResponse> =>
    fetchJson<LabDetailResponse>(`/labs/${labId}`),

  // Lab 02 OLAP Operations
  getOlapSummary: (): Promise<any> => fetchJson<any>('/lab2/summary'),

  executeRollup: (payload: { dimension: string; target_level: string }): Promise<any> =>
    fetchJson<any>('/lab2/rollup', { method: 'POST', body: JSON.stringify(payload) }),

  executeDrilldown: (payload: { dimension: string; selected_tier?: string }): Promise<any> =>
    fetchJson<any>('/lab2/drilldown', { method: 'POST', body: JSON.stringify(payload) }),

  executeSlice: (payload: { dimension: string; value: string }): Promise<any> =>
    fetchJson<any>('/lab2/slice', { method: 'POST', body: JSON.stringify(payload) }),

  executeDice: (payload: {
    recency_tiers: string[];
    frequency_tiers: string[];
    tenure_tiers: string[];
    status_filter: string;
  }): Promise<any> =>
    fetchJson<any>('/lab2/dice', { method: 'POST', body: JSON.stringify(payload) }),

  executePivot: (payload: { row_dim: string; col_dim: string; measure: string }): Promise<any> =>
    fetchJson<any>('/lab2/pivot', { method: 'POST', body: JSON.stringify(payload) }),

  getCubeData: (payload: { z_filter: string; measure: string }): Promise<any> =>
    fetchJson<any>('/lab2/cube', { method: 'POST', body: JSON.stringify(payload) }),

  // Lab 03 EDA & Visualization
  getEdaOverview: (): Promise<any> => fetchJson<any>('/lab3/overview'),

  executeEdaFilter: (payload: {
    recency_range?: [number, number];
    frequency_range?: [number, number];
    tenure_range?: [number, number];
    target_filter?: string;
  }): Promise<any> =>
    fetchJson<any>('/lab3/explore', { method: 'POST', body: JSON.stringify(payload) }),

  // Lab 04 Simple & Multiple Linear Regression
  getRegressionOverview: (): Promise<any> => fetchJson<any>('/lab4/overview'),

  predictMonetary: (payload: {
    model_type: string;
    frequency: number;
    recency?: number;
    time?: number;
  }): Promise<any> =>
    fetchJson<any>('/lab4/predict', { method: 'POST', body: JSON.stringify(payload) }),

  // Lab 05 Attribute Relevance & Decision Tree Classification
  getLab5Overview: (): Promise<any> => fetchJson<any>('/lab5/overview'),

  trainDecisionTree: (payload: {
    selected_features?: string[];
    max_depth?: number;
    min_samples_leaf?: number;
    criterion?: string;
  }): Promise<any> =>
    fetchJson<any>('/lab5/train', { method: 'POST', body: JSON.stringify(payload) }),

  predictLab5Record: (payload: {
    recency: number;
    frequency: number;
    monetary?: number;
    time: number;
    selected_features?: string[];
    max_depth?: number;
    min_samples_leaf?: number;
  }): Promise<any> =>
    fetchJson<any>('/lab5/predict', { method: 'POST', body: JSON.stringify(payload) }),

  // Lab 06 Gaussian Naïve Bayes Classification
  getLab6Overview: (): Promise<any> => fetchJson<any>('/lab6/overview'),

  predictLab6NaiveBayes: (payload: {
    recency: number;
    frequency: number;
    monetary?: number;
    time: number;
  }): Promise<any> =>
    fetchJson<any>('/lab6/predict', { method: 'POST', body: JSON.stringify(payload) }),

  // Lab 07 K-Means Clustering
  getLab7Overview: (): Promise<any> => fetchJson<any>('/lab7/overview'),

  clusterKMeans: (payload: {
    k: number;
    features?: string[];
    use_scaling?: boolean;
    x_axis_feature?: string;
    y_axis_feature?: string;
  }): Promise<any> =>
    fetchJson<any>('/lab7/cluster', { method: 'POST', body: JSON.stringify(payload) }),

  // Lab 08 Hierarchical Agglomerative Clustering
  getLab8Overview: (): Promise<any> => fetchJson<any>('/lab8/overview'),

  clusterHierarchical: (payload: {
    k: number;
    linkage_method?: string;
    features?: string[];
    x_axis_feature?: string;
    y_axis_feature?: string;
  }): Promise<any> =>
    fetchJson<any>('/lab8/cluster', { method: 'POST', body: JSON.stringify(payload) }),

  // Lab 09 Apriori Association Rule Mining
  getLab9Overview: (): Promise<any> => fetchJson<any>('/lab9/overview'),

  mineAprioriRules: (payload: {
    dataset_type?: string;
    min_support?: number;
    min_confidence?: number;
    min_lift?: number;
    max_rules?: number;
  }): Promise<any> =>
    fetchJson<any>('/lab9/mine', { method: 'POST', body: JSON.stringify(payload) }),

  uploadCustomTransactionsRaw: (csv_text: string): Promise<any> =>
    fetchJson<any>('/lab9/upload-raw', { method: 'POST', body: JSON.stringify({ csv_text }) })
};


