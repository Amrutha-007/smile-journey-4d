import pytest
import io
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.database import db
from app.utils.security import hash_password, create_access_token


@pytest.fixture(autouse=True)
def reset_database():
    """Reset in-memory database before every test."""
    db.reset()
    yield
    db.reset()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def test_doctor():
    doctor = db.create_doctor({
        "auth_user_id": "auth-doc-123",
        "name": "Dr. Sarah Thomas",
        "email": "dr.sarah@smileprogress.dental",
        "phone": "+1 (555) 123-4567",
        "clinic_name": "Thomas Aesthetic Smile Clinic",
        "specialization": "Orthodontics",
        "password_hash": hash_password("DoctorPass123!"),
    })
    return doctor


@pytest.fixture
def doctor_token(test_doctor):
    return create_access_token({
        "doctor_id": test_doctor["id"],
        "sub": test_doctor["auth_user_id"],
        "email": test_doctor["email"],
        "name": test_doctor["name"],
    })


@pytest.fixture
def auth_headers(doctor_token):
    return {"Authorization": f"Bearer {doctor_token}"}


@pytest.fixture
def second_doctor():
    doctor = db.create_doctor({
        "auth_user_id": "auth-doc-456",
        "name": "Dr. James Miller",
        "email": "dr.miller@smileprogress.dental",
        "phone": "+1 (555) 987-6543",
        "clinic_name": "Miller Dental Arts",
        "specialization": "General Dentistry",
        "password_hash": hash_password("DoctorPass456!"),
    })
    return doctor


@pytest.fixture
def second_doctor_headers(second_doctor):
    token = create_access_token({
        "doctor_id": second_doctor["id"],
        "sub": second_doctor["auth_user_id"],
        "email": second_doctor["email"],
        "name": second_doctor["name"],
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_image_bytes():
    """Generate valid 100x100 JPEG in-memory."""
    buf = io.BytesIO()
    img = Image.new("RGB", (100, 100), color=(14, 165, 233))
    img.save(buf, format="JPEG")
    return buf.getvalue()
