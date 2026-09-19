from typing import List, Optional, Dict, Any, Union
from datetime import date
from app.utils.dates import parse_date, add_months_to_date, format_iso_date


def generate_treatment_timeline(
    start_date: Union[str, date],
    duration_months: int,
    number_of_sittings: int,
    custom_dates: Optional[List[Union[str, date]]] = None
) -> List[Dict[str, Any]]:
    """
    Automatically calculates the treatment timeline according to doctor prescriptions.
    Supports automatic spacing or custom sitting dates prescribed by the dentist.
    
    Generates:
    - Stage 0: Initial (Month 0, 0% progress)
    - Stages 1..N: Intermediate and Final stages (up to 100% progress)
    """
    parsed_start_date = parse_date(start_date)
    duration_months = max(1, duration_months)
    count = max(1, number_of_sittings)

    stages: List[Dict[str, Any]] = []

    # 1. Initial Stage (Stage 0)
    stages.append({
        "stage_number": 0,
        "stage_name": "Initial",
        "month": 0,
        "scheduled_date": format_iso_date(parsed_start_date),
        "progress_percentage": 0,
        "status": "completed",
        "dentist_notes": "Baseline diagnostic smile records and initial assessment.",
    })

    # 2. Subsequent Stages (Stages 1..count)
    month_step = duration_months / count

    for i in range(1, count + 1):
        is_final = (i == count)
        raw_month = round(i * month_step)
        month = min(duration_months, raw_month)
        
        # Calculate progress percentage (0-100)
        progress = min(100, round((i / count) * 100))

        # Determine scheduled date
        if custom_dates and len(custom_dates) >= i and custom_dates[i - 1]:
            scheduled = parse_date(custom_dates[i - 1])
        else:
            # Add calculated months from start date
            scheduled = add_months_to_date(parsed_start_date, round(i * duration_months / count))

        if is_final:
            stage_name = f"Final — Month {duration_months}"
        else:
            stage_name = f"Month {month}"

        stages.append({
            "stage_number": i,
            "stage_name": stage_name,
            "month": month,
            "scheduled_date": format_iso_date(scheduled),
            "progress_percentage": progress,
            "status": "upcoming",
            "dentist_notes": f"Treatment sitting {i} of {count}. Target progress {progress}%.",
        })

    return stages
