from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from app.database import db
from app.schemas.patient import PatientCreate, PatientUpdate


class PatientService:
    def __init__(self, database=db):
        self.db = database

    def create_patient(self, doctor_id: str, data: PatientCreate) -> Dict[str, Any]:
        patient_dict = {
            "doctor_id": doctor_id,
            "name": data.name,
            "age": data.age,
            "gender": data.gender,
            "phone": data.phone,
            "email": str(data.email) if data.email else None,
            "problem": data.problem,
            "problem_description": data.problem_description,
            "status": "active",
        }
        return self.db.create_patient(patient_dict)

    def list_patients(self, doctor_id: str) -> List[Dict[str, Any]]:
        return self.db.list_patients(doctor_id)

    def get_patient(self, patient_id: str, doctor_id: str) -> Dict[str, Any]:
        patient = self.db.get_patient(patient_id, doctor_id=doctor_id)
        if not patient:
            raise HTTPException(
                status_code=404,
                detail={"code": "PATIENT_NOT_FOUND", "message": "Patient not found or unauthorized."}
            )
        return patient

    def update_patient(self, patient_id: str, doctor_id: str, data: PatientUpdate) -> Dict[str, Any]:
        # Verify ownership first
        self.get_patient(patient_id, doctor_id)
        
        updates = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
        if "email" in updates and updates["email"]:
            updates["email"] = str(updates["email"])

        updated = self.db.update_patient(patient_id, updates, doctor_id=doctor_id)
        if not updated:
            raise HTTPException(
                status_code=404,
                detail={"code": "PATIENT_NOT_FOUND", "message": "Patient not found."}
            )
        return updated

    def delete_patient(self, patient_id: str, doctor_id: str) -> bool:
        self.get_patient(patient_id, doctor_id)
        return self.db.delete_patient(patient_id, doctor_id=doctor_id)

    def update_patient_photo(self, patient_id: str, doctor_id: str, photo_url: str) -> Dict[str, Any]:
        self.get_patient(patient_id, doctor_id)
        updated = self.db.update_patient(patient_id, {"original_photo_url": photo_url}, doctor_id=doctor_id)
        return updated

    def get_patient_progress(self, patient_id: str, doctor_id: str) -> Dict[str, Any]:
        patient = self.get_patient(patient_id, doctor_id)
        treatments = self.db.get_patient_treatments(patient_id)
        active_treatment = treatments[0] if treatments else None

        stages_data = []
        overall_progress = 0

        if active_treatment:
            stages = self.db.list_treatment_stages(active_treatment["id"])
            sittings = self.db.list_patient_sittings(patient_id)

            # Max progress achieved from completed stages or sittings
            max_sitting_progress = max([s.get("progress_percentage", 0) for s in sittings], default=0)
            overall_progress = max_sitting_progress

            for s in stages:
                stages_data.append({
                    "id": s.get("id"),
                    "stage_name": s.get("stage_name"),
                    "month": s.get("month", 0),
                    "ai_image_url": s.get("ai_image_url"),
                    "actual_photo_url": s.get("actual_photo_url"),
                    "progress": s.get("progress_percentage", 0),
                    "status": s.get("status", "upcoming"),
                    "scheduled_date": str(s.get("scheduled_date")),
                    "dentist_notes": s.get("dentist_notes"),
                })

        return {
            "patient": patient,
            "treatment": active_treatment,
            "overall_progress": overall_progress,
            "stages": stages_data,
        }

    def get_patient_overview(self, patient_id: str, doctor_id: str) -> Dict[str, Any]:
        patient = self.get_patient(patient_id, doctor_id)
        treatments = self.db.get_patient_treatments(patient_id)
        treatment = treatments[0] if treatments else None

        stages = []
        simulations = []
        sittings = self.db.list_patient_sittings(patient_id)
        actual_photos = []

        if treatment:
            stages = self.db.list_treatment_stages(treatment["id"])
            simulations = self.db.list_treatment_simulations(treatment["id"])

        # Collect all actual photos from patient and sittings
        if patient.get("original_photo_url"):
            actual_photos.append({
                "type": "original_photo",
                "label": "Initial Baseline Photo",
                "url": patient["original_photo_url"],
                "date": str(patient.get("created_at")),
            })

        for sit in sittings:
            if sit.get("actual_photo_url"):
                actual_photos.append({
                    "type": "actual_sitting_photo",
                    "label": f"Sitting #{sit.get('sitting_number')}",
                    "sitting_id": sit.get("id"),
                    "url": sit["actual_photo_url"],
                    "date": str(sit.get("date")),
                    "progress": sit.get("progress_percentage", 0),
                })

        # Calculate current progress
        current_progress = max([s.get("progress_percentage", 0) for s in sittings], default=0)

        # Next upcoming sitting
        upcoming_stages = [s for s in stages if s.get("status") == "upcoming"]
        next_sitting = upcoming_stages[0] if upcoming_stages else None

        return {
            "patient": patient,
            "treatment": treatment,
            "current_progress": current_progress,
            "next_sitting": next_sitting,
            "stages": stages,
            "sittings": sittings,
            "ai_simulations": simulations,
            "actual_photos": actual_photos,
        }


patient_service = PatientService()
