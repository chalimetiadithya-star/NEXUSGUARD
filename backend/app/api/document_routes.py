from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.auth_service import get_current_user
from app.services.policy_engine import PolicyEngine

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentResponse])
def list_authorized_documents(
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    classification: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns only documents that the authenticated employee is DETERMINISTICALLY authorized to see.
    Never relies on client-side hiding.
    """
    query = db.query(Document).filter(Document.status != "ARCHIVED")

    if department:
        query = query.filter(Document.department.ilike(f"%{department}%"))
    if classification:
        query = query.filter(Document.classification.ilike(f"%{classification}%"))
    if search:
        query = query.filter(
            (Document.title.ilike(f"%{search}%")) |
            (Document.document_id.ilike(f"%{search}%")) |
            (Document.content.ilike(f"%{search}%"))
        )

    all_candidates = query.all()
    decisions = PolicyEngine.evaluate(all_candidates, current_user)

    authorized_docs = []
    for doc, decision in zip(all_candidates, decisions):
        if decision.allowed:
            authorized_docs.append(
                DocumentResponse(
                    id=doc.id,
                    document_id=doc.document_id,
                    title=doc.title,
                    owner=doc.owner,
                    department=doc.department,
                    classification=doc.classification,
                    allowed_departments=doc.allowed_departments,
                    allowed_roles=doc.allowed_roles,
                    allowed_users=doc.allowed_users,
                    denied_users=doc.denied_users,
                    lineage_id=doc.lineage_id,
                    version=doc.version,
                    effective_date=doc.effective_date,
                    status=doc.status,
                    content=doc.content,
                    created_at=doc.created_at,
                    updated_at=doc.updated_at
                )
            )

    return authorized_docs

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.document_id == document_id.upper()).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    decision = PolicyEngine.evaluate_one(doc, current_user)
    if not decision.allowed:
        # Prevent information leakage
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this document"
        )

    return DocumentResponse(
        id=doc.id,
        document_id=doc.document_id,
        title=doc.title,
        owner=doc.owner,
        department=doc.department,
        classification=doc.classification,
        allowed_departments=doc.allowed_departments,
        allowed_roles=doc.allowed_roles,
        allowed_users=doc.allowed_users,
        denied_users=doc.denied_users,
        lineage_id=doc.lineage_id,
        version=doc.version,
        effective_date=doc.effective_date,
        status=doc.status,
        content=doc.content,
        created_at=doc.created_at,
        updated_at=doc.updated_at
    )
