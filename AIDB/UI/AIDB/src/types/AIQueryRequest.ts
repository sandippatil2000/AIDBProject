/**
 * Request body for POST /api/AI/AISqlQuery
 * Sends a natural-language prompt against a named DB connection and returns
 * the AI-generated SQL query (and optionally its result set).
 */
export interface AIQueryRequest {
    connectionName?: string | null;
    userPrompt?: string | null;
    aiModel?: string | null;
    aiService?: string | null;
}