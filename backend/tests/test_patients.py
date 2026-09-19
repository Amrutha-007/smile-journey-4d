def test_create_patient(client, auth_headers):
    payload = {
        "name": "Ananya Menon",
        "age": 22,
        "gender": "female",
        "phone": "9876543210",
        "email": "ananya@example.com",
        "problem": "crowding",
        "problem_description": "Moderate lower anterior crowding"
    }
    response = client.post("/api/patients", json=payload, headers=auth_headers)
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["name"] == "Ananya Menon"
    assert res_data["data"]["patient_code"] == "PT-001"
    assert "id" in res_data["data"]


def test_get_and_list_patients(client, auth_headers):
    # Create patient
    p1 = client.post("/api/patients", json={"name": "Alice Smith", "age": 28}, headers=auth_headers).json()["data"]
    p2 = client.post("/api/patients", json={"name": "Bob Jones", "age": 35}, headers=auth_headers).json()["data"]

    # List
    response = client.get("/api/patients", headers=auth_headers)
    assert response.status_code == 200
    patients = response.json()["data"]
    assert len(patients) == 2

    # Get Single
    single_res = client.get(f"/api/patients/{p1['id']}", headers=auth_headers)
    assert single_res.status_code == 200
    assert single_res.json()["data"]["name"] == "Alice Smith"


def test_doctor_isolation(client, auth_headers, second_doctor_headers):
    """Verify that a doctor can NEVER access or retrieve another doctor's patients."""
    # Doctor 1 creates patient
    p1 = client.post("/api/patients", json={"name": "Confidential Patient"}, headers=auth_headers).json()["data"]
    p1_id = p1["id"]

    # Doctor 2 attempts to get Doctor 1's patient
    unauthorized_get = client.get(f"/api/patients/{p1_id}", headers=second_doctor_headers)
    assert unauthorized_get.status_code in (403, 404)

    # Doctor 2 lists patients -> should be empty
    list_res = client.get("/api/patients", headers=second_doctor_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()["data"]) == 0

    # Doctor 2 attempts to delete Doctor 1's patient
    unauthorized_delete = client.delete(f"/api/patients/{p1_id}", headers=second_doctor_headers)
    assert unauthorized_delete.status_code in (403, 404)


def test_update_and_delete_patient(client, auth_headers):
    p = client.post("/api/patients", json={"name": "Temporary Patient"}, headers=auth_headers).json()["data"]
    p_id = p["id"]

    # Update
    update_res = client.put(f"/api/patients/{p_id}", json={"age": 40, "status": "completed"}, headers=auth_headers)
    assert update_res.status_code == 200
    assert update_res.json()["data"]["age"] == 40
    assert update_res.json()["data"]["status"] == "completed"

    # Delete
    del_res = client.delete(f"/api/patients/{p_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # Verify deleted
    get_res = client.get(f"/api/patients/{p_id}", headers=auth_headers)
    assert get_res.status_code == 404
