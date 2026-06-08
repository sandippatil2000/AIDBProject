import type { ChartRecommendation, ChartType, JsonSchema } from '../types/schema';

interface Rule {
  condition: (schema: JsonSchema) => boolean;
  recommend: (schema: JsonSchema) => ChartRecommendation;
}

function pickLabel(schema: JsonSchema): string {
  // Prefer categorical/string field or date field for label
  const cat = schema.fields.find((f) => f.isCategorical || f.type === 'categorical');
  const date = schema.fields.find((f) => f.isDate);
  return (cat ?? date ?? schema.fields[0]).key;
}

function numericFields(schema: JsonSchema) {
  return schema.fields.filter((f) => f.isNumeric);
}

function buildRecommendation(
  chartType: ChartType,
  labelField: string,
  valueFields: string[],
  title: string,
  reasoning: string
): ChartRecommendation {
  return { chartType, labelField, valueFields, title, reasoning };
}

const rules: Rule[] = [
  // Rule 1: Bubble — 3+ numeric fields
  {
    condition: (s) => numericFields(s).length >= 3,
    recommend: (s) => {
      const nums = numericFields(s);
      const label = pickLabel(s);
      return buildRecommendation(
        'bubble',
        label,
        nums.map((f) => f.key),
        `${s.domain} Bubble Analysis`,
        'Three or more numeric dimensions detected — Bubble chart visualises x, y, and size simultaneously.'
      );
    },
  },
  // Rule 2: Pie / Doughnut — single numeric, few categories (≤8 rows)
  {
    condition: (s) => numericFields(s).length === 1 && s.rowCount <= 8,
    recommend: (s) => {
      const label = pickLabel(s);
      const value = numericFields(s)[0].key;
      return buildRecommendation(
        'doughnut',
        label,
        [value],
        `${s.domain} Distribution`,
        'Single numeric field with few categories — Doughnut chart shows proportional breakdown clearly.'
      );
    },
  },
  // Rule 3: Line — date/time label field with numeric values
  {
    condition: (s) => s.fields.some((f) => f.isDate) && numericFields(s).length >= 1,
    recommend: (s) => {
      const date = s.fields.find((f) => f.isDate)!;
      const nums = numericFields(s);
      return buildRecommendation(
        'line',
        date.key,
        nums.map((f) => f.key),
        `${s.domain} Trend Over Time`,
        'Date/time field detected as axis — Line chart is optimal for time-series trends.'
      );
    },
  },
  // Rule 4: Radar — small row count (≤10) and multiple numerics
  {
    condition: (s) => s.rowCount <= 10 && numericFields(s).length >= 2,
    recommend: (s) => {
      const label = pickLabel(s);
      const nums = numericFields(s);
      return buildRecommendation(
        'radar',
        label,
        nums.map((f) => f.key),
        `${s.domain} Multi-Dimension Radar`,
        'Small dataset with multiple numeric axes — Radar chart provides a clear multi-variate comparison.'
      );
    },
  },
  // Rule 5: Polar Area — categorical label, single numeric, moderate rows
  {
    condition: (s) =>
      numericFields(s).length === 1 &&
      s.rowCount > 8 &&
      s.rowCount <= 15,
    recommend: (s) => {
      const label = pickLabel(s);
      const value = numericFields(s)[0].key;
      return buildRecommendation(
        'polarArea',
        label,
        [value],
        `${s.domain} Polar Distribution`,
        'Moderate number of categories with one metric — Polar Area chart gives an elegant radial view.'
      );
    },
  },
  // Rule 6: Area — 2 numeric fields with increasing values (trend-like)
  {
    condition: (s) => numericFields(s).length === 2,
    recommend: (s) => {
      const label = pickLabel(s);
      const nums = numericFields(s);
      return buildRecommendation(
        'area',
        label,
        nums.map((f) => f.key),
        `${s.domain} Area Comparison`,
        'Two numeric fields detected — Area chart shows stacked or overlapping volume comparisons effectively.'
      );
    },
  },
  // Default: Bar chart
  {
    condition: () => true,
    recommend: (s) => {
      const label = pickLabel(s);
      const nums = numericFields(s);
      return buildRecommendation(
        'bar',
        label,
        nums.map((f) => f.key),
        `${s.domain} Bar Chart`,
        'Default recommendation — Bar chart provides clear categorical comparison for general datasets.'
      );
    },
  },
];

export function recommendChart(schema: JsonSchema): ChartRecommendation {
  for (const rule of rules) {
    if (rule.condition(schema)) {
      return rule.recommend(schema);
    }
  }
  // Fallback
  const label = schema.fields[0]?.key ?? 'label';
  const value = schema.fields[1]?.key ?? 'value';
  return buildRecommendation('bar', label, [value], 'Chart', 'Default bar chart.');
}
