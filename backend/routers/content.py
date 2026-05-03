"""
Content Router — /api/v1/content/*

READ-ONLY. All endpoints require authentication.
All write operations (create/update/delete) live in /admin/* instead.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db.database import get_session
from models.content import Level, Subject, Paper
from models.user import User
from schemas.content import LevelResponseSchema, SubjectResponseSchema
from core.security import require_user
from typing import List
import uuid

router = APIRouter(prefix="/content", tags=["Content"])


# ── Levels ───────────────────────────────────────────────────
@router.get("/levels", response_model=List[LevelResponseSchema])
def get_levels(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """List all GCE levels (O-Level, A-Level)."""
    return db.exec(select(Level)).all()


# ── Subjects ─────────────────────────────────────────────────
@router.get("/subjects", response_model=List[SubjectResponseSchema])
def get_subjects(
    level_id: uuid.UUID = None,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """List all subjects, optionally filtered by level."""
    if level_id:
        statement = select(Subject).where(Subject.level_id == level_id)
    else:
        statement = select(Subject)
    subjects = db.exec(statement).all()

    results = []
    for sub in subjects:
        sub_dict = sub.model_dump()
        sub_dict["level_name"] = sub.level.name if sub.level else "Unknown"
        sub_dict["papers"] = sub.papers
        results.append(sub_dict)
    return results


@router.get("/subjects/{subject_id}/papers")
def get_papers_for_subject(
    subject_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Get all papers for a specific subject (sub-resource pattern)."""
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    papers = db.exec(
        select(Paper).where(Paper.subject_id == subject_id)
    ).all()

    return {
        "subject_id": str(subject_id),
        "subject_name": subject.name,
        "level": subject.level.name if subject.level else "Unknown",
        "papers": [
            {
                "id": str(p.id),
                "year": p.year,
                "paper_type": p.paper_type,
                "video_count": len(p.videos),
                "pdf_count": len(p.pdfs),
            }
            for p in papers
        ]
    }


# ── Papers ───────────────────────────────────────────────────
@router.get("/papers/{paper_id}")
def get_paper(
    paper_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Get a single paper with its videos and PDFs."""
    paper = db.get(Paper, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    return {
        "id": str(paper.id),
        "year": paper.year,
        "paper_type": paper.paper_type,
        "subject": paper.subject.name if paper.subject else "Unknown",
        "level": paper.subject.level.name if paper.subject and paper.subject.level else "Unknown",
        "videos": [
            {
                "id": str(v.id),
                "youtube_id": v.youtube_id,
                "timestamps": v.timestamps,
            }
            for v in paper.videos
        ],
        "pdfs": [
            {
                "id": str(p.id),
                "file_url": p.file_url,
                "pdf_type": p.pdf_type,
            }
            for p in paper.pdfs
        ],
    }
