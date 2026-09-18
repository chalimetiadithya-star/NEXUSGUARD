from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.document import Document, DocumentChunk
from app.models.enums import ClearanceLevel, DocumentStatus
from app.services.auth_service import get_password_hash
from app.services.ingestion_service import IngestionService
from app.schemas.document import DocumentCreate

def seed_database(db: Session):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # 1. Seed Demo Users
    demo_users = [
        {
            "employee_id": "U102",
            "name": "Arjun Patel",
            "email": "arjun.patel@novatech.com",
            "department": "Finance",
            "role": "Finance",
            "clearance": ClearanceLevel.INTERNAL.value,
            "password": "password123"
        },
        {
            "employee_id": "U205",
            "name": "Neha Verma",
            "email": "neha.verma@novatech.com",
            "department": "Marketing",
            "role": "Marketing",
            "clearance": ClearanceLevel.INTERNAL.value,
            "password": "password123"
        },
        {
            "employee_id": "U301",
            "name": "Rohan Deshmukh",
            "email": "rohan.deshmukh@novatech.com",
            "department": "Finance",
            "role": "Finance",
            "clearance": ClearanceLevel.INTERNAL.value,
            "password": "password123"
        },
        {
            "employee_id": "U401",
            "name": "Vikram Malhotra",
            "email": "vikram.malhotra@novatech.com",
            "department": "Executive",
            "role": "Executive",
            "clearance": ClearanceLevel.RESTRICTED.value,
            "password": "password123"
        },
        {
            "employee_id": "U901",
            "name": "Priya Sharma",
            "email": "priya.sharma@novatech.com",
            "department": "Security & Compliance",
            "role": "Admin",
            "clearance": ClearanceLevel.RESTRICTED.value,
            "password": "password123"
        }
    ]

    for u_data in demo_users:
        existing = db.query(User).filter(User.employee_id == u_data["employee_id"]).first()
        if not existing:
            user = User(
                employee_id=u_data["employee_id"],
                name=u_data["name"],
                email=u_data["email"],
                department=u_data["department"],
                role=u_data["role"],
                clearance=u_data["clearance"],
                hashed_password=get_password_hash(u_data["password"]),
                is_active=True
            )
            db.add(user)
    db.commit()

    # 2. Seed Mandatory Demo Documents
    demo_docs = [
        # SCENARIO A: Finance Document DOC-101
        DocumentCreate(
            document_id="DOC-101",
            title="Q4 Revenue Forecast",
            owner="Finance Department",
            department="Finance",
            classification=ClearanceLevel.INTERNAL.value,
            allowed_departments=["Finance"],
            allowed_roles=[],
            lineage_id="FIN_REV_2026",
            version="2.0",
            effective_date="2026-09-01",
            status=DocumentStatus.ACTIVE.value,
            content="NovaTech Solutions Financial Summary. The authorized current Q4 revenue forecast is 120 crore. Operational expenditures are projected at 42 crore with expected gross margin of 65%."
        ),
        # SCENARIO B: Restricted Forecast DOC-201
        DocumentCreate(
            document_id="DOC-201",
            title="Q4 Revenue Forecast",
            owner="Office of the CEO",
            department="Executive",
            classification=ClearanceLevel.RESTRICTED.value,
            allowed_departments=["Executive"],
            allowed_roles=["Executive"],
            lineage_id="EXEC_REV_2026",
            version="3.0",
            effective_date="2026-09-01",
            status=DocumentStatus.ACTIVE.value,
            content="STRICTLY RESTRICTED - EXECUTIVE EYES ONLY. Unadjusted Q4 revenue forecast target is 145 crore including undisclosed acquisitions in the pipeline. Do not disseminate."
        ),
        # SCENARIO C: Older Forecast DOC-301
        DocumentCreate(
            document_id="DOC-301",
            title="Q4 Forecast",
            owner="Financial Planning & Analysis",
            department="Finance",
            classification=ClearanceLevel.INTERNAL.value,
            allowed_departments=["Finance"],
            allowed_roles=[],
            lineage_id="Q4_FORECAST",
            version="1.0",
            effective_date="2026-06-01",
            status=DocumentStatus.SUPERSEDED.value,
            content="NovaTech Q4 preliminary revenue forecast established in June 2026 is 110 crore. This preliminary baseline was superseded by updated September modeling."
        ),
        # SCENARIO C: Current Forecast DOC-302
        DocumentCreate(
            document_id="DOC-302",
            title="Q4 Forecast",
            owner="Financial Planning & Analysis",
            department="Finance",
            classification=ClearanceLevel.INTERNAL.value,
            allowed_departments=["Finance"],
            allowed_roles=[],
            lineage_id="Q4_FORECAST",
            version="2.0",
            effective_date="2026-09-01",
            status=DocumentStatus.ACTIVE.value,
            content="NovaTech updated Q4 forecast approved on September 1, 2026. The latest authorized Q4 forecast stands at 125 crore, driven by enterprise SaaS renewals."
        ),
        # Public Document: DOC-001
        DocumentCreate(
            document_id="DOC-001",
            title="NovaTech Solutions Employee Code of Conduct",
            owner="Human Resources",
            department="HR",
            classification=ClearanceLevel.PUBLIC.value,
            allowed_departments=[],
            allowed_roles=[],
            lineage_id="HR_CODE_OF_CONDUCT",
            version="1.0",
            effective_date="2026-01-01",
            status=DocumentStatus.ACTIVE.value,
            content="Welcome to NovaTech Solutions. Our core principles are Integrity, Client Confidentiality, and Security First. Employees must adhere to the classification standards for all intellectual property."
        ),
        # Confidential Document: DOC-105
        DocumentCreate(
            document_id="DOC-105",
            title="Next-Gen Architecture Roadmap 2026",
            owner="Engineering Architecture Board",
            department="Engineering",
            classification=ClearanceLevel.CONFIDENTIAL.value,
            allowed_departments=["Engineering", "Executive"],
            allowed_roles=[],
            lineage_id="ENG_ROADMAP",
            version="1.5",
            effective_date="2026-07-15",
            status=DocumentStatus.ACTIVE.value,
            content="NovaTech Confidential Architecture Roadmap. Transitioning to micro-services and deterministic authorization proxies by Q4 2026."
        ),
        # Conflict Demo Documents: DOC-501 & DOC-502
        DocumentCreate(
            document_id="DOC-501",
            title="Market Share Analysis Report A",
            owner="Strategy Team Alpha",
            department="Finance",
            classification=ClearanceLevel.INTERNAL.value,
            allowed_departments=["Finance", "Marketing"],
            allowed_roles=[],
            lineage_id="MARKET_ANALYSIS_A",
            version="1.0",
            effective_date="2026-08-15",
            status=DocumentStatus.ACTIVE.value,
            content="Market conflict assessment: NovaTech enterprise market share is estimated at 38% in the cloud security domain."
        ),
        DocumentCreate(
            document_id="DOC-502",
            title="Market Share Analysis Report B",
            owner="Strategy Team Beta",
            department="Finance",
            classification=ClearanceLevel.INTERNAL.value,
            allowed_departments=["Finance", "Marketing"],
            allowed_roles=[],
            lineage_id="MARKET_ANALYSIS_B",
            version="1.0",
            effective_date="2026-08-15",
            status=DocumentStatus.ACTIVE.value,
            content="Market conflict assessment: NovaTech enterprise market share is estimated at 52% according to competitive benchmark surveys."
        )
    ]

    for doc_data in demo_docs:
        IngestionService.ingest_document(db, doc_data)

    db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
        print("Database seeded successfully with demo users and documents!")
    finally:
        db.close()
