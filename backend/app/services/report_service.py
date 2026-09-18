import io
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.utils.dates import get_utc_now


from fastapi import HTTPException
from app.database import db
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


class ReportService:
    def __init__(self, database=db):
        self.db = database

    def generate_report_data(self, patient_id: str, doctor_id: str) -> Dict[str, Any]:
        patient = self.db.get_patient(patient_id, doctor_id=doctor_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found or unauthorized.")

        doctor = self.db.get_doctor_by_id(doctor_id)
        treatments = self.db.get_patient_treatments(patient_id)
        treatment = treatments[0] if treatments else {}

        stages = []
        simulations = []
        sittings = self.db.list_patient_sittings(patient_id)

        if treatment:
            stages = self.db.list_treatment_stages(treatment["id"])
            simulations = self.db.list_treatment_simulations(treatment["id"])

        # Construct structured components
        initial_assessment = {
            "problem": patient.get("problem", "N/A"),
            "problem_description": patient.get("problem_description", "N/A"),
            "original_photo_url": patient.get("original_photo_url"),
            "recorded_at": str(patient.get("created_at")),
        }

        timeline = [
            {
                "stage_id": s.get("id"),
                "stage_number": s.get("stage_number"),
                "stage_name": s.get("stage_name"),
                "month": s.get("month"),
                "scheduled_date": str(s.get("scheduled_date")),
                "progress_percentage": s.get("progress_percentage"),
                "status": s.get("status"),
            }
            for s in stages
        ]

        ai_visualizations = [
            {
                "stage_id": s.get("stage_id"),
                "stage_month": s.get("stage_month"),
                "stage_progress": s.get("stage_progress"),
                "ai_provider": s.get("ai_provider"),
                "status": s.get("status"),
                "image_url": s.get("output_image_url"),
                "simulation_type": "potential_treatment_visualization",
                "completed_at": str(s.get("completed_at")),
            }
            for s in simulations
        ]

        actual_progress = [
            {
                "sitting_number": sit.get("sitting_number"),
                "date": str(sit.get("date")),
                "progress_percentage": sit.get("progress_percentage"),
                "actual_photo_url": sit.get("actual_photo_url"),
                "dentist_notes": sit.get("dentist_notes"),
            }
            for sit in sittings
        ]

        dentist_notes = [
            {
                "source": f"Sitting #{sit.get('sitting_number')} ({sit.get('date')})",
                "note": sit.get("dentist_notes"),
            }
            for sit in sittings
            if sit.get("dentist_notes")
        ]
        for s in stages:
            if s.get("dentist_notes") and not any(n["note"] == s.get("dentist_notes") for n in dentist_notes):
                dentist_notes.append({
                    "source": f"Stage {s.get('stage_name')}",
                    "note": s.get("dentist_notes"),
                })

        return {
            "doctor": doctor or {},
            "patient": patient,
            "treatment": treatment,
            "initial_assessment": initial_assessment,
            "timeline": timeline,
            "ai_visualizations": ai_visualizations,
            "actual_progress": actual_progress,
            "sitting_history": sittings,
            "dentist_notes": dentist_notes,
            "generated_at": get_utc_now().isoformat(),
        }

    def generate_pdf_report(self, patient_id: str, doctor_id: str) -> bytes:
        data = self.generate_report_data(patient_id, doctor_id)
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#0284c7"),
            spaceAfter=6,
        )
        subtitle_style = ParagraphStyle(
            "DocSubtitle",
            parent=styles["Normal"],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#64748b"),
            spaceAfter=14,
        )
        section_heading = ParagraphStyle(
            "SectionHeading",
            parent=styles["Heading2"],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=12,
            spaceAfter=6,
        )
        normal_text = ParagraphStyle(
            "NormalText",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#334155"),
        )
        disclaimer_style = ParagraphStyle(
            "Disclaimer",
            parent=styles["Italic"],
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#64748b"),
            alignment=1,  # Centered
        )

        elements = []

        # Header Title
        elements.append(Paragraph("SmileProgress™ Clinical Treatment Report", title_style))
        clinic_info = data.get("doctor", {}).get("clinic_name", "Digital Aesthetic Smile Clinic")
        elements.append(Paragraph(f"Clinic: {clinic_info} • Generated: {get_utc_now().strftime('%d %b %Y %H:%M UTC')}", subtitle_style))
        elements.append(Spacer(1, 8))

        # Patient & Treatment Overview Table
        p = data["patient"]
        t = data["treatment"]
        doc_info = data.get("doctor", {})

        overview_data = [
            [
                Paragraph("<b>Patient Name:</b>", normal_text), Paragraph(str(p.get("name", "")), normal_text),
                Paragraph("<b>Patient Code:</b>", normal_text), Paragraph(str(p.get("patient_code", "")), normal_text),
            ],
            [
                Paragraph("<b>Age / Gender:</b>", normal_text), Paragraph(f"{p.get('age', 'N/A')} yrs / {p.get('gender', 'N/A')}", normal_text),
                Paragraph("<b>Attending Doctor:</b>", normal_text), Paragraph(str(doc_info.get("name", "Dr. Attending Dentist")), normal_text),
            ],
            [
                Paragraph("<b>Treatment Type:</b>", normal_text), Paragraph(str(t.get("treatment_type", "None")).replace("_", " ").title(), normal_text),
                Paragraph("<b>Prescribed Duration:</b>", normal_text), Paragraph(f"{t.get('duration_months', 'N/A')} Months", normal_text),
            ],
            [
                Paragraph("<b>Total Sittings:</b>", normal_text), Paragraph(str(t.get("number_of_sittings", "N/A")), normal_text),
                Paragraph("<b>Start Date:</b>", normal_text), Paragraph(str(t.get("start_date", "N/A")), normal_text),
            ],
            [
                Paragraph("<b>Primary Problem:</b>", normal_text), Paragraph(str(p.get("problem", "N/A")).title(), normal_text),
                Paragraph("<b>Clinical Notes:</b>", normal_text), Paragraph(str(p.get("problem_description", "None recorded")), normal_text),
            ],
        ]

        overview_table = Table(overview_data, colWidths=[110, 160, 110, 160])
        overview_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(overview_table)
        elements.append(Spacer(1, 14))

        # Timeline Stages Table
        elements.append(Paragraph("Prescribed Treatment Timeline & Progress Stages", section_heading))
        timeline = data.get("timeline", [])
        timeline_rows = [
            ["Stage", "Stage Name", "Target Month", "Scheduled Date", "Progress %", "Status"]
        ]
        for s in timeline:
            timeline_rows.append([
                str(s.get("stage_number")),
                str(s.get("stage_name")),
                f"Month {s.get('month')}",
                str(s.get("scheduled_date")),
                f"{s.get('progress_percentage')}%",
                str(s.get("status")).capitalize(),
            ])

        timeline_table = Table(timeline_rows, colWidths=[45, 130, 85, 100, 75, 105])
        timeline_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0284c7")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("ALIGN", (1, 0), (1, -1), "LEFT"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(timeline_table)
        elements.append(Spacer(1, 14))

        # Sitting History
        elements.append(Paragraph("Clinical Sitting History & Actual Visits", section_heading))
        sittings = data.get("actual_progress", [])
        if sittings:
            sitting_rows = [["Sitting #", "Date", "Progress", "Clinical Observations / Notes"]]
            for sit in sittings:
                sitting_rows.append([
                    f"Sitting {sit.get('sitting_number')}",
                    str(sit.get("date")),
                    f"{sit.get('progress_percentage')}%",
                    Paragraph(str(sit.get("dentist_notes") or "Progress recorded normally."), normal_text),
                ])
            sitting_table = Table(sitting_rows, colWidths=[65, 85, 65, 325])
            sitting_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            elements.append(sitting_table)
        else:
            elements.append(Paragraph("No physical sitting visits recorded yet. Upcoming visits scheduled according to timeline.", normal_text))

        elements.append(Spacer(1, 20))

        # Legal Medical Disclaimer
        disclaimer_text = (
            "<b>LEGAL & CLINICAL DISCLAIMER:</b> This report contains AI-generated potential smile treatment visualizations "
            "intended strictly for patient consultation, education, and aesthetic goal alignment. AI simulations represent potential "
            "visual projections based on standard clinical movements and do NOT constitute a guaranteed clinical result or binding orthodontic outcome. "
            "Individual biological responses, compliance, and tissue remodeling will vary."
        )
        elements.append(Paragraph(disclaimer_text, disclaimer_style))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()


report_service = ReportService()
