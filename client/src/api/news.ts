import { apiRequest } from "@/lib/queryClient";

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
}

export async function fetchNews(): Promise<NewsItem[]> {
  const res = await apiRequest('GET', '/api/news');
  if (!res.ok) {
    throw new Error('Failed to fetch news');
  }
  return res.json();
}
