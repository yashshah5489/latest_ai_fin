"""
Main application file for Smart AI Financial Analyzer
"""
import os
import datetime
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, Request, Depends, Form, HTTPException, Cookie, UploadFile, File
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session
from starlette.middleware.base import BaseHTTPMiddleware

from backend.core.config import settings
from backend.database import get_db, init_db
from backend.filters import setup_jinja_filters
from backend.security import verify_password, get_password_hash
from backend.models.user import User
from backend.services.ai_service import ai_service
from backend.services.document_service import document_service
from backend.services.investment_service import investment_service
from backend.services.news_service import news_service
from backend.services.risk_analysis_service import risk_analysis_service

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
)

# Setup static files and templates
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")
templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)

# Setup session middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie="smartfinance_session",
    max_age=60 * 60 * 24 * 7,  # 1 week
)

# Setup Jinja2 filters
setup_jinja_filters(templates)

# Make sure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


# Authentication middleware
class AuthenticationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Paths that don't require authentication
        public_paths = ['/', '/login', '/register', '/static', '/favicon.ico']
        
        # Check if path starts with any public path
        is_public = any(request.url.path.startswith(path) for path in public_paths)
        
        # Get session data
        request.session.setdefault("user_id", None)
        user_id = request.session.get("user_id")
        
        if not is_public and user_id is None:
            # Redirect to login page if not authenticated and not a public path
            return RedirectResponse(url="/login", status_code=303)
        
        # Continue with the request
        response = await call_next(request)
        return response


app.add_middleware(AuthenticationMiddleware)


@app.on_event("startup")
async def startup_event():
    """Initialize the database and other startup tasks"""
    init_db()


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Render the home page or redirect to dashboard if logged in"""
    if request.session.get("user_id"):
        return RedirectResponse(url="/dashboard", status_code=303)
    
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "title": settings.PROJECT_NAME}
    )


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Render the login page"""
    if request.session.get("user_id"):
        return RedirectResponse(url="/dashboard", status_code=303)
    
    return templates.TemplateResponse(
        "login.html",
        {"request": request, "title": "Login"}
    )


@app.post("/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Process login form"""
    # Find user by username
    user = db.query(User).filter(User.username == username).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(password, user.password):
        return templates.TemplateResponse(
            "login.html",
            {
                "request": request,
                "title": "Login",
                "error": "Invalid username or password"
            },
            status_code=400
        )
    
    # Set session data
    request.session["user_id"] = user.id
    request.session["username"] = user.username
    
    # Redirect to dashboard
    return RedirectResponse(url="/dashboard", status_code=303)


@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """Render the registration page"""
    if request.session.get("user_id"):
        return RedirectResponse(url="/dashboard", status_code=303)
    
    return templates.TemplateResponse(
        "register.html",
        {"request": request, "title": "Register"}
    )


@app.post("/register")
async def register(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(...),
    email: str = Form(...),
    db: Session = Depends(get_db)
):
    """Process registration form"""
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        return templates.TemplateResponse(
            "register.html",
            {
                "request": request,
                "title": "Register",
                "error": "Username already exists"
            },
            status_code=400
        )
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == email).first()
    if existing_email:
        return templates.TemplateResponse(
            "register.html",
            {
                "request": request,
                "title": "Register",
                "error": "Email already exists"
            },
            status_code=400
        )
    
    # Create new user
    hashed_password = get_password_hash(password)
    new_user = User(
        username=username,
        password=hashed_password,
        full_name=full_name,
        email=email,
        is_active=True,
        created_at=datetime.datetime.utcnow()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Set session data
    request.session["user_id"] = new_user.id
    request.session["username"] = new_user.username
    
    # Redirect to dashboard
    return RedirectResponse(url="/dashboard", status_code=303)


@app.get("/logout")
async def logout(request: Request):
    """Process logout"""
    request.session.clear()
    return RedirectResponse(url="/", status_code=303)


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, db: Session = Depends(get_db)):
    """Render the dashboard page"""
    user_id = request.session.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        request.session.clear()
        return RedirectResponse(url="/login", status_code=303)
    
    # Get financial news
    news = await news_service.get_financial_news()
    
    # Get AI insight
    try:
        insight = await ai_service.get_financial_insight({
            "user_id": user_id,
            "name": user.full_name
        })
    except Exception as e:
        insight = {
            "message": "Unable to generate AI insight. Please check your API key settings.",
            "confidence": 0
        }
    
    # Get dashboard data
    # This would normally come from a dashboard service or storage
    # For now, we'll use some sample data
    dashboard_data = {
        "total_balance": 750000,
        "balance_change": 0.05,
        "total_investments": 500000,
        "investments_change": 0.08,
        "monthly_expenses": 75000,
        "expenses_change": -0.02,
        "portfolio_growth": 0.12,
        "growth_change": 0.03
    }
    
    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "title": "Dashboard",
            "user": user,
            "dashboard": dashboard_data,
            "news": news,
            "insight": insight
        }
    )


@app.get("/investments", response_class=HTMLResponse)
async def investments(request: Request, db: Session = Depends(get_db)):
    """Render the investments page"""
    user_id = request.session.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        request.session.clear()
        return RedirectResponse(url="/login", status_code=303)
    
    # Get investments for user
    # This would normally come from a storage service
    # For now, we'll use some sample data
    investments_data = [
        {
            "id": "1",
            "name": "Reliance Industries",
            "type": "Equity",
            "value": 150000,
            "allocation": 0.30,
            "return": 0.15,
            "riskLevel": "Medium",
            "icon": "trending-up"
        },
        {
            "id": "2",
            "name": "HDFC Bank",
            "type": "Equity",
            "value": 100000,
            "allocation": 0.20,
            "return": 0.12,
            "riskLevel": "Medium",
            "icon": "trending-up"
        },
        {
            "id": "3",
            "name": "SBI Bluechip Fund",
            "type": "Mutual Fund",
            "value": 75000,
            "allocation": 0.15,
            "return": 0.10,
            "riskLevel": "Medium",
            "icon": "pie-chart"
        },
        {
            "id": "4",
            "name": "Government Bonds",
            "type": "Bond",
            "value": 50000,
            "allocation": 0.10,
            "return": 0.07,
            "riskLevel": "Low",
            "icon": "landmark"
        },
        {
            "id": "5",
            "name": "Fixed Deposit - ICICI",
            "type": "Fixed Deposit",
            "value": 75000,
            "allocation": 0.15,
            "return": 0.06,
            "riskLevel": "Low",
            "icon": "lock"
        },
        {
            "id": "6",
            "name": "Gold ETF",
            "type": "Gold",
            "value": 50000,
            "allocation": 0.10,
            "return": 0.08,
            "riskLevel": "Medium",
            "icon": "gem"
        }
    ]
    
    # Get portfolio summary
    portfolio_summary = {
        "portfolioValue": 500000,
        "valueChange": 0.08,
        "annualReturn": 0.12,
        "benchmarkDiff": 0.03,
        "dividendIncome": 15000,
        "lastPaymentDate": "2023-02-15"
    }
    
    return templates.TemplateResponse(
        "investments.html",
        {
            "request": request,
            "title": "Investments",
            "user": user,
            "investments": investments_data,
            "portfolio": portfolio_summary
        }
    )


@app.post("/investments/import")
async def import_investments(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Import investments from a file"""
    user_id = request.session.get("user_id")
    
    # Save the uploaded file
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    try:
        # Import investments from the file
        investments = await investment_service.import_investment_data(file_path)
        
        # In a real app, we would save these to the database
        # For now, we'll just return success
        
        return JSONResponse({
            "success": True,
            "message": f"Successfully imported {len(investments)} investments",
            "investments": investments
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "message": f"Error importing investments: {str(e)}"
        }, status_code=400)


@app.get("/documents", response_class=HTMLResponse)
async def documents(request: Request, db: Session = Depends(get_db)):
    """Render the documents page"""
    user_id = request.session.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        request.session.clear()
        return RedirectResponse(url="/login", status_code=303)
    
    # Get documents for user
    # This would normally come from a storage service or database
    # For now, we'll use some sample data
    documents_data = [
        {
            "id": 1,
            "name": "Investment Portfolio.pdf",
            "type": "pdf",
            "size": 1250,  # in KB
            "uploadedAt": datetime.datetime.now() - datetime.timedelta(days=5),
            "analysisStatus": "completed",
            "analysis": {
                "summary": "This document contains a diversified investment portfolio with moderate risk.",
                "insights": [
                    "Portfolio is well-diversified across equity, debt, and gold.",
                    "Equity allocation is 60%, which is appropriate for moderate risk tolerance.",
                    "Suggested to increase SIP investments in index funds.",
                    "Tax-saving investments are properly allocated.",
                    "Consider rebalancing to reduce exposure to banking sector."
                ]
            }
        },
        {
            "id": 2,
            "name": "Tax Statement 2022-23.pdf",
            "type": "pdf",
            "size": 980,  # in KB
            "uploadedAt": datetime.datetime.now() - datetime.timedelta(days=10),
            "analysisStatus": "completed",
            "analysis": {
                "summary": "Annual tax statement showing income sources, tax deductions, and final tax liability.",
                "insights": [
                    "Total tax liability is ₹245,000 for FY 2022-23.",
                    "Section 80C deductions are fully utilized (₹150,000).",
                    "Home loan interest deduction can be optimized further.",
                    "Medical insurance premium can be increased for additional tax benefits.",
                    "Consider investing in ELSS for tax-saving with higher returns."
                ]
            }
        },
        {
            "id": 3,
            "name": "Financial Plan 2023.xlsx",
            "type": "xlsx",
            "size": 825,  # in KB
            "uploadedAt": datetime.datetime.now() - datetime.timedelta(days=2),
            "analysisStatus": "pending",
            "analysis": None
        }
    ]
    
    return templates.TemplateResponse(
        "documents.html",
        {
            "request": request,
            "title": "Documents",
            "user": user,
            "documents": documents_data
        }
    )


@app.post("/documents/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and analyze a document"""
    user_id = request.session.get("user_id")
    
    # Check file size
    content = await file.read()
    file_size = len(content)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        return JSONResponse({
            "success": False,
            "message": f"File is too large. Maximum size is {settings.MAX_UPLOAD_SIZE/1024/1024:.1f}MB"
        }, status_code=400)
    
    # Save the uploaded file
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Get file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    # Analyze the document
    try:
        analysis = await document_service.analyze_document(file_path, file_ext[1:])
        
        # In a real app, we would save the document and analysis to the database
        # For now, we'll just return the analysis
        
        # Create document object
        document = {
            "id": 999,  # In a real app, this would be the database ID
            "name": file.filename,
            "path": file_path,
            "type": file_ext[1:],
            "size": file_size / 1024,  # Convert to KB
            "uploadedAt": datetime.datetime.now(),
            "analysisStatus": "completed",
            "analysis": analysis
        }
        
        return JSONResponse({
            "success": True,
            "document": document
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "message": f"Error analyzing document: {str(e)}"
        }, status_code=400)


@app.get("/ai-advisor", response_class=HTMLResponse)
async def ai_advisor(request: Request, db: Session = Depends(get_db)):
    """Render the AI advisor chat page"""
    user_id = request.session.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        request.session.clear()
        return RedirectResponse(url="/login", status_code=303)
    
    # Get chat history for user
    # This would normally come from a storage service or database
    # For now, we'll use some sample data
    chat_history = [
        {
            "id": "1",
            "content": "How should I allocate my investments for retirement planning?",
            "role": "user",
            "timestamp": datetime.datetime.now() - datetime.timedelta(days=1, hours=2)
        },
        {
            "id": "2",
            "content": "For retirement planning in India, I recommend a balanced approach. Consider allocating:\n\n- 40% to equity mutual funds (focus on index funds and large-cap funds)\n- 30% to debt instruments like PPF, EPF, or government bonds\n- 20% to hybrid funds or balanced advantage funds\n- 10% to gold or international funds for diversification\n\nAlso, maximize your NPS contributions for tax benefits under Section 80CCD(1B). Review your portfolio annually and gradually shift towards debt as you approach retirement age.",
            "role": "assistant",
            "timestamp": datetime.datetime.now() - datetime.timedelta(days=1, hours=2)
        },
        {
            "id": "3",
            "content": "What are the tax implications of short-term investments?",
            "role": "user",
            "timestamp": datetime.datetime.now() - datetime.timedelta(hours=5)
        },
        {
            "id": "4",
            "content": "In India, short-term investments have these tax implications:\n\n1. Equity and equity mutual funds (held < 1 year): 15% STCG tax on profits\n2. Debt mutual funds (held < 3 years): Profits added to your income and taxed at your income tax slab rate\n3. Fixed deposits: Interest is added to your income and taxed at your slab rate\n4. Real estate (held < 2 years): Profits added to your income and taxed at your slab rate\n\nAdditionally, remember that TDS may be applicable on certain interest incomes. Consider tax-saving options like ELSS funds (3-year lock-in) that offer tax deduction under Section 80C while providing equity exposure.",
            "role": "assistant",
            "timestamp": datetime.datetime.now() - datetime.timedelta(hours=5)
        }
    ]
    
    return templates.TemplateResponse(
        "ai_advisor.html",
        {
            "request": request,
            "title": "AI Financial Advisor",
            "user": user,
            "chat_history": chat_history
        }
    )


@app.post("/ai-advisor/chat")
async def chat_with_ai(
    request: Request,
    message: str = Form(...),
    db: Session = Depends(get_db)
):
    """Process chat message to AI advisor"""
    user_id = request.session.get("user_id")
    
    try:
        # Get AI response
        response = await ai_service.chat_with_ai(message, user_id=user_id)
        
        # In a real app, we would save the chat message and response to the database
        
        return JSONResponse({
            "success": True,
            "response": response,
            "timestamp": datetime.datetime.now().isoformat()
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "message": f"Error processing message: {str(e)}"
        }, status_code=400)


@app.get("/risk-analysis", response_class=HTMLResponse)
async def risk_analysis(request: Request, db: Session = Depends(get_db)):
    """Render the risk analysis page"""
    user_id = request.session.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        request.session.clear()
        return RedirectResponse(url="/login", status_code=303)
    
    # Get existing risk analysis for user if available
    # This would normally come from a storage service or database
    # For now, we'll use some sample data
    risk_analysis_data = {
        "age": 35,
        "investmentHorizon": 20,
        "riskTolerance": 7,
        "emergencyFund": 6,
        "incomeStability": 8,
        "result": {
            "riskScore": 72.5,
            "riskCategory": "Moderately Aggressive",
            "assetAllocation": {
                "equities": 65,
                "fixedIncome": 20,
                "gold": 10,
                "cash": 5
            },
            "recommendations": [
                "Consider increasing exposure to index funds for long-term growth",
                "Maintain 6 months of emergency fund in high-yield savings",
                "Invest in a mix of large-cap and mid-cap funds for equity exposure",
                "Allocate 20% to debt through a mix of government securities and corporate bonds",
                "Consider small allocation to international funds for diversification"
            ]
        },
        "createdAt": datetime.datetime.now() - datetime.timedelta(days=30)
    }
    
    return templates.TemplateResponse(
        "risk_analysis.html",
        {
            "request": request,
            "title": "Risk Analysis",
            "user": user,
            "risk_analysis": risk_analysis_data
        }
    )


@app.post("/risk-analysis/analyze")
async def analyze_risk(
    request: Request,
    age: int = Form(...),
    investment_horizon: int = Form(...),
    risk_tolerance: int = Form(...),
    emergency_fund: int = Form(...),
    income_stability: int = Form(...),
    db: Session = Depends(get_db)
):
    """Process risk analysis form"""
    user_id = request.session.get("user_id")
    
    # Create risk profile data
    risk_profile = {
        "age": age,
        "investmentHorizon": investment_horizon,
        "riskTolerance": risk_tolerance,
        "emergencyFund": emergency_fund,
        "incomeStability": income_stability
    }
    
    try:
        # Analyze risk profile
        result = await risk_analysis_service.analyze_risk_profile(risk_profile)
        
        # In a real app, we would save the risk analysis to the database
        
        return JSONResponse({
            "success": True,
            "result": result
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "message": f"Error analyzing risk profile: {str(e)}"
        }, status_code=400)


@app.get("/profile", response_class=HTMLResponse)
async def profile(request: Request, db: Session = Depends(get_db)):
    """Render the profile page"""
    user_id = request.session.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        request.session.clear()
        return RedirectResponse(url="/login", status_code=303)
    
    return templates.TemplateResponse(
        "profile.html",
        {
            "request": request,
            "title": "Profile",
            "user": user
        }
    )


@app.post("/profile/update")
async def update_profile(
    request: Request,
    full_name: str = Form(...),
    email: str = Form(...),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    user_id = request.session.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        request.session.clear()
        return RedirectResponse(url="/login", status_code=303)
    
    # Update user profile
    user.full_name = full_name
    user.email = email
    
    db.commit()
    
    return RedirectResponse(url="/profile", status_code=303)


@app.post("/profile/change-password")
async def change_password(
    request: Request,
    current_password: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Change user password"""
    user_id = request.session.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        request.session.clear()
        return RedirectResponse(url="/login", status_code=303)
    
    # Verify current password
    if not verify_password(current_password, user.password):
        return templates.TemplateResponse(
            "profile.html",
            {
                "request": request,
                "title": "Profile",
                "user": user,
                "error": "Current password is incorrect"
            },
            status_code=400
        )
    
    # Update password
    user.password = get_password_hash(new_password)
    
    db.commit()
    
    return RedirectResponse(url="/profile", status_code=303)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)