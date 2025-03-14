from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from backend.database import get_db
from backend.models.user import User
from backend.services.news_service import news_service
from api.dependencies import get_optional_current_user

router = APIRouter(
    prefix="/api/v1/news",
    tags=["news"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_financial_news(
    force_refresh: Optional[bool] = Query(False, description="Force refresh news data"),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Get latest financial news for Indian market
    
    Args:
        force_refresh: Whether to force refresh the news cache
        
    Returns:
        List of news items
    """
    # News API is not protected by auth, but we still track the user if available
    news = await news_service.get_financial_news(force_refresh=force_refresh if force_refresh else False)
    return news