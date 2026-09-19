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


class TreatmentParamsSchema(BaseModel):
    alignment: float = Field(0.5, ge=0.0, le=1.0, description="Tooth alignment/leveling correction (0.0 - 1.0)")
    spacing: float = Field(0.2, ge=0.0, le=1.0, description="Interdental spacing/diastema reduction (0.0 - 1.0)")
    whitening: float = Field(0.5, ge=0.0, le=1.0, description="Enamel shade lift (0.0 - 1.0)")
    tooth_length: float = Field(0.0, ge=-0.2, le=0.2, description="Crown height modification (-0.2 to +0.2)")
    tooth_width: float = Field(0.0, ge=-0.2, le=0.2, description="Crown width modification (-0.2 to +0.2)")
    smile_symmetry: float = Field(0.5, ge=0.0, le=1.0, description="Midline bilateral symmetry harmonization (0.0 - 1.0)")


class DirectSimulationRequest(BaseModel):
    source_image: Optional[str] = Field(None, description="Source smile photograph (base64 or URL). If omitted, patient original photo is used.")
    treatment: Optional[TreatmentParamsSchema] = Field(default_factory=TreatmentParamsSchema, description="Clinical treatment parameters.")
    preset: Optional[str] = Field(None, description="Preset identifier (e.g. natural_whitening, whitening_alignment)")


class DirectSimulationResponse(BaseModel):
    simulation_image: str
    status: str = "generated"
    simulation_type: str = "potential_treatment_visualization"
    treatment: TreatmentParamsSchema
    error_message: Optional[str] = None

