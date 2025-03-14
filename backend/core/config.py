"""
Application configuration settings
"""
import os
import secrets
from typing import Any, Dict, List, Optional, Union

from dotenv import load_dotenv
from dotenv import find_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from .env file
load_dotenv(find_dotenv())

class Settings(BaseSettings):
    """Application settings"""
    
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Smart AI Financial Analyzer"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "India-focused AI Financial Analyzer with dark theme and simplified interface"
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartfinance.db")
    
    # AI API settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    
    # File upload settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))  # 10MB
    
    # Template settings
    TEMPLATES_DIR: str = os.getenv("TEMPLATES_DIR", "./frontend/templates")
    STATIC_DIR: str = os.getenv("STATIC_DIR", "./frontend/static")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()