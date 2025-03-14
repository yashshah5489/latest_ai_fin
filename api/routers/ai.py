from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from backend.database import get_db
from backend.models.user import User
from backend.services.ai_service import ai_service
from api.dependencies import get_current_user

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["ai"],
    responses={401: {"description": "Not authenticated"}},
)

@router.post("/chat")
async def chat_with_ai(
    message: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chat with the AI financial advisor
    
    Args:
        message: User's message to the AI
        
    Returns:
        AI response
    """
    # Get chat history from database (simplified - in real implementation you'd retrieve actual history)
    # This would need to be implemented in your database layer
    chat_history = []  # You would retrieve this from the database
    
    # Get response from AI service
    response = await ai_service.chat_with_ai(message, chat_history)
    
    # Save the conversation to database (simplified)
    # This would need to be implemented in your database layer
    # db.save_chat_message(user_id=current_user.id, user_message=message, ai_response=response)
    
    return {"response": response}

@router.get("/insight")
async def get_financial_insight(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized financial insight from AI
    
    Returns:
        AI generated financial insight
    """
    # In a real implementation, you would gather this data from the user's profile
    # This is a simplified example
    user_data = {
        "age": 35,
        "income": 1200000,  # ₹12 lakh per annum
        "savings": 500000,  # ₹5 lakh
        "debt": 200000,     # ₹2 lakh
        "investments": {
            "equity": 300000,    # ₹3 lakh
            "fixedIncome": 200000,  # ₹2 lakh
            "gold": 100000,      # ₹1 lakh
        },
        "goals": ["home", "retirement", "children_education"],
        "risk_profile": "moderate",
    }
    
    insight = await ai_service.get_financial_insight(user_data)
    return insight