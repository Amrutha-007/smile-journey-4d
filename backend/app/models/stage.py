from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime, date


from app.utils.dates import get_utc_now


@dataclass
class TreatmentStage:
    id: str
    treatment_id: str
    stage_number: int
    stage_name: str
    month: int
    scheduled_date: Optional[date] = None
    progress_percentage: int = 0
    status: str = "upcoming"  # 'upcoming', 'generating', 'completed'
    ai_image_url: Optional[str] = None
    actual_photo_url: Optional[str] = None
    dentist_notes: Optional[str] = None
    created_at: datetime = field(default_factory=get_utc_now)
    updated_at: datetime = field(default_factory=get_utc_now)

