from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    clinic_name: Optional[str] = None
    specialization: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class DoctorResponse(BaseModel):
    id: str
    auth_user_id: str
    name: str
    email: str
    phone: Optional[str] = None
    clinic_name: Optional[str] = None
    specialization: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    doctor: DoctorResponse
