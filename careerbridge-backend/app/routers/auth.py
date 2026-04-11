from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new student (or admin) account."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if payload.enrollment_no:
        dup = db.query(User).filter(User.enrollment_no == payload.enrollment_no).first()
        if dup:
            raise HTTPException(status_code=400, detail="Enrollment number already in use")

    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        enrollment_no=payload.enrollment_no,
        hashed_password=hash_password(payload.password),
        role=payload.role if payload.role in ("student", "admin") else "student",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        role=user.role,
        user_id=user.id,
        full_name=f"{user.first_name} {user.last_name}",
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email + password."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is blocked. Contact admin.")

    # Optional: enforce role match (frontend sends chosen role)
    if payload.role == "admin" and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not an admin account")

    # Update last_seen
    from datetime import datetime
    user.last_seen = datetime.utcnow()
    db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        role=user.role,
        user_id=user.id,
        full_name=f"{user.first_name} {user.last_name}",
    )


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": f"{current_user.first_name} {current_user.last_name}",
        "email": current_user.email,
        "role": current_user.role,
        "enrollment_no": current_user.enrollment_no,
    }
