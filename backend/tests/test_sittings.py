def test_sitting_lifecycle_and_actual_photo(client, auth_headers, sample_image_bytes):
    # 1. Create Patient & Treatment
    p = client.post("/api/patients", json={"name": "Sitting Test Patient"}, headers=auth_headers).json()["data"]
    patient_id = p["id"]

    t_res = client.post(f"/api/patients/{patient_id}/treatment", json={
        "treatment_type": "veneers",
        "duration_months": 3,
        "number_of_sittings": 3,
        "start_date": "2026-06-10"
    }, headers=auth_headers).json()["data"]
    stages = t_res["stages"]
    stage_1 = stages[1]

    # 2. Log Sitting #1
    sitting_payload = {
        "stage_id": stage_1["id"],
        "sitting_number": 1,
        "date": "2026-07-10",
        "progress_percentage": 33,
        "dentist_notes": "Preparation and temporary veneers placed."
    }
    sit_res = client.post(f"/api/patients/{patient_id}/sittings", json=sitting_payload, headers=auth_headers)
    assert sit_res.status_code == 201
    sitting = sit_res.json()["data"]
    assert sitting["sitting_number"] == 1
    assert sitting["progress_percentage"] == 33

    # 3. Upload Actual Sitting Photo
    files = {"file": ("actual_visit1.jpg", sample_image_bytes, "image/jpeg")}
    photo_res = client.post(f"/api/sittings/{sitting['id']}/photo", files=files, headers=auth_headers)
    assert photo_res.status_code == 200
    assert photo_res.json()["success"] is True
    actual_photo_url = photo_res.json()["image_url"]

    # 4. Verify stage reflects the actual photo
    stage_res = client.get(f"/api/stages/{stage_1['id']}", headers=auth_headers)
    assert stage_res.status_code == 200
    assert stage_res.json()["data"]["actual_photo_url"] == actual_photo_url
    assert stage_res.json()["data"]["status"] == "completed"

    # 5. Check progress endpoint reflects the updated progress
    progress_res = client.get(f"/api/patients/{patient_id}/progress", headers=auth_headers)
    assert progress_res.status_code == 200
    assert progress_res.json()["data"]["overall_progress"] == 33
