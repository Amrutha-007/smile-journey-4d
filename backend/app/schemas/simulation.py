from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class SimulationRequest(BaseModel):
    stage_ids: Optional[List[str]] = Field(None, description="Optional specific stage IDs to simulate. If omitted, all eligible stages are simulated.")


class SimulationStatusResponse(BaseModel):
    id: str
    status: str  # 'queued', 'processing', 'completed', 'failed'
    stage: str
    image_url: Optional[str] = None
    error_message: Optional[str] = None
    treatment_type: Optional[str] = None
    stage_month: Optional[int] = None
    stage_progress: Optional[int] = None
    ai_provider: Optional[str] = None
    simulation_type: str = "potential_treatment_visualization"


class SimulationResponse(BaseModel):
    id: str
    patient_id: str
    treatment_id: str
    stage_id: Optional[str] = None
    input_image_url: str
    output_image_url: Optional[str] = None
    treatment_type: str
    stage_month: int
    stage_progress: int
    ai_provider: str
    status: str
    error_message: Optional[str] = None
    simulation_type: str = "potential_treatment_visualization"
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BatchSimulationResponse(BaseModel):
    treatment_id: str
    total_stages: int
    simulations_queued: int
    simulations: List[SimulationStatusResponse]
