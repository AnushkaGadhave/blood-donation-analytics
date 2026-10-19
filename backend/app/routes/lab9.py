from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import Optional
from app.services.lab9_service import Lab9Service

router = APIRouter()


class AprioriMineRequest(BaseModel):
    dataset_type: Optional[str] = Field(default="donor_profiles", description="'donor_profiles', 'retail_grocery', or 'custom'")
    min_support: Optional[float] = Field(default=0.08, ge=0.01, le=0.90)
    min_confidence: Optional[float] = Field(default=0.40, ge=0.05, le=0.95)
    min_lift: Optional[float] = Field(default=1.0, ge=0.1, le=10.0)
    max_rules: Optional[int] = Field(default=30, ge=5, le=100)


class CustomCsvTextRequest(BaseModel):
    csv_text: str = Field(..., description="Raw comma-separated items per row")


@router.get("/overview", summary="Get complete Lab 09 Apriori association suite")
@router.get("/summary", summary="Get complete Lab 09 Apriori association suite")
async def get_lab9_overview():
    try:
        return Lab9Service.execute_apriori_suite()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mine", summary="Execute Apriori rule mining with customized thresholds")
async def mine_apriori_rules(payload: AprioriMineRequest):
    try:
        return Lab9Service.execute_apriori_suite(
            dataset_type=payload.dataset_type or "donor_profiles",
            min_support=payload.min_support if payload.min_support is not None else 0.08,
            min_confidence=payload.min_confidence if payload.min_confidence is not None else 0.40,
            min_lift=payload.min_lift if payload.min_lift is not None else 1.0,
            max_rules=payload.max_rules or 30,
            force_refresh=True
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/upload-raw", summary="Upload custom transaction CSV text for Apriori mining")
async def upload_custom_transactions(payload: CustomCsvTextRequest):
    try:
        status = Lab9Service.load_custom_csv_transactions(payload.csv_text)
        suite = Lab9Service.execute_apriori_suite(dataset_type="custom", force_refresh=True)
        return {
            "status": status,
            "suite": suite
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
