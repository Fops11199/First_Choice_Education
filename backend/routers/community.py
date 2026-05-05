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


# --- Thread Schemas ---
class ThreadCreate(BaseModel):
    title: str
    category: str = "General"

class ThreadResponse(BaseModel):
    id: uuid.UUID
    title: str
    category: str
    author_name: str
    author_role: str
    reply_count: int
    created_at: str

class ReplyResponse(BaseModel):
    id: uuid.UUID
    content: str
    author_name: str
    author_role: str
    created_at: str


class CommentResponse(BaseModel):
    id: uuid.UUID
    content: str
    created_at: str
    author_name: str
    author_initials: str
    author_role: str
    parent_id: uuid.UUID | None = None
    is_pinned: bool = False


class CommentCreate(BaseModel):
    content: str
    parent_id: uuid.UUID | None = None


@router.get("/threads")
def get_threads(category: str = None, db: Session = Depends(get_session)):
    statement = select(Thread)
    if category:
        statement = statement.where(Thread.category == category)
    statement = statement.order_by(Thread.created_at.desc())
    threads = db.exec(statement).all()

    results = []
    for t in threads:
        author = db.get(User, t.author_id)
        reply_count = len(t.replies) if t.replies else 0
        results.append(ThreadResponse(
            id=t.id,
            title=t.title,
            category=t.category,
            author_name=author.full_name if author else "Unknown",
            author_role=author.role if author else "student",
            reply_count=reply_count,
            created_at=t.created_at.isoformat()
        ))
    return results


@router.get("/threads/{thread_id}")
def get_thread(thread_id: uuid.UUID, db: Session = Depends(get_session)):
    thread = db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    author = db.get(User, thread.author_id)
    reply_count = len(thread.replies) if thread.replies else 0
    return ThreadResponse(
        id=thread.id,
        title=thread.title,
        category=thread.category,
        author_name=author.full_name if author else "Unknown",
        author_role=author.role if author else "student",
        reply_count=reply_count,
        created_at=thread.created_at.isoformat()
    )


@router.post("/threads", status_code=status.HTTP_201_CREATED)
def create_thread(
    thread_data: ThreadCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    thread = Thread(
        title=thread_data.title,
        category=thread_data.category,
        author_id=current_user.id
    )
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return ThreadResponse(
        id=thread.id,
        title=thread.title,
        category=thread.category,
        author_name=current_user.full_name,
        author_role=current_user.role,
        reply_count=0,
        created_at=thread.created_at.isoformat()
    )

@router.delete("/threads/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_thread(
    thread_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    if current_user.role not in ["admin", "tutor"]:
        raise HTTPException(status_code=403, detail="Only admins and tutors can delete threads")
    thread = db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    db.delete(thread)
    db.commit()
    return None

@router.get("/threads/{thread_id}/replies")
def get_replies(thread_id: uuid.UUID, db: Session = Depends(get_session)):
    statement = (
        select(Reply, User)
        .join(User, Reply.author_id == User.id)
        .where(Reply.thread_id == thread_id)
        .order_by(Reply.created_at)
    )
    results = db.exec(statement).all()
    return [
        ReplyResponse(
            id=reply.id,
            content=reply.content,
            author_name=user.full_name,
            author_role=user.role,
            created_at=reply.created_at.isoformat()
        )
        for reply, user in results
    ]

@router.post("/threads/{thread_id}/replies", status_code=status.HTTP_201_CREATED)
def create_reply(
    thread_id: uuid.UUID,
    reply_data: CommentCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    thread = db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    reply = Reply(
        thread_id=thread_id,
        author_id=current_user.id,
        content=reply_data.content
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return ReplyResponse(
        id=reply.id,
        content=reply.content,
        author_name=current_user.full_name,
        author_role=current_user.role,
        created_at=reply.created_at.isoformat()
    )

# --- Specialized Paper Discussion Endpoints ---



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
            author_initials=initials,
            author_role=user.role,
            parent_id=reply.parent_id,
            is_pinned=reply.is_pinned
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
        content=comment.content,
        parent_id=comment.parent_id
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
        author_initials=initials,
        author_role=current_user.role,
        parent_id=reply.parent_id,
        is_pinned=reply.is_pinned
    )

@router.put("/papers/{paper_id}/comments/{comment_id}/pin", response_model=CommentResponse)
def pin_paper_comment(
    paper_id: str,
    comment_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    if current_user.role not in ["admin", "tutor"]:
        raise HTTPException(status_code=403, detail="Only tutors or admins can pin messages")
        
    reply = db.get(Reply, comment_id)
    if not reply:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    reply.is_pinned = not reply.is_pinned
    db.add(reply)
    db.commit()
    db.refresh(reply)
    
    # Needs to return user info as well
    user = db.get(User, reply.author_id)
    name_parts = user.full_name.split()
    initials = (name_parts[0][0] + (name_parts[1][0] if len(name_parts) > 1 else "")).upper() if name_parts else "S"
    
    return CommentResponse(
        id=reply.id,
        content=reply.content,
        created_at=reply.created_at.strftime("%b %d, %H:%M"),
        author_name=user.full_name,
        author_initials=initials,
        author_role=user.role,
        parent_id=reply.parent_id,
        is_pinned=reply.is_pinned
    )

