from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.lab6_service import Lab6Service

router = APIRouter()


class PredictNaiveBayesRequest(BaseModel):
    recency: int = Field(default=4, ge=0, le=74, description="Months since last donation")
    frequency: int = Field(default=5, ge=1, le=50, description="Number of previous donations")
    monetary: Optional[int] = Field(default=None, ge=250, le=12500, description="Total blood volume in c.c.")
    time: int = Field(default=20, ge=2, le=98, description="Months since first donation")


@router.get("/overview", summary="Get complete Lab 06 Gaussian Naïve Bayes suite")
@router.get("/summary", summary="Get complete Lab 06 Gaussian Naïve Bayes suite")
async def get_lab6_overview():
    try:
        return Lab6Service.execute_naive_bayes_suite()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict", summary="Compute posterior probabilities for single donor record")
async def predict_naive_bayes(payload: PredictNaiveBayesRequest):
    try:
        return Lab6Service.predict_donor_probability(
            recency=payload.recency,
            frequency=payload.frequency,
            monetary=payload.monetary,
            time=payload.time
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
