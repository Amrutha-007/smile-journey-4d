from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


from app.utils.dates import get_utc_now


@dataclass
class AISimulation:
    id: str
    patient_id: str
    treatment_id: str
    stage_id: Optional[str]
    input_image_url: str
    output_image_url: Optional[str]
    treatment_type: str
    stage_month: int
    stage_progress: int
    ai_provider: str
    status: str = "queued"  # 'queued', 'processing', 'completed', 'failed'
    error_message: Optional[str] = None
    created_at: datetime = field(default_factory=get_utc_now)
    completed_at: Optional[datetime] = None

