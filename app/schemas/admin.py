from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.research import PolicyDecisionSchema

class AdminStatsResponse(BaseModel):
    total_users: int
    total_documents: int
    total_queries: int
    allowed_decisions: int
    blocked_decisions: int
    recent_activity: List[dict]

class RequestTraceResponse(BaseModel):
    request_id: str
    user_id: str
    user_name: str
    user_department: str
    user_role: str
    user_clearance: str
    question: str
    candidate_ids: List[str]
    authorization_decisions: List[PolicyDecisionSchema]
    authorized_ids: List[str]
    selected_ids: List[str]
    llm_evidence_ids: List[str]
    status: str
    duration_ms: int
    created_at: datetime
