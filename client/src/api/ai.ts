import { apiRequest } from "@/lib/queryClient";

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

export interface AIInsight {
  message: string;
  confidence: number;
}

/**
 * Send a chat message to the AI advisor
 * @param message The message text
 * @returns The AI response
 */
export async function sendChatMessage(message: string): Promise<{response: string}> {
  const response = await apiRequest("POST", "/api/ai/chat", { message });
  return await response.json();
}

/**
 * Fetch chat history with AI advisor
 * @returns Array of chat messages
 */
export async function fetchChatHistory(): Promise<ChatMessage[]> {
  const response = await apiRequest("GET", "/api/ai/chat-history");
  return await response.json();
}

/**
 * Get an AI-generated financial insight
 * @returns AI insight with message and confidence
 */
export async function fetchAIInsight(): Promise<AIInsight> {
  const response = await apiRequest("GET", "/api/ai/insights");
  return await response.json();
}