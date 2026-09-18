"""
SmileProgress Database Seed Script
Populates the database with realistic clinical demo data for hackathons and presentations:
- Doctor: Dr. Sarah Thomas
- Patients: Ananya Menon (Clear Aligners), Rahul Kumar (Veneers), Meera S (Braces)
- Treatment plans, calculated timeline stages, mock AI simulation records, sittings, and reports.
"""

import sys
import os
import asyncio
from datetime import date, datetime

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from app.database import db
from app.utils.security import hash_password, create_access_token
from app.services.timeline_service import generate_treatment_timeline
from app.services.ai_service import get_ai_provider
from app.utils.dates import parse_date, get_utc_now




async def seed():
    print("🌱 Seeding SmileProgress Database...")

    # 1. Seed Doctor
    doctor = db.create_doctor({
        "auth_user_id": "doc-sarah-thomas-001",
        "name": "Dr. Sarah Thomas, BDS, MDS",
        "email": "dr.sarah@smileprogress.dental",
        "phone": "+1 (555) 832-4419",
        "clinic_name": "Thomas Aesthetic & Digital Smile Center",
        "specialization": "Orthodontics & Aesthetic Dentistry",
        "password_hash": hash_password("DoctorSecret2026!"),
    })
    doctor_id = doctor["id"]
    print(f"  ✓ Doctor created: {doctor['name']} ({doctor['email']})")

    # Generate test auth token for convenience
    token = create_access_token({
        "doctor_id": doctor_id,
        "sub": doctor["auth_user_id"],
        "email": doctor["email"],
        "name": doctor["name"],
    })
    print(f"  🔑 Demo Auth Token: {token[:25]}...")

    ai_provider = get_ai_provider("mock")

    # --------------------------------------------------------------------------
    # 2. Patient 1: Ananya Menon (Clear Aligners — 12 Months, 6 Sittings)
    # --------------------------------------------------------------------------
    p1 = db.create_patient({
        "doctor_id": doctor_id,
        "patient_code": "PT-001",
        "name": "Ananya Menon",
        "age": 26,
        "gender": "Female",
        "phone": "+1 (555) 349-8821",
        "email": "ananya.menon@example.com",
        "problem": "crowding",
        "problem_description": "Moderate anterior maxillary crowding with mesial rotation of #8. Deep bite tendency.",
        "status": "active",
        "original_photo_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
    })
    print(f"  ✓ Patient 1 created: {p1['name']} ({p1['patient_code']})")

    t1 = db.create_treatment({
        "patient_id": p1["id"],
        "treatment_type": "clear_aligners",
        "duration_months": 12,
        "number_of_sittings": 6,
        "start_date": parse_date("2026-09-18"),
        "expected_end_date": parse_date("2027-09-18"),
        "description": "Comprehensive clear aligner treatment with attachments on #4, #6, #11, #13 and interproximal reduction (IPR).",
    })

    t1_stages = generate_treatment_timeline(
        start_date=t1["start_date"],
        duration_months=t1["duration_months"],
        number_of_sittings=t1["number_of_sittings"]
    )

    created_stages_1 = []
    for s_data in t1_stages:
        sim_img, _ = await ai_provider.generate_smile_simulation(
            image_url=p1["original_photo_url"],
            treatment_type=t1["treatment_type"],
            stage_month=s_data["month"],
            stage_progress=s_data["progress_percentage"]
        )

        stage_status = "completed" if s_data["progress_percentage"] <= 33 else "upcoming"
        st = db.create_stage({
            "treatment_id": t1["id"],
            "stage_number": s_data["stage_number"],
            "stage_name": s_data["stage_name"],
            "month": s_data["month"],
            "scheduled_date": parse_date(s_data["scheduled_date"]),
            "progress_percentage": s_data["progress_percentage"],
            "status": stage_status,
            "ai_image_url": sim_img,
            "actual_photo_url": sim_img if stage_status == "completed" else None,
            "dentist_notes": s_data["dentist_notes"],
        })
        created_stages_1.append(st)

        # Record AI simulation
        db.create_simulation({
            "patient_id": p1["id"],
            "treatment_id": t1["id"],
            "stage_id": st["id"],
            "input_image_url": p1["original_photo_url"],
            "output_image_url": sim_img,
            "treatment_type": t1["treatment_type"],
            "stage_month": s_data["month"],
            "stage_progress": s_data["progress_percentage"],
            "ai_provider": "mock",
            "status": "completed",
            "completed_at": get_utc_now(),
        })

    # Log 2 sittings for Ananya
    db.create_sitting({
        "patient_id": p1["id"],
        "treatment_id": t1["id"],
        "stage_id": created_stages_1[1]["id"],
        "sitting_number": 1,
        "date": parse_date("2026-11-18"),
        "progress_percentage": 17,
        "dentist_notes": "Aligner sets 1-4 verified. Resin attachments bonded. Good patient compliance reported.",
        "actual_photo_url": created_stages_1[1]["ai_image_url"],
    })
    db.create_sitting({
        "patient_id": p1["id"],
        "treatment_id": t1["id"],
        "stage_id": created_stages_1[2]["id"],
        "sitting_number": 2,
        "date": parse_date("2027-01-18"),
        "progress_percentage": 33,
        "dentist_notes": "IPR 0.2mm performed between #8 and #9. Anterior de-crowding progressing smoothly.",
        "actual_photo_url": created_stages_1[2]["ai_image_url"],
    })

    # --------------------------------------------------------------------------
    # 3. Patient 2: Rahul Kumar (Veneers — 3 Months, 3 Sittings, Completed)
    # --------------------------------------------------------------------------
    p2 = db.create_patient({
        "doctor_id": doctor_id,
        "patient_code": "PT-002",
        "name": "Rahul Kumar",
        "age": 34,
        "gender": "Male",
        "phone": "+1 (555) 782-9014",
        "email": "rahul.kumar@example.com",
        "problem": "discoloration",
        "problem_description": "Tetracycline staining on #6 through #11 with incisal edge micro-fractures.",
        "status": "completed",
        "original_photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
    })
    print(f"  ✓ Patient 2 created: {p2['name']} ({p2['patient_code']})")

    t2 = db.create_treatment({
        "patient_id": p2["id"],
        "treatment_type": "veneers",
        "duration_months": 3,
        "number_of_sittings": 3,
        "start_date": parse_date("2026-06-10"),
        "expected_end_date": parse_date("2026-09-10"),
        "description": "Feldspathic porcelain veneers for anterior maxillary rehabilitation (#6 to #11), shade Vita BL2.",
    })

    t2_stages = generate_treatment_timeline(
        start_date=t2["start_date"],
        duration_months=t2["duration_months"],
        number_of_sittings=t2["number_of_sittings"]
    )

    created_stages_2 = []
    for s_data in t2_stages:
        sim_img, _ = await ai_provider.generate_smile_simulation(
            image_url=p2["original_photo_url"],
            treatment_type=t2["treatment_type"],
            stage_month=s_data["month"],
            stage_progress=s_data["progress_percentage"]
        )

        st = db.create_stage({
            "treatment_id": t2["id"],
            "stage_number": s_data["stage_number"],
            "stage_name": s_data["stage_name"],
            "month": s_data["month"],
            "scheduled_date": parse_date(s_data["scheduled_date"]),
            "progress_percentage": s_data["progress_percentage"],
            "status": "completed",
            "ai_image_url": sim_img,
            "actual_photo_url": sim_img,
            "dentist_notes": f"Veneer progress at {s_data['progress_percentage']}%. Margin and aesthetic evaluation completed.",
        })
        created_stages_2.append(st)

        db.create_simulation({
            "patient_id": p2["id"],
            "treatment_id": t2["id"],
            "stage_id": st["id"],
            "input_image_url": p2["original_photo_url"],
            "output_image_url": sim_img,
            "treatment_type": t2["treatment_type"],
            "stage_month": s_data["month"],
            "stage_progress": s_data["progress_percentage"],
            "ai_provider": "mock",
            "status": "completed",
            "completed_at": get_utc_now(),
        })

    # Log all 3 sittings for Rahul
    for idx, st in enumerate(created_stages_2[1:], 1):
        db.create_sitting({
            "patient_id": p2["id"],
            "treatment_id": t2["id"],
            "stage_id": st["id"],
            "sitting_number": idx,
            "date": st["scheduled_date"],
            "progress_percentage": st["progress_percentage"],
            "dentist_notes": f"Sitting {idx} completed successfully.",
            "actual_photo_url": st["ai_image_url"],
        })

    # --------------------------------------------------------------------------
    # 4. Patient 3: Meera S (Braces — 18 Months, 9 Sittings, Active)
    # --------------------------------------------------------------------------
    p3 = db.create_patient({
        "doctor_id": doctor_id,
        "patient_code": "PT-003",
        "name": "Meera S",
        "age": 19,
        "gender": "Female",
        "phone": "+1 (555) 902-1244",
        "email": "meera.s@example.com",
        "problem": "misalignment",
        "problem_description": "Class II Division 1 malocclusion with high-placed ectopic canine (#6) and 5mm overjet.",
        "status": "active",
        "original_photo_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    })
    print(f"  ✓ Patient 3 created: {p3['name']} ({p3['patient_code']})")

    t3 = db.create_treatment({
        "patient_id": p3["id"],
        "treatment_type": "braces",
        "duration_months": 18,
        "number_of_sittings": 9,
        "start_date": parse_date("2026-03-01"),
        "expected_end_date": parse_date("2027-09-01"),
        "description": "Comprehensive fixed ceramic bracket orthodontic treatment with canine retraction.",
    })

    t3_stages = generate_treatment_timeline(
        start_date=t3["start_date"],
        duration_months=t3["duration_months"],
        number_of_sittings=t3["number_of_sittings"]
    )

    created_stages_3 = []
    for s_data in t3_stages:
        sim_img, _ = await ai_provider.generate_smile_simulation(
            image_url=p3["original_photo_url"],
            treatment_type=t3["treatment_type"],
            stage_month=s_data["month"],
            stage_progress=s_data["progress_percentage"]
        )

        st_status = "completed" if s_data["progress_percentage"] <= 33 else "upcoming"
        st = db.create_stage({
            "treatment_id": t3["id"],
            "stage_number": s_data["stage_number"],
            "stage_name": s_data["stage_name"],
            "month": s_data["month"],
            "scheduled_date": parse_date(s_data["scheduled_date"]),
            "progress_percentage": s_data["progress_percentage"],
            "status": st_status,
            "ai_image_url": sim_img,
            "actual_photo_url": sim_img if st_status == "completed" else None,
            "dentist_notes": f"Stage {s_data['stage_name']}. Progress at {s_data['progress_percentage']}%.",
        })
        created_stages_3.append(st)

        db.create_simulation({
            "patient_id": p3["id"],
            "treatment_id": t3["id"],
            "stage_id": st["id"],
            "input_image_url": p3["original_photo_url"],
            "output_image_url": sim_img,
            "treatment_type": t3["treatment_type"],
            "stage_month": s_data["month"],
            "stage_progress": s_data["progress_percentage"],
            "ai_provider": "mock",
            "status": "completed",
            "completed_at": get_utc_now(),
        })

    # Log 3 sittings for Meera
    for idx, st in enumerate(created_stages_3[1:4], 1):
        db.create_sitting({
            "patient_id": p3["id"],
            "treatment_id": t3["id"],
            "stage_id": st["id"],
            "sitting_number": idx,
            "date": st["scheduled_date"],
            "progress_percentage": st["progress_percentage"],
            "dentist_notes": f"Orthodontic archwire change #{idx}. Tracking well.",
            "actual_photo_url": st["ai_image_url"],
        })

    print("✨ Database seed completed successfully!")
    print(f"   Total Doctors: {len(db.doctors)}")
    print(f"   Total Patients: {len(db.patients)}")
    print(f"   Total Treatments: {len(db.treatments)}")
    print(f"   Total Stages: {len(db.stages)}")
    print(f"   Total Sittings: {len(db.sittings)}")
    print(f"   Total AI Simulations: {len(db.simulations)}")


if __name__ == "__main__":
    asyncio.run(seed())
