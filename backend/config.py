import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Smart AI Financial Analyzer"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "India-focused AI Financial Analyzer with dark theme and simplified interface"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartaifinancialanalyzer")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartfinance.db")
    
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    
    # File Upload
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))  # 10MB
    
    # Templates and Static
    TEMPLATES_DIR: str = os.getenv("TEMPLATES_DIR", "./frontend/templates")
    STATIC_DIR: str = os.getenv("STATIC_DIR", "./frontend/static")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        
# Create global settings object
settings = Settings()