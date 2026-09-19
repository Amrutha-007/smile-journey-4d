from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class PatientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    problem: Optional[str] = Field(None, max_length=255)
    problem_description: Optional[str] = None


class PatientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    problem: Optional[str] = None
    problem_description: Optional[str] = None
    original_photo_url: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|completed|upcoming)$")


class PatientCreateResponse(BaseModel):
    id: str
    patient_code: str
    name: str


class PatientResponse(BaseModel):
    id: str
    doctor_id: str
    patient_code: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    problem: Optional[str] = None
    problem_description: Optional[str] = None
    original_photo_url: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PatientPhotoResponse(BaseModel):
    success: bool = True
    image_url: str


class PatientProgressResponse(BaseModel):
    patient: dict
    treatment: Optional[dict] = None
    overall_progress: int = 0
    stages: List[dict] = []


class PatientOverviewResponse(BaseModel):
    patient: dict
    treatment: Optional[dict] = None
    current_progress: int = 0
    next_sitting: Optional[dict] = None
    stages: List[dict] = []
    sittings: List[dict] = []
    ai_simulations: List[dict] = []
    actual_photos: List[dict] = []
