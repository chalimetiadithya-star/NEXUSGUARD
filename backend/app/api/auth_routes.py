from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, Token, UserProfile
from app.services.auth_service import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    # Support username as employee_id or email
    user = db.query(User).filter(
        (User.employee_id == creds.username.strip().upper()) |
        (User.email == creds.username.strip().lower())
    ).first()

    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect employee ID or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )

    access_token = create_access_token(data={"sub": user.employee_id})
    profile = UserProfile(
        employee_id=user.employee_id,
        name=user.name,
        email=user.email,
        department=user.department,
        role=user.role,
        clearance=user.clearance,
        is_active=user.is_active
    )

    return Token(access_token=access_token, token_type="bearer", user=profile)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return UserProfile(
        employee_id=current_user.employee_id,
        name=current_user.name,
        email=current_user.email,
        department=current_user.department,
        role=current_user.role,
        clearance=current_user.clearance,
        is_active=current_user.is_active
    )

@router.get("/demo-users")
def list_demo_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    demo_cards = []
    descriptions = {
        "U102": "Finance Analyst (Internal) — Retrieves authorized DOC-101 (120 crore)",
        "U205": "Marketing Specialist (Internal) — Blocked from Executive DOC-201 (145 crore)",
        "U301": "Finance Lead (Internal) — Demonstrates latest version selection DOC-302 (125 crore)",
        "U401": "Chief Executive Officer (Restricted) — Authorized to view restricted materials",
        "U901": "Chief Information Security Officer (Admin) — Manages governance & inspects audit traces"
    }
    for u in users:
        demo_cards.append({
            "employee_id": u.employee_id,
            "name": u.name,
            "department": u.department,
            "role": u.role,
            "clearance": u.clearance,
            "description": descriptions.get(u.employee_id, "Employee account")
        })
    return demo_cards
