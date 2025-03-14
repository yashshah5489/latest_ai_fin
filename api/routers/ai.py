"""
AI router for financial advisor functionality
"""
from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import get_db
from backend.services.ai_service import ai_service
from api.dependencies import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])

class ChatMessage(BaseModel):
    """Chat message model"""
    id: str
    content: str
    role: str
    timestamp: str

class AIInsight(BaseModel):
    """AI insight model"""
    message: str
    confidence: float

class ChatRequest(BaseModel):
    """Chat request model"""
    message: str

@router.get("/insights", response_model=AIInsight)
async def get_ai_insight(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-generated financial insight
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AI insight
    """
    insight = await ai_service.get_financial_insight(current_user.id)
    return insight

@router.get("/chat-history", response_model=List[ChatMessage])
async def get_chat_history(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get chat history with AI advisor
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of chat messages
    """
    history = await ai_service.get_chat_history(current_user.id)
    return history

@router.post("/chat", response_model=Dict[str, str])
async def chat_with_ai(
    request: ChatRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chat with AI financial advisor
    
    Args:
        request: Chat request with message
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AI response
    """
    response = await ai_service.chat_with_ai(request.message, user_id=current_user.id)
    return {"response": response}