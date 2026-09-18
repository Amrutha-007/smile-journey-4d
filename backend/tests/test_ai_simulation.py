def test_ai_batch_generation(client, auth_headers, sample_image_bytes):
    # 1. Create Patient and upload photo
    p = client.post("/api/patients", json={"name": "AI Simulation Patient"}, headers=auth_headers).json()["data"]
    patient_id = p["id"]

    files = {"file": ("smile.jpg", sample_image_bytes, "image/jpeg")}
    client.post(f"/api/patients/{patient_id}/photo", files=files, headers=auth_headers)

    # 2. Create Treatment (Clear aligners, 6 months, 3 sittings)
    t = client.post(f"/api/patients/{patient_id}/treatment", json={
        "treatment_type": "clear_aligners",
        "duration_months": 6,
        "number_of_sittings": 3,
        "start_date": "2026-09-18"
    }, headers=auth_headers).json()["data"]["treatment"]
    treatment_id = t["id"]

    # 3. Trigger Batch AI Generation
    gen_res = client.post(f"/api/treatments/{treatment_id}/generate-all", headers=auth_headers)
    assert gen_res.status_code == 200
    gen_data = gen_res.json()["data"]
    assert gen_data["simulations_queued"] == 3  # 3 non-initial stages
    assert all(sim["status"] == "completed" for sim in gen_data["simulations"])
    assert all(sim["image_url"] is not None for sim in gen_data["simulations"])

    # 4. Poll simulation status
    first_sim_id = gen_data["simulations"][0]["id"]
    status_res = client.get(f"/api/simulations/{first_sim_id}", headers=auth_headers)
    assert status_res.status_code == 200
    assert status_res.json()["data"]["status"] == "completed"
    assert status_res.json()["data"]["simulation_type"] == "potential_treatment_visualization"

    # 5. Test retry endpoint
    retry_res = client.post(f"/api/simulations/{first_sim_id}/retry", headers=auth_headers)
    assert retry_res.status_code == 200
    assert retry_res.json()["data"]["status"] == "completed"
