from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import datetime

from app.db.base import Base

class RiskAnalysis(Base):
    __tablename__ = "risk_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    # Risk profile data
    age = Column(Integer, nullable=False)
    investment_horizon = Column(Integer, nullable=False)  # in years
    risk_tolerance = Column(Integer, nullable=False)  # scale 1-10
    emergency_fund = Column(Integer, nullable=False)  # in months
    income_stability = Column(Integer, nullable=False)  # scale 1-10
    
    # Risk analysis results
    risk_score = Column(Float, nullable=True)
    risk_category = Column(String, nullable=True)
    asset_allocation = Column(JSON, nullable=True)  # distribution of assets
    recommendations = Column(JSON, nullable=True)  # list of recommendations
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="risk_analyses")