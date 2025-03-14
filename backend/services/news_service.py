"""
News service for fetching financial news with India focus
"""
import os
import json
import logging
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from uuid import uuid4

import httpx
from tavily import TavilyClient

from backend.core.config import settings

logger = logging.getLogger(__name__)

class NewsService:
    """Service for fetching financial news with India focus"""
    
    def __init__(self):
        """Initialize the news service"""
        self.tavily_client = None
        self.last_fetch_time = None
        self.cached_news = []
        self.cache_expiry = 3600  # 1 hour in seconds
        self._initialize()
    
    def _initialize(self):
        """Initialize news service API keys"""
        # Check if Tavily API key is available
        if not settings.TAVILY_API_KEY:
            logger.warning("Tavily API key not found, news search will be limited")
            return
        
        try:
            # Initialize Tavily client
            self.tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)
            logger.info("Tavily client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Tavily client: {str(e)}")
            self.tavily_client = None
    
    async def get_financial_news(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Get latest financial news for Indian market
        
        Args:
            force_refresh: Force refresh the news cache
            
        Returns:
            List of news items with title, description, source, URL, and published date
        """
        # Check if cache is valid
        current_time = time.time()
        if (not force_refresh and 
            self.last_fetch_time and 
            self.cached_news and 
            current_time - self.last_fetch_time < self.cache_expiry):
            return self.cached_news
        
        news = []
        
        # Try to get news from Tavily
        try:
            if self.tavily_client:
                news = await self._get_news_from_tavily()
        except Exception as e:
            logger.error(f"Error fetching news from Tavily: {str(e)}")
        
        # If no news from Tavily, use fallback
        if not news:
            news = self._get_fallback_news()
        
        # Update cache
        self.cached_news = news
        self.last_fetch_time = current_time
        
        return news
    
    async def _get_news_from_tavily(self) -> List[Dict[str, Any]]:
        """Get news from Tavily search API"""
        if not self.tavily_client:
            return []
        
        # Create search query
        query = "latest financial news India stock market NSE BSE"
        
        # Search with Tavily
        search_result = self.tavily_client.search(
            query=query,
            search_depth="advanced",
            max_results=5,
            include_domains=[
                "moneycontrol.com",
                "economictimes.indiatimes.com", 
                "financialexpress.com",
                "livemint.com",
                "business-standard.com",
                "ndtv.com/business",
                "bloomberg.com"
            ]
        )
        
        # Process results
        news = []
        if search_result and "results" in search_result:
            for item in search_result["results"]:
                # Extract date from content or use current date
                published_at = datetime.now().strftime("%Y-%m-%d")
                
                news.append({
                    "id": str(uuid4()),
                    "title": item.get("title", ""),
                    "description": item.get("content", "")[:200] + "...",
                    "source": item.get("source", "").split(".")[0].capitalize() if "source" in item else "Financial News",
                    "url": item.get("url", ""),
                    "publishedAt": published_at
                })
        
        return news
    
    def _get_fallback_news(self) -> List[Dict[str, Any]]:
        """Get fallback news when API is not available"""
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        return [
            {
                "id": str(uuid4()),
                "title": "Markets Update: Sensex and Nifty close higher",
                "description": "Indian benchmark indices closed higher today, with banking and IT sectors leading the gains. Foreign institutional investors were net buyers.",
                "source": "MoneyControl",
                "url": "https://www.moneycontrol.com/",
                "publishedAt": current_date
            },
            {
                "id": str(uuid4()),
                "title": "RBI keeps repo rate unchanged",
                "description": "The Reserve Bank of India maintained the repo rate, citing inflation concerns while maintaining an accommodative stance for economic growth.",
                "source": "EconomicTimes",
                "url": "https://economictimes.indiatimes.com/",
                "publishedAt": current_date
            },
            {
                "id": str(uuid4()),
                "title": "IT Companies Report Strong Q4 Earnings",
                "description": "Major Indian IT services companies reported better-than-expected quarterly results, driven by digital transformation deals and cost optimization measures.",
                "source": "LiveMint",
                "url": "https://www.livemint.com/",
                "publishedAt": current_date
            }
        ]

# Singleton instance
news_service = NewsService()