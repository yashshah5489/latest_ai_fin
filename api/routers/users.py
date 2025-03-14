"""
Users router
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import get_db
from backend.models.user import User
from backend.security import verify_password, get_password_hash
from api.dependencies import get_current_user
from api.routers.auth import UserUpdate, User as UserSchema, PasswordChange

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user info
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user data
    """
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user data
    
    Args:
        user_data: User data to update
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated user data
    """
    # Update user data
    if user_data.full_name:
        current_user.full_name = user_data.full_name
    
    if user_data.email:
        # Check if email already exists
        existing_email = db.query(User).filter(
            User.email == user_data.email,
            User.id != current_user.id
        ).first()
        
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
            
        current_user.email = user_data.email
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.put("/me/password", response_model=UserSchema)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change current user password
    
    Args:
        password_data: Password change data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated user data
        
    Raises:
        HTTPException: If current password is incorrect
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Update password
    current_user.password = get_password_hash(password_data.new_password)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user