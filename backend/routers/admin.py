"""
Admin Router — /api/v1/admin/*

ALL endpoints require admin role.
Covers: stats, users, full CRUD for levels/subjects/papers/videos/pdfs.
"""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlmodel import Session, select, func
from db.database import get_session
from models.user import User
from models.content import Level, Subject, Paper, Video, PDF
from schemas.content import (
    LevelBaseSchema, LevelResponseSchema,
    SubjectBaseSchema, SubjectResponseSchema,
    PaperBaseSchema,
    VideoBaseSchema,
    PDFBaseSchema
)
from core.security import require_admin
from typing import List
import uuid
import os
import shutil
import time

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Platform Stats ───────────────────────────────────────────
@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """Platform-wide statistics for the admin dashboard."""
    student_count = db.exec(select(func.count(User.id)).where(User.role == "student")).one()
    subject_count = db.exec(select(func.count(Subject.id))).one()
    paper_count = db.exec(select(func.count(Paper.id))).one()
    video_count = db.exec(select(func.count(Video.id))).one()

    return {
        "total_students": student_count,
        "total_subjects": subject_count,
        "total_papers": paper_count,
        "total_videos": video_count,
    }


@router.get("/recent-subjects")
def get_recent_subjects(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """5 most recently added subjects."""
    statement = select(Subject).order_by(Subject.id.desc()).limit(5)
    subjects = db.exec(statement).all()
    return [
        {
            "id": str(s.id),
            "name": s.name,
            "level": s.level.name if s.level else "Unknown",
            "paper_count": len(s.papers),
        }
        for s in subjects
    ]


# ── User Management ──────────────────────────────────────────
@router.get("/users")
def list_users(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """List all registered students."""
    users = db.exec(select(User).where(User.role == "student")).all()
    return [
        {
            "id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "level": u.level,
            "is_active": u.is_active,
        }
        for u in users
    ]


# ── Levels CRUD ──────────────────────────────────────────────
@router.get("/levels", response_model=List[LevelResponseSchema])
def list_levels(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    return db.exec(select(Level)).all()


@router.post("/levels", response_model=LevelResponseSchema, status_code=status.HTTP_201_CREATED)
def create_level(
    level_data: LevelBaseSchema,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    level = Level(**level_data.model_dump())
    db.add(level)
    db.commit()
    db.refresh(level)
    return level


@router.put("/levels/{level_id}", response_model=LevelResponseSchema)
def update_level(
    level_id: uuid.UUID,
    level_data: LevelBaseSchema,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    level = db.get(Level, level_id)
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    level.name = level_data.name
    db.add(level)
    db.commit()
    db.refresh(level)
    return level


@router.delete("/levels/{level_id}")
def delete_level(
    level_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    level = db.get(Level, level_id)
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    db.delete(level)
    db.commit()
    return {"message": "Level deleted"}


# ── Subjects CRUD ────────────────────────────────────────────
@router.get("/subjects", response_model=List[SubjectResponseSchema])
def list_subjects(
    level_id: uuid.UUID = None,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    if level_id:
        subjects = db.exec(select(Subject).where(Subject.level_id == level_id)).all()
    else:
        subjects = db.exec(select(Subject)).all()

    results = []
    for sub in subjects:
        sub_dict = sub.model_dump()
        sub_dict["level_name"] = sub.level.name if sub.level else "Unknown"
        sub_dict["papers"] = sub.papers
        results.append(sub_dict)
    return results


@router.post("/subjects", response_model=SubjectResponseSchema, status_code=status.HTTP_201_CREATED)
def create_subject(
    subject_data: SubjectBaseSchema,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    subject = Subject(**subject_data.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    sub_dict = subject.model_dump()
    sub_dict["level_name"] = subject.level.name if subject.level else "Unknown"
    sub_dict["papers"] = subject.papers
    return sub_dict


@router.put("/subjects/{subject_id}", response_model=SubjectResponseSchema)
def update_subject(
    subject_id: uuid.UUID,
    subject_data: SubjectBaseSchema,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    subject.name = subject_data.name
    subject.level_id = subject_data.level_id
    db.add(subject)
    db.commit()
    db.refresh(subject)
    sub_dict = subject.model_dump()
    sub_dict["level_name"] = subject.level.name if subject.level else "Unknown"
    sub_dict["papers"] = subject.papers
    return sub_dict


@router.delete("/subjects/{subject_id}")
def delete_subject(
    subject_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return {"message": "Subject deleted"}


# ── Papers CRUD ──────────────────────────────────────────────
@router.get("/papers")
def list_papers(
    subject_id: uuid.UUID = None,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    if subject_id:
        papers = db.exec(select(Paper).where(Paper.subject_id == subject_id)).all()
    else:
        papers = db.exec(select(Paper)).all()
    return [
        {
            "id": str(p.id),
            "year": p.year,
            "paper_type": p.paper_type,
            "subject_id": str(p.subject_id),
            "video_count": len(p.videos),
            "pdf_count": len(p.pdfs),
        }
        for p in papers
    ]


@router.post("/papers", status_code=status.HTTP_201_CREATED)
def create_paper(
    paper_data: PaperBaseSchema,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    paper = Paper(**paper_data.model_dump())
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return {"id": str(paper.id), "year": paper.year, "paper_type": paper.paper_type}


@router.put("/papers/{paper_id}")
def update_paper(
    paper_id: uuid.UUID,
    paper_data: PaperBaseSchema,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    paper = db.get(Paper, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    paper.year = paper_data.year
    paper.paper_type = paper_data.paper_type
    paper.subject_id = paper_data.subject_id
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return {"id": str(paper.id), "year": paper.year, "paper_type": paper.paper_type}


@router.delete("/papers/{paper_id}")
def delete_paper(
    paper_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    paper = db.get(Paper, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    db.delete(paper)
    db.commit()
    return {"message": "Paper deleted"}


# ── Videos (sub-resource of papers) ─────────────────────────
@router.post("/papers/{paper_id}/videos", status_code=status.HTTP_201_CREATED)
def add_video_to_paper(
    paper_id: uuid.UUID,
    video_data: VideoBaseSchema,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """Add a YouTube video solution to a paper."""
    paper = db.get(Paper, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    video = Video(**video_data.model_dump(), paper_id=paper_id)
    video.creator_id = current_user.id  # auto-attribute to admin
    db.add(video)
    db.commit()
    db.refresh(video)
    return {"id": str(video.id), "youtube_id": video.youtube_id}


@router.delete("/videos/{video_id}")
def delete_video(
    video_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    video = db.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    db.delete(video)
    db.commit()
    return {"message": "Video deleted"}


# ── PDFs (sub-resource of papers) ───────────────────────────
@router.post("/papers/{paper_id}/pdfs", status_code=status.HTTP_201_CREATED)
def add_pdf_to_paper(
    paper_id: uuid.UUID,
    pdf_data: PDFBaseSchema,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """Add a PDF (question paper or marking scheme) to a paper."""
    paper = db.get(Paper, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    pdf = PDF(**pdf_data.model_dump(), paper_id=paper_id)
    db.add(pdf)
    db.commit()
    db.refresh(pdf)
    return {"id": str(pdf.id), "file_url": pdf.file_url, "pdf_type": pdf.pdf_type}


@router.delete("/pdfs/{pdf_id}")
def delete_pdf(
    pdf_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    pdf = db.get(PDF, pdf_id)
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    db.delete(pdf)
    db.commit()
    return {"message": "PDF deleted"}


# ── File Uploads ─────────────────────────────────────────────
@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin)
):
    """Upload a file to local storage and return the public URL."""
    try:
        # Create unique filename to prevent collisions
        timestamp = int(time.time())
        filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join("uploads", filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return URL (hardcoded localhost for now, should be env variable in prod)
        # Note: Students will access via http://localhost:8000/uploads/...
        public_url = f"http://localhost:8000/uploads/{filename}"
        
        return {"url": public_url, "filename": filename}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )
