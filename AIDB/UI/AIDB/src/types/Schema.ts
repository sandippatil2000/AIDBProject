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
  | 'mixed'
  // ── New extended chart types ───────────────────────
  | 'horizontalBar'   // Bar chart with indexAxis: 'y'
  | 'stackedBar'      // Stacked bar chart
  | 'comboBarLine'    // Mixed bar + line datasets
  | 'multiAxisLine'   // Line chart with dual Y axes
  | 'lineDrawTime';   // Filled line with explicit filler drawTime

export interface ChartRecommendation {
  chartType: ChartType;
  labelField: string;
  valueFields: string[];
  title: string;
  reasoning: string;
}

export interface TableSchema {
  tableName: string;
  columns: string[];
}

export interface DatabaseSchema {
  schemaStructured: TableSchema[];
  schemaRaw: string[];
}

