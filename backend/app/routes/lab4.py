from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.regression_service import RegressionService

router = APIRouter()


class PredictMonetaryRequest(BaseModel):
    model_type: str = Field("slr", description="'slr' or 'mlr'")
    frequency: int = Field(5, ge=1, le=50, description="Total number of previous donations (Frequency: 1-50)")
    recency: Optional[int] = Field(4, ge=0, le=74, description="Months since last donation (Recency: 0-74)")
    time: Optional[int] = Field(20, ge=2, le=98, description="Months since first donation (Time/Tenure: 2-98)")


@router.get("/summary", summary="Get complete Lab 04 SLR & MLR regression suite")
@router.get("/overview", summary="Get complete Lab 04 SLR & MLR regression suite")
async def get_regression_summary():
    """
    Returns complete SLR (Frequency -> Monetary) and MLR (Recency + Frequency + Time -> Monetary)
    model results, train/test metrics (R2, MSE, RMSE, MAE), actual vs predicted sets,
    fitted lines, feature coefficients, correlation matrix, and residual histograms.
    """
    try:
        return RegressionService.get_regression_suite()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute regression models: {str(e)}")


@router.post("/predict", summary="Predict monetary blood volume in c.c. using SLR or MLR")
async def predict_monetary(payload: PredictMonetaryRequest):
    """
    Computes regression prediction for blood donation monetary volume (c.c.) using
    either Simple Linear Regression (Frequency) or Multiple Linear Regression (Recency, Frequency, Time).
    """
    try:
        return RegressionService.predict_monetary_volume(
            model_type=payload.model_type,
            frequency=payload.frequency,
            recency=payload.recency,
            time=payload.time
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")
