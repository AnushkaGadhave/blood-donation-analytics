"""
FastAPI Route Module Exports
Unified API routing for UCI Blood Transfusion Service Center Project.
"""
from fastapi import APIRouter
from .health import router as health_router
from .dataset import router as dataset_router
from .analytics import router as analytics_router
from .models import router as models_router
from .predict import router as predict_router
from .labs import router as labs_router

# Legacy routes preserved for compatibility
from .lab1 import router as lab1_router
from .lab2 import router as lab2_router
from .lab3 import router as lab3_router
from .lab4 import router as lab4_router
from .lab5 import router as lab5_router
from .lab6 import router as lab6_router
from .lab7 import router as lab7_router
from .lab8 import router as lab8_router
from .lab9 import router as lab9_router

api_router = APIRouter()

# Primary Unified API Routes
api_router.include_router(health_router, prefix="", tags=["Health Check"])
api_router.include_router(dataset_router, prefix="/dataset", tags=["UCI Dataset Overview & Records"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Donor Behaviour Analysis"])
api_router.include_router(models_router, prefix="/models", tags=["Classification Model Benchmarks"])
api_router.include_router(predict_router, prefix="/predict", tags=["Interactive Donor Prediction"])
api_router.include_router(labs_router, prefix="/labs", tags=["DWDM Academic Labs 1-9"])

# Dedicated DWDM Lab Endpoints
api_router.include_router(lab1_router, prefix="/lab1", tags=["Lab 1: Dimensional Modeling"])
api_router.include_router(lab2_router, prefix="/lab2", tags=["Lab 2: OLAP Operations"])
api_router.include_router(lab3_router, prefix="/lab3", tags=["Lab 3: Exploratory Data Analysis"])
api_router.include_router(lab4_router, prefix="/lab4", tags=["Lab 4: Linear Regression"])
api_router.include_router(lab5_router, prefix="/lab5", tags=["Lab 5: Decision Tree Classification"])
api_router.include_router(lab6_router, prefix="/lab6", tags=["Lab 6: Gaussian Naive Bayes"])
api_router.include_router(lab7_router, prefix="/lab7", tags=["Lab 7: K-Means Clustering"])
api_router.include_router(lab8_router, prefix="/lab8", tags=["Lab 8: Hierarchical Clustering"])
api_router.include_router(lab9_router, prefix="/lab9", tags=["Lab 9: Apriori Association Rules"])

__all__ = ["api_router"]

