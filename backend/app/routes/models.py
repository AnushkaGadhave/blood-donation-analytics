"""
Machine Learning Models Benchmark Route
Provides model comparisons, confusion matrices, ROC/PR curves, and retraining.
"""
from fastapi import APIRouter, HTTPException
from app.services.ml_service import MLService

router = APIRouter()


@router.get("/comparison", summary="Get 4-model classification comparison benchmarks")
async def get_model_comparison():
    try:
        return MLService.train_and_evaluate_all(force_retrain=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/retrain", summary="Force retrain all 4 classifiers")
async def retrain_models():
    try:
        return MLService.train_and_evaluate_all(force_retrain=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
