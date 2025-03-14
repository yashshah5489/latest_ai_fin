"""
Documents router for document management and analysis
"""
import os
import shutil
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import get_db
from backend.models.document import Document
from backend.services.document_service import document_service
from backend.core.config import settings
from api.dependencies import get_current_user

router = APIRouter(prefix="/documents", tags=["documents"])

class DocumentResponse(BaseModel):
    """Document response model"""
    id: int
    name: str
    type: str
    size: int
    uploaded_at: datetime
    analysis_status: str
    
    class Config:
        orm_mode = True

class DocumentAnalysisResponse(BaseModel):
    """Document analysis response model"""
    summary: str
    insights: List[str]

@router.get("", response_model=List[DocumentResponse])
async def get_documents(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all user documents
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of documents
    """
    documents = db.query(Document).filter(Document.user_id == current_user.id).all()
    return documents

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get document by ID
    
    Args:
        document_id: Document ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Document
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document

@router.get("/{document_id}/analysis", response_model=DocumentAnalysisResponse)
async def get_document_analysis(
    document_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get document analysis
    
    Args:
        document_id: Document ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Document analysis
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if document.analysis_status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document analysis is {document.analysis_status}"
        )
    
    return document.analysis

@router.post("", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a new document
    
    Args:
        file: Document file
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Uploaded document
    """
    # Validate file size
    if file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large (max {settings.MAX_UPLOAD_SIZE / 1024 / 1024} MB)"
        )
    
    # Validate file type
    allowed_extensions = ['.pdf', '.xlsx', '.xls']
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )
    finally:
        file.file.close()
    
    # Create document in database
    document = Document(
        name=file.filename,
        path=file_path,
        type=file.content_type or file_extension[1:],
        size=file.size,
        analysis_status="pending",
        user_id=current_user.id
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Start analysis in background
    # This would typically be done in a background task or queue
    # but for simplicity, we'll just call it directly here
    try:
        # Analyze document
        analysis = await document_service.analyze_document(file_path, file_extension[1:])
        
        # Update document with analysis
        document.analysis = analysis
        document.analysis_status = "completed"
        
        db.commit()
        db.refresh(document)
    except Exception as e:
        # Update document with failed status
        document.analysis_status = "failed"
        db.commit()
    
    return document

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete document
    
    Args:
        document_id: Document ID
        current_user: Current authenticated user
        db: Database session
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete file
    try:
        if os.path.exists(document.path):
            os.remove(document.path)
    except Exception as e:
        # Log error but continue
        pass
    
    # Delete from database
    db.delete(document)
    db.commit()
    
    return