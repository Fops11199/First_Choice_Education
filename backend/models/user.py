from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timedelta
import uuid

class UserBase(SQLModel):
    full_name: str
    email: str = Field(unique=True, index=True)
    whatsapp_number: Optional[str] = None
    role: str = Field(default="student", index=True) # student, creator, admin
    level: Optional[str] = Field(default=None, index=True) # O-Level, A-Level
    region: Optional[str] = Field(default=None, index=True)
    current_school: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)

class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime

class UserUpdate(SQLModel):
    full_name: Optional[str] = None
    whatsapp_number: Optional[str] = None
    level: Optional[str] = None
    region: Optional[str] = None
    current_school: Optional[str] = None
    password: Optional[str] = None

class PasswordResetToken(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(index=True)
    code: str
    expires_at: datetime
    is_used: bool = Field(default=False)

