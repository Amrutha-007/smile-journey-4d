from app.schemas.common import APIResponse, APIError, ErrorResponse
from app.schemas.auth import RegisterRequest, LoginRequest, DoctorResponse, TokenResponse
from app.schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientCreateResponse,
    PatientPhotoResponse,
    PatientProgressResponse,
    PatientOverviewResponse,
)
from app.schemas.treatment import (
    TreatmentCreate,
    TreatmentResponse,
    TreatmentWithStagesResponse,
    StageSummary,
)
from app.schemas.stage import StageUpdate, StageResponse
from app.schemas.sitting import (
    SittingCreate,
    SittingUpdate,
    SittingResponse,
    SittingPhotoResponse,
)
from app.schemas.simulation import (
    SimulationRequest,
    SimulationResponse,
    SimulationStatusResponse,
    BatchSimulationResponse,
)
from app.schemas.report import DetailedReportData, ReportResponse

__all__ = [
    "APIResponse",
    "APIError",
    "ErrorResponse",
    "RegisterRequest",
    "LoginRequest",
    "DoctorResponse",
    "TokenResponse",
    "PatientCreate",
    "PatientUpdate",
    "PatientResponse",
    "PatientCreateResponse",
    "PatientPhotoResponse",
    "PatientProgressResponse",
    "PatientOverviewResponse",
    "TreatmentCreate",
    "TreatmentResponse",
    "TreatmentWithStagesResponse",
    "StageSummary",
    "StageUpdate",
    "StageResponse",
    "SittingCreate",
    "SittingUpdate",
    "SittingResponse",
    "SittingPhotoResponse",
    "SimulationRequest",
    "SimulationResponse",
    "SimulationStatusResponse",
    "BatchSimulationResponse",
    "DetailedReportData",
    "ReportResponse",
]
