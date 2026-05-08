from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class AdvertBase(BaseModel):
    title: str
    image_url: str
    target_url: str
    is_active: bool = True
    display_order: int = 0

class AdvertCreate(AdvertBase):
    pass

class AdvertUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    target_url: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

class AdvertRead(AdvertBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True
