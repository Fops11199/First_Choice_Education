from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime
import uuid

class Level(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True) # O-Level, A-Level
    subjects: List["Subject"] = Relationship(back_populates="level", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class Subject(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    level_id: uuid.UUID = Field(foreign_key="level.id", index=True)
    level: Level = Relationship(back_populates="subjects")
    papers: List["Paper"] = Relationship(back_populates="subject", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class Paper(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    subject_id: uuid.UUID = Field(foreign_key="subject.id", index=True)
    year: int
    paper_type: str # Paper 1, Paper 2, Paper 3
    subject: Subject = Relationship(back_populates="papers")
    videos: List["Video"] = Relationship(back_populates="paper", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    pdfs: List["PDF"] = Relationship(back_populates="paper", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class Video(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    paper_id: uuid.UUID = Field(foreign_key="paper.id", index=True)
    creator_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    youtube_id: str
    timestamps: Optional[str] = None # JSON string or text
    created_at: datetime = Field(default_factory=datetime.utcnow)
    paper: Paper = Relationship(back_populates="videos")

class PDF(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    paper_id: uuid.UUID = Field(foreign_key="paper.id", index=True)
    file_url: str
    pdf_type: str # question, answer
    created_at: datetime = Field(default_factory=datetime.utcnow)
    paper: Paper = Relationship(back_populates="pdfs")
