from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str = "student"   # student | admin


class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    enrollment_no: str | None = None
    email: EmailStr
    password: str
    role: str = "student"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
