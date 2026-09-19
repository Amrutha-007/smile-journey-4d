from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


from app.utils.dates import get_utc_now


@dataclass
class Patient:
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
    status: str = "active"  # 'active', 'completed', 'upcoming'
    created_at: datetime = field(default_factory=get_utc_now)
    updated_at: datetime = field(default_factory=get_utc_now)

