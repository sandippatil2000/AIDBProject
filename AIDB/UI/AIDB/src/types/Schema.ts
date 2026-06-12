export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'categorical';

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  isNumeric: boolean;
  isDate: boolean;
  isCategorical: boolean;
  sampleValues: unknown[];
}

export interface JsonSchema {
  fields: FieldSchema[];
  rowCount: number;
  domain: string;
}

export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'doughnut'
  | 'radar'
  | 'polarArea'
  | 'bubble'
  | 'scatter'
  | 'area'
  | 'mixed';

export interface ChartRecommendation {
  chartType: ChartType;
  labelField: string;
  valueFields: string[];
  title: string;
  reasoning: string;
}
