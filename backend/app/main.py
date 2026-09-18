from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
import mimetypes

from app.config import settings
from app.database import db
from app.services.storage_service import storage_service
from app.api.auth import router as auth_router
from app.api.patients import router as patients_router
from app.api.treatments import router as treatments_router
from app.api.stages import router as stages_router
from app.api.sittings import router as sittings_router
from app.api.simulations import router as simulations_router
from app.api.reports import router as reports_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks: e.g. verify local storage buckets
    yield
    # Shutdown tasks


app = FastAPI(
    title="SmileProgress Backend API",
    description=(
        "Advanced Digital Smile Design & Orthodontic Tracking Platform Backend.\n\n"
        "Provides REST APIs for doctor authentication, patient management, automatic timeline calculation, "
        "AI-driven potential smile simulations (Gemini & Mock), clinical sitting photography, and consolidated reports."
    ),
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ------------------------------------------------------------------------------
# CORS Middleware
# ------------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------------------
# Global Exception Handlers (Standardized Error Responses)
# ------------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code = "HTTP_ERROR"
    message = str(exc.detail)

    if isinstance(exc.detail, dict):
        code = exc.detail.get("code", code)
        message = exc.detail.get("message", message)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": message
            }
        },
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_details = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err["loc"])
        error_details.append(f"{field}: {err['msg']}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "; ".join(error_details)
            }
        }
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred."
            }
        }
    )


# ------------------------------------------------------------------------------
# Health Check Endpoint
# ------------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
async def health_check():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "service": "SmileProgress Backend"
    }


# ------------------------------------------------------------------------------
# Local Storage Retrieval Route
# ------------------------------------------------------------------------------
@app.get("/api/storage/{bucket_name}/{file_path:path}", tags=["Storage"])
async def get_storage_file(bucket_name: str, file_path: str):
    """Retrieve locally stored files (images, reports) when offline or in dev mode."""
    content = storage_service.get_local_file_bytes(bucket_name, file_path)
    if not content:
        raise HTTPException(status_code=404, detail="File not found in storage.")

    content_type, _ = mimetypes.guess_type(file_path)
    return Response(content=content, media_type=content_type or "application/octet-stream")


# ------------------------------------------------------------------------------
# Register API Routers
# ------------------------------------------------------------------------------
app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(treatments_router)
app.include_router(stages_router)
app.include_router(sittings_router)
app.include_router(simulations_router)
app.include_router(reports_router)
