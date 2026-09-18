from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.stage import StageResponse, StageUpdate
from app.schemas.common import APIResponse
from app.api.deps import get_current_doctor
from app.database import db
from app.services.patient_service import patient_service

router = APIRouter(tags=["Treatment Stages"])


@router.get("/api/treatments/{treatment_id}/stages", response_model=APIResponse[List[StageResponse]])
async def list_stages(
    treatment_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    treatment = db.get_treatment(treatment_id)
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found.")
    
    # Verify doctor owns patient
    patient_service.get_patient(treatment["patient_id"], current_doctor["id"])

    stages = db.list_treatment_stages(treatment_id)
    return APIResponse(
        success=True,
        data=[StageResponse(**s) for s in stages]
    )


@router.get("/api/stages/{stage_id}", response_model=APIResponse[StageResponse])
async def get_stage(
    stage_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    stage = db.get_stage(stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found.")
    
    treatment = db.get_treatment(stage["treatment_id"])
    if not treatment:
        raise HTTPException(status_code=404, detail="Parent treatment not found.")

    patient_service.get_patient(treatment["patient_id"], current_doctor["id"])

    return APIResponse(
        success=True,
        data=StageResponse(**stage)
    )


@router.put("/api/stages/{stage_id}", response_model=APIResponse[StageResponse])
async def update_stage(
    stage_id: str,
    request: StageUpdate,
    current_doctor: dict = Depends(get_current_doctor)
):
    stage = db.get_stage(stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found.")
    
    treatment = db.get_treatment(stage["treatment_id"])
    if not treatment:
        raise HTTPException(status_code=404, detail="Parent treatment not found.")

    patient_service.get_patient(treatment["patient_id"], current_doctor["id"])

    updates = {k: v for k, v in request.model_dump(exclude_unset=True).items() if v is not None}
    updated = db.update_stage(stage_id, updates)

    return APIResponse(
        success=True,
        data=StageResponse(**updated),
        message="Stage updated successfully."
    )
