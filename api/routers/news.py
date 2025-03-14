"""
News router for financial news
"""
from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import get_db
from backend.services.news_service import news_service
from api.dependencies import get_current_user

router = APIRouter(prefix="/news", tags=["news"])

class NewsItem(BaseModel):
    """News item model"""
    id: str
    title: str
    description: str
    source: str
    url: str
    publishedAt: str

@router.get("", response_model=List[NewsItem])
async def get_news(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
    force_refresh: bool = False
):
    """
    Get latest financial news
    
    Args:
        current_user: Current authenticated user
        db: Database session
        force_refresh: Force refresh news cache
        
    Returns:
        List of news items
    """
    news = await news_service.get_financial_news(force_refresh=force_refresh)
    return news