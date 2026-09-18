import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.schemas.research import (
    ResearchQueryRequest,
    ResearchQueryResponse,
    ConversationResponse,
    MessageResponse
)
from app.services.auth_service import get_current_user
from app.services.research_orchestrator import ResearchOrchestrator

router = APIRouter(prefix="", tags=["Research"])

@router.post("/research/query", response_model=ResearchQueryResponse)
def research_query(
    request: ResearchQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Research question cannot be empty"
        )

    # Trusted user identity is derived strictly from current_user
    # Frontend parameters attempting to spoof role or clearance are ignored
    return ResearchOrchestrator.execute(
        db=db,
        question=request.question.strip(),
        authenticated_user=current_user,
        conversation_id=request.conversation_id
    )

@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.employee_id
    ).order_by(Conversation.updated_at.desc()).all()

    return [
        ConversationResponse(
            id=c.id,
            user_id=c.user_id,
            title=c.title,
            created_at=c.created_at.isoformat(),
            updated_at=c.updated_at.isoformat(),
            message_count=len(c.messages)
        )
        for c in conversations
    ]

@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = Conversation(
        user_id=current_user.employee_id,
        title="New Research Session"
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    return ConversationResponse(
        id=conv.id,
        user_id=conv.user_id,
        title=conv.title,
        created_at=conv.created_at.isoformat(),
        updated_at=conv.updated_at.isoformat(),
        message_count=0
    )

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.employee_id
    ).first()

    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    response = []
    for msg in conv.messages:
        citations = []
        try:
            citations = json.loads(msg.citations_json or "[]")
        except Exception:
            pass

        response.append(
            MessageResponse(
                id=msg.id,
                role=msg.role,
                content=msg.content,
                request_id=msg.request_id,
                citations=citations,
                status=msg.status,
                created_at=msg.created_at.isoformat()
            )
        )

    return response
