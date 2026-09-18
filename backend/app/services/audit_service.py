import json
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent
from app.models.user import User
from app.services.policy_engine import PolicyDecision

class AuditService:
    """
    Logs comprehensive audit records for every query, candidate,
    authorization evaluation, version resolution, and LLM input.
    """

    @staticmethod
    def record_query(
        db: Session,
        request_id: str,
        user: User,
        question: str,
        candidate_ids: List[str],
        decisions: List[PolicyDecision],
        authorized_ids: List[str],
        selected_ids: List[str],
        llm_evidence_ids: List[str],
        status: str,
        duration_ms: int
    ) -> AuditEvent:
        decision_dicts = [
            {
                "document_id": d.document_id,
                "allowed": d.allowed,
                "reason": d.reason.value,
                "title": d.title,
                "classification": d.classification
            }
            for d in decisions
        ]

        event = AuditEvent(
            request_id=request_id,
            user_id=user.employee_id,
            user_name=user.name,
            user_department=user.department,
            user_role=user.role,
            user_clearance=user.clearance,
            question=question,
            candidate_ids_json=json.dumps(candidate_ids),
            authorization_decisions_json=json.dumps(decision_dicts),
            authorized_ids_json=json.dumps(authorized_ids),
            selected_ids_json=json.dumps(selected_ids),
            llm_evidence_ids_json=json.dumps(llm_evidence_ids),
            status=status,
            duration_ms=duration_ms,
            created_at=datetime.utcnow()
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
