import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.audit import AuditEvent
from app.schemas.auth import UserProfile, UserUpdate
from app.schemas.document import DocumentResponse, DocumentCreate, DocumentUpdate
from app.schemas.admin import AdminStatsResponse, RequestTraceResponse
from app.services.auth_service import require_admin
from app.services.ingestion_service import IngestionService
from app.schemas.research import PolicyDecisionSchema

router = APIRouter(prefix="/admin", tags=["Admin & Security"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_documents = db.query(Document).count()
    total_queries = db.query(AuditEvent).count()

    all_audits = db.query(AuditEvent).all()
    allowed_decisions = 0
    blocked_decisions = 0

    for a in all_audits:
        try:
            decisions = json.loads(a.authorization_decisions_json or "[]")
            for d in decisions:
                if d.get("allowed"):
                    allowed_decisions += 1
                else:
                    blocked_decisions += 1
        except Exception:
            pass

    recent_events = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(10).all()
    recent_activity = [
        {
            "request_id": e.request_id,
            "user_id": e.user_id,
            "user_name": e.user_name,
            "question": e.question,
            "status": e.status,
            "duration_ms": e.duration_ms,
            "created_at": e.created_at.isoformat() if e.created_at else ""
        }
        for e in recent_events
    ]

    return AdminStatsResponse(
        total_users=total_users,
        total_documents=total_documents,
        total_queries=total_queries,
        allowed_decisions=allowed_decisions,
        blocked_decisions=blocked_decisions,
        recent_activity=recent_activity
    )

@router.get("/users", response_model=List[UserProfile])
def list_users(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return [
        UserProfile(
            employee_id=u.employee_id,
            name=u.name,
            email=u.email,
            department=u.department,
            role=u.role,
            clearance=u.clearance,
            is_active=u.is_active
        )
        for u in users
    ]

@router.put("/users/{employee_id}", response_model=UserProfile)
def update_user(
    employee_id: str,
    update_data: UserUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.employee_id == employee_id.upper()).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if update_data.name is not None:
        user.name = update_data.name
    if update_data.department is not None:
        user.department = update_data.department
    if update_data.role is not None:
        user.role = update_data.role
    if update_data.clearance is not None:
        user.clearance = update_data.clearance
    if update_data.is_active is not None:
        user.is_active = update_data.is_active

    db.commit()
    db.refresh(user)

    return UserProfile(
        employee_id=user.employee_id,
        name=user.name,
        email=user.email,
        department=user.department,
        role=user.role,
        clearance=user.clearance,
        is_active=user.is_active
    )

@router.get("/documents", response_model=List[DocumentResponse])
def list_admin_documents(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return [
        DocumentResponse(
            id=d.id,
            document_id=d.document_id,
            title=d.title,
            owner=d.owner,
            department=d.department,
            classification=d.classification,
            allowed_departments=d.allowed_departments,
            allowed_roles=d.allowed_roles,
            allowed_users=d.allowed_users,
            denied_users=d.denied_users,
            lineage_id=d.lineage_id,
            version=d.version,
            effective_date=d.effective_date,
            status=d.status,
            content=d.content,
            created_at=d.created_at,
            updated_at=d.updated_at
        )
        for d in docs
    ]

@router.post("/documents", response_model=DocumentResponse)
def create_admin_document(
    doc_data: DocumentCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    try:
        doc = IngestionService.ingest_document(db, doc_data)
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document ingestion failed: {str(e)}"
        )

@router.post("/documents/upload", response_model=DocumentResponse)
async def upload_document_file(
    file: UploadFile = File(...),
    document_id: str = Form(...),
    title: str = Form(...),
    owner: str = Form(...),
    department: str = Form(...),
    classification: str = Form(...),
    allowed_departments: str = Form("[]"),
    allowed_roles: str = Form("[]"),
    lineage_id: str = Form(...),
    version: str = Form("1.0"),
    effective_date: str = Form(...),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    try:
        extracted_text = IngestionService.extract_text_from_file(file.filename, file_bytes)
        depts = json.loads(allowed_departments) if allowed_departments else []
        roles = json.loads(allowed_roles) if allowed_roles else []

        doc_data = DocumentCreate(
            document_id=document_id.strip().upper(),
            title=title.strip(),
            owner=owner.strip(),
            department=department.strip(),
            classification=classification.strip(),
            allowed_departments=depts,
            allowed_roles=roles,
            lineage_id=lineage_id.strip(),
            version=version.strip(),
            effective_date=effective_date.strip(),
            status="ACTIVE",
            content=extracted_text
        )
        doc = IngestionService.ingest_document(db, doc_data)
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Upload processing failed: {str(e)}"
        )

@router.get("/audit", response_model=List[RequestTraceResponse])
def get_audit_logs(
    status_filter: Optional[str] = Query(None),
    user_filter: Optional[str] = Query(None),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditEvent)
    if status_filter:
        query = query.filter(AuditEvent.status == status_filter)
    if user_filter:
        query = query.filter(
            (AuditEvent.user_id.ilike(f"%{user_filter}%")) |
            (AuditEvent.user_name.ilike(f"%{user_filter}%"))
        )

    events = query.order_by(AuditEvent.created_at.desc()).limit(100).all()

    results = []
    for e in events:
        decisions = []
        try:
            for d in json.loads(e.authorization_decisions_json or "[]"):
                decisions.append(
                    PolicyDecisionSchema(
                        document_id=d.get("document_id"),
                        allowed=d.get("allowed", False),
                        reason=d.get("reason", "UNKNOWN"),
                        title=d.get("title"),
                        classification=d.get("classification")
                    )
                )
        except Exception:
            pass

        results.append(
            RequestTraceResponse(
                request_id=e.request_id,
                user_id=e.user_id,
                user_name=e.user_name,
                user_department=e.user_department,
                user_role=e.user_role,
                user_clearance=e.user_clearance,
                question=e.question,
                candidate_ids=e.candidate_ids,
                authorization_decisions=decisions,
                authorized_ids=e.authorized_ids,
                selected_ids=e.selected_ids,
                llm_evidence_ids=e.llm_evidence_ids,
                status=e.status,
                duration_ms=e.duration_ms,
                created_at=e.created_at
            )
        )
    return results

@router.get("/requests/{request_id}/trace", response_model=RequestTraceResponse)
def get_request_trace(
    request_id: str,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    event = db.query(AuditEvent).filter(AuditEvent.request_id == request_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request trace not found"
        )

    decisions = []
    try:
        for d in json.loads(event.authorization_decisions_json or "[]"):
            decisions.append(
                PolicyDecisionSchema(
                    document_id=d.get("document_id"),
                    allowed=d.get("allowed", False),
                    reason=d.get("reason", "UNKNOWN"),
                    title=d.get("title"),
                    classification=d.get("classification")
                )
            )
    except Exception:
        pass

    return RequestTraceResponse(
        request_id=event.request_id,
        user_id=event.user_id,
        user_name=event.user_name,
        user_department=event.user_department,
        user_role=event.user_role,
        user_clearance=event.user_clearance,
        question=event.question,
        candidate_ids=event.candidate_ids,
        authorization_decisions=decisions,
        authorized_ids=event.authorized_ids,
        selected_ids=event.selected_ids,
        llm_evidence_ids=event.llm_evidence_ids,
        status=event.status,
        duration_ms=event.duration_ms,
        created_at=event.created_at
    )
