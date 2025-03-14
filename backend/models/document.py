import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from backend.database import Base

class Document(Base):
    """Database model for documents"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    path = Column(String, nullable=False)
    type = Column(String, nullable=False)
    size = Column(Float, nullable=False)  # in KB
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    analysis_status = Column(String, default="pending")  # pending, completed, failed
    summary = Column(Text, nullable=True)
    insights = Column(JSON, nullable=True)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="documents")