import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import RegisterRequest, LoginRequest, DoctorResponse, TokenResponse
from app.schemas.common import APIResponse
from app.api.deps import get_current_doctor
from app.database import db, supabase_client
from app.utils.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=APIResponse[TokenResponse])
async def register(request: RegisterRequest):
    # Check if doctor already exists
    existing = db.get_doctor_by_email(request.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "EMAIL_EXISTS", "message": "A doctor with this email is already registered."}
        )

    auth_user_id = str(uuid.uuid4())

    # If Supabase client configured, register user in Supabase Auth
    if supabase_client:
        try:
            res = supabase_client.auth.sign_up({
                "email": request.email,
                "password": request.password,
                "options": {
                    "data": {
                        "name": request.name,
                        "clinic_name": request.clinic_name,
                        "specialization": request.specialization,
                    }
                }
            })
            if res.user:
                auth_user_id = res.user.id
        except Exception:
            pass

    # Create doctor in database
    hashed_pwd = hash_password(request.password)
    doctor = db.create_doctor({
        "auth_user_id": auth_user_id,
        "name": request.name,
        "email": str(request.email),
        "phone": request.phone,
        "clinic_name": request.clinic_name,
        "specialization": request.specialization,
        "password_hash": hashed_pwd,
    })

    # Generate token
    token = create_access_token({
        "doctor_id": doctor["id"],
        "sub": doctor["auth_user_id"],
        "email": doctor["email"],
        "name": doctor["name"],
    })

    return APIResponse(
        success=True,
        data=TokenResponse(
            access_token=token,
            doctor=DoctorResponse(**doctor)
        ),
        message="Doctor registered successfully."
    )


@router.post("/login", response_model=APIResponse[TokenResponse])
async def login(request: LoginRequest):
    doctor = db.get_doctor_by_email(request.email)

    # If Supabase Auth is enabled, verify with Supabase
    if supabase_client:
        try:
            res = supabase_client.auth.sign_in_with_password({
                "email": request.email,
                "password": request.password,
            })
            if res.user:
                if not doctor:
                    doctor = db.create_doctor({
                        "auth_user_id": res.user.id,
                        "name": res.user.user_metadata.get("name", "Dr. Doctor"),
                        "email": request.email,
                    })
                token = res.session.access_token
                return APIResponse(
                    success=True,
                    data=TokenResponse(
                        access_token=token,
                        doctor=DoctorResponse(**doctor)
                    )
                )
        except Exception:
            pass

    # Local authentication fallback
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."}
        )

    stored_hash = doctor.get("password_hash")
    if stored_hash and not verify_password(request.password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."}
        )

    token = create_access_token({
        "doctor_id": doctor["id"],
        "sub": doctor["auth_user_id"],
        "email": doctor["email"],
        "name": doctor["name"],
    })

    return APIResponse(
        success=True,
        data=TokenResponse(
            access_token=token,
            doctor=DoctorResponse(**doctor)
        )
    )


@router.get("/me", response_model=APIResponse[DoctorResponse])
async def get_me(current_doctor: dict = Depends(get_current_doctor)):
    return APIResponse(
        success=True,
        data=DoctorResponse(**current_doctor)
    )
