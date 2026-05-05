from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db.database import get_session
from models.review import Review
from models.user import User
from core.security import require_user, require_admin
from typing import List
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/reviews", tags=["reviews"])

class ReviewCreate(BaseModel):
    rating: int
    content: str

class ReviewResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    rating: int
    content: str
    created_at: str

@router.get("/", response_model=List[ReviewResponse])
def get_approved_reviews(db: Session = Depends(get_session)):
    """Get all approved testimonials for the landing page."""
    statement = select(Review, User).join(User, Review.user_id == User.id).where(Review.is_approved == True).order_by(Review.created_at.desc())
    results = db.exec(statement).all()
    
    return [
        ReviewResponse(
            id=r.id,
            full_name=u.full_name,
            rating=r.rating,
            content=r.content,
            created_at=r.created_at.strftime("%b %d, %Y")
        )
        for r, u in results
    ]

@router.post("/", status_code=status.HTTP_201_CREATED)
def post_review(
    review_data: ReviewCreate, 
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Submit a new review (pending approval)."""
    new_review = Review(
        user_id=current_user.id,
        rating=review_data.rating,
        content=review_data.content
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return {"message": "Review submitted for approval"}

@router.get("/admin/pending", response_model=List[Review])
def get_pending_reviews(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    """Admin: Get all reviews awaiting approval."""
    return db.exec(select(Review).where(Review.is_approved == False)).all()

@router.put("/admin/{review_id}/approve")
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

@router.delete("/admin/{review_id}")
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
