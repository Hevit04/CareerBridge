from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    enrollment_no: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[int] = None
    phone: Optional[str] = None
    preferred_role: Optional[str] = None
    location_pref: Optional[str] = None
    skills: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: str = "student"


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[int] = None
    preferred_role: Optional[str] = None
    location_pref: Optional[str] = None
    skills: Optional[str] = None


class UserOut(UserBase):
    id: int
    role: str
    is_active: bool
    resume_filename: Optional[str] = None
    resume_uploaded_at: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserListItem(BaseModel):
    id: int
    full_name: str
    enrollment_no: Optional[str]
    email: str
    role: str
    is_active: bool
    last_seen: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class AdminUserAction(BaseModel):
    action: str  # "block" | "unblock" | "reset_password"
