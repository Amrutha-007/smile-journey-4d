from fastapi import APIRouter, Depends, HTTPException, Response
from app.schemas.report import DetailedReportData, ReportResponse
from app.schemas.common import APIResponse
from app.api.deps import get_current_doctor
from app.database import db
from app.services.report_service import report_service
from app.services.patient_service import patient_service

router = APIRouter(tags=["Treatment Reports"])


@router.post("/api/patients/{patient_id}/report", response_model=APIResponse[DetailedReportData])
async def generate_patient_report(
    patient_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    """
    Generates and saves a consolidated treatment report combining
    patient baseline records, timeline stages, AI visualizations,
    actual sitting photographs, and dentist notes.
    """
    report_data = report_service.generate_report_data(patient_id, current_doctor["id"])
    treatments = db.get_patient_treatments(patient_id)
    treatment_id = treatments[0]["id"] if treatments else ""

    # Persist report record
    saved = db.create_report({
        "patient_id": patient_id,
        "treatment_id": treatment_id,
        "report_url": f"/api/patients/{patient_id}/report/pdf",
    })

    return APIResponse(
        success=True,
        data=DetailedReportData(**report_data),
        message="Consolidated treatment report generated successfully."
    )


@router.get("/api/patients/{patient_id}/report", response_model=APIResponse[DetailedReportData])
async def get_patient_report(
    patient_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    """Retrieves current consolidated report data for patient."""
    report_data = report_service.generate_report_data(patient_id, current_doctor["id"])
    return APIResponse(
        success=True,
        data=DetailedReportData(**report_data)
    )


@router.get("/api/patients/{patient_id}/report/pdf")
async def download_patient_pdf_report(
    patient_id: str,
    current_doctor: dict = Depends(get_current_doctor)
):
    """Generates and streams a high-resolution, branded clinical PDF report."""
    patient = patient_service.get_patient(patient_id, current_doctor["id"])
    pdf_bytes = report_service.generate_pdf_report(patient_id, current_doctor["id"])
    filename = f"SmileProgress_Report_{patient.get('patient_code', 'PT')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
