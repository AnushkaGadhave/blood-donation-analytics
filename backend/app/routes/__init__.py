"""
FastAPI route module exports
"""
from fastapi import APIRouter
from .health import router as health_router
from .eda import router as eda_router
from .classification import router as classification_router
from .clustering import router as clustering_router
from .association import router as association_router

api_router = APIRouter()
api_router.include_router(health_router, prefix="", tags=["Health Check"])
api_router.include_router(eda_router, prefix="/eda", tags=["Exploratory Data Analysis"])
api_router.include_router(classification_router, prefix="/classification", tags=["Classification"])
api_router.include_router(clustering_router, prefix="/clustering", tags=["Clustering"])
api_router.include_router(association_router, prefix="/association-rules", tags=["Association Rule Mining"])

__all__ = ["api_router"]
