from typing import List, Optional
from datetime import datetime
from app.utils.dates import get_utc_now


from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.simulation import (
    SimulationRequest,
    SimulationResponse,
    SimulationStatusResponse,
    BatchSimulationResponse,
)
from app.schemas.common import APIResponse
from app.api.deps import get_current_doctor
from app.database import db
from app.services.patient_service import patient_service
from app.services.ai_service import get_ai_provider
from app.config import settings

router = APIRouter(tags=["AI Simulations"])


@router.post(
    "/api/patients/{patient_id}/treatment/{treatment_id}/simulate",
    response_model=APIResponse[BatchSimulationResponse]
)
async def simulate_stages(
    patient_id: str,
    treatment_id: str,
    request: Optional[SimulationRequest] = None,
    current_doctor: dict = Depends(get_current_doctor)
):
    # Verify patient and treatment ownership
    patient = patient_service.get_patient(patient_id, current_doctor["id"])
    treatment = db.get_treatment(treatment_id)
    if not treatment or treatment["patient_id"] != patient_id:
        raise HTTPException(status_code=404, detail="Treatment not found for this patient.")

    stages = db.list_treatment_stages(treatment_id)
    if not stages:
        raise HTTPException(status_code=400, detail="No stages found for this treatment.")

    # Filter by stage_ids if specified
    if request and request.stage_ids:
        eligible_stages = [s for s in stages if s["id"] in request.stage_ids]
    else:
        eligible_stages = [s for s in stages if s.get("stage_number", 0) > 0]

    original_photo = patient.get("original_photo_url") or "placeholder_patient_smile.jpg"
    ai_provider = get_ai_provider()
    results = []

    for stage in eligible_stages:
        db.update_stage(stage["id"], {"status": "generating"})
        
        sim_record = db.create_simulation({
            "patient_id": patient_id,
            "treatment_id": treatment_id,
            "stage_id": stage["id"],
            "input_image_url": original_photo,
            "treatment_type": treatment["treatment_type"],
            "stage_month": stage["month"],
            "stage_progress": stage["progress_percentage"],
            "ai_provider": settings.AI_PROVIDER,
            "status": "processing",
        })

        try:
            generated_img, prompt = await ai_provider.generate_smile_simulation(
                image_url=original_photo,
                treatment_type=treatment["treatment_type"],
                stage_month=stage["month"],
                stage_progress=stage["progress_percentage"]
            )

            db.update_simulation(sim_record["id"], {
                "output_image_url": generated_img,
                "status": "completed",
                "completed_at": get_utc_now(),
            })

            db.update_stage(stage["id"], {
                "ai_image_url": generated_img,
                "status": "upcoming" if stage.get("status") != "completed" else "completed",
            })

            results.append(SimulationStatusResponse(
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
            err_str = str(e)
            db.update_simulation(sim_record["id"], {
                "status": "failed",
                "error_message": err_str,
            })
            db.update_stage(stage["id"], {"status": "upcoming"})
            results.append(SimulationStatusResponse(
                id=sim_record["id"],
                status="failed",
                stage=stage["stage_name"],
                error_message=err_str,
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
            simulations_queued=len(results),
            simulations=results,
        ),
        message="Simulations completed."
    )


@router.get("/api/simulations/{simulation_id}", response_model=APIResponse[SimulationStatusResponse])
async def get_simulation_status(
    simulation_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    sim = db.get_simulation(simulation_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found.")

    # Verify doctor owns patient
    patient_service.get_patient(sim["patient_id"], current_doctor["id"])

    stage_name = f"Month {sim.get('stage_month')}"
    if sim.get("stage_id"):
        st = db.get_stage(sim["stage_id"])
        if st:
            stage_name = st["stage_name"]

    return APIResponse(
        success=True,
        data=SimulationStatusResponse(
            id=sim["id"],
            status=sim["status"],
            stage=stage_name,
            image_url=sim.get("output_image_url"),
            error_message=sim.get("error_message"),
            treatment_type=sim.get("treatment_type"),
            stage_month=sim.get("stage_month"),
            stage_progress=sim.get("stage_progress"),
            ai_provider=sim.get("ai_provider"),
            simulation_type=sim.get("simulation_type", "potential_treatment_visualization"),
        )
    )


@router.post("/api/simulations/{simulation_id}/retry", response_model=APIResponse[SimulationStatusResponse])
async def retry_simulation(
    simulation_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    sim = db.get_simulation(simulation_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found.")

    patient = patient_service.get_patient(sim["patient_id"], current_doctor["id"])
    treatment = db.get_treatment(sim["treatment_id"])
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment record missing.")

    # Mark as processing
    db.update_simulation(simulation_id, {"status": "processing", "error_message": None})
    ai_provider = get_ai_provider()

    try:
        generated_img, prompt = await ai_provider.generate_smile_simulation(
            image_url=sim["input_image_url"],
            treatment_type=sim["treatment_type"],
            stage_month=sim["stage_month"],
            stage_progress=sim["stage_progress"],
        )

        db.update_simulation(simulation_id, {
            "output_image_url": generated_img,
            "status": "completed",
            "completed_at": get_utc_now(),
        })

        if sim.get("stage_id"):
            db.update_stage(sim["stage_id"], {"ai_image_url": generated_img})

        return APIResponse(
            success=True,
            data=SimulationStatusResponse(
                id=simulation_id,
                status="completed",
                stage=f"Month {sim['stage_month']}",
                image_url=generated_img,
                treatment_type=sim["treatment_type"],
                stage_month=sim["stage_month"],
                stage_progress=sim["stage_progress"],
                ai_provider=sim["ai_provider"],
            ),
            message="Simulation re-run succeeded."
        )
    except Exception as e:
        err_str = str(e)
        db.update_simulation(simulation_id, {
            "status": "failed",
            "error_message": err_str,
        })
        return APIResponse(
            success=False,
            data=SimulationStatusResponse(
                id=simulation_id,
                status="failed",
                stage=f"Month {sim['stage_month']}",
                error_message=err_str,
                treatment_type=sim["treatment_type"],
                stage_month=sim["stage_month"],
                stage_progress=sim["stage_progress"],
                ai_provider=sim["ai_provider"],
            ),
            message=f"Simulation retry failed: {err_str}"
        )
