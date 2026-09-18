from app.models.user import User
from app.models.document import Document
from app.models.enums import ClearanceLevel, PolicyReason
from app.services.policy_engine import PolicyEngine

def test_policy_clearance_allow():
    user = User(employee_id="U102", department="Finance", role="Finance", clearance="Internal", is_active=True)
    doc = Document(document_id="DOC-101", title="Q4 Report", department="Finance", classification="Internal")
    doc.allowed_departments = ["Finance"]
    doc.allowed_roles = []
    decision = PolicyEngine.evaluate_one(doc, user)
    assert decision.allowed is True
    assert decision.reason == PolicyReason.ALLOW

def test_policy_clearance_insufficient():
    user = User(employee_id="U205", department="Marketing", role="Marketing", clearance="Internal", is_active=True)
    doc = Document(document_id="DOC-201", title="Exec Report", department="Executive", classification="Restricted")
    doc.allowed_departments = []
    doc.allowed_roles = []
    decision = PolicyEngine.evaluate_one(doc, user)
    assert decision.allowed is False
    assert decision.reason == PolicyReason.INSUFFICIENT_CLEARANCE

def test_policy_department_denial():
    user = User(employee_id="U205", department="Marketing", role="Marketing", clearance="Internal", is_active=True)
    doc = Document(document_id="DOC-101", title="Finance Doc", department="Finance", classification="Internal")
    doc.allowed_departments = ["Finance"]
    doc.allowed_roles = []
    decision = PolicyEngine.evaluate_one(doc, user)
    assert decision.allowed is False
    assert decision.reason == PolicyReason.DEPARTMENT_NOT_ALLOWED

def test_policy_role_denial():
    user = User(employee_id="U102", department="Finance", role="Analyst", clearance="Restricted", is_active=True)
    doc = Document(document_id="DOC-900", title="CFO Only", department="Finance", classification="Internal")
    doc.allowed_departments = []
    doc.allowed_roles = ["CFO", "Executive"]
    decision = PolicyEngine.evaluate_one(doc, user)
    assert decision.allowed is False
    assert decision.reason == PolicyReason.ROLE_NOT_ALLOWED

def test_policy_explicit_deny_wins():
    user = User(employee_id="U102", department="Finance", role="Finance", clearance="Restricted", is_active=True)
    doc = Document(document_id="DOC-101", title="Blocked Doc", department="Finance", classification="Internal")
    doc.allowed_departments = ["Finance"]
    doc.denied_users = ["U102"]
    decision = PolicyEngine.evaluate_one(doc, user)
    assert decision.allowed is False
    assert decision.reason == PolicyReason.EXPLICIT_DENY

def test_policy_default_deny_malformed():
    user = User(employee_id="U102", department="Finance", role="Finance", clearance="Internal", is_active=True)
    doc = Document(document_id="DOC-ERR", title="Broken Doc", department="Finance", classification="INVALID_LEVEL")
    decision = PolicyEngine.evaluate_one(doc, user)
    assert decision.allowed is False
    assert decision.reason in [PolicyReason.UNKNOWN_CLASSIFICATION, PolicyReason.INVALID_POLICY_METADATA]
