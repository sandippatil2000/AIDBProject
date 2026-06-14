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

  // ─── HORIZONTAL BAR ───────────────────────────────────────────────────────
  // Uses a standard Bar chart with indexAxis: 'y' to flip the orientation.
  if (rec.chartType === 'horizontalBar') {
    const chartData: ChartData<'bar'> = {
      labels,
      datasets: rec.valueFields.map((key, i) => ({
        label: numFields.find((f) => f.key === key)?.label ?? key,
        data: data.map((row) => Number(row[key] ?? 0)),
        backgroundColor: PALETTE[i % PALETTE.length],
        borderColor: BORDER_PALETTE[i % BORDER_PALETTE.length],
        borderWidth: 2,
        borderRadius: 4,
      })),
    };
    const chartOptions: ChartOptions<'bar'> = {
      indexAxis: 'y',          // ← This is the key flag for horizontal orientation
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.08)' },
        },
        y: {
          grid: { display: false },
        },
      },
    };
    return { chartData, chartOptions } as { chartData: ChartData; chartOptions: ChartOptions };
  }

  // ─── STACKED BAR ──────────────────────────────────────────────────────────
  // All datasets are stacked on both axes.
  if (rec.chartType === 'stackedBar') {
    const chartData: ChartData<'bar'> = {
      labels,
      datasets: rec.valueFields.map((key, i) => ({
        label: numFields.find((f) => f.key === key)?.label ?? key,
        data: data.map((row) => Number(row[key] ?? 0)),
        backgroundColor: PALETTE[i % PALETTE.length],
        borderColor: BORDER_PALETTE[i % BORDER_PALETTE.length],
        borderWidth: 1,
        borderRadius: i === rec.valueFields.length - 1 ? 4 : 0, // Round top segment only
      })),
    };
    const chartOptions: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          stacked: true,       // ← Stack on X
          grid: { color: 'rgba(255,255,255,0.08)' },
        },
        y: {
          stacked: true,       // ← Stack on Y
          grid: { color: 'rgba(255,255,255,0.08)' },
          beginAtZero: true,
        },
      },
    };
    return { chartData, chartOptions } as { chartData: ChartData; chartOptions: ChartOptions };
  }

  // ─── COMBO BAR / LINE ─────────────────────────────────────────────────────
  // First half of valueFields → bar datasets; second half → line datasets.
  // The generic <Chart type="bar"> component in DynamicChart respects each
  // dataset's individual `type` property.
  if (rec.chartType === 'comboBarLine') {
    const mid = Math.ceil(rec.valueFields.length / 2);
    const barFields  = rec.valueFields.slice(0, mid);
    const lineFields = rec.valueFields.slice(mid);

    const barDatasets = barFields.map((key, i) => ({
      type: 'bar' as const,
      label: numFields.find((f) => f.key === key)?.label ?? key,
      data: data.map((row) => Number(row[key] ?? 0)),
      backgroundColor: PALETTE[i % PALETTE.length],
      borderColor: BORDER_PALETTE[i % BORDER_PALETTE.length],
      borderWidth: 2,
      borderRadius: 4,
      yAxisID: 'y',
    }));

    const lineDatasets = lineFields.map((key, i) => ({
      type: 'line' as const,
      label: numFields.find((f) => f.key === key)?.label ?? key,
      data: data.map((row) => Number(row[key] ?? 0)),
      backgroundColor: PALETTE[(mid + i) % PALETTE.length].replace('0.85', '0.2'),
      borderColor: BORDER_PALETTE[(mid + i) % BORDER_PALETTE.length],
      borderWidth: 2.5,
      tension: 0.4,
      pointRadius: 4,
      fill: false,
      yAxisID: 'y',
    }));

    const chartData = {
      labels,
      datasets: [...barDatasets, ...lineDatasets],
    };

    const chartOptions: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.08)' } },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.08)' },
        },
      },
    };
    return { chartData, chartOptions } as { chartData: ChartData; chartOptions: ChartOptions };
  }

  // ─── MULTI AXIS LINE ──────────────────────────────────────────────────────
  // First half of value fields uses the left Y axis ('y'); the second half
  // uses the right Y axis ('y1'). Both axes are independent in scale.
  if (rec.chartType === 'multiAxisLine') {
    const mid = Math.ceil(rec.valueFields.length / 2);
    const leftFields  = rec.valueFields.slice(0, mid);
    const rightFields = rec.valueFields.slice(mid);

    const datasets = [
      ...leftFields.map((key, i) => ({
        label: `${numFields.find((f) => f.key === key)?.label ?? key} (L)`,
        data: data.map((row) => Number(row[key] ?? 0)),
        backgroundColor: PALETTE[i % PALETTE.length].replace('0.85', '0.15'),
        borderColor: BORDER_PALETTE[i % BORDER_PALETTE.length],
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 4,
        fill: false,
        yAxisID: 'y',           // ← Left Y axis
      })),
      ...rightFields.map((key, i) => ({
        label: `${numFields.find((f) => f.key === key)?.label ?? key} (R)`,
        data: data.map((row) => Number(row[key] ?? 0)),
        backgroundColor: PALETTE[(mid + i) % PALETTE.length].replace('0.85', '0.15'),
        borderColor: BORDER_PALETTE[(mid + i) % BORDER_PALETTE.length],
        borderWidth: 2.5,
        borderDash: [6, 3],    // Dashed lines for right-axis datasets
        tension: 0.4,
        pointRadius: 4,
        fill: false,
        yAxisID: 'y1',         // ← Right Y axis
      })),
    ];

    const chartData: ChartData<'line'> = { labels, datasets };

    const chartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.08)' } },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.08)' },
          title: { display: true, text: 'Primary axis' },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          // Don't draw grid lines for the right axis — it clutters the chart
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Secondary axis' },
        },
      },
    };
    return { chartData, chartOptions } as { chartData: ChartData; chartOptions: ChartOptions };
  }

  // ─── LINE CHART WITH FILLER drawTime ─────────────────────────────────────
  // A filled area line chart that explicitly configures the Filler plugin's
  // `drawTime` so the filled area renders BEHIND the other datasets.
  if (rec.chartType === 'lineDrawTime') {
    const chartData: ChartData<'line'> = {
      labels,
      datasets: rec.valueFields.map((key, i) => ({
        label: numFields.find((f) => f.key === key)?.label ?? key,
        data: data.map((row) => Number(row[key] ?? 0)),
        backgroundColor: PALETTE[i % PALETTE.length].replace('0.85', '0.35'),
        borderColor: BORDER_PALETTE[i % BORDER_PALETTE.length],
        borderWidth: 2,
        fill: i === 0 ? 'origin' : `-1`,  // First fills to baseline; others fill to prev
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      })),
    };

    const chartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        filler: {
          // drawTime controls when the fill is drawn relative to other elements:
          // 'beforeDatasetsDraw' → fill renders behind datasets (default-ish)
          // 'afterDatasetsDraw' → fill renders in front of datasets
          drawTime: 'beforeDatasetsDraw',
        },
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.08)' } },
        y: {
          grid: { color: 'rgba(255,255,255,0.08)' },
          beginAtZero: true,
        },
      },
    };
    return { chartData, chartOptions } as { chartData: ChartData; chartOptions: ChartOptions };
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
