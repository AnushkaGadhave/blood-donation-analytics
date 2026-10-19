"""
Lab 02 Router — OLAP Operations
Exposes endpoints for Roll-Up, Drill-Down, Slice, Dice, Pivot, and 3D OLAP Cube
on the UCI Blood Transfusion Service Center Dataset and Multidimensional Warehouse.
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.olap_service import OLAPService

router = APIRouter()


class RollupRequest(BaseModel):
    dimension: str = Field("recency", description="Dimension to roll up: 'recency', 'frequency', 'tenure'")
    target_level: str = Field("tier", description="Target hierarchy level: 'tier', 'category', 'all'")


class DrilldownRequest(BaseModel):
    dimension: str = Field("recency", description="Dimension to drill down: 'recency', 'frequency', 'tenure'")
    selected_tier: Optional[str] = Field("Immediate (0–3m)", description="Tier label to decompose")


class SliceRequest(BaseModel):
    dimension: str = Field("recency", description="Dimension to slice by: 'recency', 'frequency', 'tenure', 'donation_status'")
    value: str = Field("Immediate (0–3m)", description="Fixed dimension tier/value to extract")


class DiceRequest(BaseModel):
    recency_tiers: List[str] = Field(default_factory=list, description="List of selected recency tiers")
    frequency_tiers: List[str] = Field(default_factory=list, description="List of selected frequency tiers")
    tenure_tiers: List[str] = Field(default_factory=list, description="List of selected tenure tiers")
    status_filter: str = Field("all", description="'all', 'DONOR', 'NON_DONOR', '1', '0'")


class PivotRequest(BaseModel):
    row_dim: str = Field("recency", description="Row dimension: 'recency', 'frequency', 'tenure', 'status'")
    col_dim: str = Field("status", description="Column dimension: 'status', 'frequency', 'tenure', 'recency'")
    measure: str = Field("donor_count", description="Measure: 'donor_count', 'total_volume_cc', 'return_rate_pct', 'avg_frequency'")


class CubeRequest(BaseModel):
    z_filter: str = Field("all", description="Z-plane filter on Tenure Tier or 'all'")
    measure: str = Field("donor_count", description="Measure to display in cube cells")


@router.get("/summary", summary="Get Lab 02 OLAP metadata and filter options")
async def get_lab2_summary():
    """
    Returns complete dimensional schemas, hierarchies, measures, and baseline metrics.
    """
    try:
        return OLAPService.get_filter_options()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filters", summary="Get dynamic OLAP filter options")
async def get_filters():
    try:
        return OLAPService.get_filter_options()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rollup", summary="Execute OLAP Roll-Up operation")
async def execute_rollup(payload: RollupRequest):
    try:
        return OLAPService.execute_rollup(
            dimension=payload.dimension,
            target_level=payload.target_level
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/drilldown", summary="Execute OLAP Drill-Down operation")
async def execute_drilldown(payload: DrilldownRequest):
    try:
        return OLAPService.execute_drilldown(
            dimension=payload.dimension,
            selected_tier=payload.selected_tier
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/slice", summary="Execute OLAP Slice operation")
async def execute_slice(payload: SliceRequest):
    try:
        return OLAPService.execute_slice(
            dimension=payload.dimension,
            value=payload.value
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/dice", summary="Execute OLAP Dice operation")
async def execute_dice(payload: DiceRequest):
    try:
        return OLAPService.execute_dice(
            recency_tiers=payload.recency_tiers,
            frequency_tiers=payload.frequency_tiers,
            tenure_tiers=payload.tenure_tiers,
            status_filter=payload.status_filter
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/pivot", summary="Execute OLAP Pivot operation")
async def execute_pivot(payload: PivotRequest):
    try:
        return OLAPService.execute_pivot(
            row_dim=payload.row_dim,
            col_dim=payload.col_dim,
            measure=payload.measure
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/cube", summary="Get 3D OLAP Cube data")
async def get_cube(payload: CubeRequest):
    try:
        return OLAPService.get_cube_data(
            z_filter=payload.z_filter,
            measure=payload.measure
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
