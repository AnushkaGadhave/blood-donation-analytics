export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  dataset_present: boolean;
  dataset_path: string;
  environment: string;
}

export interface RFMAttribute {
  code: 'R' | 'F' | 'M' | 'T' | 'Class';
  name: string;
  unit: string;
  description: string;
  role: string;
}

export type ActiveTab = 'overview' | 'preprocessing' | 'eda' | 'classification' | 'clustering' | 'association';
