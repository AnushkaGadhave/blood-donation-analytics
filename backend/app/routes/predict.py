"""
Interactive Donor Prediction Route
Provides live inference with input validation and calibrated probability estimation.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.ml_service import MLService

router = APIRouter()


class PredictionRequest(BaseModel):
    recency_months: int = Field(..., ge=0, le=120, description="Months since last donation")
    frequency_times: int = Field(..., ge=1, le=100, description="Total lifetime donations")
    monetary_cc: int = Field(..., ge=250, le=25000, description="Total blood volume donated in c.c.")
    time_months: int = Field(..., ge=1, le=200, description="Months since first donation")


@router.post("", summary="Predict donor return probability")
async def predict_donor(payload: PredictionRequest):
    try:
        result = MLService.predict_donor(
            recency=payload.recency_months,
            frequency=payload.frequency_times,
            monetary=payload.monetary_cc,
            time=payload.time_months
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("errors", ["Invalid prediction input"]))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
