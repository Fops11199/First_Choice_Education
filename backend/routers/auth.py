from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta

from db.database import get_session
from models.user import User, PasswordResetToken
from schemas.user import UserCreateSchema, UserResponseSchema, TokenSchema
from core.security import verify_password, get_password_hash, create_access_token
from core.config import settings
import logging
import secrets
import random
import string
import requests
import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

from pydantic import BaseModel


@router.post("/register", response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreateSchema, db: Session = Depends(get_session)):
    try:
        # Check if email exists
        statement = select(User).where(User.email == user_in.email)
        if db.exec(statement).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"field": "email", "message": "This email is already registered."}
            )
        
        # Check if whatsapp number exists
        if user_in.whatsapp_number:
            statement = select(User).where(User.whatsapp_number == user_in.whatsapp_number)
            if db.exec(statement).first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"field": "whatsappNumber", "message": "This WhatsApp number is already in use."}
                )
        
        # Create new user
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            full_name=user_in.full_name,
            email=user_in.email,
            password_hash=hashed_password,
            whatsapp_number=user_in.whatsapp_number,
            level=user_in.level
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration error: {str(e)}"
        )

@router.post("/login", response_model=TokenSchema)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    try:
        statement = select(User).where(User.email == form_data.username)
        user = db.exec(statement).first()
        
        if not user or not verify_password(form_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
            
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": str(user.id), "role": user.role},
            expires_delta=access_token_expires
        )
        
        onboarding_required = False if user.role == "admin" else (not user.whatsapp_number or not user.level)
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": user,
            "onboarding_required": onboarding_required
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )


class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_session)):
    user = db.exec(select(User).where(User.email == req.email)).first()
    if not user:
        # We don't want to reveal if email exists or not for security
        return {"detail": "If your email is registered, you will receive a reset code."}
    
    # Generate 6-digit code
    code = ''.join(random.choices(string.digits, k=6))
    
    # Invalidate previous tokens
    previous_tokens = db.exec(select(PasswordResetToken).where(
        (PasswordResetToken.email == req.email) & (PasswordResetToken.is_used == False)
    )).all()
    for token in previous_tokens:
        token.is_used = True
        db.add(token)
        
    # Create new token
    from datetime import datetime
    new_token = PasswordResetToken(
        email=req.email,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=15)
    )
    db.add(new_token)
    db.commit()
    
    # Send email via Brevo
    if settings.BREVO_API_KEY != "dummy_key":
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json"
        }
        payload = {
            "sender": {"name": "First Choice Education", "email": "fopahpricely01@gmail.com"},
            "to": [{"email": req.email}],
            "subject": "Your Password Reset Code",
            "htmlContent": f"<html><body><h2>Password Reset</h2><p>Your password reset code is: <strong style='font-size: 24px;'>{code}</strong></p><p>This code is valid for 15 minutes.</p></body></html>"
        }
        try:
            requests.post(url, json=payload, headers=headers)
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
    else:
        logger.info(f"DUMMY EMAIL TO {req.email}: Code is {code}")
        
    return {"detail": "If your email is registered, you will receive a reset code."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_session)):
    from datetime import datetime
    # Find token
    token = db.exec(select(PasswordResetToken).where(
        (PasswordResetToken.email == req.email) & 
        (PasswordResetToken.code == req.code) &
        (PasswordResetToken.is_used == False)
    )).first()
    
    if not token or token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")
        
    # Find user
    user = db.exec(select(User).where(User.email == req.email)).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found.")
        
    # Update password
    user.password_hash = get_password_hash(req.new_password)
    token.is_used = True
    
    db.add(user)
    db.add(token)
    db.commit()
    
    return {"detail": "Password has been reset successfully. You can now login."}

class GoogleAuthRequest(BaseModel):
    access_token: str

@router.post("/google", response_model=TokenSchema)
def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_session)):
    try:
        # Fetch user info using the access token
        google_url = f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={req.access_token}"
        response = requests.get(google_url)
        
        if response.status_code != 200:
            raise ValueError("Invalid Google token")
            
        idinfo = response.json()
        email = idinfo['email']
        name = idinfo.get('name', 'Google User')
        
        # Check if user exists
        user = db.exec(select(User).where(User.email == email)).first()
        
        if not user:
            # Create new user via Google
            random_password = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
            hashed_password = get_password_hash(random_password)
            user = User(
                full_name=name,
                email=email,
                password_hash=hashed_password
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
            
        # Create standard token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": str(user.id), "role": user.role},
            expires_delta=access_token_expires
        )
        
        onboarding_required = False if user.role == "admin" else (not user.whatsapp_number or not user.level)
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": user,
            "onboarding_required": onboarding_required
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

