import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(50), index=True, nullable=False) # e.g. U102
    user_name = Column(String(100), nullable=False)
    user_department = Column(String(100), nullable=False)
    user_role = Column(String(100), nullable=False)
    user_clearance = Column(String(50), nullable=False)
    
    question = Column(Text, nullable=False)
    
    # Trace arrays stored as JSON
    candidate_ids_json = Column(Text, default="[]")
    authorization_decisions_json = Column(Text, default="[]")
    authorized_ids_json = Column(Text, default="[]")
    selected_ids_json = Column(Text, default="[]")
    llm_evidence_ids_json = Column(Text, default="[]")
    
    status = Column(String(50), nullable=False)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    @property
    def candidate_ids(self) -> list:
        try:
            return json.loads(self.candidate_ids_json or "[]")
        except Exception:
            return []

    @property
    def authorization_decisions(self) -> list:
        try:
            return json.loads(self.authorization_decisions_json or "[]")
        except Exception:
            return []

    @property
    def authorized_ids(self) -> list:
        try:
            return json.loads(self.authorized_ids_json or "[]")
        except Exception:
            return []

    @property
    def selected_ids(self) -> list:
        try:
            return json.loads(self.selected_ids_json or "[]")
        except Exception:
            return []

    @property
    def llm_evidence_ids(self) -> list:
        try:
            return json.loads(self.llm_evidence_ids_json or "[]")
        except Exception:
            return []
