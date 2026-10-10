from fastapi import APIRouter, HTTPException, Query
from app.services.data_service import DataService

router = APIRouter()


@router.get("/rules", summary="Get Apriori association rules")
async def get_association_rules(
    min_support: float = Query(0.05, ge=0.01, le=1.0),
    min_confidence: float = Query(0.5, ge=0.1, le=1.0),
):
    """
    Placeholder endpoint for Apriori association rule mining.
    """
    if not DataService.is_dataset_available():
        raise HTTPException(
            status_code=503,
            detail="Dataset not loaded. Please place 'transfusion.data' in backend/data/.",
        )

    return {
        "status": "ready",
        "min_support": min_support,
        "min_confidence": min_confidence,
        "message": "Association rules endpoint initialized. Implementation will follow in Phase 2.",
    }
