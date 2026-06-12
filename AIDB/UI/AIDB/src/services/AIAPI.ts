import type { AIChatRequest } from '../types/AIChatRequest';
import type { AIQueryRequest } from '../types/AIQueryRequest';
import type { AIRecommendChartsRequest } from '../types/AIRecommendChartsRequest';
import { apiClient } from './api';

// ── API service ───────────────────────────────────────────────────────────────

export const AIAPI = {
    /**
     * POST /api/AI/AISqlQuery
     * Converts a natural-language user prompt into an SQL query using the AI
     * service, scoped to the specified database connection.
     */
    generateSqlQuery: async (request: AIQueryRequest) => {
        return apiClient.post<string>('/AI/AISqlQuery', request);
    },

    /**
     * POST /api/AI/chat
     * Sends a conversation history to the AI service and retrieves the next
     * assistant response. Useful for multi-turn chat interactions.
     */
    chat: async (request: AIChatRequest) => {
        return apiClient.post<string>('/AI/chat', request);
    },

    /**
     * POST /api/AI/RecommendCharts
     * Sends dataset schema metadata to the AI service and returns a list of
     * recommended chart configurations suited to the given data structure.
     */
    AIrecommendCharts: async (request: AIRecommendChartsRequest) => {
        return apiClient.post<string>('/AI/RecommendCharts', request);
    },
};
