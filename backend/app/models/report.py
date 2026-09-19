from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


from app.utils.dates import get_utc_now


@dataclass
class Report:
    id: str
    patient_id: str
    treatment_id: str
    report_url: Optional[str] = None
    created_at: datetime = field(default_factory=get_utc_now)
    updated_at: datetime = field(default_factory=get_utc_now)

