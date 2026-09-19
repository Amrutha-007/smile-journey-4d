from typing import Optional
from pydantic import BaseModel, Field
from datetime import date, datetime


class StageUpdate(BaseModel):
    stage_name: Optional[str] = None
    scheduled_date: Optional[date] = None
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[str] = Field(None, pattern="^(upcoming|generating|completed)$")
    dentist_notes: Optional[str] = None
    ai_image_url: Optional[str] = None
    actual_photo_url: Optional[str] = None


class StageResponse(BaseModel):
    id: str
    treatment_id: str
    stage_number: int
    stage_name: str
    month: int
    scheduled_date: Optional[date] = None
    progress_percentage: int
    status: str
    ai_image_url: Optional[str] = None
    actual_photo_url: Optional[str] = None
    dentist_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
