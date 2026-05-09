from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Advert(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    image_url: str
    target_url: str
    is_active: bool = Field(default=True)
    display_order: int = Field(default=0)
    description: Optional[str] = None
    available_regions: Optional[str] = None
    location: Optional[str] = None
    programs: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    institution_type: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
