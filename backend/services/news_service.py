import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import httpx
from uuid import uuid4

from backend.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NewsService:
    """Service for fetching financial news with India focus"""
    
    def __init__(self):
        self.tavily_api_key = None
        self.news_cache = []
        self.last_cache_update = None
        self.cache_valid_minutes = 60  # Cache news for 60 minutes
        self._initialize()
    
    def _initialize(self):
        """Initialize news service API keys"""
        self.tavily_api_key = settings.TAVILY_API_KEY
        if not self.tavily_api_key:
            logger.warning("Tavily API key not set, news service will use fallback data")
    
    async def get_financial_news(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Get latest financial news for Indian market
        
        Args:
            force_refresh: Force refresh the news cache
            
        Returns:
            List of news items
        """
        # Check if cache is valid
        now = datetime.now()
        cache_valid = (
            self.last_cache_update is not None and 
            self.news_cache and 
            now - self.last_cache_update < timedelta(minutes=self.cache_valid_minutes)
        )
        
        # Return cache if valid and not forcing refresh
        if cache_valid and not force_refresh:
            logger.info("Returning financial news from cache")
            return self.news_cache
        
        # Try to get news from Tavily API
        if self.tavily_api_key:
            try:
                news = await self._get_news_from_tavily()
                if news:
                    self.news_cache = news
                    self.last_cache_update = now
                    return news
            except Exception as e:
                logger.error(f"Error fetching news from Tavily API: {str(e)}")
        
        # Use fallback if API failed or not configured
        if not self.news_cache:
            self.news_cache = self._get_fallback_news()
            self.last_cache_update = now
        
        return self.news_cache
    
    async def _get_news_from_tavily(self) -> List[Dict[str, Any]]:
        """Get financial news from Tavily API"""
        query = "latest financial news India stock market economy investment"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://api.tavily.com/search",
                    json={
                        "api_key": self.tavily_api_key,
                        "query": query,
                        "search_depth": "advanced",
                        "include_domains": ["economictimes.indiatimes.com", "moneycontrol.com", "livemint.com", "business-standard.com", "financialexpress.com"],
                        "max_results": 10,
                        "include_answer": False,
                        "include_images": False,
                        "include_raw_content": False
                    },
                    timeout=30.0
                )
                
                response.raise_for_status()
                result = response.json()
                
                news_items = []
                for i, item in enumerate(result.get("results", [])):
                    # Extract date from URL or content if available
                    published_date = datetime.now().strftime("%Y-%m-%d")
                    
                    news_items.append({
                        "id": str(uuid4()),
                        "title": item.get("title", "Financial News Update"),
                        "description": item.get("description", ""),
                        "source": item.get("source", "Financial News"),
                        "url": item.get("url", ""),
                        "publishedAt": published_date
                    })
                
                return news_items
            except Exception as e:
                logger.error(f"Error in Tavily API request: {str(e)}")
                raise
    
    def _get_fallback_news(self) -> List[Dict[str, Any]]:
        """Get fallback news data when API is unavailable"""
        logger.info("Using fallback news data")
        today = datetime.now().strftime("%Y-%m-%d")
        
        return [
            {
                "id": "1",
                "title": "Sensex rises over 200 points; Nifty tests 16,700",
                "description": "Equity benchmark Sensex jumped over 200 points in early trade today, tracking gains in index majors Reliance Industries, ICICI Bank and HDFC Bank amid a mixed trend in global markets.",
                "source": "Financial Express",
                "url": "https://www.financialexpress.com",
                "publishedAt": today
            },
            {
                "id": "2",
                "title": "RBI keeps benchmark interest rate unchanged at 4%",
                "description": "The Reserve Bank of India (RBI) kept the benchmark interest rate unchanged at 4 percent but maintained an accommodative stance as the economy faces threat from the third wave of COVID-19.",
                "source": "Economic Times",
                "url": "https://economictimes.indiatimes.com",
                "publishedAt": today
            },
            {
                "id": "3",
                "title": "India's economy projected to grow at 8.5% in 2022-23",
                "description": "According to the latest economic survey, India's economy is projected to grow at 8.5% in 2022-23, supported by widespread vaccine coverage and government fiscal measures.",
                "source": "Moneycontrol",
                "url": "https://www.moneycontrol.com",
                "publishedAt": today
            },
            {
                "id": "4",
                "title": "IT stocks under pressure as rupee strengthens",
                "description": "IT stocks came under pressure as the Indian rupee strengthened against the US dollar. A stronger rupee impacts the revenue of IT companies that earn a significant portion in foreign currencies.",
                "source": "Livemint",
                "url": "https://www.livemint.com",
                "publishedAt": today
            },
            {
                "id": "5",
                "title": "Government announces new crypto tax regulations",
                "description": "The Indian government has announced new taxation rules for cryptocurrency transactions, imposing a 30% tax on income from these digital assets.",
                "source": "Business Standard",
                "url": "https://www.business-standard.com",
                "publishedAt": today
            }
        ]

# Create a singleton instance
news_service = NewsService()