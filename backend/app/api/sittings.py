import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.schemas.sitting import (
    SittingCreate,
    SittingUpdate,
    SittingResponse,
    SittingPhotoResponse,
)
from app.schemas.common import APIResponse
from app.api.deps import get_current_doctor
from app.services.sitting_service import sitting_service
from app.services.storage_service import storage_service
from app.config import settings

router = APIRouter(tags=["Sittings"])


@router.post("/api/patients/{patient_id}/sittings", response_model=APIResponse[SittingResponse], status_code=status.HTTP_201_CREATED)
async def create_sitting(
    patient_id: str,
    request: SittingCreate,
    current_doctor: dict = Depends(get_current_doctor)
):
    sitting = sitting_service.create_sitting(patient_id, current_doctor["id"], request)
    return APIResponse(
        success=True,
        data=SittingResponse(**sitting),
        message="Sitting record saved successfully."
    )


@router.get("/api/patients/{patient_id}/sittings", response_model=APIResponse[List[SittingResponse]])
async def list_sittings(
    patient_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    sittings = sitting_service.list_sittings(patient_id, current_doctor["id"])
    return APIResponse(
        success=True,
        data=[SittingResponse(**s) for s in sittings]
    )


@router.get("/api/sittings/{sitting_id}", response_model=APIResponse[SittingResponse])
async def get_sitting(
    sitting_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    sitting = sitting_service.get_sitting(sitting_id, current_doctor["id"])
    return APIResponse(
        success=True,
        data=SittingResponse(**sitting)
    )


@router.put("/api/sittings/{sitting_id}", response_model=APIResponse[SittingResponse])
async def update_sitting(
    sitting_id: str,
    request: SittingUpdate,
    current_doctor: dict = Depends(get_current_doctor)
):
    updated = sitting_service.update_sitting(sitting_id, current_doctor["id"], request)
    return APIResponse(
        success=True,
        data=SittingResponse(**updated),
        message="Sitting updated successfully."
    )


@router.post("/api/sittings/{sitting_id}/photo", response_model=SittingPhotoResponse)
async def upload_sitting_photo(
    sitting_id: str,
    file: UploadFile = File(...),
    current_doctor: dict = Depends(get_current_doctor)
):
    # Verify doctor owns the sitting
    sitting = sitting_service.get_sitting(sitting_id, current_doctor["id"])

    # Read and validate image
    file_bytes = await file.read()
    storage_service.validate_image_file(file_bytes, file.content_type)

    # Distinct storage key in bucket 'patient-sittings'
    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    file_key = f"sittings/{sitting_id}/actual_{uuid.uuid4().hex[:8]}.{ext}"

    photo_url = await storage_service.upload_file(
        bucket_name=settings.BUCKET_PATIENT_SITTINGS,
        file_path=file_key,
        file_bytes=file_bytes,
        content_type=file.content_type or "image/jpeg"
    )

    # Save to sitting and update linked stage
    sitting_service.attach_actual_photo(sitting_id, current_doctor["id"], photo_url)

    return SittingPhotoResponse(
        success=True,
        image_url=photo_url,
        sitting_id=sitting_id
    )
