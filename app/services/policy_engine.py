from typing import List, Optional
from pydantic import BaseModel
from app.models.enums import ClearanceLevel, PolicyReason
from app.models.user import User
from app.models.document import Document

class PolicyDecision(BaseModel):
    document_id: str
    allowed: bool
    reason: PolicyReason
    title: Optional[str] = None
    classification: Optional[str] = None

class PolicyEngine:
    """
    Deterministic Authorization Policy Engine.
    Enforces that RELEVANT DOES NOT MEAN AUTHORIZED.
    The LLM plays NO role in access decisions.
    Rules:
      1. If user is disabled -> USER_DISABLED
      2. If document metadata is missing or malformed -> INVALID_POLICY_METADATA (Default Deny)
      3. If user or doc clearance is unknown -> UNKNOWN_CLASSIFICATION (Default Deny)
      4. Explicit Deny: If user.employee_id in document.denied_users -> EXPLICIT_DENY (DENY wins over ALLOW)
      5. Clearance Check: user.clearance >= document.classification
         If not -> INSUFFICIENT_CLEARANCE
      6. Department & Role:
         - If document.allowed_departments is specified, user.department MUST match.
           If not -> DEPARTMENT_NOT_ALLOWED
         - If document.allowed_roles is specified, user.role MUST match.
           If not -> ROLE_NOT_ALLOWED
      7. Explicit user allow: If document.allowed_users is specified, user.employee_id in allowed_users
         satisfies department/role constraints (provided clearance >= classification and not explicitly denied).
      8. If all checks pass -> ALLOW
    """

    @staticmethod
    def evaluate_one(document: Document, user: User) -> PolicyDecision:
        # 1. User state check
        if not user or not user.is_active:
            return PolicyDecision(
                document_id=getattr(document, "document_id", "UNKNOWN"),
                allowed=False,
                reason=PolicyReason.USER_DISABLED
            )

        # 2. Document existence & basic integrity
        if not document or not document.document_id:
            return PolicyDecision(
                document_id="UNKNOWN",
                allowed=False,
                reason=PolicyReason.INVALID_POLICY_METADATA
            )

        doc_id = document.document_id
        doc_title = document.title or "Untitled"
        doc_class_str = document.classification

        # 3. Validate classification
        doc_clearance = ClearanceLevel.from_string(doc_class_str)
        user_clearance = ClearanceLevel.from_string(user.clearance)

        if not doc_clearance or not user_clearance:
            return PolicyDecision(
                document_id=doc_id,
                allowed=False,
                reason=PolicyReason.UNKNOWN_CLASSIFICATION,
                title=doc_title,
                classification=doc_class_str
            )

        # 4. Explicit Deny Check (DENY always wins)
        denied_users = [u.strip().upper() for u in (document.denied_users or [])]
        if user.employee_id.strip().upper() in denied_users:
            return PolicyDecision(
                document_id=doc_id,
                allowed=False,
                reason=PolicyReason.EXPLICIT_DENY,
                title=doc_title,
                classification=doc_clearance.value
            )

        # 5. Clearance Hierarchy Check: user.clearance >= doc.clearance
        if user_clearance.rank < doc_clearance.rank:
            return PolicyDecision(
                document_id=doc_id,
                allowed=False,
                reason=PolicyReason.INSUFFICIENT_CLEARANCE,
                title=doc_title,
                classification=doc_clearance.value
            )

        # 6. Check explicit user allow
        allowed_users = [u.strip().upper() for u in (document.allowed_users or [])]
        if allowed_users and user.employee_id.strip().upper() in allowed_users:
            return PolicyDecision(
                document_id=doc_id,
                allowed=True,
                reason=PolicyReason.ALLOW,
                title=doc_title,
                classification=doc_clearance.value
            )

        # 7. Department Check
        allowed_depts = [d.strip().lower() for d in (document.allowed_departments or []) if d.strip()]
        if allowed_depts:
            user_dept = (user.department or "").strip().lower()
            if user_dept not in allowed_depts:
                return PolicyDecision(
                    document_id=doc_id,
                    allowed=False,
                    reason=PolicyReason.DEPARTMENT_NOT_ALLOWED,
                    title=doc_title,
                    classification=doc_clearance.value
                )

        # 8. Role Check
        allowed_roles = [r.strip().lower() for r in (document.allowed_roles or []) if r.strip()]
        if allowed_roles:
            user_role = (user.role or "").strip().lower()
            if user_role not in allowed_roles:
                return PolicyDecision(
                    document_id=doc_id,
                    allowed=False,
                    reason=PolicyReason.ROLE_NOT_ALLOWED,
                    title=doc_title,
                    classification=doc_clearance.value
                )

        # All criteria satisfied
        return PolicyDecision(
            document_id=doc_id,
            allowed=True,
            reason=PolicyReason.ALLOW,
            title=doc_title,
            classification=doc_clearance.value
        )

    @classmethod
    def evaluate(cls, documents: List[Document], user: User) -> List[PolicyDecision]:
        """
        Evaluates a list of candidate documents against the authenticated user.
        Returns a structured decision for each candidate.
        """
        return [cls.evaluate_one(doc, user) for doc in documents]
