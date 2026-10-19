"""
Donor Behaviour Analytics Route
Provides distributions, cross-class comparisons, correlations, and scatter relations.
"""
from fastapi import APIRouter, HTTPException
from app.services.donor_analytics_service import DonorAnalyticsService

router = APIRouter()


@router.get("/summary", summary="Get complete donor behaviour analysis summary")
async def get_analytics_summary():
    try:
        return DonorAnalyticsService.get_full_analytics_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/distributions", summary="Get univariate feature distributions")
async def get_distributions():
    try:
        return DonorAnalyticsService.get_univariate_distributions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/comparisons", summary="Get cross-class comparisons across target")
async def get_class_comparisons():
    try:
        return DonorAnalyticsService.get_class_comparisons()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/correlations", summary="Get correlation matrix and insights")
async def get_correlations():
    try:
        return DonorAnalyticsService.get_correlation_matrix()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scatter", summary="Get scatter relation points")
async def get_scatter_data():
    try:
        return {"points": DonorAnalyticsService.get_scatter_relations()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
