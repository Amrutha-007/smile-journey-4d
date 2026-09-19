import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.treatment import (
    TreatmentCreate,
    TreatmentResponse,
    TreatmentWithStagesResponse,
    StageSummary,
)
from app.schemas.simulation import BatchSimulationResponse, SimulationStatusResponse
from app.schemas.common import APIResponse
from app.api.deps import get_current_doctor
from app.database import db
from app.services.patient_service import patient_service
from app.services.timeline_service import generate_treatment_timeline
from app.services.ai_service import get_ai_provider
from app.services.storage_service import storage_service
from app.utils.dates import add_months_to_date, parse_date
from app.config import settings

router = APIRouter(tags=["Treatments"])


@router.post("/api/patients/{patient_id}/treatment", response_model=APIResponse[TreatmentWithStagesResponse], status_code=status.HTTP_201_CREATED)
async def create_treatment(
    patient_id: str,
    request: TreatmentCreate,
    current_doctor: dict = Depends(get_current_doctor)
):
    # Verify patient ownership
    patient = patient_service.get_patient(patient_id, current_doctor["id"])

    # Calculate expected end date
    start = parse_date(request.start_date)
    expected_end = add_months_to_date(start, request.duration_months)

    # 1. Create treatment record
    treatment_record = {
        "patient_id": patient_id,
        "treatment_type": request.treatment_type,
        "duration_months": request.duration_months,
        "number_of_sittings": request.number_of_sittings,
        "start_date": start,
        "expected_end_date": expected_end,
        "description": request.description,
    }
    treatment = db.create_treatment(treatment_record)

    # 2. Automatically generate treatment stages via Timeline Service
    timeline_stages = generate_treatment_timeline(
        start_date=start,
        duration_months=request.duration_months,
        number_of_sittings=request.number_of_sittings,
        custom_dates=request.custom_dates
    )

    created_stages = []
    for stage_data in timeline_stages:
        stage_record = {
            "treatment_id": treatment["id"],
            "stage_number": stage_data["stage_number"],
            "stage_name": stage_data["stage_name"],
            "month": stage_data["month"],
            "scheduled_date": parse_date(stage_data["scheduled_date"]),
            "progress_percentage": stage_data["progress_percentage"],
            "status": stage_data["status"],
            "dentist_notes": stage_data.get("dentist_notes"),
            "ai_image_url": None,
            "actual_photo_url": None,
        }
        # For stage 0 (Initial), if patient already has original photo, attach it as baseline
        if stage_data["stage_number"] == 0 and patient.get("original_photo_url"):
            stage_record["actual_photo_url"] = patient["original_photo_url"]
            stage_record["ai_image_url"] = patient["original_photo_url"]

        saved_stage = db.create_stage(stage_record)
        created_stages.append(saved_stage)

    # Prepare response
    stage_summaries = [
        StageSummary(
            id=s["id"],
            name=s["stage_name"],
            month=s["month"],
            progress=s["progress_percentage"],
            scheduled_date=str(s["scheduled_date"]),
            status=s["status"]
        )
        for s in created_stages
    ]

    return APIResponse(
        success=True,
        data=TreatmentWithStagesResponse(
            treatment={
                "id": treatment["id"],
                "type": treatment["treatment_type"],
                "duration_months": treatment["duration_months"],
                "number_of_sittings": treatment["number_of_sittings"],
            },
            stages=stage_summaries
        ),
        message="Treatment and automatic timeline stages created successfully."
    )


@router.get("/api/treatments/{treatment_id}", response_model=APIResponse[TreatmentResponse])
async def get_treatment(
    treatment_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    treatment = db.get_treatment(treatment_id)
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found.")
    # Verify doctor owns the patient
    patient_service.get_patient(treatment["patient_id"], current_doctor["id"])
    return APIResponse(success=True, data=TreatmentResponse(**treatment))


@router.post("/api/treatments/{treatment_id}/generate-all", response_model=APIResponse[BatchSimulationResponse])
async def generate_all_simulations(
    treatment_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    """
    Sequentially processes all non-initial stages of a treatment, generating
    potential smile simulations using the configured AI provider.
    """
    treatment = db.get_treatment(treatment_id)
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found.")
    
    patient = patient_service.get_patient(treatment["patient_id"], current_doctor["id"])
    stages = db.list_treatment_stages(treatment_id)
    if not stages:
        raise HTTPException(status_code=400, detail="No stages found for this treatment.")

    original_photo = patient.get("original_photo_url") or "placeholder_patient_smile.jpg"
    ai_provider = get_ai_provider()

    simulation_results = []

    for stage in stages:
        # Skip stage 0 (Initial) from AI generation if desired, or sync initial to original photo
        if stage.get("stage_number") == 0:
            if patient.get("original_photo_url"):
                db.update_stage(stage["id"], {
                    "ai_image_url": patient["original_photo_url"],
                    "actual_photo_url": patient["original_photo_url"],
                    "status": "completed"
                })
            continue

        # Mark stage as generating
        db.update_stage(stage["id"], {"status": "generating"})

        # Create simulation record in 'processing'
        sim_record = db.create_simulation({
            "patient_id": patient["id"],
            "treatment_id": treatment["id"],
            "stage_id": stage["id"],
            "input_image_url": original_photo,
            "treatment_type": treatment["treatment_type"],
            "stage_month": stage["month"],
            "stage_progress": stage["progress_percentage"],
            "ai_provider": settings.AI_PROVIDER,
            "status": "processing",
        })

        try:
            # Generate AI potential smile visualization
            generated_img, prompt_used = await ai_provider.generate_smile_simulation(
                image_url=original_photo,
                treatment_type=treatment["treatment_type"],
                stage_month=stage["month"],
                stage_progress=stage["progress_percentage"]
            )

            # Update simulation record
            db.update_simulation(sim_record["id"], {
                "output_image_url": generated_img,
                "status": "completed",
            })

            # Update stage record
            db.update_stage(stage["id"], {
                "ai_image_url": generated_img,
                "status": "upcoming" if stage.get("status") != "completed" else "completed",
            })

            simulation_results.append(SimulationStatusResponse(
                id=sim_record["id"],
                status="completed",
                stage=stage["stage_name"],
                image_url=generated_img,
                treatment_type=treatment["treatment_type"],
                stage_month=stage["month"],
                stage_progress=stage["progress_percentage"],
                ai_provider=settings.AI_PROVIDER,
            ))

        except Exception as e:
            # Failure isolation: Do NOT fail the entire treatment if one stage fails
            error_msg = str(e)
            db.update_simulation(sim_record["id"], {
                "status": "failed",
                "error_message": error_msg,
            })
            db.update_stage(stage["id"], {"status": "upcoming"})

            simulation_results.append(SimulationStatusResponse(
                id=sim_record["id"],
                status="failed",
                stage=stage["stage_name"],
                error_message=error_msg,
                treatment_type=treatment["treatment_type"],
                stage_month=stage["month"],
                stage_progress=stage["progress_percentage"],
                ai_provider=settings.AI_PROVIDER,
            ))

    return APIResponse(
        success=True,
        data=BatchSimulationResponse(
            treatment_id=treatment_id,
            total_stages=len(stages),
            simulations_queued=len(simulation_results),
            simulations=simulation_results,
        ),
        message="AI smile simulations processed for all stages."
    )
