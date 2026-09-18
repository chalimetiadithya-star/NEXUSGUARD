import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enums import ClearanceLevel, DocumentStatus

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    owner = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    classification = Column(String(50), nullable=False, default=ClearanceLevel.INTERNAL.value)
    
    # JSON-encoded lists of allowed departments, roles, users, and explicit denies
    allowed_departments_json = Column(Text, default="[]")
    allowed_roles_json = Column(Text, default="[]")
    allowed_users_json = Column(Text, default="[]")
    denied_users_json = Column(Text, default="[]")
    
    lineage_id = Column(String(100), index=True, nullable=False)
    version = Column(String(20), nullable=False, default="1.0")
    effective_date = Column(String(50), nullable=False) # e.g. "2026-09-01"
    status = Column(String(50), nullable=False, default=DocumentStatus.ACTIVE.value)
    storage_path = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

    @property
    def classification_level(self) -> ClearanceLevel:
        level = ClearanceLevel.from_string(self.classification)
        return level if level is not None else ClearanceLevel.RESTRICTED

    @property
    def allowed_departments(self) -> list:
        try:
            return json.loads(self.allowed_departments_json or "[]")
        except Exception:
            return []

    @allowed_departments.setter
    def allowed_departments(self, val: list):
        self.allowed_departments_json = json.dumps(val or [])

    @property
    def allowed_roles(self) -> list:
        try:
            return json.loads(self.allowed_roles_json or "[]")
        except Exception:
            return []

    @allowed_roles.setter
    def allowed_roles(self, val: list):
        self.allowed_roles_json = json.dumps(val or [])

    @property
    def allowed_users(self) -> list:
        try:
            return json.loads(self.allowed_users_json or "[]")
        except Exception:
            return []

    @allowed_users.setter
    def allowed_users(self, val: list):
        self.allowed_users_json = json.dumps(val or [])

    @property
    def denied_users(self) -> list:
        try:
            return json.loads(self.denied_users_json or "[]")
        except Exception:
            return []

    @denied_users.setter
    def denied_users(self, val: list):
        self.denied_users_json = json.dumps(val or [])


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(50), ForeignKey("documents.document_id", ondelete="CASCADE"), index=True, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    search_text = Column(Text, nullable=False)

    document = relationship("Document", back_populates="chunks")
