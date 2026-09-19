from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime, date


from app.utils.dates import get_utc_now


@dataclass
class Treatment:
    id: str
    patient_id: str
    treatment_type: str  # 'veneers', 'clear_aligners', 'braces'
    duration_months: int
    number_of_sittings: int
    start_date: date
    expected_end_date: Optional[date] = None
    description: Optional[str] = None
    created_at: datetime = field(default_factory=get_utc_now)
    updated_at: datetime = field(default_factory=get_utc_now)

