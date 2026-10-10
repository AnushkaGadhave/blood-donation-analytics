from fastapi import APIRouter, HTTPException
from app.services.data_service import DataService

router = APIRouter()


@router.get("/summary", summary="Dataset overview summary")
async def get_dataset_summary():
    """
    Returns high-level statistics and metadata about the blood donation dataset if present.
    """
    df, error = DataService.load_dataset()
    if error:
        raise HTTPException(status_code=404, detail=error)

    target_counts = df["donated"].value_counts().to_dict()
    return {
        "total_records": int(len(df)),
        "columns": list(df.columns),
        "target_distribution": {
            "donated_yes": int(target_counts.get(1, 0)),
            "donated_no": int(target_counts.get(0, 0)),
        },
        "missing_values": int(df.isnull().sum().sum()),
    }
