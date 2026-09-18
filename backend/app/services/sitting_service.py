from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from app.database import db
from app.schemas.sitting import SittingCreate, SittingUpdate


class SittingService:
    def __init__(self, database=db):
        self.db = database

    def create_sitting(self, patient_id: str, doctor_id: str, data: SittingCreate) -> Dict[str, Any]:
        # Validate patient ownership
        patient = self.db.get_patient(patient_id, doctor_id=doctor_id)
        if not patient:
            raise HTTPException(
                status_code=404,
                detail={"code": "PATIENT_NOT_FOUND", "message": "Patient not found or unauthorized."}
            )

        treatments = self.db.get_patient_treatments(patient_id)
        if not treatments:
            raise HTTPException(
                status_code=400,
                detail={"code": "NO_TREATMENT", "message": "Patient has no active treatment plan."}
            )
        treatment = treatments[0]

        # Verify stage if specified
        if data.stage_id:
            stage = self.db.get_stage(data.stage_id)
            if not stage or stage.get("treatment_id") != treatment["id"]:
                raise HTTPException(
                    status_code=400,
                    detail={"code": "INVALID_STAGE", "message": "Specified stage does not belong to this treatment."}
                )

        sitting_dict = {
            "patient_id": patient_id,
            "treatment_id": treatment["id"],
            "stage_id": data.stage_id,
            "sitting_number": data.sitting_number,
            "date": data.date,
            "progress_percentage": data.progress_percentage,
            "dentist_notes": data.dentist_notes,
            "actual_photo_url": None,
        }
        sitting = self.db.create_sitting(sitting_dict)

        # Update linked stage status and notes if present
        if data.stage_id:
            stage_updates = {
                "status": "completed",
                "progress_percentage": data.progress_percentage,
            }
            if data.dentist_notes:
                stage_updates["dentist_notes"] = data.dentist_notes
            self.db.update_stage(data.stage_id, stage_updates)

        # Update patient status if treatment completed
        if data.progress_percentage >= 100:
            self.db.update_patient(patient_id, {"status": "completed"})

        return sitting

    def list_sittings(self, patient_id: str, doctor_id: str) -> List[Dict[str, Any]]:
        # Validate ownership
        patient = self.db.get_patient(patient_id, doctor_id=doctor_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found or unauthorized.")
        return self.db.list_patient_sittings(patient_id)

    def get_sitting(self, sitting_id: str, doctor_id: str) -> Dict[str, Any]:
        sitting = self.db.get_sitting(sitting_id)
        if not sitting:
            raise HTTPException(status_code=404, detail="Sitting not found.")
        # Check doctor ownership through patient
        patient = self.db.get_patient(sitting["patient_id"], doctor_id=doctor_id)
        if not patient:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this patient's records.")
        return sitting

    def update_sitting(self, sitting_id: str, doctor_id: str, data: SittingUpdate) -> Dict[str, Any]:
        sitting = self.get_sitting(sitting_id, doctor_id)
        updates = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}

        updated = self.db.update_sitting(sitting_id, updates)
        if updates.get("actual_photo_url") and sitting.get("stage_id"):
            self.db.update_stage(sitting["stage_id"], {"actual_photo_url": updates["actual_photo_url"]})
        return updated

    def attach_actual_photo(self, sitting_id: str, doctor_id: str, photo_url: str) -> Dict[str, Any]:
        sitting = self.get_sitting(sitting_id, doctor_id)
        updated_sitting = self.db.update_sitting(sitting_id, {"actual_photo_url": photo_url})

        # Sync actual photo to the stage if associated
        if sitting.get("stage_id"):
            self.db.update_stage(sitting["stage_id"], {
                "actual_photo_url": photo_url,
                "status": "completed"
            })

        return updated_sitting


sitting_service = SittingService()
