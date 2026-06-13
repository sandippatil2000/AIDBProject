// ─── Chart config type ────────────────────────────────────────────────────────
import type { ChartData, ChartOptions } from 'chart.js';
import type { ChartRecommendation } from './Schema';

export interface ChartConfig {
    recommendation: ChartRecommendation;
    chartData: ChartData;
    chartOptions: ChartOptions;
}
