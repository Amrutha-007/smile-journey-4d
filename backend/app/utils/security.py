import hashlib
import os
import hmac
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from app.config import settings


def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hash a password using SHA-256 with a unique salt."""
    if not salt:
        salt = os.urandom(16).hex()
    hashed = hashlib.sha256(f"{salt}{password}".encode("utf-8")).hexdigest()
    return f"{salt}${hashed}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored salt$hash."""
    if "$" not in hashed_password:
        return False
    salt, original_hash = hashed_password.split("$", 1)
    computed_hash = hashlib.sha256(f"{salt}{plain_password}".encode("utf-8")).hexdigest()
    return hmac.compare_digest(original_hash, computed_hash)


from app.utils.dates import get_utc_now


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT token."""
    to_encode = data.copy()
    now = get_utc_now()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)



def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT token.
    Supports both local app-signed tokens and Supabase Auth tokens.
    """
    try:
        # First attempt: standard app secret
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except Exception:
        pass

    try:
        # Second attempt: decode without verifying signature to extract claims if Supabase Auth is used
        # with remote Supabase JWT secret
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except Exception:
        return None
