from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime, date


from app.utils.dates import get_utc_now


@dataclass
class Sitting:
    id: str
    patient_id: str
    treatment_id: str
    stage_id: Optional[str]
    sitting_number: int
    date: date
    progress_percentage: int = 0
    actual_photo_url: Optional[str] = None
    dentist_notes: Optional[str] = None
    created_at: datetime = field(default_factory=get_utc_now)
    updated_at: datetime = field(default_factory=get_utc_now)

