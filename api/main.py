import os
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import logging
import jwt
from jwt.exceptions import PyJWTError
import uvicorn

from api.routers import auth, news, ai, documents, risk
from backend.database import get_db, init_db
from backend.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Create uploads directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Initialize Jinja2 templates
templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(news.router)
app.include_router(ai.router)
app.include_router(documents.router)
app.include_router(risk.router)

# Exception handler for generic exceptions
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )

# Exception handler for JWT exceptions
@app.exception_handler(PyJWTError)
async def jwt_exception_handler(request: Request, exc: PyJWTError):
    return JSONResponse(
        status_code=401,
        content={"detail": "Invalid authentication credentials"},
        headers={"WWW-Authenticate": "Bearer"},
    )

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Smart AI Financial Analyzer API",
        "version": settings.VERSION,
        "docs_url": "/docs",
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

if __name__ == "__main__":
    # Run server
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )