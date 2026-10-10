from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class HealthCheckResponse(BaseModel):
    status: str = "ok"
    app_name: str
    version: str
    dataset_present: bool
    dataset_path: str
    environment: str


class DonorDataInput(BaseModel):
    recency: int = Field(..., ge=0, description="Months since last donation")
    frequency: int = Field(..., ge=1, description="Total number of donations")
    monetary: Optional[int] = Field(None, ge=0, description="Total blood donated in c.c. (defaults to frequency * 250)")
    time: int = Field(..., ge=0, description="Months since first donation")


class DatasetSummaryResponse(BaseModel):
    total_records: int
    features: List[str]
    target_column: str
    target_distribution: Dict[str, int]
    missing_values_count: int


class ModelPredictionResponse(BaseModel):
    will_donate: bool
    probability_donation: float
    probability_no_donation: float
    model_name: str
    risk_level: Optional[str] = None
