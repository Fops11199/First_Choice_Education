from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta

from db.database import get_session
from models.user import User
from schemas.user import UserCreateSchema, UserResponseSchema, TokenSchema
from core.security import verify_password, get_password_hash, create_access_token
from core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

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
        
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login."
        )
