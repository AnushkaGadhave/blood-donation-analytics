import os
import pandas as pd
from typing import Optional, Tuple
from app.utils.config import settings

# Standardized column names for UCI Blood Transfusion Service Center Dataset
COLUMN_NAMES = [
    "recency",      # Recency (months since last donation)
    "frequency",    # Frequency (total number of donations)
    "monetary",     # Monetary (total blood donated in c.c.)
    "time",         # Time (months since first donation)
    "donated",      # Target class: whether donated blood in March 2007 (1=yes, 0=no)
]


class DataService:
    @staticmethod
    def is_dataset_available() -> bool:
        """Checks if transfusion.data exists at the configured path."""
        return os.path.exists(settings.DATASET_PATH)

    @staticmethod
    def load_dataset() -> Tuple[Optional[pd.DataFrame], Optional[str]]:
        """
        Loads the dataset if present.
        Returns:
            Tuple of (DataFrame or None, error_message or None)
        """
        if not DataService.is_dataset_available():
            return None, f"Dataset not found at {settings.DATASET_PATH}. Please place 'transfusion.data' in backend/data/."

        try:
            # The UCI dataset is a comma-separated file with a header row
            df = pd.read_csv(settings.DATASET_PATH)
            if df.shape[1] == 5:
                df.columns = COLUMN_NAMES
            return df, None
        except Exception as e:
            return None, f"Error reading dataset: {str(e)}"
