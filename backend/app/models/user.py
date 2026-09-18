from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base
from app.models.enums import ClearanceLevel

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False)
    clearance = Column(String(50), nullable=False, default=ClearanceLevel.INTERNAL.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def clearance_level(self) -> ClearanceLevel:
        level = ClearanceLevel.from_string(self.clearance)
        return level if level is not None else ClearanceLevel.PUBLIC
