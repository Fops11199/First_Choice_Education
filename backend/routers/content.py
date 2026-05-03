from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db.database import get_session
from models.content import Level, Subject, Paper
from schemas.content import LevelResponseSchema, SubjectResponseSchema, SubjectBaseSchema
from typing import List
import uuid

router = APIRouter(prefix="/content", tags=["content"])

# Level Endpoints
@router.get("/levels", response_model=List[LevelResponseSchema])
def get_levels(db: Session = Depends(get_session)):
    levels = db.exec(select(Level)).all()
    return levels

@router.post("/levels", response_model=LevelResponseSchema, status_code=status.HTTP_201_CREATED)
def create_level(level: Level, db: Session = Depends(get_session)):
    db.add(level)
    db.commit()
    db.refresh(level)
    return level

# Subject Endpoints
@router.get("/subjects", response_model=List[SubjectResponseSchema])
def get_subjects(level_id: uuid.UUID = None, db: Session = Depends(get_session)):
    if level_id:
        statement = select(Subject).where(Subject.level_id == level_id)
    else:
        statement = select(Subject)
    subjects = db.exec(statement).all()
    return subjects

@router.post("/subjects", response_model=SubjectResponseSchema, status_code=status.HTTP_201_CREATED)
def create_subject(subject_data: SubjectBaseSchema, db: Session = Depends(get_session)):
    subject = Subject(**subject_data.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject

# Paper Endpoints
@router.get("/papers/{paper_id}")
def get_paper(paper_id: uuid.UUID, db: Session = Depends(get_session)):
    paper = db.get(Paper, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper
