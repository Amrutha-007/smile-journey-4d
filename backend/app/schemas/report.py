from typing import Optional, List, Any, Dict
from pydantic import BaseModel
from datetime import datetime


class DetailedReportData(BaseModel):
    patient: Dict[str, Any]
    treatment: Dict[str, Any]
    initial_assessment: Dict[str, Any]
    timeline: List[Dict[str, Any]]
    ai_visualizations: List[Dict[str, Any]]
    actual_progress: List[Dict[str, Any]]
    sitting_history: List[Dict[str, Any]]
    dentist_notes: List[Dict[str, Any]]
    disclaimer: str = "This document contains AI-generated potential treatment visualizations for patient education and communication. Visual simulations represent approximate potential progress and do not constitute guaranteed clinical outcomes."


class ReportResponse(BaseModel):
    id: str
    patient_id: str
    treatment_id: str
    report_url: Optional[str] = None
    data: Optional[DetailedReportData] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
