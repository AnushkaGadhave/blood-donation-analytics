from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from app.services.lab5_service import Lab5Service

router = APIRouter()


class TrainDecisionTreeRequest(BaseModel):
    selected_features: Optional[List[str]] = Field(default=["recency_months", "frequency_times", "time_months"])
    max_depth: Optional[int] = Field(default=3, ge=2, le=8)
    min_samples_leaf: Optional[int] = Field(default=5, ge=1, le=25)
    criterion: Optional[str] = Field(default="entropy")


class PredictRecordRequest(BaseModel):
    recency: int = Field(default=4, ge=0, le=74)
    frequency: int = Field(default=5, ge=1, le=50)
    monetary: Optional[int] = Field(default=1250, ge=250, le=12500)
    time: int = Field(default=20, ge=2, le=98)
    selected_features: Optional[List[str]] = None
    max_depth: Optional[int] = Field(default=3, ge=2, le=8)
    min_samples_leaf: Optional[int] = Field(default=5, ge=1, le=25)


@router.get("/overview", summary="Get complete Lab 05 Decision Tree suite")
@router.get("/summary", summary="Get complete Lab 05 Decision Tree suite")
async def get_lab5_overview():
    try:
        return Lab5Service.execute_decision_tree_suite()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/train", summary="Retrain Decision Tree with custom hyperparameters")
async def train_decision_tree(payload: TrainDecisionTreeRequest):
    try:
        return Lab5Service.execute_decision_tree_suite(
            selected_features=payload.selected_features,
            max_depth=payload.max_depth or 3,
            min_samples_leaf=payload.min_samples_leaf or 5,
            criterion=payload.criterion or "entropy",
            force_refresh=True
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/predict", summary="Predict single donor class and trace decision path")
async def predict_single_record(payload: PredictRecordRequest):
    try:
        return Lab5Service.predict_single_record(
            recency=payload.recency,
            frequency=payload.frequency,
            monetary=payload.monetary or (payload.frequency * 250),
            time=payload.time,
            selected_features=payload.selected_features,
            max_depth=payload.max_depth or 3,
            min_samples_leaf=payload.min_samples_leaf or 5
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
