import type { ChartRecommendation, JsonSchema } from '../types/schema';
import type { ChartData, ChartOptions } from 'chart.js';

const PALETTE = [
  'rgba(99, 102, 241, 0.85)',
  'rgba(236, 72, 153, 0.85)',
  'rgba(16, 185, 129, 0.85)',
  'rgba(245, 158, 11, 0.85)',
  'rgba(59, 130, 246, 0.85)',
  'rgba(239, 68, 68, 0.85)',
  'rgba(139, 92, 246, 0.85)',
  'rgba(20, 184, 166, 0.85)',
  'rgba(249, 115, 22, 0.85)',
  'rgba(34, 197, 94, 0.85)',
];

const BORDER_PALETTE = PALETTE.map((c) => c.replace('0.85', '1'));

export function buildChartConfig(
  data: Record<string, unknown>[],
  schema: JsonSchema,
  rec: ChartRecommendation
): { chartData: ChartData; chartOptions: ChartOptions } {
  const labels = data.map((row) => String(row[rec.labelField] ?? ''));
  const numFields = schema.fields.filter((f) => f.isNumeric);

  // ─── BUBBLE ───────────────────────────────────────────────────────────────
  if (rec.chartType === 'bubble') {
    const [xKey, yKey, rKey] = rec.valueFields;
    const maxR = Math.max(...data.map((r) => Number(r[rKey] ?? 0)));
    const chartData: ChartData<'bubble'> = {
      datasets: [
        {
          label: rec.title,
          data: data.map((row) => ({
            x: Number(row[xKey] ?? 0),
            y: Number(row[yKey] ?? 0),
            r: Math.max(4, (Number(row[rKey] ?? 0) / maxR) * 30),
          })),
          backgroundColor: data.map((_, i) => PALETTE[i % PALETTE.length]),
          borderColor: data.map((_, i) => BORDER_PALETTE[i % BORDER_PALETTE.length]),
          borderWidth: 2,
        },
      ],
    };
    const chartOptions: ChartOptions<'bubble'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const raw = ctx.raw as { x: number; y: number; r: number };
              return `${ctx.dataset.label}: (${raw.x}, ${raw.y})`;
            },
          },
        },
      },
    };
    return { chartData, chartOptions } as { chartData: ChartData; chartOptions: ChartOptions };
  }

  // ─── SCATTER ──────────────────────────────────────────────────────────────
  if (rec.chartType === 'scatter') {
    const [xKey, yKey] = rec.valueFields;
    const chartData: ChartData<'scatter'> = {
      datasets: [
        {
          label: rec.title,
          data: data.map((row) => ({
            x: Number(row[xKey] ?? 0),
            y: Number(row[yKey] ?? 0),
          })),
          backgroundColor: PALETTE[0],
          borderColor: BORDER_PALETTE[0],
          pointRadius: 6,
        },
      ],
    };
    return {
      chartData,
      chartOptions: { responsive: true, maintainAspectRatio: false },
    } as { chartData: ChartData; chartOptions: ChartOptions };
  }

  // ─── PIE / DOUGHNUT / POLAR AREA ──────────────────────────────────────────
  if (['pie', 'doughnut', 'polarArea'].includes(rec.chartType)) {
    const valueKey = rec.valueFields[0];
    const chartData: ChartData<'pie' | 'doughnut' | 'polarArea'> = {
      labels,
      datasets: [
        {
          label: numFields.find((f) => f.key === valueKey)?.label ?? valueKey,
          data: data.map((row) => Number(row[valueKey] ?? 0)),
          backgroundColor: data.map((_, i) => PALETTE[i % PALETTE.length]),
          borderColor: data.map((_, i) => BORDER_PALETTE[i % BORDER_PALETTE.length]),
          borderWidth: 2,
        },
      ],
    };
    return {
      chartData,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } },
      },
    } as { chartData: ChartData; chartOptions: ChartOptions };
  }

  // ─── RADAR ────────────────────────────────────────────────────────────────
  if (rec.chartType === 'radar') {
    const chartData: ChartData<'radar'> = {
      labels: rec.valueFields.map(
        (k) => numFields.find((f) => f.key === k)?.label ?? k
      ),
      datasets: data.map((row, i) => ({
        label: String(row[rec.labelField] ?? `Row ${i + 1}`),
        data: rec.valueFields.map((k) => Number(row[k] ?? 0)),
        backgroundColor: PALETTE[i % PALETTE.length].replace('0.85', '0.3'),
        borderColor: BORDER_PALETTE[i % BORDER_PALETTE.length],
        borderWidth: 2,
        pointBackgroundColor: BORDER_PALETTE[i % BORDER_PALETTE.length],
      })),
    };
    return {
      chartData,
      chartOptions: { responsive: true, maintainAspectRatio: false },
    } as { chartData: ChartData; chartOptions: ChartOptions };
  }

  // ─── LINE / AREA / BAR (default) ──────────────────────────────────────────
  const fill = rec.chartType === 'area';
  const chartData: ChartData<'bar' | 'line'> = {
    labels,
    datasets: rec.valueFields.map((key, i) => ({
      label: numFields.find((f) => f.key === key)?.label ?? key,
      data: data.map((row) => Number(row[key] ?? 0)),
      backgroundColor: PALETTE[i % PALETTE.length],
      borderColor: BORDER_PALETTE[i % BORDER_PALETTE.length],
      borderWidth: 2,
      fill,
      tension: 0.4,
      pointRadius: rec.chartType === 'line' || fill ? 4 : 0,
    })),
  };

  const chartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.08)' } },
      y: { grid: { color: 'rgba(255,255,255,0.08)' }, beginAtZero: true },
    },
  };

  return { chartData, chartOptions } as { chartData: ChartData; chartOptions: ChartOptions };
}
