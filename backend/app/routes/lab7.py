from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from app.services.lab7_service import Lab7Service

router = APIRouter()


class KMeansClusterRequest(BaseModel):
    k: int = Field(default=3, ge=2, le=8, description="Number of clusters K")
    features: Optional[List[str]] = Field(default=["recency_months", "frequency_times", "time_months"])
    use_scaling: Optional[bool] = Field(default=True)
    x_axis_feature: Optional[str] = Field(default="recency_months")
    y_axis_feature: Optional[str] = Field(default="frequency_times")


@router.get("/overview", summary="Get complete Lab 07 K-Means clustering suite")
@router.get("/summary", summary="Get complete Lab 07 K-Means clustering suite")
async def get_lab7_overview():
    try:
        return Lab7Service.execute_kmeans_suite()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cluster", summary="Recompute K-Means with custom parameters")
async def recompute_kmeans(payload: KMeansClusterRequest):
    try:
        return Lab7Service.execute_kmeans_suite(
            k=payload.k,
            features=payload.features,
            use_scaling=payload.use_scaling if payload.use_scaling is not None else True,
            x_axis_feature=payload.x_axis_feature or "recency_months",
            y_axis_feature=payload.y_axis_feature or "frequency_times",
            force_refresh=True
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
