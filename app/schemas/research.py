from pydantic import BaseModel
from typing import List, Optional
from app.schemas.document import CitationResponse

class PolicyDecisionSchema(BaseModel):
    document_id: str
    allowed: bool
    reason: str
    title: Optional[str] = None
    classification: Optional[str] = None

class ResearchQueryRequest(BaseModel):
    question: str
    conversation_id: Optional[int] = None
    # Note: Frontend must NOT supply trusted user context.
    # The server derives identity strictly from Authorization header.

class ResearchQueryResponse(BaseModel):
    request_id: str
    status: str # SUCCESS, NO_AUTHORIZED_EVIDENCE, CONFLICT, etc.
    answer: str
    citations: List[CitationResponse]
    conversation_id: Optional[int] = None
    duration_ms: Optional[int] = None

class ConversationResponse(BaseModel):
    id: int
    user_id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    request_id: Optional[str] = None
    citations: List[CitationResponse] = []
    status: Optional[str] = None
    created_at: str
