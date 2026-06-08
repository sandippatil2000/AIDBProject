import type { ChartRecommendation, ChartType, JsonSchema } from '../types/schema';

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
// Each rule fires independently. Priority controls display order.
const RULES: Rule[] = [
  // ── Line: date/time axis (priority 1 — best time-series representation)
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

  // ── Area: date axis or 2+ numeric fields — filled line shows volume
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

  // ── Bar: categorical or any data with numeric values — universal comparison
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

  // ── Radar: ≤12 rows and 2+ numeric dimensions
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

  // ── Doughnut: single numeric field with ≤10 categories
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

  // ── Pie: single numeric with ≤8 categories
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

  // ── Polar Area: 1+ numeric and ≤15 rows — radial magnitude encoding
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

  // ── Bubble: 3+ numeric fields — maps x, y, and size
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

  // ── Scatter: 2+ numeric fields — correlation / distribution
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
];

// ─── Public API ───────────────────────────────────────────────────────────────
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
