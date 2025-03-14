"""
Script to run the Smart AI Financial Analyzer application
"""
import os
import logging
import sys

import uvicorn
from fastapi import FastAPI

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger(__name__)

def main():
    """
    Initialize the database and start the FastAPI application
    """
    logger.info("Starting Smart AI Financial Analyzer")
    
    # Check for environment variables
    required_vars = [
        "SECRET_KEY",
        "DATABASE_URL"
    ]
    
    for var in required_vars:
        if not os.getenv(var):
            logger.warning(f"Environment variable {var} is not set")
    
    # Optional API keys
    api_keys = [
        "OPENAI_API_KEY",
        "GROQ_API_KEY",
        "TAVILY_API_KEY"
    ]
    
    for key in api_keys:
        if not os.getenv(key):
            logger.warning(f"{key} is not set. Some AI features may not work properly.")
    
    # Start the application
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()