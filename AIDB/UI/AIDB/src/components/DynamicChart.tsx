import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  BubbleController,
  ScatterController,
  BarController,
  LineController,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Bubble,
  Scatter,
  Chart,           // Used for mixed/combo charts (bar + line datasets)
} from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import type { ChartType } from '../types/Schema';

// ─── Register all required Chart.js components ───────────────────────────────
// BarController and LineController are required for the mixed Chart component.
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  BubbleController,
  ScatterController,
  BarController,
  LineController,
  Filler,
  Tooltip,
  Legend
);

interface DynamicChartProps {
  chartType: ChartType;
  chartData: ChartData;
  chartOptions: ChartOptions;
}

const DynamicChart: React.FC<DynamicChartProps> = ({ chartType, chartData, chartOptions }) => {
  // key={chartType} forces a full canvas re-mount when the chart type changes,
  // preventing Chart.js from reusing a canvas initialised for a different type
  // (which would otherwise produce a blank / broken render).
  const props = { key: chartType, data: chartData as never, options: chartOptions as never };

  switch (chartType) {
    // ── Original chart types ──────────────────────────────────────────────────
    case 'bar':
      return <Bar {...props} />;
    case 'line':
    case 'area':
      return <Line {...props} />;
    case 'pie':
      return <Pie {...props} />;
    case 'doughnut':
      return <Doughnut {...props} />;
    case 'radar':
      return <Radar {...props} />;
    case 'polarArea':
      return <PolarArea {...props} />;
    case 'bubble':
      return <Bubble {...props} />;
    case 'scatter':
      return <Scatter {...props} />;

    // ── Extended chart types ──────────────────────────────────────────────────
    // Horizontal Bar: standard Bar component — chartDataBuilder sets indexAxis:'y'
    case 'horizontalBar':
      return <Bar {...props} />;

    // Stacked Bar: standard Bar component — chartDataBuilder sets stacked scales
    case 'stackedBar':
      return <Bar {...props} />;

    // Combo Bar/Line: uses the generic Chart component so individual datasets can
    // declare their own `type` ('bar' | 'line') within a single canvas.
    case 'comboBarLine':
      return <Chart type="bar" {...props} />;

    // Multi Axis Line: standard Line component — chartDataBuilder sets dual Y axes
    case 'multiAxisLine':
      return <Line {...props} />;

    // Line with drawTime: standard Line component — chartDataBuilder configures
    // the Filler plugin's drawTime to control fill layer ordering
    case 'lineDrawTime':
      return <Line {...props} />;

    // ── Mixed / legacy fallback ───────────────────────────────────────────────
    case 'mixed':
      return <Chart type="bar" {...props} />;

    default:
      return <Bar {...props} />;
  }
};

export default DynamicChart;
