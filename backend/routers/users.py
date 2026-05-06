from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db.database import get_session
from models.user import User
from core.security import get_current_user, verify_password, get_password_hash, require_user
from pydantic import BaseModel
import uuid
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/search")
def search_users(
    query: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Search for users by name (for invitations)."""
    statement = select(User).where(User.full_name.ilike(f"%{query}%")).limit(10)
    users = db.exec(statement).all()
    return [{"id": u.id, "full_name": u.full_name, "role": u.role} for u in users]

@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "whatsapp_number": current_user.whatsapp_number,
        "level": current_user.level,
        "role": current_user.role,
        "is_active": current_user.is_active,
    }


@router.put("/me")
def update_my_profile(
    updates: dict,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update the currently authenticated user's profile (name, whatsapp, level)."""
    allowed_fields = {"full_name", "whatsapp_number", "level"}
    
    for field, value in updates.items():
        if field in allowed_fields:
            setattr(current_user, field, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "whatsapp_number": current_user.whatsapp_number,
        "level": current_user.level,
        "role": current_user.role,
    }

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.post("/me/password")
def update_password(
    data: PasswordUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    current_user.password_hash = get_password_hash(data.new_password)
    db.add(current_user)
    db.commit()
    return {"detail": "Password updated successfully"}
