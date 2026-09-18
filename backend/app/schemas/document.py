from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CitationResponse(BaseModel):
    document_id: str
    title: str
    version: str
    effective_date: str
    classification: str
    department: str
    excerpt: Optional[str] = None

class DocumentResponse(BaseModel):
    id: int
    document_id: str
    title: str
    owner: str
    department: str
    classification: str
    allowed_departments: List[str]
    allowed_roles: List[str]
    allowed_users: List[str]
    denied_users: List[str]
    lineage_id: str
    version: str
    effective_date: str
    status: str
    content: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class DocumentCreate(BaseModel):
    document_id: str
    title: str
    owner: str
    department: str
    classification: str
    allowed_departments: List[str] = []
    allowed_roles: List[str] = []
    allowed_users: List[str] = []
    denied_users: List[str] = []
    lineage_id: str
    version: str = "1.0"
    effective_date: str
    status: str = "ACTIVE"
    content: str

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    owner: Optional[str] = None
    department: Optional[str] = None
    classification: Optional[str] = None
    allowed_departments: Optional[List[str]] = None
    allowed_roles: Optional[List[str]] = None
    allowed_users: Optional[List[str]] = None
    denied_users: Optional[List[str]] = None
    lineage_id: Optional[str] = None
    version: Optional[str] = None
    effective_date: Optional[str] = None
    status: Optional[str] = None
    content: Optional[str] = None
