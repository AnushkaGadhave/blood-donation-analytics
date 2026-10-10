from fastapi import APIRouter, HTTPException, Query
from app.services.data_service import DataService

router = APIRouter()


@router.get("/clusters", summary="Get donor cluster analysis")
async def get_clusters(k: int = Query(3, ge=2, le=8, description="Number of clusters")):
    """
    Placeholder endpoint for K-Means and Hierarchical donor clustering.
    """
    if not DataService.is_dataset_available():
        raise HTTPException(
            status_code=503,
            detail="Dataset not loaded. Please place 'transfusion.data' in backend/data/.",
        )

    return {
        "status": "ready",
        "requested_clusters": k,
        "message": "Clustering endpoint initialized. Implementation will follow in Phase 2.",
    }
