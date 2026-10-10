from fastapi import APIRouter
from app.models.schemas import HealthCheckResponse
from app.services.data_service import DataService
from app.utils.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthCheckResponse, summary="Backend health check")
async def health_check():
    """
    Returns server status, version, and whether the UCI dataset file is present.
    """
    return HealthCheckResponse(
        status="healthy",
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        dataset_present=DataService.is_dataset_available(),
        dataset_path=settings.DATASET_PATH,
        environment=settings.ENVIRONMENT,
    )
