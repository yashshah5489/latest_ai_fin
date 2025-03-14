"""
Investments router for investment management and analysis
"""
import os
import shutil
import tempfile
from typing import List, Dict, Any
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import get_db
from backend.services.investment_service import investment_service
from backend.core.config import settings
from api.dependencies import get_current_user

router = APIRouter(prefix="/investments", tags=["investments"])

class Investment(BaseModel):
    """Investment model"""
    id: str
    name: str
    type: str
    value: float
    allocation: float
    return_value: float = 0.0
    risk_level: str
    icon: str

class PortfolioSummary(BaseModel):
    """Portfolio summary model"""
    portfolio_value: float
    value_change: float
    annual_return: float
    benchmark_diff: float
    dividend_income: float
    last_payment_date: str

@router.get("", response_model=List[Investment])
async def get_investments(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user investments
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of investments
    """
    # In a real application, we would fetch this from a database
    # For now, we'll return a fixed list
    investments = [
        {
            "id": "inv_1",
            "name": "Reliance Industries",
            "type": "Equity",
            "value": 120000.0,
            "allocation": 25.0,
            "return": 12.5,
            "riskLevel": "High",
            "icon": "trending-up"
        },
        {
            "id": "inv_2",
            "name": "SBI Bluechip Fund",
            "type": "Mutual Fund",
            "value": 85000.0,
            "allocation": 18.0,
            "return": 9.8,
            "riskLevel": "Medium",
            "icon": "pie-chart"
        },
        {
            "id": "inv_3",
            "name": "HDFC Bank FD",
            "type": "Fixed Deposit",
            "value": 100000.0,
            "allocation": 21.0,
            "return": 5.5,
            "riskLevel": "Low",
            "icon": "landmark"
        },
        {
            "id": "inv_4",
            "name": "Gold ETF",
            "type": "Gold",
            "value": 50000.0,
            "allocation": 10.0,
            "return": 7.2,
            "riskLevel": "Medium",
            "icon": "coins"
        },
        {
            "id": "inv_5",
            "name": "PPF",
            "type": "Provident Fund",
            "value": 120000.0,
            "allocation": 26.0,
            "return": 7.1,
            "riskLevel": "Low",
            "icon": "shield"
        }
    ]
    
    return investments

@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get portfolio summary
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Portfolio summary
    """
    # In a real application, we would calculate this from the database
    # For now, we'll return fixed data
    summary = {
        "portfolio_value": 475000.0,
        "value_change": 5.2,
        "annual_return": 8.7,
        "benchmark_diff": 1.2,
        "dividend_income": 12500.0,
        "last_payment_date": "2023-02-15"
    }
    
    return summary

@router.post("/import", status_code=status.HTTP_200_OK)
async def import_investments(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Import investments from Excel file
    
    Args:
        file: Excel file
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Success message
    """
    # Validate file type
    allowed_extensions = ['.xlsx', '.xls']
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Save file to temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
        try:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
        finally:
            file.file.close()
    
    try:
        # Process investments
        investments = await investment_service.import_investment_data(temp_path)
        
        if not investments:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid investment data found in file"
            )
        
        # In a real application, we would save these to the database
        
        return {"success": True, "message": f"Successfully imported {len(investments)} investments"}
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)