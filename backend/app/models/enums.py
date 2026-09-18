import enum

class ClearanceLevel(str, enum.Enum):
    PUBLIC = "Public"
    INTERNAL = "Internal"
    CONFIDENTIAL = "Confidential"
    RESTRICTED = "Restricted"

    @property
    def rank(self) -> int:
        hierarchy = {
            ClearanceLevel.PUBLIC: 0,
            ClearanceLevel.INTERNAL: 1,
            ClearanceLevel.CONFIDENTIAL: 2,
            ClearanceLevel.RESTRICTED: 3,
        }
        return hierarchy.get(self, 0)

    @classmethod
    def from_string(cls, val: str):
        if not val:
            return None
        val_norm = val.strip().capitalize()
        for member in cls:
            if member.value.lower() == val.strip().lower():
                return member
        return None

class DocumentStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    SUPERSEDED = "SUPERSEDED"
    ARCHIVED = "ARCHIVED"

class PolicyReason(str, enum.Enum):
    ALLOW = "ALLOW"
    INSUFFICIENT_CLEARANCE = "INSUFFICIENT_CLEARANCE"
    DEPARTMENT_NOT_ALLOWED = "DEPARTMENT_NOT_ALLOWED"
    ROLE_NOT_ALLOWED = "ROLE_NOT_ALLOWED"
    EXPLICIT_DENY = "EXPLICIT_DENY"
    INVALID_POLICY_METADATA = "INVALID_POLICY_METADATA"
    UNKNOWN_CLASSIFICATION = "UNKNOWN_CLASSIFICATION"
    USER_DISABLED = "USER_DISABLED"

class QueryStatus(str, enum.Enum):
    SUCCESS = "SUCCESS"
    NO_AUTHORIZED_EVIDENCE = "NO_AUTHORIZED_EVIDENCE"
    CONFLICT = "CONFLICT"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    LLM_UNAVAILABLE = "LLM_UNAVAILABLE"
    ERROR = "ERROR"
