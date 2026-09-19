from app.api.auth import router as auth_router
from app.api.patients import router as patients_router
from app.api.treatments import router as treatments_router
from app.api.stages import router as stages_router
from app.api.sittings import router as sittings_router
from app.api.simulations import router as simulations_router
from app.api.reports import router as reports_router

__all__ = [
    "auth_router",
    "patients_router",
    "treatments_router",
    "stages_router",
    "sittings_router",
    "simulations_router",
    "reports_router",
]
