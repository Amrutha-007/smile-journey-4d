from datetime import date
from app.services.timeline_service import generate_treatment_timeline


def test_timeline_12_months_6_sittings():
    """Verify 12 months with 6 sittings generates Initial + 6 stages with expected progression."""
    start_date = "2026-09-18"
    duration = 12
    sittings = 6

    stages = generate_treatment_timeline(start_date, duration, sittings)

    # Initial stage + 6 sittings = 7 total stages
    assert len(stages) == 7

    # Stage 0: Initial
    assert stages[0]["stage_number"] == 0
    assert stages[0]["stage_name"] == "Initial"
    assert stages[0]["month"] == 0
    assert stages[0]["progress_percentage"] == 0
    assert stages[0]["scheduled_date"] == "2026-09-18"

    # Stage 1: Month 2 (approx 17%)
    assert stages[1]["stage_number"] == 1
    assert stages[1]["stage_name"] == "Month 2"
    assert stages[1]["month"] == 2
    assert stages[1]["progress_percentage"] == 17

    # Stage 2: Month 4 (approx 33%)
    assert stages[2]["stage_number"] == 2
    assert stages[2]["stage_name"] == "Month 4"
    assert stages[2]["month"] == 4
    assert stages[2]["progress_percentage"] == 33

    # Stage 3: Month 6 (approx 50%)
    assert stages[3]["stage_number"] == 3
    assert stages[3]["stage_name"] == "Month 6"
    assert stages[3]["month"] == 6
    assert stages[3]["progress_percentage"] == 50

    # Stage 4: Month 8 (approx 67%)
    assert stages[4]["stage_number"] == 4
    assert stages[4]["stage_name"] == "Month 8"
    assert stages[4]["month"] == 8
    assert stages[4]["progress_percentage"] == 67

    # Stage 5: Month 10 (approx 83%)
    assert stages[5]["stage_number"] == 5
    assert stages[5]["stage_name"] == "Month 10"
    assert stages[5]["month"] == 10
    assert stages[5]["progress_percentage"] == 83

    # Stage 6: Final — Month 12 (100%)
    assert stages[6]["stage_number"] == 6
    assert "Final" in stages[6]["stage_name"]
    assert stages[6]["month"] == 12
    assert stages[6]["progress_percentage"] == 100


def test_timeline_custom_dates():
    """Verify that custom dentist-prescribed dates override automatic date spacing."""
    start_date = "2026-09-18"
    duration = 6
    sittings = 3
    custom_dates = ["2026-10-25", "2026-12-15", "2027-03-20"]

    stages = generate_treatment_timeline(start_date, duration, sittings, custom_dates=custom_dates)

    assert len(stages) == 4  # Initial + 3 sittings
    assert stages[1]["scheduled_date"] == "2026-10-25"
    assert stages[2]["scheduled_date"] == "2026-12-15"
    assert stages[3]["scheduled_date"] == "2027-03-20"


def test_timeline_single_sitting():
    """Edge case: 1 sitting treatment."""
    stages = generate_treatment_timeline("2026-01-01", 3, 1)
    assert len(stages) == 2
    assert stages[0]["stage_name"] == "Initial"
    assert "Final" in stages[1]["stage_name"]
    assert stages[1]["progress_percentage"] == 100
