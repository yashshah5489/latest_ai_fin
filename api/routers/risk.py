from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from backend.database import get_db
from backend.models.user import User
from backend.models.risk_analysis import RiskAnalysis
from backend.services.risk_analysis_service import risk_analysis_service
from api.dependencies import get_current_user

router = APIRouter(
    prefix="/api/v1/risk",
    tags=["risk"],
    responses={401: {"description": "Not authenticated"}},
)

@router.post("/analyze")
async def analyze_risk_profile(
    profile_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze user's risk profile and provide recommendations
    
    Args:
        profile_data: User's risk profile data
        
    Returns:
        Risk analysis results
    """
    try:
        # Get analysis from risk analysis service
        analysis_result = await risk_analysis_service.analyze_risk_profile(profile_data)
        
        # Save to database
        # Create new risk analysis entry
        db_analysis = RiskAnalysis(
            user_id=current_user.id,
            age=profile_data.get("age", 35),
            investment_horizon=profile_data.get("investmentHorizon", 5),
            risk_tolerance=profile_data.get("riskTolerance", 5),
            emergency_fund=profile_data.get("emergencyFund", 3),
            income_stability=profile_data.get("incomeStability", 5),
            risk_score=analysis_result["riskScore"],
            risk_category=analysis_result["riskCategory"],
            asset_allocation=analysis_result["assetAllocation"],
            recommendations=analysis_result["recommendations"]
        )
        
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        
        return analysis_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing risk profile: {str(e)}")

@router.get("/analysis")
async def get_risk_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the most recent risk analysis for the current user
    
    Returns:
        Most recent risk analysis
    """
    # Get most recent risk analysis from database
    analysis = db.query(RiskAnalysis).filter(
        RiskAnalysis.user_id == current_user.id
    ).order_by(RiskAnalysis.created_at.desc()).first()
    
    if not analysis:
        return {
            "message": "No risk analysis found for this user. Please complete a risk assessment first."
        }
    
    return {
        "riskScore": analysis.risk_score,
        "riskCategory": analysis.risk_category,
        "assetAllocation": analysis.asset_allocation,
        "recommendations": analysis.recommendations,
        "profileData": {
            "age": analysis.age,
            "investmentHorizon": analysis.investment_horizon,
            "riskTolerance": analysis.risk_tolerance,
            "emergencyFund": analysis.emergency_fund,
            "incomeStability": analysis.income_stability
        },
        "createdAt": analysis.created_at
    }