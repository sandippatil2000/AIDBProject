import type { FieldSchema, FieldType, JsonSchema } from '../types/schema';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+\-]+)?$/;

function detectFieldType(values: unknown[]): FieldType {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== '');

  const allBoolean = nonNull.every((v) => typeof v === 'boolean');
  if (allBoolean) return 'boolean';

  const allNumber = nonNull.every((v) => typeof v === 'number' && !isNaN(v as number));
  if (allNumber) return 'number';

  const allDate = nonNull.every(
    (v) => typeof v === 'string' && DATE_REGEX.test(v as string)
  );
  if (allDate) return 'date';

  // Check if it looks like a categorical (string with low cardinality)
  const unique = new Set(nonNull.map(String)).size;
  if (typeof nonNull[0] === 'string' && unique <= Math.max(10, nonNull.length * 0.3)) {
    return 'categorical';
  }

  return 'string';
}

function toLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export function inferSchema(data: Record<string, unknown>[]): JsonSchema {
  if (!data || data.length === 0) {
    return { fields: [], rowCount: 0, domain: 'unknown' };
  }

  const keys = Object.keys(data[0]);

  const fields: FieldSchema[] = keys.map((key) => {
    const values = data.map((row) => row[key]);
    const type = detectFieldType(values);
    const uniqueCount = new Set(values.map(String)).size;

    return {
      key,
      label: toLabel(key),
      type,
      isNumeric: type === 'number',
      isDate: type === 'date',
      isCategorical: type === 'categorical' || type === 'string',
      uniqueCount,
      sampleValues: values.slice(0, 5),
    };
  });

  // Simple domain detection based on key names
  const allKeys = keys.join(' ').toLowerCase();
  let domain = 'General';
  if (allKeys.includes('revenue') || allKeys.includes('sales') || allKeys.includes('price'))
    domain = 'Sales';
  else if (allKeys.includes('energy') || allKeys.includes('watt') || allKeys.includes('carbon'))
    domain = 'Energy';
  else if (allKeys.includes('subject') || allKeys.includes('academic') || allKeys.includes('enrolled'))
    domain = 'Education';
  else if (allKeys.includes('temp') || allKeys.includes('weather') || allKeys.includes('humidity'))
    domain = 'Weather';
  else if (allKeys.includes('patient') || allKeys.includes('hospital') || allKeys.includes('health'))
    domain = 'Healthcare';

  return { fields, rowCount: data.length, domain };
}
