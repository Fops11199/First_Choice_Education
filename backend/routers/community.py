from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db.database import get_session
from models.community import Thread, Reply, Community, CommunityMember
from models.notification import Notification
from models.user import User
from core.security import require_user, require_admin
from typing import List, Optional
from pydantic import BaseModel
import uuid
from datetime import datetime
import traceback

router = APIRouter(prefix="/community", tags=["community"])

# --- Community Schemas ---
class CommunityCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    is_private: bool = False

class CommunityResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    category: str
    is_private: bool
    creator_id: uuid.UUID
    member_count: int
    created_at: str

# --- Thread Schemas ---
class ThreadCreate(BaseModel):
    community_id: uuid.UUID
    title: str

class ThreadResponse(BaseModel):
    id: uuid.UUID
    community_id: Optional[uuid.UUID] = None
    title: str
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
    parent_id: Optional[uuid.UUID] = None
    parent_content: Optional[str] = None
    parent_author: Optional[str] = None

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

# --- Community Endpoints ---

@router.get("/", response_model=List[CommunityResponse])
def get_communities(db: Session = Depends(get_session)):
    """List all public communities."""
    statement = select(Community).where(Community.is_private == False)
    communities = db.exec(statement).all()
    
    results = []
    for c in communities:
        member_count = len(c.memberships)
        results.append(CommunityResponse(
            id=c.id,
            name=c.name,
            description=c.description,
            category=c.category,
            is_private=c.is_private,
            creator_id=c.creator_id,
            member_count=member_count,
            created_at=c.created_at.isoformat()
        ))
    return results

@router.post("/", response_model=CommunityResponse, status_code=status.HTTP_201_CREATED)
def create_community(
    data: CommunityCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Create a new community and become the owner."""
    community = Community(
        name=data.name,
        description=data.description,
        category=data.category,
        is_private=data.is_private,
        creator_id=current_user.id
    )
    db.add(community)
    db.commit()
    db.refresh(community)
    
    # Auto-add creator as Owner
    membership = CommunityMember(
        community_id=community.id,
        user_id=current_user.id,
        role="owner",
        status="active"
    )
    db.add(membership)
    db.commit()
    
    return CommunityResponse(
        id=community.id,
        name=community.name,
        description=community.description,
        category=community.category,
        is_private=community.is_private,
        creator_id=community.creator_id,
        member_count=1,
        created_at=community.created_at.isoformat()
    )

@router.post("/{community_id}/join")
def join_community(
    community_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Join a community or request access if private."""
    community = db.get(Community, community_id)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
        
    existing = db.exec(
        select(CommunityMember).where(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id
        )
    ).first()
    
    if existing:
        return {"message": "Already a member", "status": existing.status}
        
    status_val = "pending" if community.is_private else "active"
    membership = CommunityMember(
        community_id=community_id,
        user_id=current_user.id,
        role="member",
        status=status_val
    )
    db.add(membership)
    
    # If private, notify the owner
    if community.is_private:
        notif = Notification(
            user_id=community.creator_id,
            message=f"{current_user.full_name} requested to join {community.name}",
            type="join_request",
            link=f"/community/g/{community_id}"
        )
        db.add(notif)
        
    db.commit()
    
    return {"message": "Joined successfully" if status_val == "active" else "Request sent to admin", "status": status_val}

@router.post("/{community_id}/invite")
def invite_to_community(
    community_id: uuid.UUID,
    user_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Invite a user to a community (Admin only)."""
    community = db.get(Community, community_id)
    # Check if current user is admin/owner
    membership = db.exec(
        select(CommunityMember).where(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id
        )
    ).first()
    
    if not membership or membership.role not in ["owner", "moderator"]:
        raise HTTPException(status_code=403, detail="Only admins can invite members")
        
    # Create membership as 'active' (since it's an invite) or 'invited'
    new_member = CommunityMember(
        community_id=community_id,
        user_id=user_id,
        role="member",
        status="active"
    )
    db.add(new_member)
    
    # Notify the invited user
    notif = Notification(
        user_id=user_id,
        message=f"You have been added to {community.name} by {current_user.full_name}",
        type="community_invite",
        link=f"/community/g/{community_id}"
    )
    db.add(notif)
    db.commit()
    return {"message": "User invited successfully"}

@router.get("/{community_id}/requests")
def get_join_requests(
    community_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """List pending join requests for a community (Admin only)."""
    # Check permissions
    membership = db.exec(
        select(CommunityMember).where(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id
        )
    ).first()
    
    if not membership or membership.role not in ["owner", "moderator"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    statement = (
        select(CommunityMember, User)
        .join(User, CommunityMember.user_id == User.id)
        .where(CommunityMember.community_id == community_id, CommunityMember.status == "pending")
    )
    results = db.exec(statement).all()
    return [{"user_id": u.id, "full_name": u.full_name, "joined_at": m.joined_at} for m, u in results]

@router.post("/{community_id}/approve/{user_id}")
def approve_join_request(
    community_id: uuid.UUID,
    user_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Approve a pending join request."""
    # Check permissions
    admin_membership = db.exec(
        select(CommunityMember).where(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id
        )
    ).first()
    
    if not admin_membership or admin_membership.role not in ["owner", "moderator"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    member = db.exec(
        select(CommunityMember).where(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == user_id
        )
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Request not found")
        
    member.status = "active"
    
    # Notify the user they were approved
    notif = Notification(
        user_id=user_id,
        message=f"Your request to join {db.get(Community, community_id).name} was approved!",
        type="community_invite",
        link=f"/community/g/{community_id}"
    )
    db.add(notif)
    db.add(member)
    db.commit()
    return {"message": "User approved"}

# --- Thread Endpoints ---

@router.get("/{community_id}/threads", response_model=List[ThreadResponse])
def get_community_threads(
    community_id: uuid.UUID, 
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """List threads in a community. Checks membership if private."""
    community = db.get(Community, community_id)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
        
    if community.is_private:
        membership = db.exec(
            select(CommunityMember).where(
                CommunityMember.community_id == community_id,
                CommunityMember.user_id == current_user.id,
                CommunityMember.status == "active"
            )
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Private community access required")
            
    statement = select(Thread).where(Thread.community_id == community_id).order_by(Thread.created_at.desc())
    threads = db.exec(statement).all()
    
    results = []
    for t in threads:
        author = db.get(User, t.author_id)
        results.append(ThreadResponse(
            id=t.id,
            community_id=t.community_id,
            title=t.title,
            author_name=author.full_name if author else "Unknown",
            author_role=author.role if author else "student",
            reply_count=len(t.replies),
            created_at=t.created_at.isoformat()
        ))
    return results

@router.get("/threads/{thread_id}", response_model=ThreadResponse)
def get_thread_detail(
    thread_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Get a single thread's details."""
    thread = db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    author = db.get(User, thread.author_id)
    return ThreadResponse(
        id=thread.id,
        community_id=thread.community_id,
        title=thread.title,
        author_name=author.full_name if author else "Unknown",
        author_role=author.role if author else "student",
        reply_count=len(thread.replies),
        created_at=thread.created_at.isoformat()
    )

@router.post("/threads", response_model=ThreadResponse, status_code=status.HTTP_201_CREATED)
def create_thread(
    thread_data: ThreadCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Create a thread. Checks if user is a member of the community."""
    try:
        # 1. Verify Membership
        membership = db.exec(
            select(CommunityMember).where(
                CommunityMember.community_id == thread_data.community_id,
                CommunityMember.user_id == current_user.id,
                CommunityMember.status == "active"
            )
        ).first()
        
        if not membership:
            raise HTTPException(status_code=403, detail="Must be a member to post")
            
        # 2. Create Thread object
        thread = Thread(
            community_id=thread_data.community_id,
            title=thread_data.title,
            author_id=current_user.id
        )
        
        # 3. Save to DB
        db.add(thread)
        db.commit()
        db.refresh(thread)
        
        # 4. Prepare Response
        return ThreadResponse(
            id=thread.id,
            community_id=thread.community_id,
            title=thread.title,
            author_name=current_user.full_name,
            author_role=current_user.role,
            reply_count=0,
            created_at=thread.created_at.isoformat()
        )
    except Exception as e:
        print(f"CRITICAL ERROR in create_thread: {e}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/threads/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_thread(
    thread_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    thread = db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    # Check if author or community admin
    membership = db.exec(
        select(CommunityMember).where(
            CommunityMember.community_id == thread.community_id,
            CommunityMember.user_id == current_user.id
        )
    ).first()
    
    is_authorized = (
        current_user.role == "admin" or 
        thread.author_id == current_user.id or 
        (membership and membership.role in ["owner", "moderator"])
    )
    
    if not is_authorized:
        raise HTTPException(status_code=403, detail="Not authorized to delete this thread")
        
    db.delete(thread)
    db.commit()
    return None

@router.get("/threads/{thread_id}/replies", response_model=List[ReplyResponse])
def get_replies(thread_id: uuid.UUID, db: Session = Depends(get_session)):
    statement = (
        select(Reply, User)
        .join(User, Reply.author_id == User.id)
        .where(Reply.thread_id == thread_id)
        .order_by(Reply.created_at)
    )
    results = db.exec(statement).all()
    
    final_replies = []
    for reply, user in results:
        parent_content = None
        parent_author = None
        if reply.parent_id:
            parent = db.get(Reply, reply.parent_id)
            if parent:
                parent_content = parent.content
                parent_user = db.get(User, parent.author_id)
                parent_author = parent_user.full_name if parent_user else "Unknown"
        
        final_replies.append(ReplyResponse(
            id=reply.id,
            content=reply.content,
            author_name=user.full_name,
            author_role=user.role,
            created_at=reply.created_at.isoformat(),
            parent_id=reply.parent_id,
            parent_content=parent_content,
            parent_author=parent_author
        ))
    return final_replies

@router.post("/threads/{thread_id}/replies", response_model=ReplyResponse, status_code=status.HTTP_201_CREATED)
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
        content=reply_data.content,
        parent_id=reply_data.parent_id
    )
    db.add(reply)
    
    # Handle parent info for response
    parent_content = None
    parent_author = None
    if reply.parent_id:
        parent = db.get(Reply, reply.parent_id)
        if parent:
            parent_content = parent.content
            parent_user = db.get(User, parent.author_id)
            parent_author = parent_user.full_name if parent_user else "Unknown"
            
            # Notify Parent Author (if not self)
            if parent.author_id != current_user.id:
                db.add(Notification(
                    user_id=parent.author_id,
                    message=f"{current_user.full_name} replied to your comment in {thread.title}",
                    type="reply",
                    link=f"/community/thread/{thread_id}"
                ))

    # Notify Thread Author (if not replying to self and not already notified as parent)
    if thread.author_id != current_user.id:
        # Check if we already notified the thread author via parent logic
        already_notified = False
        if reply.parent_id:
            parent = db.get(Reply, reply.parent_id)
            if parent and parent.author_id == thread.author_id:
                already_notified = True
        
        if not already_notified:
            db.add(Notification(
                user_id=thread.author_id,
                message=f"{current_user.full_name} replied to your thread: {thread.title}",
                type="reply",
                link=f"/community/thread/{thread_id}"
            ))

    db.commit()
    db.refresh(reply)
    
    return ReplyResponse(
        id=reply.id,
        content=reply.content,
        author_name=current_user.full_name,
        author_role=current_user.role,
        created_at=reply.created_at.isoformat(),
        parent_id=reply.parent_id,
        parent_content=parent_content,
        parent_author=parent_author
    )

# --- Specialized Paper Discussion Endpoints (Keep these for compatibility) ---

@router.get("/papers/{paper_id}/comments", response_model=List[CommentResponse])
def get_paper_comments(paper_id: str, db: Session = Depends(get_session)):
    # Find the thread using the paper_id in category (legacy behavior)
    statement = select(Thread).where(Thread.category == str(paper_id))
    thread = db.exec(statement).first()
    
    if not thread:
        return []
        
    statement = (
        select(Reply, User)
        .join(User, Reply.author_id == User.id)
        .where(Reply.thread_id == thread.id)
        .order_by(Reply.created_at)
    )
    results = db.exec(statement).all()
    
    comments = []
    for reply, user in results:
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
    
    # 2. If no thread, create one (without community_id)
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
    
    # Notify Parent Author if it's a reply
    if reply.parent_id:
        parent = db.get(Reply, reply.parent_id)
        if parent and parent.author_id != current_user.id:
            db.add(Notification(
                user_id=parent.author_id,
                message=f"{current_user.full_name} replied to your comment on a study paper",
                type="reply",
                link=f"/papers/{paper_id}"
            ))

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
