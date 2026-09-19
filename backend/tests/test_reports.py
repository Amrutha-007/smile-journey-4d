def test_generate_and_retrieve_report(client, auth_headers):
    # 1. Create Patient with full details
    p = client.post("/api/patients", json={
        "name": "Report Test Patient",
        "age": 25,
        "gender": "Female",
        "problem": "crowding",
        "problem_description": "Maxillary anterior crowding"
    }, headers=auth_headers).json()["data"]
    patient_id = p["id"]

    # 2. Create Treatment
    client.post(f"/api/patients/{patient_id}/treatment", json={
        "treatment_type": "clear_aligners",
        "duration_months": 12,
        "number_of_sittings": 6,
        "start_date": "2026-09-18"
    }, headers=auth_headers)

    # 3. Generate Report (POST)
    gen_res = client.post(f"/api/patients/{patient_id}/report", headers=auth_headers)
    assert gen_res.status_code == 200
    report_data = gen_res.json()["data"]

    # Verify structured fields
    assert "patient" in report_data
    assert "treatment" in report_data
    assert "initial_assessment" in report_data
    assert "timeline" in report_data
    assert len(report_data["timeline"]) == 7  # Initial + 6
    assert "ai_visualizations" in report_data
    assert "actual_progress" in report_data
    assert "sitting_history" in report_data
    assert "dentist_notes" in report_data
    assert "disclaimer" in report_data

    # 4. Retrieve Report (GET)
    get_res = client.get(f"/api/patients/{patient_id}/report", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["patient"]["name"] == "Report Test Patient"

    # 5. Download Report PDF
    pdf_res = client.get(f"/api/patients/{patient_id}/report/pdf", headers=auth_headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF")
