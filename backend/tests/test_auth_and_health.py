def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "SmileProgress Backend"


def test_register_and_login_flow(client):
    # 1. Register new doctor
    reg_payload = {
        "name": "Dr. Clara Oswald",
        "email": "dr.clara@smileprogress.dental",
        "password": "SecurePassword123!",
        "clinic_name": "Oswald Digital Aesthetics",
        "specialization": "Cosmetic Dentistry",
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert reg_data["success"] is True
    assert "access_token" in reg_data["data"]
    token = reg_data["data"]["access_token"]
    assert reg_data["data"]["doctor"]["email"] == "dr.clara@smileprogress.dental"

    # 2. Duplicate registration rejected
    dup_res = client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 400
    assert dup_res.json()["error"]["code"] == "EMAIL_EXISTS"

    # 3. Login with correct credentials
    login_res = client.post("/api/auth/login", json={
        "email": "dr.clara@smileprogress.dental",
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()["data"]

    # 4. Login with wrong password
    bad_login = client.post("/api/auth/login", json={
        "email": "dr.clara@smileprogress.dental",
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

    # 5. Access /api/auth/me with token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["data"]["name"] == "Dr. Clara Oswald"


def test_unauthenticated_access_denied(client):
    # Patient list without token -> 401
    res = client.get("/api/patients")
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"
