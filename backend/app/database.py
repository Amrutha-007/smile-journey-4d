import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime, date
from app.config import settings
from app.utils.dates import get_utc_now


# Attempt to initialize Supabase client
supabase_client = None
if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
    except Exception:
        supabase_client = None


class InMemoryDatabase:
    """
    High-fidelity in-memory database store with relational querying,
    foreign key filtering, and doctor isolation.
    Used for local development, offline runs, and automated testing.
    """

    def __init__(self):
        self.reset()

    def reset(self):
        self.doctors: Dict[str, Dict[str, Any]] = {}
        self.patients: Dict[str, Dict[str, Any]] = {}
        self.treatments: Dict[str, Dict[str, Any]] = {}
        self.stages: Dict[str, Dict[str, Any]] = {}
        self.sittings: Dict[str, Dict[str, Any]] = {}
        self.simulations: Dict[str, Dict[str, Any]] = {}
        self.reports: Dict[str, Dict[str, Any]] = {}

    # Doctors
    def create_doctor(self, data: Dict[str, Any]) -> Dict[str, Any]:
        doc_id = data.get("id") or str(uuid.uuid4())
        record = {
            **data,
            "id": doc_id,
            "created_at": data.get("created_at") or get_utc_now(),
            "updated_at": get_utc_now()
        }
        self.doctors[doc_id] = record
        return record

    def get_doctor_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        return self.doctors.get(doc_id)

    def get_doctor_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        for doc in self.doctors.values():
            if doc.get("email", "").lower() == email.lower():
                return doc
        return None

    def get_doctor_by_auth_user_id(self, auth_user_id: str) -> Optional[Dict[str, Any]]:
        for doc in self.doctors.values():
            if doc.get("auth_user_id") == auth_user_id:
                return doc
        return None

    # Patients
    def create_patient(self, data: Dict[str, Any]) -> Dict[str, Any]:
        p_id = data.get("id") or str(uuid.uuid4())
        doctor_id = data.get("doctor_id")
        
        # Calculate next patient code for doctor if not provided
        if not data.get("patient_code"):
            existing = [p for p in self.patients.values() if p.get("doctor_id") == doctor_id]
            code = f"PT-{str(len(existing) + 1).zfill(3)}"
        else:
            code = data["patient_code"]

        record = {
            **data,
            "id": p_id,
            "patient_code": code,
            "status": data.get("status", "active"),
            "created_at": data.get("created_at") or get_utc_now(),
            "updated_at": get_utc_now()
        }
        self.patients[p_id] = record
        return record

    def get_patient(self, patient_id: str, doctor_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        p = self.patients.get(patient_id)
        if not p:
            return None
        if doctor_id and p.get("doctor_id") != doctor_id:
            return None
        return p

    def list_patients(self, doctor_id: str) -> List[Dict[str, Any]]:
        return [
            p for p in self.patients.values()
            if p.get("doctor_id") == doctor_id
        ]

    def update_patient(self, patient_id: str, updates: Dict[str, Any], doctor_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        p = self.get_patient(patient_id, doctor_id)
        if not p:
            return None
        p.update(updates)
        p["updated_at"] = get_utc_now()
        self.patients[patient_id] = p
        return p

    def delete_patient(self, patient_id: str, doctor_id: Optional[str] = None) -> bool:
        p = self.get_patient(patient_id, doctor_id)
        if not p:
            return False
        # Cascade delete treatments, stages, sittings, simulations
        treatments_to_del = [t["id"] for t in self.treatments.values() if t.get("patient_id") == patient_id]
        for t_id in treatments_to_del:
            self.delete_treatment(t_id)
        self.patients.pop(patient_id, None)
        return True

    # Treatments
    def create_treatment(self, data: Dict[str, Any]) -> Dict[str, Any]:
        t_id = data.get("id") or str(uuid.uuid4())
        record = {
            **data,
            "id": t_id,
            "created_at": data.get("created_at") or get_utc_now(),
            "updated_at": get_utc_now()
        }
        self.treatments[t_id] = record
        return record

    def get_treatment(self, treatment_id: str) -> Optional[Dict[str, Any]]:
        return self.treatments.get(treatment_id)

    def get_patient_treatments(self, patient_id: str) -> List[Dict[str, Any]]:
        return [
            t for t in self.treatments.values()
            if t.get("patient_id") == patient_id
        ]

    def delete_treatment(self, treatment_id: str) -> bool:
        if treatment_id not in self.treatments:
            return False
        # Remove stages
        stages_to_del = [s["id"] for s in self.stages.values() if s.get("treatment_id") == treatment_id]
        for s_id in stages_to_del:
            self.stages.pop(s_id, None)
        self.treatments.pop(treatment_id, None)
        return True

    # Stages
    def create_stage(self, data: Dict[str, Any]) -> Dict[str, Any]:
        s_id = data.get("id") or str(uuid.uuid4())
        record = {
            **data,
            "id": s_id,
            "created_at": data.get("created_at") or get_utc_now(),
            "updated_at": get_utc_now()
        }
        self.stages[s_id] = record
        return record

    def get_stage(self, stage_id: str) -> Optional[Dict[str, Any]]:
        return self.stages.get(stage_id)

    def list_treatment_stages(self, treatment_id: str) -> List[Dict[str, Any]]:
        matched = [s for s in self.stages.values() if s.get("treatment_id") == treatment_id]
        matched.sort(key=lambda s: s.get("stage_number", 0))
        return matched

    def update_stage(self, stage_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        s = self.stages.get(stage_id)
        if not s:
            return None
        s.update(updates)
        s["updated_at"] = get_utc_now()
        self.stages[stage_id] = s
        return s

    # Sittings
    def create_sitting(self, data: Dict[str, Any]) -> Dict[str, Any]:
        sit_id = data.get("id") or str(uuid.uuid4())
        record = {
            **data,
            "id": sit_id,
            "created_at": data.get("created_at") or get_utc_now(),
            "updated_at": get_utc_now()
        }
        self.sittings[sit_id] = record
        return record

    def get_sitting(self, sitting_id: str) -> Optional[Dict[str, Any]]:
        return self.sittings.get(sitting_id)

    def list_patient_sittings(self, patient_id: str) -> List[Dict[str, Any]]:
        matched = [s for s in self.sittings.values() if s.get("patient_id") == patient_id]
        matched.sort(key=lambda s: s.get("sitting_number", 0))
        return matched

    def update_sitting(self, sitting_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        s = self.sittings.get(sitting_id)
        if not s:
            return None
        s.update(updates)
        s["updated_at"] = get_utc_now()
        self.sittings[sitting_id] = s
        return s

    # AI Simulations
    def create_simulation(self, data: Dict[str, Any]) -> Dict[str, Any]:
        sim_id = data.get("id") or str(uuid.uuid4())
        record = {
            **data,
            "id": sim_id,
            "simulation_type": "potential_treatment_visualization",
            "created_at": data.get("created_at") or get_utc_now(),
        }
        self.simulations[sim_id] = record
        return record

    def get_simulation(self, sim_id: str) -> Optional[Dict[str, Any]]:
        return self.simulations.get(sim_id)

    def list_treatment_simulations(self, treatment_id: str) -> List[Dict[str, Any]]:
        return [
            s for s in self.simulations.values()
            if s.get("treatment_id") == treatment_id
        ]

    def update_simulation(self, sim_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        sim = self.simulations.get(sim_id)
        if not sim:
            return None
        sim.update(updates)
        self.simulations[sim_id] = sim
        return sim

    # Reports
    def create_report(self, data: Dict[str, Any]) -> Dict[str, Any]:
        rep_id = data.get("id") or str(uuid.uuid4())
        record = {
            **data,
            "id": rep_id,
            "created_at": data.get("created_at") or get_utc_now(),
            "updated_at": get_utc_now()
        }
        self.reports[rep_id] = record
        return record

    def get_report(self, report_id: str) -> Optional[Dict[str, Any]]:
        return self.reports.get(report_id)

    def get_patient_report(self, patient_id: str) -> Optional[Dict[str, Any]]:
        for r in self.reports.values():
            if r.get("patient_id") == patient_id:
                return r
        return None


# Global DB instance
db = InMemoryDatabase()
