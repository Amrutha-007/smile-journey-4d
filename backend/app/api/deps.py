from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.security import decode_token
from app.database import db
from app.config import settings

security = HTTPBearer(auto_error=False)


async def get_current_doctor(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    """
    Extracts and validates authenticated doctor from Supabase JWT or local Bearer token.
    Raises 401 if token is missing or invalid.
    """
    if not credentials:
        # Check if default test doctor exists in dev mode without token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Authentication token required."},
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Invalid or expired authentication token."},
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract doctor identifiers (Supabase JWT uses 'sub' for user ID)
    auth_user_id = payload.get("sub") or payload.get("auth_user_id")
    email = payload.get("email")
    doctor_id = payload.get("doctor_id")

    doctor = None
    if doctor_id:
        doctor = db.get_doctor_by_id(doctor_id)
    if not doctor and auth_user_id:
        doctor = db.get_doctor_by_auth_user_id(auth_user_id)
    if not doctor and email:
        doctor = db.get_doctor_by_email(email)

    if not doctor:
        # Auto-provision doctor profile if valid Supabase token is presented
        if auth_user_id and email:
            doctor = db.create_doctor({
                "auth_user_id": auth_user_id,
                "email": email,
                "name": payload.get("user_metadata", {}).get("name", "Dr. Smile Specialist"),
                "clinic_name": payload.get("user_metadata", {}).get("clinic_name", "Digital Smile Clinic"),
            })
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "DOCTOR_NOT_FOUND", "message": "Doctor account not found."},
                headers={"WWW-Authenticate": "Bearer"},
            )

    return doctor
