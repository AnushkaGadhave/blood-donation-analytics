from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from app.services.lab8_service import Lab8Service

router = APIRouter()


class HierarchicalClusterRequest(BaseModel):
    k: int = Field(default=4, ge=2, le=8, description="Number of clusters K")
    linkage_method: Optional[str] = Field(default="ward", description="'ward', 'complete', 'average', or 'single'")
    features: Optional[List[str]] = Field(default=["recency_months", "frequency_times", "time_months"])
    x_axis_feature: Optional[str] = Field(default="recency_months")
    y_axis_feature: Optional[str] = Field(default="frequency_times")


@router.get("/overview", summary="Get complete Lab 08 Hierarchical Clustering suite")
@router.get("/summary", summary="Get complete Lab 08 Hierarchical Clustering suite")
async def get_lab8_overview():
    try:
        return Lab8Service.execute_hierarchical_suite()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cluster", summary="Recompute Hierarchical Clustering with custom parameters")
async def recompute_hierarchical(payload: HierarchicalClusterRequest):
    try:
        return Lab8Service.execute_hierarchical_suite(
            k=payload.k,
            linkage_method=payload.linkage_method or "ward",
            features=payload.features,
            x_axis_feature=payload.x_axis_feature or "recency_months",
            y_axis_feature=payload.y_axis_feature or "frequency_times",
            force_refresh=True
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
