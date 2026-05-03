from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta

from db.database import get_session
from models.user import User
from schemas.user import UserCreateSchema, UserResponseSchema, TokenSchema
from core.security import verify_password, get_password_hash, create_access_token
from core.config import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import logging
import secrets

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

from pydantic import BaseModel
class GoogleLoginSchema(BaseModel):
    credential: str

@router.post("/register", response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreateSchema, db: Session = Depends(get_session)):
    try:
        # Check if user exists
        statement = select(User).where(User.email == user_in.email)
        existing_user = db.exec(statement).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
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
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration."
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
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@router.post("/google", response_model=TokenSchema)
def google_login(data: GoogleLoginSchema, db: Session = Depends(get_session)):
    try:
        # Verify Google Token
        id_info = id_token.verify_oauth2_token(
            data.credential, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        email = id_info['email']
        full_name = id_info.get('name', 'Google User')
        
        # Check if user exists
        statement = select(User).where(User.email == email)
        user = db.exec(statement).first()
        
        if not user:
            # Auto-register Google user
            # We use a random string for password_hash since they use Google
            random_pass = secrets.token_urlsafe(32)
            user = User(
                full_name=full_name,
                email=email,
                password_hash=get_password_hash(random_pass),
                role="student"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
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
    except ValueError:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during Google login."
        )
