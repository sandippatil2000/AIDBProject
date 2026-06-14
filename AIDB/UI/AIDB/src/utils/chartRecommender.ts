import type { ChartRecommendation, ChartType, JsonSchema } from '../types/Schema';

interface Rule {
  id: ChartType;
  priority: number; // lower = higher priority / shown first
  condition: (schema: JsonSchema) => boolean;
  recommend: (schema: JsonSchema) => ChartRecommendation;
}

function pickLabel(schema: JsonSchema): string {
  const cat = schema.fields.find((f) => f.isCategorical || f.type === 'categorical');
  const date = schema.fields.find((f) => f.isDate);
  return (cat ?? date ?? schema.fields[0]).key;
}

function numericFields(schema: JsonSchema) {
  return schema.fields.filter((f) => f.isNumeric);
}

function build(
  chartType: ChartType,
  labelField: string,
  valueFields: string[],
  title: string,
  reasoning: string
): ChartRecommendation {
  return { chartType, labelField, valueFields, title, reasoning };
}

// ─── Rule Definitions ─────────────────────────────────────────────────────────
const RULES: Rule[] = [
  {
    id: 'line',
    priority: 1,
    condition: (s) => s.fields.some((f) => f.isDate) && numericFields(s).length >= 1,
    recommend: (s) => {
      const dateField = s.fields.find((f) => f.isDate)!;
      const nums = numericFields(s);
      return build(
        'line',
        dateField.key,
        nums.map((f) => f.key),
        `${s.domain} Trend Over Time`,
        'Date/time field detected as axis — Line chart is optimal for visualising trends over time.'
      );
    },
  },
  {
    id: 'area',
    priority: 2,
    condition: (s) =>
      (s.fields.some((f) => f.isDate) && numericFields(s).length >= 1) ||
      numericFields(s).length >= 2,
    recommend: (s) => {
      const dateField = s.fields.find((f) => f.isDate);
      const label = dateField ? dateField.key : pickLabel(s);
      const nums = numericFields(s);
      return build(
        'area',
        label,
        nums.map((f) => f.key),
        `${s.domain} Area Overview`,
        'Area chart fills under the line to emphasise cumulative volume and magnitude changes.'
      );
    },
  },
  {
    id: 'bar',
    priority: 3,
    condition: (s) => numericFields(s).length >= 1,
    recommend: (s) => {
      const label = pickLabel(s);
      const nums = numericFields(s);
      return build(
        'bar',
        label,
        nums.map((f) => f.key),
        `${s.domain} Bar Comparison`,
        'Bar chart provides clear side-by-side comparison across categories.'
      );
    },
  },
  {
    id: 'radar',
    priority: 4,
    condition: (s) => s.rowCount <= 12 && numericFields(s).length >= 2,
    recommend: (s) => {
      const label = pickLabel(s);
      const nums = numericFields(s);
      return build(
        'radar',
        label,
        nums.map((f) => f.key),
        `${s.domain} Radar Analysis`,
        'Radar chart is ideal for comparing multiple numeric dimensions across a small set of items.'
      );
    },
  },
  {
    id: 'doughnut',
    priority: 5,
    condition: (s) => numericFields(s).length >= 1 && s.rowCount <= 10,
    recommend: (s) => {
      const label = pickLabel(s);
      const value = numericFields(s)[0].key;
      return build(
        'doughnut',
        label,
        [value],
        `${s.domain} Distribution`,
        'Doughnut chart shows proportional share of each category within the total.'
      );
    },
  },
  {
    id: 'pie',
    priority: 6,
    condition: (s) => numericFields(s).length >= 1 && s.rowCount <= 8,
    recommend: (s) => {
      const label = pickLabel(s);
      const value = numericFields(s)[0].key;
      return build(
        'pie',
        label,
        [value],
        `${s.domain} Pie Breakdown`,
        'Pie chart highlights the proportional contribution of each segment to the whole.'
      );
    },
  },
  {
    id: 'polarArea',
    priority: 7,
    condition: (s) => numericFields(s).length >= 1 && s.rowCount <= 15,
    recommend: (s) => {
      const label = pickLabel(s);
      const value = numericFields(s)[0].key;
      return build(
        'polarArea',
        label,
        [value],
        `${s.domain} Polar Distribution`,
        'Polar Area chart encodes magnitude as segment radius, giving an elegant radial perspective.'
      );
    },
  },
  {
    id: 'bubble',
    priority: 8,
    condition: (s) => numericFields(s).length >= 3,
    recommend: (s) => {
      const nums = numericFields(s);
      const label = pickLabel(s);
      return build(
        'bubble',
        label,
        nums.slice(0, 3).map((f) => f.key),
        `${s.domain} Bubble Analysis`,
        'Bubble chart maps three numeric dimensions simultaneously: X position, Y position, and bubble size.'
      );
    },
  },
  {
    id: 'scatter',
    priority: 9,
    condition: (s) => numericFields(s).length >= 2,
    recommend: (s) => {
      const [x, y] = numericFields(s);
      return build(
        'scatter',
        x.key,
        [x.key, y.key],
        `${s.domain} Scatter Plot`,
        'Scatter plot reveals correlations and clustering patterns between two numeric variables.'
      );
    },
  },

  // ─── New extended chart type rules ───────────────────────────────────────

  {
    id: 'horizontalBar',
    priority: 10,
    // Best when there are many categories (hard to read on a vertical axis)
    condition: (s) => numericFields(s).length >= 1 && s.rowCount >= 5,
    recommend: (s) => {
      const label = pickLabel(s);
      const nums = numericFields(s);
      return build(
        'horizontalBar',
        label,
        nums.map((f) => f.key),
        `${s.domain} Horizontal Bar`,
        'Horizontal bars make long category labels readable and improve comparison across many items.'
      );
    },
  },

  {
    id: 'stackedBar',
    priority: 11,
    // Best when there are multiple numeric series to show part-to-whole
    condition: (s) => numericFields(s).length >= 2,
    recommend: (s) => {
      const label = pickLabel(s);
      const nums = numericFields(s);
      return build(
        'stackedBar',
        label,
        nums.map((f) => f.key),
        `${s.domain} Stacked Bar`,
        'Stacked bars show how individual series contribute to an aggregate total across categories.'
      );
    },
  },

  {
    id: 'comboBarLine',
    priority: 12,
    // Requires at least 2 numeric fields so bars and lines can use different fields
    condition: (s) => numericFields(s).length >= 2,
    recommend: (s) => {
      const label = pickLabel(s);
      const nums = numericFields(s);
      return build(
        'comboBarLine',
        label,
        nums.map((f) => f.key),
        `${s.domain} Combo Bar / Line`,
        'Combo chart overlays bar and line series to compare volume (bars) with trend (lines) on the same canvas.'
      );
    },
  },

  {
    id: 'multiAxisLine',
    priority: 13,
    // Needs time + at least 2 numeric fields with potentially different scales
    condition: (s) => numericFields(s).length >= 2,
    recommend: (s) => {
      const label = pickLabel(s);
      const nums = numericFields(s);
      return build(
        'multiAxisLine',
        label,
        nums.map((f) => f.key),
        `${s.domain} Multi-Axis Line`,
        'Dual Y-axis line chart lets you compare series with different units or scales without distortion.'
      );
    },
  },

  {
    id: 'lineDrawTime',
    priority: 14,
    // Useful for time-based filled area charts with controlled layer ordering
    condition: (s) => s.fields.some((f) => f.isDate) && numericFields(s).length >= 1,
    recommend: (s) => {
      const dateField = s.fields.find((f) => f.isDate)!;
      const nums = numericFields(s);
      return build(
        'lineDrawTime',
        dateField.key,
        nums.map((f) => f.key),
        `${s.domain} Filled Line (drawTime)`,
        'Filled line chart with Filler plugin drawTime configured to render fill layers behind datasets for a clean layered look.'
      );
    },
  },
];

/** Returns ALL chart types that are applicable, sorted by priority (most specific first). */
export function recommendCharts(schema: JsonSchema): ChartRecommendation[] {
  const seen = new Set<ChartType>();
  const results: ChartRecommendation[] = [];

  const sorted = [...RULES].sort((a, b) => a.priority - b.priority);

  for (const rule of sorted) {
    if (!seen.has(rule.id) && rule.condition(schema)) {
      seen.add(rule.id);
      results.push(rule.recommend(schema));
    }
  }

  return results;
}

/** Convenience: returns just the best (highest priority) recommendation. */
export function recommendChart(schema: JsonSchema): ChartRecommendation {
  return recommendCharts(schema)[0];
}
