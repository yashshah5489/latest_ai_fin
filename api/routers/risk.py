"""
Risk analysis router
"""
from typing import Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import get_db
from backend.models.risk_analysis import RiskAnalysis
from backend.services.risk_analysis_service import risk_analysis_service
from api.dependencies import get_current_user

router = APIRouter(prefix="/risk", tags=["risk"])

class RiskProfileRequest(BaseModel):
    """Risk profile request model"""
    age: int
    investment_horizon: int
    risk_tolerance: int
    emergency_fund: int
    income_stability: int

class AssetAllocation(BaseModel):
    """Asset allocation model"""
    equities: int
    fixed_income: int
    gold: int
    cash: int

class RiskAnalysisResponse(BaseModel):
    """Risk analysis response model"""
    risk_score: float
    risk_category: str
    asset_allocation: AssetAllocation
    recommendations: List[str]

@router.post("/analyze", response_model=RiskAnalysisResponse)
async def analyze_risk(
    profile: RiskProfileRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze risk profile
    
    Args:
        profile: Risk profile data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Risk analysis
    """
    # Analyze risk profile
    analysis = await risk_analysis_service.analyze_risk_profile(profile.dict())
    
    # Save risk analysis to database
    db_analysis = RiskAnalysis(
        age=profile.age,
        investment_horizon=profile.investment_horizon,
        risk_tolerance=profile.risk_tolerance,
        emergency_fund=profile.emergency_fund,
        income_stability=profile.income_stability,
        risk_score=analysis["risk_score"],
        risk_category=analysis["risk_category"],
        asset_allocation=analysis["asset_allocation"],
        recommendations=analysis["recommendations"],
        user_id=current_user.id
    )
    
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    return analysis

@router.get("/latest", response_model=RiskAnalysisResponse)
async def get_latest_risk_analysis(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get latest risk analysis
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Latest risk analysis
    """
    # Get latest risk analysis
    analysis = db.query(RiskAnalysis).filter(
        RiskAnalysis.user_id == current_user.id
    ).order_by(RiskAnalysis.created_at.desc()).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No risk analysis found"
        )
    
    return {
        "risk_score": analysis.risk_score,
        "risk_category": analysis.risk_category,
        "asset_allocation": analysis.asset_allocation,
        "recommendations": analysis.recommendations
    }