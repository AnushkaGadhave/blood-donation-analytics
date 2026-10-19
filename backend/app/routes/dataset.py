"""
Dataset Route for UCI Blood Transfusion Service Center Dataset
Provides dataset overview, metadata, paginated record exploration, and CSV export.
"""
import io
from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional
from app.services.data_service import DataService

router = APIRouter()


@router.get("/overview", summary="Get UCI dataset overview and statistics")
async def get_dataset_overview():
    try:
        return DataService.get_dataset_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/records", summary="Get paginated raw records with search and sort")
async def get_dataset_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: Optional[str] = Query(None),
    sort_dir: str = Query("asc", pattern="^(asc|desc|ASC|DESC)$"),
    search: Optional[str] = Query(None),
    target_filter: Optional[int] = Query(None)
):
    try:
        clean_page = int(page) if not hasattr(page, 'default') else 1
        clean_size = int(page_size) if not hasattr(page_size, 'default') else 20
        clean_sort = str(sort_by) if isinstance(sort_by, str) else None
        clean_dir = str(sort_dir) if isinstance(sort_dir, str) else "asc"
        clean_search = str(search) if isinstance(search, str) else None
        clean_target = int(target_filter) if isinstance(target_filter, int) else None

        return DataService.get_paginated_records(
            page=clean_page,
            page_size=clean_size,
            sort_by=clean_sort,
            sort_dir=clean_dir,
            search=clean_search,
            target_filter=clean_target
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export", summary="Export UCI dataset to CSV")
async def export_dataset_csv(target_filter: Optional[int] = Query(None)):
    try:
        df = DataService.load_dataset()
        if target_filter is not None and target_filter in [0, 1]:
            df = df[df["donated_march_2007"] == target_filter]

        stream = io.StringIO()
        df.to_csv(stream, index=False)

        return Response(
            content=stream.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=uci_blood_transfusion_dataset.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
