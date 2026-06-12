/**
 * Represents a single column's schema metadata as expected by
 * POST /api/AI/RecommendCharts.
 * Maps directly to the `ColumnSchema` component in the Swagger spec.
 */
export interface ColumnSchema {
    key?: string | null;
    type?: string | null;
    isString?: boolean;
    isNumeric?: boolean;
    isDate?: boolean;
    isCategorical?: boolean;
}

/**
 * Request body for POST /api/AI/RecommendCharts
 * Sends dataset schema metadata to the AI service and returns a list of
 * recommended chart configurations for the given data.
 */
export interface AIRecommendChartsRequest {
    aiModel?: string | null;
    aiService?: string | null;
    schema?: ColumnSchema[] | null;
    title?: string | null;
}
