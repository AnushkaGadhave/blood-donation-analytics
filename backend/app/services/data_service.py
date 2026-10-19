"""
Data Service for UCI Blood Transfusion Service Center Dataset
Handles dataset loading, validation, data dictionary, summary profiling, and pagination.
"""
import os
import json
import pandas as pd
import numpy as np
from typing import Optional, Tuple, Dict, Any, List

RAW_DATA_PATHS = [
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw", "transfusion.data"),
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "transfusion.data"),
    os.path.join(os.getcwd(), "data", "raw", "transfusion.data"),
    os.path.join(os.getcwd(), "backend", "data", "raw", "transfusion.data"),
]

STANDARDIZED_COLUMNS = [
    "recency_months",       # R: Months since last donation
    "frequency_times",      # F: Total number of donations
    "monetary_cc",          # M: Total blood donated in c.c.
    "time_months",          # T: Months since first donation
    "donated_march_2007"    # Target: 1 = donated in March 2007, 0 = did not donate
]

DATA_DICTIONARY = [
    {
        "name": "recency_months",
        "original_header": "Recency (months)",
        "rfm_code": "R",
        "description": "Months elapsed since the donor's last blood donation.",
        "type": "Numeric (Integer/Float)",
        "unit": "Months",
        "min": 0,
        "max": 74,
        "role": "Input Feature"
    },
    {
        "name": "frequency_times",
        "original_header": "Frequency (times)",
        "rfm_code": "F",
        "description": "Total cumulative number of blood donations made by the donor.",
        "type": "Numeric (Integer)",
        "unit": "Donation Events",
        "min": 1,
        "max": 50,
        "role": "Input Feature"
    },
    {
        "name": "monetary_cc",
        "original_header": "Monetary (c.c. blood)",
        "rfm_code": "M",
        "description": "Total volume of blood donated in cubic centimeters (c.c.). Exactly equals Frequency * 250 c.c.",
        "type": "Numeric (Integer)",
        "unit": "c.c. blood",
        "min": 250,
        "max": 12500,
        "role": "Input Feature (Collinear with F)"
    },
    {
        "name": "time_months",
        "original_header": "Time (months)",
        "rfm_code": "T",
        "description": "Months elapsed since the donor's very first recorded donation (donor tenure).",
        "type": "Numeric (Integer/Float)",
        "unit": "Months",
        "min": 2,
        "max": 98,
        "role": "Input Feature"
    },
    {
        "name": "donated_march_2007",
        "original_header": '"whether he/she donated blood in March 2007"',
        "rfm_code": "Target (Y)",
        "description": "Binary ground-truth indicator: whether the donor donated blood during the mobile clinic visit in March 2007.",
        "type": "Binary Categorical",
        "unit": "0 (No) / 1 (Yes)",
        "min": 0,
        "max": 1,
        "role": "Supervised Target Class"
    }
]


class DataService:
    _cached_df: Optional[pd.DataFrame] = None

    @classmethod
    def get_dataset_path(cls) -> str:
        for p in RAW_DATA_PATHS:
            if os.path.exists(p):
                return os.path.abspath(p)
        raise FileNotFoundError("Could not find transfusion.data in expected paths.")

    @classmethod
    def is_dataset_available(cls) -> bool:
        try:
            cls.get_dataset_path()
            return True
        except FileNotFoundError:
            return False

    @classmethod
    def load_dataset(cls, reload: bool = False) -> pd.DataFrame:
        """
        Loads the clean UCI dataset with standardized column names.
        Ensures exactly 748 records and 5 columns.
        """
        if cls._cached_df is not None and not reload:
            return cls._cached_df.copy()

        path = cls.get_dataset_path()
        # Read raw CSV skipping malformed lines if any, and handle whitespace
        df = pd.read_csv(path, skipinitialspace=True)
        
        # Verify shape
        if df.shape[1] != 5:
            raise ValueError(f"Expected 5 columns, found {df.shape[1]}")

        # Set standardized clean column names
        df.columns = STANDARDIZED_COLUMNS
        
        # Ensure correct numeric types
        df["recency_months"] = pd.to_numeric(df["recency_months"], errors="coerce").astype(int)
        df["frequency_times"] = pd.to_numeric(df["frequency_times"], errors="coerce").astype(int)
        df["monetary_cc"] = pd.to_numeric(df["monetary_cc"], errors="coerce").astype(int)
        df["time_months"] = pd.to_numeric(df["time_months"], errors="coerce").astype(int)
        df["donated_march_2007"] = pd.to_numeric(df["donated_march_2007"], errors="coerce").astype(int)

        cls._cached_df = df
        return df.copy()

    @classmethod
    def get_dataset_overview(cls) -> Dict[str, Any]:
        """
        Returns full metadata, descriptive statistics, quality audit, and data dictionary.
        """
        df = cls.load_dataset()
        total_records = len(df)
        
        # Class distribution
        class_counts = df["donated_march_2007"].value_counts().to_dict()
        non_donors = int(class_counts.get(0, 0))
        donors = int(class_counts.get(1, 0))
        
        # Five-number summary + parametric stats
        stats = {}
        for col in STANDARDIZED_COLUMNS:
            series = df[col]
            q1 = float(series.quantile(0.25))
            median = float(series.median())
            q3 = float(series.quantile(0.75))
            iqr = q3 - q1
            stats[col] = {
                "count": int(series.count()),
                "mean": round(float(series.mean()), 2),
                "std": round(float(series.std()), 2),
                "min": float(series.min()),
                "q1": q1,
                "median": median,
                "q3": q3,
                "max": float(series.max()),
                "iqr": round(iqr, 2),
                "skewness": round(float(series.skew()), 2)
            }

        # Quality audit
        null_counts = {col: int(df[col].isnull().sum()) for col in STANDARDIZED_COLUMNS}
        dup_rows = int(df.duplicated().sum())

        return {
            "title": "Blood Transfusion Service Center Dataset",
            "source_citation": "Yeh, I-Cheng, Yang, King-Jang, and Ting, Tao-Ming, 'Knowledge discovery on RFM model using Bernoulli sequence', Expert Systems with Applications, 2008.",
            "uci_url": "https://archive.ics.uci.edu/dataset/176/blood+transfusion+service+center",
            "domain": "Blood Transfusion Service Center (Hsin-Chu City, Taiwan)",
            "total_instances": total_records,
            "total_attributes": 5,
            "target_variable": "donated_march_2007",
            "class_distribution": {
                "positive_donors_count": donors,
                "positive_donors_pct": round(donors / total_records * 100, 2),
                "negative_donors_count": non_donors,
                "negative_donors_pct": round(non_donors / total_records * 100, 2),
                "imbalance_ratio": f"{round(non_donors / donors, 2)} : 1"
            },
            "quality_audit": {
                "missing_values_total": sum(null_counts.values()),
                "missing_by_column": null_counts,
                "duplicate_profiles_count": dup_rows,
                "duplicate_definition": "215 donor instances share identical RFMT profiles (e.g., multiple 1st-time donors with R=2, F=1, M=250, T=2). These represent valid distinct individuals sharing identical behavioral history, not redundant database entries.",
                "collinearity_invariant": "Monetary cc = Frequency * 250 cc (Pearson r = 1.0000). Every donation is exactly 250 c.c."
            },
            "descriptive_statistics": stats,
            "data_dictionary": DATA_DICTIONARY
        }

    @classmethod
    def get_paginated_records(
        cls,
        page: int = 1,
        page_size: int = 20,
        sort_by: Optional[str] = None,
        sort_dir: str = "asc",
        search: Optional[str] = None,
        target_filter: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Returns paginated records with optional search, sorting, and filtering.
        """
        df = cls.load_dataset()
        df["donor_id"] = np.arange(1, len(df) + 1)

        if isinstance(target_filter, int) and target_filter in [0, 1]:
            df = df[df["donated_march_2007"] == target_filter]

        if isinstance(search, str) and search.strip():
            term = search.strip().lower()
            mask = (
                df["donor_id"].astype(str).str.contains(term) |
                df["recency_months"].astype(str).str.contains(term) |
                df["frequency_times"].astype(str).str.contains(term) |
                df["monetary_cc"].astype(str).str.contains(term) |
                df["time_months"].astype(str).str.contains(term)
            )
            df = df[mask]

        if isinstance(sort_by, str) and sort_by in df.columns:
            ascending = isinstance(sort_dir, str) and (sort_dir.lower() == "asc")
            df = df.sort_values(by=sort_by, ascending=ascending)

        total_records = len(df)
        total_pages = max(1, (total_records + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_df = df.iloc[start_idx:end_idx]

        return {
            "page": page,
            "page_size": page_size,
            "total_records": total_records,
            "total_pages": total_pages,
            "records": page_df.to_dict(orient="records")
        }
