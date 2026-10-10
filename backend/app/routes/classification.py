from fastapi import APIRouter, HTTPException
from app.models.schemas import DonorDataInput, ModelPredictionResponse
from app.services.data_service import DataService

router = APIRouter()


@router.post("/predict", summary="Predict blood donation likelihood")
async def predict_donation(donor: DonorDataInput):
    """
    Placeholder endpoint for single donor prediction.
    Will be fully integrated with trained classifiers in Phase 2.
    """
    if not DataService.is_dataset_available():
        raise HTTPException(
            status_code=503,
            detail="Model is not trained. Please place 'transfusion.data' in backend/data/ and trigger training.",
        )

    return {
        "status": "pending_training",
        "input_received": donor.dict(),
        "message": "Classification model training pipeline will be executed in Phase 2.",
    }
