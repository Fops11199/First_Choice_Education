"""
Admin Router — /api/v1/admin/*

ALL endpoints require admin role.
Covers: stats, users, full CRUD for levels/subjects/papers/videos/pdfs.
"""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Request
from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload
from db.database import get_session
from models.user import User
from models.content import Level, Subject, Paper, Video, PDF
from models.review import Review
from models.notification import Notification
from schemas.content import (
    LevelBaseSchema, LevelResponseSchema,
    SubjectBaseSchema, SubjectResponseSchema,
    PaperBaseSchema,
    VideoBaseSchema,
    PDFBaseSchema
)
from schemas.user import UserRoleUpdateSchema, UserCreateAdminSchema
from core.security import require_admin, get_password_hash
from typing import List, Optional
import uuid
import os
import shutil
import time
from pydantic import BaseModel

class ReviewResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    rating: int
    content: str
    created_at: str
    is_approved: Optional[bool] = None

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Platform Stats ───────────────────────────────────────────
@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """Platform-wide statistics for the admin dashboard."""
    from datetime import datetime, timedelta
    
    # Basic Counts
    student_count = db.exec(select(func.count(User.id)).where(User.role == "student")).one()
    subject_count = db.exec(select(func.count(Subject.id))).one()
    paper_count = db.exec(select(func.count(Paper.id))).one()
    video_count = db.exec(select(func.count(Video.id))).one()

    # Calculate Signups in last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    new_signups_week = db.exec(
        select(func.count(User.id))
        .where(User.role == "student")
        .where(User.created_at >= seven_days_ago)
    ).one()

    # Calculate Student growth (simulated trend since we might not have many months of data)
    # If we have 0 students, growth is 0. If we have signups this week, growth is positive.
    growth = 0
    if student_count > 0:
        growth = int((new_signups_week / student_count) * 100) if student_count > new_signups_week else 100

    # Resource coverage / Efficiency
    # Percentage of papers that have at least one video solution
    papers_with_video = db.exec(select(func.count(func.distinct(Video.paper_id)))).one()
    efficiency = int((papers_with_video / paper_count) * 100) if paper_count > 0 else 0

    return {
        "total_students": student_count,
        "total_subjects": subject_count,
        "total_papers": paper_count,
        "total_videos": video_count,
        "new_signups_week": new_signups_week,
        "student_trend": f"+{growth}% this month" if growth > 0 else "Stable",
        "efficiency": efficiency,
        "resource_trend": f"+{video_count} solutions" if video_count > 0 else "Up to date"
    }


@router.get("/recent-subjects")
def get_recent_subjects(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """5 most recently added subjects."""
    statement = (
        select(Subject)
        .options(selectinload(Subject.level), selectinload(Subject.papers))
        .order_by(Subject.id.desc())
        .limit(5)
    )
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
    role: str = None,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """List registered users, optionally filtered by role."""
    statement = select(User)
    if role:
        statement = statement.where(User.role == role)
    
    users = db.exec(statement).all()
    return [
        {
            "id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "level": u.level,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: uuid.UUID,
    role_data: UserRoleUpdateSchema,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """Change a user's role (promote/demote)."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent self-demotion or removing the last admin (optional safety)
    if user.id == current_user.id and role_data.role != "admin":
        raise HTTPException(status_code=400, detail="You cannot change your own admin role.")
        
    user.role = role_data.role
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": f"User role updated to {role_data.role}", "user_id": str(user.id)}


@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_privileged_user(
    user_data: UserCreateAdminSchema,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """Create a new Admin or Tutor account directly."""
    # Check if email exists
    existing = db.exec(select(User).where(User.email == user_data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": f"{user_data.role.capitalize()} created successfully", "id": str(new_user.id)}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """Delete a user account. Admins cannot delete themselves."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
    
    db.delete(user)
    db.commit()
    return {"message": f"User {user.full_name} has been deleted"}


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
    statement = (
        select(Subject)
        .options(selectinload(Subject.level), selectinload(Subject.papers))
    )
    if level_id:
        statement = statement.where(Subject.level_id == level_id)
    subjects = db.exec(statement).all()

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
    video_counts = dict(db.exec(select(Video.paper_id, func.count(Video.id)).group_by(Video.paper_id)).all())
    pdf_counts = dict(db.exec(select(PDF.paper_id, func.count(PDF.id)).group_by(PDF.paper_id)).all())

    statement = select(Paper)
    if subject_id:
        statement = statement.where(Paper.subject_id == subject_id)
    papers = db.exec(statement).all()

    return [
        {
            "id": str(p.id),
            "year": p.year,
            "paper_type": p.paper_type,
            "subject_id": str(p.subject_id),
            "video_count": video_counts.get(p.id, 0),
            "pdf_count": pdf_counts.get(p.id, 0),
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

    # Notify all students about the new paper
    students = db.exec(select(User).where(User.role == "student")).all()
    subject = db.get(Subject, paper.subject_id)
    subject_name = subject.name if subject else "a new subject"
    
    for student in students:
        db.add(Notification(
            user_id=student.id,
            message=f"New Resource! {paper.year} {subject_name} ({paper.paper_type}) is now available.",
            type="info",
            link=f"/papers/{paper.id}"
        ))
    db.commit()

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


from services.storage import storage_service

# ── File Uploads ─────────────────────────────────────────────
@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin)
):
    """Upload a file via storage service (R2 or Local) with type validation."""
    ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not allowed. Only PDFs and images (PNG/JPG) are permitted."
        )
    
    try:
        public_url = await storage_service.upload_file(file.file, file.filename)
        return {"url": public_url, "filename": file.filename}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

# ── Testimonials Management ─────────────────────────────────
@router.get("/reviews/all", response_model=List[ReviewResponse])
def get_all_reviews_for_admin(
    approved: Optional[str] = None,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """Admin: Get reviews, optionally filtered by approval status."""
    # Use outer join in case a user was deleted but their review remains
    statement = select(Review, User).join(User, Review.user_id == User.id, isouter=True).order_by(Review.created_at.desc())
    
    if approved is not None:
        # Robust boolean conversion for query params
        is_approved_bool = approved.lower() == 'true'
        statement = statement.where(Review.is_approved == is_approved_bool)
        
    results = db.exec(statement).all()
    
    return [
        ReviewResponse(
            id=r.id,
            full_name=u.full_name if u else "Unknown Student",
            rating=r.rating,
            content=r.content,
            created_at=r.created_at.strftime("%b %d, %Y"),
            is_approved=r.is_approved
        )
        for r, u in results
    ]

@router.put("/reviews/{review_id}/approve")
def approve_review(
    review_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """Admin: Approve a review."""
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_approved = True
    db.add(review)
    db.commit()
    return {"message": "Review approved"}

@router.put("/reviews/{review_id}/unapprove")
def unapprove_review(
    review_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """Admin: Take a live review back to pending."""
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_approved = False
    db.add(review)
    db.commit()
    return {"message": "Review moved back to pending"}

@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """Admin: Delete/Reject a review."""
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}
