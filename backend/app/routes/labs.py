"""
DWDM Academic Labs Route
Serves execution outputs, schema models, and reports for DWDM Labs 1 through 9.
"""
from fastapi import APIRouter, HTTPException
from app.services.labs_service import LabsService

router = APIRouter()


@router.get("", summary="List all 9 DWDM lab experiments")
async def list_labs():
    try:
        return {"labs": LabsService.get_all_labs_summary()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{lab_id}", summary="Get detailed results and execution for a specific lab")
async def get_lab(lab_id: int):
    try:
        return LabsService.get_lab_details(lab_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
