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

export async function sendChatMessage(message: string): Promise<{ response: string }> {
  const res = await apiRequest('POST', '/api/ai/chat', { message });
  if (!res.ok) {
    throw new Error('Failed to send message');
  }
  return res.json();
}

export async function fetchChatHistory(): Promise<ChatMessage[]> {
  const res = await apiRequest('GET', '/api/ai/chat/history');
  if (!res.ok) {
    throw new Error('Failed to fetch chat history');
  }
  return res.json();
}

export async function fetchAIInsight(): Promise<AIInsight> {
  const res = await apiRequest('GET', '/api/ai/insight');
  if (!res.ok) {
    throw new Error('Failed to fetch AI insight');
  }
  return res.json();
}
