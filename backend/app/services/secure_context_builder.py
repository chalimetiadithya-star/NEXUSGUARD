from typing import List, Dict, Set
from pydantic import BaseModel
from app.models.document import Document

class AuthorizedEvidenceItem(BaseModel):
    source_id: str
    title: str
    version: str
    effective_date: str
    classification: str
    department: str
    excerpt: str

class SecureContext(BaseModel):
    question: str
    authorized_evidence: List[AuthorizedEvidenceItem]

    @property
    def source_ids(self) -> Set[str]:
        return {item.source_id for item in self.authorized_evidence}

class SecurityInvariantViolation(Exception):
    pass

class SecureContextBuilder:
    """
    Constructs the secure LLM context strictly from authorized evidence.
    Enforces the core security invariant:
      all(context.source_ids) ⊆ authorized_document_ids
    Fails closed if any unauthorized document ID is detected.
    """

    @classmethod
    def build(
        cls,
        question: str,
        authorized_documents: List[Document],
        allowed_document_ids: Set[str],
        max_chars_per_doc: int = 1500
    ) -> SecureContext:
        evidence_items: List[AuthorizedEvidenceItem] = []

        for doc in authorized_documents:
            doc_id = doc.document_id

            # HARD SECURITY ASSERTION: Must be in authorized_document_ids
            if doc_id not in allowed_document_ids:
                raise SecurityInvariantViolation(
                    f"CRITICAL SECURITY INVARIANT VIOLATION: Attempted to build context with unauthorized document '{doc_id}'."
                )

            # Build excerpt
            clean_content = (doc.content or "").strip()
            if len(clean_content) > max_chars_per_doc:
                clean_content = clean_content[:max_chars_per_doc] + "..."

            evidence_items.append(
                AuthorizedEvidenceItem(
                    source_id=doc_id,
                    title=doc.title,
                    version=doc.version,
                    effective_date=doc.effective_date,
                    classification=doc.classification,
                    department=doc.department,
                    excerpt=clean_content
                )
            )

        context = SecureContext(
            question=question,
            authorized_evidence=evidence_items
        )

        # Re-verify post-construction invariant
        if not (context.source_ids <= allowed_document_ids):
            raise SecurityInvariantViolation("CRITICAL: Context source IDs exceed authorized set!")

        return context
