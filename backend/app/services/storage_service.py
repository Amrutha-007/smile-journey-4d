import os
import io
import uuid
import base64
from typing import Optional, Tuple
from pathlib import Path
from PIL import Image
from fastapi import UploadFile, HTTPException
from app.config import settings


class StorageService:
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self.local_storage_dir = Path("./local_storage")
        self.local_storage_dir.mkdir(parents=True, exist_ok=True)
        for bucket in [
            settings.BUCKET_PATIENT_ORIGINALS,
            settings.BUCKET_PATIENT_SITTINGS,
            settings.BUCKET_AI_SIMULATIONS,
            settings.BUCKET_REPORTS,
        ]:
            (self.local_storage_dir / bucket).mkdir(parents=True, exist_ok=True)

    def validate_image_file(self, file_content: bytes, content_type: Optional[str] = None) -> None:
        """Validate image size and format."""
        if len(file_content) > settings.MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum allowed size is {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB."
            )

        # Validate with Pillow to ensure it is a real image
        try:
            image = Image.open(io.BytesIO(file_content))
            image.verify()
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid image file or corrupted data."
            )

        if content_type and content_type.lower() not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported image type: {content_type}. Allowed: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
            )

    async def upload_file(
        self,
        bucket_name: str,
        file_path: str,
        file_bytes: bytes,
        content_type: str = "image/jpeg"
    ) -> str:
        """
        Uploads file to Supabase Storage if configured, otherwise stores locally.
        Returns a retrieval URL (signed URL or accessible URL).
        """
        # 1. Supabase Storage upload if available
        if self.supabase and settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                # Ensure bucket exists
                try:
                    self.supabase.storage.get_bucket(bucket_name)
                except Exception:
                    try:
                        self.supabase.storage.create_bucket(bucket_name, options={"public": False})
                    except Exception:
                        pass

                # Upload to Supabase Storage
                self.supabase.storage.from_(bucket_name).upload(
                    path=file_path,
                    file=file_bytes,
                    file_options={"content-type": content_type, "upsert": "true"}
                )

                # Create signed URL (valid for 7 days = 604800s)
                res = self.supabase.storage.from_(bucket_name).create_signed_url(file_path, 604800)
                if isinstance(res, dict) and "signedURL" in res:
                    return res["signedURL"]
                elif hasattr(res, "signed_url"):
                    return res.signed_url
                return f"{settings.SUPABASE_URL}/storage/v1/object/{bucket_name}/{file_path}"
            except Exception as e:
                # Fallback to local storage on error
                pass

        # 2. Local filesystem storage fallback
        dest_path = self.local_storage_dir / bucket_name / file_path
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        with open(dest_path, "wb") as f:
            f.write(file_bytes)

        # Return a relative/local API URL or base64 data URL for easy display
        return f"/api/storage/{bucket_name}/{file_path}"

    def get_local_file_bytes(self, bucket_name: str, file_path: str) -> Optional[bytes]:
        """Retrieve local file bytes if exists."""
        target = self.local_storage_dir / bucket_name / file_path
        if target.exists() and target.is_file():
            with open(target, "rb") as f:
                return f.read()
        return None


# Global singleton instance
storage_service = StorageService()
