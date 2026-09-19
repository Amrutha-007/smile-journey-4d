import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientCreateResponse,
    PatientPhotoResponse,
    PatientProgressResponse,
    PatientOverviewResponse,
)
from app.schemas.common import APIResponse
from app.api.deps import get_current_doctor
from app.services.patient_service import patient_service
from app.services.storage_service import storage_service
from app.config import settings

router = APIRouter(prefix="/api/patients", tags=["Patients"])


@router.post("", response_model=APIResponse[PatientCreateResponse], status_code=status.HTTP_201_CREATED)
async def create_patient(
    request: PatientCreate,
    current_doctor: dict = Depends(get_current_doctor)
):
    patient = patient_service.create_patient(current_doctor["id"], request)
    return APIResponse(
        success=True,
        data=PatientCreateResponse(
            id=patient["id"],
            patient_code=patient["patient_code"],
            name=patient["name"]
        ),
        message="Patient created successfully."
    )


@router.get("", response_model=APIResponse[List[PatientResponse]])
async def list_patients(current_doctor: dict = Depends(get_current_doctor)):
    patients = patient_service.list_patients(current_doctor["id"])
    return APIResponse(
        success=True,
        data=[PatientResponse(**p) for p in patients]
    )


@router.get("/{patient_id}", response_model=APIResponse[PatientResponse])
async def get_patient(
    patient_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    patient = patient_service.get_patient(patient_id, current_doctor["id"])
    return APIResponse(
        success=True,
        data=PatientResponse(**patient)
    )


@router.put("/{patient_id}", response_model=APIResponse[PatientResponse])
async def update_patient(
    patient_id: str,
    request: PatientUpdate,
    current_doctor: dict = Depends(get_current_doctor)
):
    updated = patient_service.update_patient(patient_id, current_doctor["id"], request)
    return APIResponse(
        success=True,
        data=PatientResponse(**updated),
        message="Patient updated successfully."
    )


@router.delete("/{patient_id}", response_model=APIResponse[dict])
async def delete_patient(
    patient_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    patient_service.delete_patient(patient_id, current_doctor["id"])
    return APIResponse(
        success=True,
        data={"deleted": True, "patient_id": patient_id},
        message="Patient deleted successfully."
    )


@router.post("/{patient_id}/photo", response_model=PatientPhotoResponse)
async def upload_patient_photo(
    patient_id: str,
    file: UploadFile = File(...),
    current_doctor: dict = Depends(get_current_doctor)
):
    # Verify doctor owns this patient first
    patient = patient_service.get_patient(patient_id, current_doctor["id"])

    # Read and validate file
    file_bytes = await file.read()
    storage_service.validate_image_file(file_bytes, file.content_type)

    # Generate distinct storage filename
    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    file_key = f"patients/{patient_id}/original_{uuid.uuid4().hex[:8]}.{ext}"

    # Upload to Supabase / Local storage
    image_url = await storage_service.upload_file(
        bucket_name=settings.BUCKET_PATIENT_ORIGINALS,
        file_path=file_key,
        file_bytes=file_bytes,
        content_type=file.content_type or "image/jpeg"
    )

    # Save to patient profile
    patient_service.update_patient_photo(patient_id, current_doctor["id"], image_url)

    return PatientPhotoResponse(
        success=True,
        image_url=image_url
    )


@router.get("/{patient_id}/progress", response_model=APIResponse[PatientProgressResponse])
async def get_patient_progress(
    patient_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    data = patient_service.get_patient_progress(patient_id, current_doctor["id"])
    return APIResponse(
        success=True,
        data=PatientProgressResponse(**data)
    )


@router.get("/{patient_id}/overview", response_model=APIResponse[PatientOverviewResponse])
async def get_patient_overview(
    patient_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    data = patient_service.get_patient_overview(patient_id, current_doctor["id"])
    return APIResponse(
        success=True,
        data=PatientOverviewResponse(**data)
    )
