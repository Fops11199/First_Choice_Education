from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class VideoBaseSchema(BaseModel):
    youtube_id: str
    timestamps: Optional[str] = None
    creator_id: Optional[uuid.UUID] = None

class VideoResponseSchema(VideoBaseSchema):
    id: uuid.UUID
    created_at: datetime
    class Config:
        from_attributes = True

class PDFBaseSchema(BaseModel):
    file_url: str
    pdf_type: str = Field(pattern="^(question|answer)$")

class PDFResponseSchema(PDFBaseSchema):
    id: uuid.UUID
    created_at: datetime
    class Config:
        from_attributes = True

class PaperBaseSchema(BaseModel):
    subject_id: uuid.UUID
    year: int
    paper_type: str = Field(pattern="^(Paper 1|Paper 2|Paper 3)$")

class PaperResponseSchema(PaperBaseSchema):
    id: uuid.UUID
    videos: List[VideoResponseSchema] = []
    pdfs: List[PDFResponseSchema] = []
    
    class Config:
        from_attributes = True

class SubjectBaseSchema(BaseModel):
    name: str
    level_id: uuid.UUID

class SubjectResponseSchema(SubjectBaseSchema):
    id: uuid.UUID
    level_name: Optional[str] = None
    papers: List[PaperResponseSchema] = []

    class Config:
        from_attributes = True

class LevelBaseSchema(BaseModel):
    name: str = Field(pattern="^(O-Level|A-Level)$")

class LevelResponseSchema(LevelBaseSchema):
    id: uuid.UUID
    subjects: List[SubjectResponseSchema] = []

    class Config:
        from_attributes = True

class DashboardStatsSchema(BaseModel):
    total_papers_completed: int
    subject_progress: dict[str, dict[str, int]] # e.g. {"Maths": {"completed": 12, "total": 20}}
    recently_viewed: List[PaperResponseSchema]
