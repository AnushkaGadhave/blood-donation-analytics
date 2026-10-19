from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.eda_service import EDAService

router = APIRouter()


class ExploreFilterRequest(BaseModel):
    recency_range: Optional[List[int]] = Field(None, description="[min_months, max_months]")
    frequency_range: Optional[List[int]] = Field(None, description="[min_times, max_times]")
    tenure_range: Optional[List[int]] = Field(None, description="[min_months, max_months]")
    target_filter: Optional[str] = Field("all", description="'all', '1', '0'")


@router.get("/summary", summary="Get complete EDA summary for UCI Blood Transfusion dataset")
@router.get("/overview", summary="Get complete EDA overview for UCI Blood Transfusion dataset")
async def get_eda_summary():
    """
    Returns complete visual EDA metrics, parametric/non-parametric descriptive statistics,
    univariate distributions with observed donation response rates, 5x5 correlation matrix,
    outlier bounds (1.5xIQR), class comparative statistics, and automatically generated key findings.
    """
    try:
        return EDAService.get_eda_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate EDA overview: {str(e)}")


@router.post("/explore", summary="Interactive multi-slider exploratory filter")
async def explore_filtered_data(payload: ExploreFilterRequest):
    """
    Applies interactive multi-dimensional filters on the 748 UCI donor records and
    returns recalculated cohort KPIs, donor response rate, and sample records.
    """
    try:
        return EDAService.execute_filtered_exploration(
            recency_range=payload.recency_range,
            frequency_range=payload.frequency_range,
            tenure_range=payload.tenure_range,
            target_filter=payload.target_filter
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to filter records: {str(e)}")
