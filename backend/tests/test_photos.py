def test_upload_patient_photo(client, auth_headers, sample_image_bytes):
    # 1. Create Patient
    p = client.post("/api/patients", json={"name": "Photo Test Patient"}, headers=auth_headers).json()["data"]
    patient_id = p["id"]

    # 2. Upload valid image
    files = {"file": ("smile.jpg", sample_image_bytes, "image/jpeg")}
    response = client.post(f"/api/patients/{patient_id}/photo", files=files, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "image_url" in data
    assert len(data["image_url"]) > 0

    # 3. Verify photo URL is stored on patient record
    patient_res = client.get(f"/api/patients/{patient_id}", headers=auth_headers)
    assert patient_res.json()["data"]["original_photo_url"] == data["image_url"]


def test_upload_invalid_file_type(client, auth_headers):
    p = client.post("/api/patients", json={"name": "Bad File Patient"}, headers=auth_headers).json()["data"]
    files = {"file": ("malicious.exe", b"NOT_AN_IMAGE_DATA_CONTENT", "application/octet-stream")}
    response = client.post(f"/api/patients/{p['id']}/photo", files=files, headers=auth_headers)
    assert response.status_code in (400, 422)


def test_photo_upload_doctor_isolation(client, auth_headers, second_doctor_headers, sample_image_bytes):
    # Doctor 1 creates patient
    p = client.post("/api/patients", json={"name": "Doctor 1 Patient"}, headers=auth_headers).json()["data"]
    patient_id = p["id"]

    # Doctor 2 attempts photo upload
    files = {"file": ("smile.jpg", sample_image_bytes, "image/jpeg")}
    response = client.post(f"/api/patients/{patient_id}/photo", files=files, headers=second_doctor_headers)
    assert response.status_code in (403, 404)
