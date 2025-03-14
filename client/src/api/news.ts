import { apiRequest } from "@/lib/queryClient";

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
}

/**
 * Fetch financial news
 * @param forceRefresh Whether to force refresh the news cache
 * @returns Array of news items
 */
export async function fetchNews(forceRefresh = false): Promise<NewsItem[]> {
  const url = forceRefresh 
    ? '/api/news?force_refresh=true' 
    : '/api/news';
  
  const response = await apiRequest("GET", url);
  return await response.json();
}