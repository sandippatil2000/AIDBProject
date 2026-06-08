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
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar, PolarArea, Bubble, Scatter } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import type { ChartType } from '../types/schema';

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
    default:
      return <Bar {...props} />;
  }
};

export default DynamicChart;
