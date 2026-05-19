import type { ChatMessageDto } from "../types/ChatMessageDto";

/**
 * Request body for POST /api/AI/chat
 * Sends a multi-turn conversation history to the AI service and returns
 * the assistant's next message.
 */
export interface AIChatRequest {
    messages?: ChatMessageDto[] | null;
    aiModel?: string | null;
    aiService?: string | null;
}