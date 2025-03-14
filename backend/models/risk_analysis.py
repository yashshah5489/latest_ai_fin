"""
Risk analysis model for SQLAlchemy
"""
from datetime import datetime
from typing import Optional, Dict, Any

from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship

from backend.database import Base

class RiskAnalysis(Base):
    """Risk analysis model"""
    __tablename__ = "risk_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer, nullable=False)
    investment_horizon = Column(Integer, nullable=False)
    risk_tolerance = Column(Integer, nullable=False)
    emergency_fund = Column(Integer, nullable=False)
    income_stability = Column(Integer, nullable=False)
    
    # Analysis results
    risk_score = Column(Float, nullable=False)
    risk_category = Column(String, nullable=False)
    asset_allocation = Column(JSON, nullable=False)  # Dict with allocation percentages
    recommendations = Column(JSON, nullable=False)  # List of recommendations
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="risk_analyses")