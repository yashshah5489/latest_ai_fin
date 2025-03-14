"""
Main application file for Smart AI Financial Analyzer
"""
import os
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session
import uvicorn

from backend.core.config import settings
from backend.filters import setup_jinja_filters
from backend.database import engine, Base, get_db
from backend.security import create_access_token, get_password_hash
from backend.models import User, RiskAnalysis, Document
from backend.services.ai_service import AIService
from backend.services.news_service import NewsService
from backend.services.risk_analysis_service import RiskAnalysisService
from backend.services.document_service import DocumentService

from api.main import router as api_router

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Set up session middleware for cookie-based sessions
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie="smartai_session",
    max_age=86400,  # 1 day
)

# Mount static files
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Set up Jinja2 templates
templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)

# Initialize services
ai_service = AIService()
news_service = NewsService()
risk_analysis_service = RiskAnalysisService()
document_service = DocumentService()

# Include API routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Setup Jinja2 filters
setup_jinja_filters(app)


# Middleware to check authentication for web routes
@app.middleware("http")
async def authentication_middleware(request: Request, call_next):
    request.user = None
    session = request.session
    
    if "user_id" in session:
        db = next(get_db())
        user = db.query(User).filter(User.id == session["user_id"]).first()
        if user:
            request.user = user
    
    response = await call_next(request)
    return response


# --- Web Routes ---

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Render the home page or redirect to dashboard if logged in"""
    if request.user:
        return RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)
    
    return templates.TemplateResponse("login.html", {"request": request})


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Render the login page"""
    if request.user:
        return RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)
    
    return templates.TemplateResponse("login.html", {"request": request})


@app.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    """Process login form"""
    form = await request.form()
    username = form.get("username")
    password = form.get("password")
    
    # Validate credentials (this would use proper password hashing)
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return templates.TemplateResponse(
            "login.html", 
            {"request": request, "error": "Invalid username or password"}
        )
    
    # Store user ID in session
    request.session["user_id"] = user.id
    
    # Redirect to dashboard
    return RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)


@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """Render the registration page"""
    if request.user:
        return RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)
    
    return templates.TemplateResponse("register.html", {"request": request})


@app.post("/register")
async def register(request: Request, db: Session = Depends(get_db)):
    """Process registration form"""
    form = await request.form()
    username = form.get("username")
    password = form.get("password")
    full_name = form.get("full_name")
    email = form.get("email")
    
    # Check if username already exists
    if db.query(User).filter(User.username == username).first():
        return templates.TemplateResponse(
            "register.html",
            {"request": request, "error": "Username already exists"}
        )
    
    # Create new user
    user = User(
        username=username,
        password=get_password_hash(password),
        full_name=full_name,
        email=email
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Log in the new user
    request.session["user_id"] = user.id
    
    # Redirect to dashboard
    return RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)


@app.post("/logout")
async def logout(request: Request):
    """Process logout"""
    request.session.clear()
    return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, db: Session = Depends(get_db)):
    """Render the dashboard page"""
    if not request.user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    
    # Get dashboard data from service
    dashboard_data = {
        "totalBalance": 1250000,
        "balanceChange": 3.5,
        "totalInvestments": 950000,
        "investmentsChange": 5.2,
        "monthlyExpenses": 75000,
        "expensesChange": -2.1,
        "portfolioGrowth": 12.8,
        "growthChange": 1.5
    }
    
    # Get investments from service
    investments = [
        {
            "id": "1",
            "name": "HDFC Bank",
            "type": "Equity",
            "value": 125000,
            "allocation": 13.2,
            "return": 15.5,
            "riskLevel": "Medium",
            "icon": "fas fa-landmark"
        },
        {
            "id": "2",
            "name": "SBI Bluechip Fund",
            "type": "Mutual Fund",
            "value": 200000,
            "allocation": 21.1,
            "return": 12.3,
            "riskLevel": "Medium",
            "icon": "fas fa-chart-line"
        },
        {
            "id": "3",
            "name": "Government Bonds",
            "type": "Debt",
            "value": 150000,
            "allocation": 15.8,
            "return": 6.5,
            "riskLevel": "Low",
            "icon": "fas fa-file-invoice-dollar"
        },
        {
            "id": "4",
            "name": "Gold ETF",
            "type": "Commodity",
            "value": 100000,
            "allocation": 10.5,
            "return": 8.2,
            "riskLevel": "Medium",
            "icon": "fas fa-coins"
        },
        {
            "id": "5",
            "name": "Fixed Deposit",
            "type": "Debt",
            "value": 375000,
            "allocation": 39.4,
            "return": 5.0,
            "riskLevel": "Low",
            "icon": "fas fa-piggy-bank"
        }
    ]
    
    # Get financial news
    news_items = await news_service.get_financial_news()
    
    # Get AI insight
    ai_insight = await ai_service.get_financial_insight({"user_id": request.user.id})
    
    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "dashboard_data": dashboard_data,
            "investments": investments,
            "news_items": news_items,
            "ai_insight": ai_insight
        }
    )


@app.get("/investments", response_class=HTMLResponse)
async def investments(request: Request, db: Session = Depends(get_db)):
    """Render the investments page"""
    if not request.user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    
    # Get investments from service
    investments = [
        {
            "id": "1",
            "name": "HDFC Bank",
            "type": "Equity",
            "value": 125000,
            "allocation": 13.2,
            "return": 15.5,
            "riskLevel": "Medium",
            "icon": "fas fa-landmark"
        },
        {
            "id": "2",
            "name": "SBI Bluechip Fund",
            "type": "Mutual Fund",
            "value": 200000,
            "allocation": 21.1,
            "return": 12.3,
            "riskLevel": "Medium",
            "icon": "fas fa-chart-line"
        },
        {
            "id": "3",
            "name": "Government Bonds",
            "type": "Debt",
            "value": 150000,
            "allocation": 15.8,
            "return": 6.5,
            "riskLevel": "Low",
            "icon": "fas fa-file-invoice-dollar"
        },
        {
            "id": "4",
            "name": "Gold ETF",
            "type": "Commodity",
            "value": 100000,
            "allocation": 10.5,
            "return": 8.2,
            "riskLevel": "Medium",
            "icon": "fas fa-coins"
        },
        {
            "id": "5",
            "name": "Fixed Deposit",
            "type": "Debt",
            "value": 375000,
            "allocation": 39.4,
            "return": 5.0,
            "riskLevel": "Low",
            "icon": "fas fa-piggy-bank"
        }
    ]
    
    # Get portfolio summary
    portfolio_summary = {
        "portfolioValue": 950000,
        "valueChange": 5.2,
        "annualReturn": 8.7,
        "benchmarkDiff": 0.5,
        "dividendIncome": 15000,
        "lastPaymentDate": "15 Feb, 2025"
    }
    
    return templates.TemplateResponse(
        "investments.html",
        {
            "request": request,
            "investments": investments,
            "portfolio_summary": portfolio_summary
        }
    )


@app.get("/documents", response_class=HTMLResponse)
async def documents(request: Request, db: Session = Depends(get_db)):
    """Render the documents page"""
    if not request.user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    
    # Get user's documents
    user_documents = db.query(Document).filter(Document.user_id == request.user.id).all()
    
    # Transform to format expected by the template
    documents = []
    for doc in user_documents:
        documents.append({
            "id": doc.id,
            "name": doc.name,
            "type": doc.type,
            "size": doc.size,
            "uploadedAt": doc.uploaded_at,
            "analysisStatus": doc.analysis_status
        })
    
    return templates.TemplateResponse(
        "documents.html",
        {"request": request, "documents": documents}
    )


@app.get("/ai-advisor", response_class=HTMLResponse)
async def ai_advisor(request: Request, db: Session = Depends(get_db)):
    """Render the AI advisor chat page"""
    if not request.user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    
    # Get chat history
    chat_history = []  # This would come from a service or database
    
    return templates.TemplateResponse(
        "ai_advisor.html",
        {"request": request, "chat_history": chat_history}
    )


@app.get("/risk-analysis", response_class=HTMLResponse)
async def risk_analysis(request: Request, db: Session = Depends(get_db)):
    """Render the risk analysis page"""
    if not request.user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    
    # Check if user has a saved risk analysis
    user_risk_analysis = db.query(RiskAnalysis).filter(
        RiskAnalysis.user_id == request.user.id
    ).order_by(RiskAnalysis.created_at.desc()).first()
    
    return templates.TemplateResponse(
        "risk_analysis.html",
        {"request": request, "risk_analysis": user_risk_analysis}
    )


@app.get("/profile", response_class=HTMLResponse)
async def profile(request: Request, db: Session = Depends(get_db)):
    """Render the profile page"""
    if not request.user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    
    # Check API connections
    groq_api_connected = bool(settings.GROQ_API_KEY)
    tavily_api_connected = bool(settings.TAVILY_API_KEY)
    
    # Get notification preferences (simple example)
    notifications = {
        "market_updates": True,
        "portfolio_alerts": True,
        "investment_recommendations": True,
        "document_analysis": True
    }
    
    return templates.TemplateResponse(
        "profile.html",
        {
            "request": request,
            "groq_api_connected": groq_api_connected,
            "tavily_api_connected": tavily_api_connected,
            "notifications": notifications
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)