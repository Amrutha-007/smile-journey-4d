from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


from app.utils.dates import get_utc_now


@dataclass
class Doctor:
    id: str
    auth_user_id: str
    name: str
    email: str
    phone: Optional[str] = None
    clinic_name: Optional[str] = None
    specialization: Optional[str] = None
    created_at: datetime = field(default_factory=get_utc_now)
    updated_at: datetime = field(default_factory=get_utc_now)

