import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.database import get_db
from backend.models.user import User
from backend.models.document import Document
from backend.services.document_service import document_service
from backend.config import settings
from api.dependencies import get_current_user

router = APIRouter(
    prefix="/api/v1/documents",
    tags=["documents"],
    responses={401: {"description": "Not authenticated"}},
)

@router.get("/")
async def get_user_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all documents for the current user
    
    Returns:
        List of user documents
    """
    documents = db.query(Document).filter(Document.user_id == current_user.id).all()
    
    result = []
    for doc in documents:
        result.append({
            "id": doc.id,
            "name": doc.name,
            "type": doc.type,
            "size": doc.size,
            "uploadedAt": doc.uploaded_at,
            "analysisStatus": doc.analysis_status,
            "analysis": {
                "summary": doc.summary,
                "insights": doc.insights
            } if doc.analysis_status == "completed" else None
        })
    
    return result

async def analyze_document_task(document_id: int, file_path: str, file_type: str, db: Session):
    """Background task to analyze a document"""
    try:
        # Get analysis from document service
        analysis = await document_service.analyze_document(file_path, file_type)
        
        # Update document in database
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            document.analysis_status = "completed"
            document.summary = analysis.get("summary")
            document.insights = analysis.get("insights")
            db.commit()
    except Exception as e:
        # Mark analysis as failed
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            document.analysis_status = "failed"
            db.commit()

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and analyze a new document
    
    Args:
        file: The document file to upload
        
    Returns:
        Document information with analysis status
    """
    # Validate file
    # Check file size (10MB limit)
    max_size = settings.MAX_UPLOAD_SIZE
    content = await file.read()
    size = len(content) / 1024  # Size in KB
    
    if size > max_size:
        raise HTTPException(status_code=400, detail=f"File too large, maximum size is {max_size/1024} MB")
    
    # Get file extension
    filename = file.filename
    file_extension = filename.split(".")[-1].lower() if "." in filename else ""
    
    # Only allow certain file types
    allowed_extensions = ["pdf", "xlsx", "xls", "csv", "txt"]
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type not supported. Allowed types: {', '.join(allowed_extensions)}")
    
    # Create uploads directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Create user-specific directory
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, f"user_{current_user.id}")
    os.makedirs(user_upload_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(user_upload_dir, filename)
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Create document record in database
    document = Document(
        name=filename,
        path=file_path,
        type=file_extension,
        size=size,
        analysis_status="pending",
        user_id=current_user.id
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Start background task to analyze document
    background_tasks.add_task(
        analyze_document_task,
        document_id=document.id,
        file_path=file_path,
        file_type=file_extension,
        db=db
    )
    
    return {
        "id": document.id,
        "name": document.name,
        "type": document.type,
        "size": document.size,
        "uploadedAt": document.uploaded_at,
        "analysisStatus": document.analysis_status
    }

@router.get("/{document_id}/analysis")
async def get_document_analysis(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get analysis for a specific document
    
    Args:
        document_id: The ID of the document
        
    Returns:
        Document analysis
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if document.analysis_status == "pending":
        return {
            "status": "pending",
            "message": "Document analysis is still in progress"
        }
    elif document.analysis_status == "failed":
        return {
            "status": "failed",
            "message": "Document analysis failed"
        }
    
    return {
        "status": "completed",
        "summary": document.summary,
        "insights": document.insights
    }