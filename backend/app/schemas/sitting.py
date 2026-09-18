from typing import Optional
from pydantic import BaseModel, Field
from datetime import date, datetime


class SittingCreate(BaseModel):
    stage_id: Optional[str] = None
    sitting_number: int = Field(..., ge=1)
    date: date
    progress_percentage: int = Field(0, ge=0, le=100)
    dentist_notes: Optional[str] = None


class SittingUpdate(BaseModel):
    stage_id: Optional[str] = None
    sitting_number: Optional[int] = Field(None, ge=1)
    date: Optional[date] = None
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)
    actual_photo_url: Optional[str] = None
    dentist_notes: Optional[str] = None


class SittingResponse(BaseModel):
    id: str
    patient_id: str
    treatment_id: str
    stage_id: Optional[str] = None
    sitting_number: int
    date: date
    progress_percentage: int
    actual_photo_url: Optional[str] = None
    dentist_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SittingPhotoResponse(BaseModel):
    success: bool = True
    image_url: str
    sitting_id: str
