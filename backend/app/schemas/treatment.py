from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime


class TreatmentCreate(BaseModel):
    treatment_type: str = Field(..., description="Treatment type: 'veneers', 'clear_aligners', or 'braces'")
    duration_months: int = Field(..., gt=0, description="Duration in months (must be > 0)")
    number_of_sittings: int = Field(..., gt=0, description="Number of sittings (must be > 0)")
    start_date: date = Field(..., description="Treatment start date (YYYY-MM-DD)")
    description: Optional[str] = None
    custom_dates: Optional[List[str]] = Field(None, description="Optional custom sitting dates (YYYY-MM-DD)")

    @field_validator("treatment_type")
    @classmethod
    def validate_treatment_type(cls, v: str) -> str:
        valid_types = {"veneers", "clear_aligners", "braces"}
        norm = v.lower().strip()
        if norm not in valid_types:
            # Also allow dental_veneers alias for compatibility with frontend
            if norm == "dental_veneers":
                return "veneers"
            raise ValueError(f"treatment_type must be one of: {', '.join(valid_types)}")
        return norm


class TreatmentResponse(BaseModel):
    id: str
    patient_id: str
    treatment_type: str
    duration_months: int
    number_of_sittings: int
    start_date: date
    expected_end_date: Optional[date] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StageSummary(BaseModel):
    id: str
    name: str
    month: int
    progress: int
    scheduled_date: Optional[str] = None
    status: str = "upcoming"


class TreatmentWithStagesResponse(BaseModel):
    treatment: dict
    stages: List[StageSummary]
