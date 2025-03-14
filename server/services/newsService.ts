import axios from "axios";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
}

class NewsService {
  private tavilyApiKey: string | null = null;
  private newsApiKey: string | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.tavilyApiKey = process.env.TAVILY_API_KEY || null;
    this.newsApiKey = process.env.NEWS_API_KEY || null;
  }

  async getFinancialNews(): Promise<NewsItem[]> {
    try {
      // Try Tavily API first if API key is available
      if (this.tavilyApiKey) {
        return await this.getNewsFromTavily();
      }
      
      // Fall back to NewsAPI if Tavily API key is not available
      if (this.newsApiKey) {
        return await this.getNewsFromNewsAPI();
      }
      
      // If no API keys are available, return sample news
      return this.getFallbackNews();
    } catch (error) {
      console.error("Error fetching financial news:", error);
      return this.getFallbackNews();
    }
  }

  private async getNewsFromTavily(): Promise<NewsItem[]> {
    try {
      const response = await axios.post(
        "https://api.tavily.com/search",
        {
          query: "latest financial news india stock market",
          search_depth: "advanced",
          include_domains: ["economictimes.indiatimes.com", "moneycontrol.com", "livemint.com", "businesstoday.in", "business-standard.com"],
          include_answer: false,
          include_images: false,
          max_results: 5
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": this.tavilyApiKey!
          }
        }
      );

      return response.data.results.map((result: any, index: number) => ({
        id: `tavily-${index}`,
        title: result.title,
        description: result.content.substring(0, 120) + "...",
        source: result.url.split("/")[2].replace("www.", ""),
        url: result.url,
        publishedAt: new Date().toISOString() // Tavily doesn't provide publish dates
      }));
    } catch (error) {
      console.error("Tavily API error:", error);
      throw error;
    }
  }

  private async getNewsFromNewsAPI(): Promise<NewsItem[]> {
    try {
      const response = await axios.get(
        "https://newsapi.org/v2/top-headlines",
        {
          params: {
            country: "in",
            category: "business",
            apiKey: this.newsApiKey
          }
        }
      );

      return response.data.articles.map((article: any, index: number) => ({
        id: `news-${index}`,
        title: article.title,
        description: article.description || "No description available",
        source: article.source.name,
        url: article.url,
        publishedAt: article.publishedAt
      }));
    } catch (error) {
      console.error("NewsAPI error:", error);
      throw error;
    }
  }

  private getFallbackNews(): NewsItem[] {
    // These are placeholder news items that will be displayed if API calls fail
    // In a production environment, we'd use proper error handling and empty states
    return [
      {
        id: "1",
        title: "RBI Maintains Repo Rate at 6.5% for Seventh Consecutive Time",
        description: "The Reserve Bank of India (RBI) kept the repo rate unchanged at 6.5% for the seventh consecutive time, maintaining its focus on withdrawing accommodation.",
        source: "Economic Times",
        url: "https://economictimes.indiatimes.com",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: "2",
        title: "Sensex Hits All-time High, Crosses 75,000 Mark",
        description: "Indian benchmark indices reached a new milestone today with the Sensex crossing 75,000 for the first time, driven by gains in banking and IT stocks.",
        source: "LiveMint",
        url: "https://livemint.com",
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
      },
      {
        id: "3",
        title: "Government Announces New Tax Relief for Middle Class",
        description: "The Finance Ministry has announced additional tax benefits for the middle-income group, aimed at boosting consumer spending and economic growth.",
        source: "Business Standard",
        url: "https://business-standard.com",
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
      }
    ];
  }
}

export const newsService = new NewsService();
