def test_create_treatment_and_auto_stages(client, auth_headers):
    # 1. Create Patient
    p = client.post("/api/patients", json={"name": "Timeline Test Patient"}, headers=auth_headers).json()["data"]
    patient_id = p["id"]

    # 2. Create Treatment
    treatment_payload = {
        "treatment_type": "clear_aligners",
        "duration_months": 12,
        "number_of_sittings": 6,
        "start_date": "2026-09-18",
        "description": "Clear aligner treatment"
    }
    response = client.post(f"/api/patients/{patient_id}/treatment", json=treatment_payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()["data"]

    # Check treatment response
    assert data["treatment"]["type"] == "clear_aligners"
    assert data["treatment"]["duration_months"] == 12
    assert data["treatment"]["number_of_sittings"] == 6

    # Check automatically calculated stages
    stages = data["stages"]
    assert len(stages) == 7
    assert stages[0]["name"] == "Initial"
    assert stages[0]["month"] == 0
    assert stages[0]["progress"] == 0

    assert stages[1]["month"] == 2
    assert stages[1]["progress"] == 17

    assert stages[-1]["progress"] == 100
    assert "Final" in stages[-1]["name"]


def test_invalid_treatment_type(client, auth_headers):
    p = client.post("/api/patients", json={"name": "Invalid Test Patient"}, headers=auth_headers).json()["data"]
    response = client.post(f"/api/patients/{p['id']}/treatment", json={
        "treatment_type": "invalid_magic_treatment",
        "duration_months": 6,
        "number_of_sittings": 3,
        "start_date": "2026-09-18",
    }, headers=auth_headers)
    assert response.status_code == 422


def test_invalid_duration_and_sittings(client, auth_headers):
    p = client.post("/api/patients", json={"name": "Zero Test Patient"}, headers=auth_headers).json()["data"]
    response = client.post(f"/api/patients/{p['id']}/treatment", json={
        "treatment_type": "braces",
        "duration_months": 0,
        "number_of_sittings": 0,
        "start_date": "2026-09-18",
    }, headers=auth_headers)
    assert response.status_code == 422
