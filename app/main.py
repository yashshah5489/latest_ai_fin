from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import json

from app.core.config import settings
from app.db.base import engine, get_db, Base
from app.models import User, Document, RiskAnalysis

# Create all tables in the database
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title=settings.PROJECT_NAME)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Mount static files directory
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Set up Jinja2 templates
templates_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
templates = Jinja2Templates(directory=templates_dir)

# Create required directories if they don't exist
os.makedirs(static_dir, exist_ok=True)
os.makedirs(templates_dir, exist_ok=True)
os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads"), exist_ok=True)

# Root route - Landing page
@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse(
        "index.html", {"request": request, "title": settings.PROJECT_NAME}
    )

# Authentication routes
@app.get("/login")
async def login_page(request: Request):
    return templates.TemplateResponse(
        "login.html", {"request": request, "title": "Login"}
    )

@app.get("/register")
async def register_page(request: Request):
    return templates.TemplateResponse(
        "register.html", {"request": request, "title": "Register"}
    )

# Application routes
@app.get("/dashboard")
async def dashboard(request: Request):
    return templates.TemplateResponse(
        "dashboard.html", {"request": request, "title": "Dashboard"}
    )

@app.get("/investments")
async def investments(request: Request):
    return templates.TemplateResponse(
        "investments.html", {"request": request, "title": "Investments"}
    )

@app.get("/documents")
async def documents(request: Request):
    return templates.TemplateResponse(
        "documents.html", {"request": request, "title": "Documents"}
    )

@app.get("/ai-advisor")
async def ai_advisor(request: Request):
    return templates.TemplateResponse(
        "ai_advisor.html", {"request": request, "title": "AI Advisor"}
    )

@app.get("/risk-analysis")
async def risk_analysis(request: Request):
    return templates.TemplateResponse(
        "risk_analysis.html", {"request": request, "title": "Risk Analysis"}
    )

@app.get("/profile")
async def profile(request: Request):
    return templates.TemplateResponse(
        "profile.html", {"request": request, "title": "Profile"}
    )

# For development purposes
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)