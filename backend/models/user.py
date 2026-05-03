from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class UserBase(SQLModel):
    full_name: str
    email: str = Field(unique=True, index=True)
    whatsapp_number: Optional[str] = None
    role: str = Field(default="student") # student, creator, admin
    level: Optional[str] = None # O-Level, A-Level
    is_active: bool = Field(default=True)

class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
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
    password: Optional[str] = None
