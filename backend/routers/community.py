from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db.database import get_session
from models.community import Thread, Reply
from models.user import User
from core.security import require_user, require_admin
from typing import List
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/community", tags=["community"])

@router.get("/threads", response_model=List[Thread])
def get_threads(category: str = None, db: Session = Depends(get_session)):
    if category:
        statement = select(Thread).where(Thread.category == category)
    else:
        statement = select(Thread)
    threads = db.exec(statement).all()
    return threads

@router.post("/threads", response_model=Thread, status_code=status.HTTP_201_CREATED)
def create_thread(
    thread: Thread, 
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    # Force the author_id to be the current user
    thread.author_id = current_user.id
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread

@router.delete("/threads/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_thread(
    thread_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    thread = db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    db.delete(thread)
    db.commit()
    return None

@router.get("/threads/{thread_id}/replies", response_model=List[Reply])
def get_replies(thread_id: uuid.UUID, db: Session = Depends(get_session)):
    statement = select(Reply).where(Reply.thread_id == thread_id)
    replies = db.exec(statement).all()
    return replies

@router.post("/threads/{thread_id}/replies", response_model=Reply, status_code=status.HTTP_201_CREATED)
def create_reply(
    thread_id: uuid.UUID, 
    reply: Reply, 
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    reply.thread_id = thread_id
    reply.author_id = current_user.id
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return reply

# --- Specialized Paper Discussion Endpoints ---

class CommentResponse(BaseModel):
    id: uuid.UUID
    content: str
    created_at: str
    author_name: str
    author_initials: str

class CommentCreate(BaseModel):
    content: str

@router.get("/papers/{paper_id}/comments", response_model=List[CommentResponse])
def get_paper_comments(paper_id: str, db: Session = Depends(get_session)):
    # Find the thread for this paper (using category to store paper_id)
    thread = db.exec(select(Thread).where(Thread.category == str(paper_id))).first()
    if not thread:
        return []
        
    # Get replies and join with User to get names
    statement = select(Reply, User).join(User, Reply.author_id == User.id).where(Reply.thread_id == thread.id).order_by(Reply.created_at)
    results = db.exec(statement).all()
    
    comments = []
    for reply, user in results:
        # Create initials (e.g., "John Doe" -> "JD")
        name_parts = user.full_name.split()
        initials = (name_parts[0][0] + (name_parts[1][0] if len(name_parts) > 1 else "")).upper() if name_parts else "S"
        
        comments.append(CommentResponse(
            id=reply.id,
            content=reply.content,
            created_at=reply.created_at.strftime("%b %d, %H:%M"),
            author_name=user.full_name,
            author_initials=initials
        ))
        
    return comments

@router.post("/papers/{paper_id}/comments", response_model=CommentResponse)
def post_paper_comment(
    paper_id: str, 
    comment: CommentCreate, 
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    # 1. Check if thread exists for this paper
    thread = db.exec(select(Thread).where(Thread.category == str(paper_id))).first()
    
    # 2. If no thread, create one
    if not thread:
        thread = Thread(
            title=f"Discussion for Paper {paper_id}",
            category=str(paper_id),
            author_id=current_user.id
        )
        db.add(thread)
        db.commit()
        db.refresh(thread)
        
    # 3. Create the reply (comment)
    reply = Reply(
        thread_id=thread.id,
        author_id=current_user.id,
        content=comment.content
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)
    
    # Create initials
    name_parts = current_user.full_name.split()
    initials = (name_parts[0][0] + (name_parts[1][0] if len(name_parts) > 1 else "")).upper() if name_parts else "S"
    
    return CommentResponse(
        id=reply.id,
        content=reply.content,
        created_at=reply.created_at.strftime("%b %d, %H:%M"),
        author_name=current_user.full_name,
        author_initials=initials
    )

