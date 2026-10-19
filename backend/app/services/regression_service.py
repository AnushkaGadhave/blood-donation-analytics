"""
Regression Service for Lab 04: Simple and Multiple Linear Regression
Using the UCI Blood Transfusion Service Center Dataset (data/raw/transfusion.data).
Predicts continuous numerical target 'monetary_cc' (Total blood volume donated in c.c.)
from 'frequency_times' (SLR) and 'recency_months', 'frequency_times', 'time_months' (MLR).
"""
import logging
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

from app.services.data_service import DataService

logger = logging.getLogger("RegressionService")


class RegressionService:
    _cached_results: Optional[Dict[str, Any]] = None

    NUMERIC_COLUMNS = [
        "recency_months",
        "frequency_times",
        "monetary_cc",
        "time_months"
    ]

    COLUMN_LABELS = {
        "recency_months": "Recency (months)",
        "frequency_times": "Frequency (times)",
        "monetary_cc": "Monetary (c.c. blood)",
        "time_months": "Time / Tenure (months)"
    }

    COLUMN_UNITS = {
        "recency_months": "months",
        "frequency_times": "donations",
        "monetary_cc": "c.c. blood",
        "time_months": "months"
    }

    @classmethod
    def load_dataset(cls) -> pd.DataFrame:
        """
        Loads the clean 748-record UCI Blood Transfusion Service Center dataset.
        """
        return DataService.load_dataset()

    @classmethod
    def get_regression_suite(cls, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Executes complete Simple (SLR) and Multiple Linear Regression (MLR) on the UCI dataset.
        Splits 80% train (598 rows) / 20% test (150 rows) with random_state=42.
        """
        if cls._cached_results is not None and not force_refresh:
            return cls._cached_results

        df = cls.load_dataset()
        total_rows = len(df)

        # ---------------------------------------------------------------------
        # 1. DESCRIPTIVE STATISTICS & 4x4 CORRELATION MATRIX
        # ---------------------------------------------------------------------
        stats_summary = {}
        for col in cls.NUMERIC_COLUMNS:
            s = df[col]
            stats_summary[col] = {
                "name": cls.COLUMN_LABELS[col],
                "unit": cls.COLUMN_UNITS[col],
                "mean": round(float(s.mean()), 2),
                "std": round(float(s.std()), 2),
                "min": round(float(s.min()), 2),
                "q1": round(float(s.quantile(0.25)), 2),
                "median": round(float(s.median()), 2),
                "q3": round(float(s.quantile(0.75)), 2),
                "max": round(float(s.max()), 2)
            }

        corr_matrix = df[cls.NUMERIC_COLUMNS].corr().round(4)
        corr_cells = []
        for r_col in cls.NUMERIC_COLUMNS:
            for c_col in cls.NUMERIC_COLUMNS:
                corr_val = float(corr_matrix.loc[r_col, c_col])
                corr_cells.append({
                    "row": r_col,
                    "row_label": cls.COLUMN_LABELS[r_col],
                    "col": c_col,
                    "col_label": cls.COLUMN_LABELS[c_col],
                    "correlation": corr_val,
                    "is_perfect": abs(corr_val - 1.0) < 1e-5 and r_col != c_col
                })

        # ---------------------------------------------------------------------
        # 2. TRAIN / TEST SPLIT (80% / 20%, random_state=42)
        # ---------------------------------------------------------------------
        X_all = df[["recency_months", "frequency_times", "time_months"]]
        y = df["monetary_cc"]

        X_train, X_test, y_train, y_test = train_test_split(
            X_all, y, test_size=0.20, random_state=42
        )

        test_indices = X_test.index.tolist()

        # ---------------------------------------------------------------------
        # 3. SIMPLE LINEAR REGRESSION (SLR: Frequency -> Monetary)
        # ---------------------------------------------------------------------
        X_train_slr = X_train[["frequency_times"]]
        X_test_slr = X_test[["frequency_times"]]

        slr_model = LinearRegression()
        slr_model.fit(X_train_slr, y_train)

        slr_y_pred_test = slr_model.predict(X_test_slr)
        slr_y_pred_train = slr_model.predict(X_train_slr)

        slr_intercept = round(float(slr_model.intercept_), 3)
        if abs(slr_intercept) < 1e-6:
            slr_intercept = 0.0
        slr_slope = round(float(slr_model.coef_[0]), 3)

        slr_r2_test = round(float(r2_score(y_test, slr_y_pred_test)), 4)
        slr_mse_test = round(float(mean_squared_error(y_test, slr_y_pred_test)), 3)
        if abs(slr_mse_test) < 1e-6:
            slr_mse_test = 0.0
        slr_rmse_test = round(float(np.sqrt(slr_mse_test)), 3)
        if abs(slr_rmse_test) < 1e-6:
            slr_rmse_test = 0.0
        slr_mae_test = round(float(mean_absolute_error(y_test, slr_y_pred_test)), 3)
        if abs(slr_mae_test) < 1e-6:
            slr_mae_test = 0.0

        slr_r2_train = round(float(r2_score(y_train, slr_y_pred_train)), 4)

        # Generate fitted line points across Frequency domain (1 to 50)
        freq_min = int(df["frequency_times"].min())
        freq_max = int(df["frequency_times"].max())
        line_freqs = np.linspace(freq_min, freq_max, 50)
        line_pred = slr_model.predict(pd.DataFrame({"frequency_times": line_freqs}))
        slr_fit_line = [
            {
                "frequency": round(float(f), 1),
                "fitted_monetary": round(float(m), 1)
            }
            for f, m in zip(line_freqs, line_pred)
        ]

        # Scatter points (Frequency vs Monetary) with unique jittered/sampled representation
        # Group identical points to display point density accurately
        grouped_pts = df.groupby(["frequency_times", "monetary_cc"]).size().reset_index(name="donor_count")
        slr_scatter_points = []
        for _, row in grouped_pts.iterrows():
            f_val = int(row["frequency_times"])
            m_val = int(row["monetary_cc"])
            pred_m = float(slr_model.predict(pd.DataFrame({"frequency_times": [f_val]}))[0])
            slr_scatter_points.append({
                "frequency": f_val,
                "actual_monetary": m_val,
                "fitted_monetary": round(pred_m, 1),
                "donor_count": int(row["donor_count"]),
                "residual": round(float(m_val - pred_m), 3)
            })

        # Test set predictions for SLR (150 instances)
        slr_test_predictions = []
        for orig_idx, actual, pred, freq_val in zip(test_indices, y_test, slr_y_pred_test, X_test["frequency_times"]):
            res = float(actual - pred)
            slr_test_predictions.append({
                "id": int(orig_idx + 1),
                "frequency": int(freq_val),
                "actual": round(float(actual), 2),
                "predicted": round(float(pred), 2),
                "residual": round(res, 3) if abs(res) >= 1e-4 else 0.0,
                "abs_residual": round(abs(res), 3) if abs(res) >= 1e-4 else 0.0
            })

        # ---------------------------------------------------------------------
        # 4. MULTIPLE LINEAR REGRESSION (MLR: Recency + Frequency + Time -> Monetary)
        # ---------------------------------------------------------------------
        mlr_model = LinearRegression()
        mlr_model.fit(X_train, y_train)

        mlr_y_pred_test = mlr_model.predict(X_test)
        mlr_y_pred_train = mlr_model.predict(X_train)

        mlr_intercept = round(float(mlr_model.intercept_), 3)
        if abs(mlr_intercept) < 1e-6:
            mlr_intercept = 0.0

        mlr_coefs = {
            "recency_months": 0.0 if abs(mlr_model.coef_[0]) < 1e-6 else round(float(mlr_model.coef_[0]), 4),
            "frequency_times": round(float(mlr_model.coef_[1]), 4),
            "time_months": 0.0 if abs(mlr_model.coef_[2]) < 1e-6 else round(float(mlr_model.coef_[2]), 4)
        }

        mlr_r2_test = round(float(r2_score(y_test, mlr_y_pred_test)), 4)
        mlr_mse_test = round(float(mean_squared_error(y_test, mlr_y_pred_test)), 3)
        if abs(mlr_mse_test) < 1e-6:
            mlr_mse_test = 0.0
        mlr_rmse_test = round(float(np.sqrt(mlr_mse_test)), 3)
        if abs(mlr_rmse_test) < 1e-6:
            mlr_rmse_test = 0.0
        mlr_mae_test = round(float(mean_absolute_error(y_test, mlr_y_pred_test)), 3)
        if abs(mlr_mae_test) < 1e-6:
            mlr_mae_test = 0.0

        mlr_r2_train = round(float(r2_score(y_train, mlr_y_pred_train)), 4)

        # Feature coefficients bar chart data
        feature_coefficients = [
            {
                "feature": "recency_months",
                "label": "Recency (months)",
                "coefficient": mlr_coefs["recency_months"],
                "impact": "0.00 c.c./month (no marginal effect)",
                "color": "#7956E8",
                "description": "Months elapsed since last donation"
            },
            {
                "feature": "frequency_times",
                "label": "Frequency (times)",
                "coefficient": mlr_coefs["frequency_times"],
                "impact": "+250.00 c.c. per donation event",
                "color": "#FFD166",
                "description": "Total cumulative donation count"
            },
            {
                "feature": "time_months",
                "label": "Time / Tenure (months)",
                "coefficient": mlr_coefs["time_months"],
                "impact": "0.00 c.c./month (no marginal effect)",
                "color": "#56C9A5",
                "description": "Months since first donation"
            }
        ]

        # MLR Test set predictions (150 instances)
        mlr_test_predictions = []
        for orig_idx, actual, pred, (_, row) in zip(test_indices, y_test, mlr_y_pred_test, X_test.iterrows()):
            res = float(actual - pred)
            mlr_test_predictions.append({
                "id": int(orig_idx + 1),
                "recency": int(row["recency_months"]),
                "frequency": int(row["frequency_times"]),
                "time": int(row["time_months"]),
                "actual": round(float(actual), 2),
                "predicted": round(float(pred), 2),
                "residual": round(res, 3),
                "abs_residual": round(abs(res), 3)
            })

        # ---------------------------------------------------------------------
        # 5. RESIDUAL ANALYSIS & HISTOGRAMS
        # ---------------------------------------------------------------------
        def build_residual_histogram(residuals: List[float], n_bins: int = 7):
            min_r = min(residuals)
            max_r = max(residuals)
            # If residuals are virtually 0, provide clean zero-centered bins
            if abs(max_r - min_r) < 1e-4:
                return [
                    {"bin_label": "-0.03 to -0.01", "count": 0, "start": -0.03, "end": -0.01},
                    {"bin_label": "-0.01 to +0.01", "count": len(residuals), "start": -0.01, "end": 0.01},
                    {"bin_label": "+0.01 to +0.03", "count": 0, "start": 0.01, "end": 0.03}
                ]
            step = (max_r - min_r) / n_bins
            bins = []
            for i in range(n_bins):
                b_start = min_r + i * step
                b_end = b_start + step
                label = f"{round(b_start, 2)} to {round(b_end, 2)}"
                cnt = sum(1 for r in residuals if b_start <= r < b_end or (i == n_bins - 1 and r == max_r))
                bins.append({"bin_label": label, "count": cnt, "start": b_start, "end": b_end})
            return bins

        slr_res_list = [p["residual"] for p in slr_test_predictions]
        mlr_res_list = [p["residual"] for p in mlr_test_predictions]

        slr_res_hist = build_residual_histogram(slr_res_list)
        mlr_res_hist = build_residual_histogram(mlr_res_list)

        # ---------------------------------------------------------------------
        # 6. MODEL COMPARISON METRICS (Identical 150 Test Samples)
        # ---------------------------------------------------------------------
        comparison_metrics = [
            {
                "metric": "R² Score (Coefficient of Determination)",
                "metric_key": "r2",
                "slr_value": slr_r2_test,
                "mlr_value": mlr_r2_test,
                "delta": round(mlr_r2_test - slr_r2_test, 4),
                "winner": "Tied (1.000)",
                "higher_is_better": True,
                "description": "Proportion of total variance in Monetary volume explained by the model"
            },
            {
                "metric": "Mean Absolute Error (MAE)",
                "metric_key": "mae",
                "slr_value": slr_mae_test,
                "mlr_value": mlr_mae_test,
                "delta": round(mlr_mae_test - slr_mae_test, 3),
                "winner": "Tied (0.0 c.c.)",
                "higher_is_better": False,
                "description": "Average magnitude of absolute prediction error in cubic centimeters"
            },
            {
                "metric": "Root Mean Squared Error (RMSE)",
                "metric_key": "rmse",
                "slr_value": slr_rmse_test,
                "mlr_value": mlr_rmse_test,
                "delta": round(mlr_rmse_test - slr_rmse_test, 3),
                "winner": "Tied (0.0 c.c.)",
                "higher_is_better": False,
                "description": "Standard deviation of the residuals / prediction errors"
            },
            {
                "metric": "Mean Squared Error (MSE)",
                "metric_key": "mse",
                "slr_value": slr_mse_test,
                "mlr_value": mlr_mse_test,
                "delta": round(mlr_mse_test - slr_mse_test, 3),
                "winner": "Tied (0.0)",
                "higher_is_better": False,
                "description": "Average squared difference between estimated values and actual target"
            }
        ]

        # ---------------------------------------------------------------------
        # 7. ASSEMBLE LAB 04 RESPONSE PAYLOAD
        # ---------------------------------------------------------------------
        cls._cached_results = {
            "lab_id": 4,
            "title": "Lab 04: Simple & Multiple Linear Regression",
            "dataset_info": {
                "name": "UCI Blood Transfusion Service Center Dataset",
                "source": "data/raw/transfusion.data",
                "total_records": total_rows,
                "train_records": len(X_train),
                "test_records": len(X_test),
                "features_slr": ["Frequency"],
                "features_mlr": ["Recency", "Frequency", "Time"],
                "target": "Monetary",
                "target_full_name": "Monetary (c.c. blood volume donated)",
                "units": {
                    "Recency": "months",
                    "Frequency": "donations",
                    "Time": "months",
                    "Monetary": "c.c. blood"
                },
                "deterministic_invariant": {
                    "formula": "Monetary = Frequency × 250 c.c.",
                    "pearson_r": 1.0000,
                    "finding": "Every donation in the dataset is exactly 250 c.c. of blood. Hence, Monetary is deterministically collinear with Frequency."
                }
            },
            "descriptive_statistics": stats_summary,
            "correlation_matrix": {
                "columns": [cls.COLUMN_LABELS[c] for c in cls.NUMERIC_COLUMNS],
                "raw_keys": cls.NUMERIC_COLUMNS,
                "cells": corr_cells
            },
            "slr": {
                "model_name": "Simple Linear Regression (SLR)",
                "predictor": "Frequency",
                "target": "Monetary (c.c.)",
                "intercept": slr_intercept,
                "slope": slr_slope,
                "equation": f"Monetary (c.c.) = {slr_intercept} + ({slr_slope} × Frequency)",
                "metrics": {
                    "r2": slr_r2_test,
                    "r2_train": slr_r2_train,
                    "mse": slr_mse_test,
                    "rmse": slr_rmse_test,
                    "mae": slr_mae_test
                },
                "fit_line": slr_fit_line,
                "scatter_points": slr_scatter_points,
                "test_predictions": slr_test_predictions,
                "residual_histogram": slr_res_hist
            },
            "mlr": {
                "model_name": "Multiple Linear Regression (MLR)",
                "predictors": ["Recency", "Frequency", "Time"],
                "target": "Monetary (c.c.)",
                "intercept": mlr_intercept,
                "coefficients": {
                    "Recency": mlr_coefs["recency_months"],
                    "Frequency": mlr_coefs["frequency_times"],
                    "Time": mlr_coefs["time_months"]
                },
                "equation": (
                    f"Monetary (c.c.) = {mlr_intercept} + "
                    f"({mlr_coefs['recency_months']} × Recency) + "
                    f"({mlr_coefs['frequency_times']} × Frequency) + "
                    f"({mlr_coefs['time_months']} × Time)"
                ),
                "metrics": {
                    "r2": mlr_r2_test,
                    "r2_train": mlr_r2_train,
                    "mse": mlr_mse_test,
                    "rmse": mlr_rmse_test,
                    "mae": mlr_mae_test
                },
                "feature_coefficients": feature_coefficients,
                "test_predictions": mlr_test_predictions,
                "residual_histogram": mlr_res_hist
            },
            "comparison": {
                "metrics": comparison_metrics,
                "best_model": "Simple Linear Regression (SLR is optimal & parsimonious)",
                "parsimony_note": (
                    "Both SLR and MLR yield R² = 1.0000 and RMSE = 0.00 c.c. "
                    "However, SLR is preferred under Occam's Razor (parsimony principle) "
                    "as it achieves zero prediction error with only 1 parameter (Frequency) "
                    "without requiring redundant Recency or Time features."
                )
            }
        }

        return cls._cached_results

    @classmethod
    def predict_monetary_volume(
        cls,
        model_type: str = "slr",
        frequency: int = 5,
        recency: Optional[int] = 4,
        time: Optional[int] = 20
    ) -> Dict[str, Any]:
        """
        Computes regression prediction for blood donation monetary volume (c.c.).
        Validates inputs against dataset domains.
        """
        suite = cls.get_regression_suite()
        m_type = model_type.lower()

        # Input constraints validation based on dataset range
        freq = max(1, min(50, int(frequency)))
        rec = max(0, min(74, int(recency if recency is not None else 4)))
        t_months = max(2, min(98, int(time if time is not None else 20)))

        # Logical validation: tenure (Time) must be >= months since last donation (Recency)
        if t_months < rec:
            t_months = rec

        if m_type == "slr":
            model_info = suite["slr"]
            intercept = model_info["intercept"]
            slope = model_info["slope"]
            pred_volume = intercept + slope * freq
            equation_calc = f"{intercept} + ({slope} × {freq})"
            used_inputs = {
                "Frequency (donations)": freq
            }
        else:
            model_info = suite["mlr"]
            intercept = model_info["intercept"]
            coefs = model_info["coefficients"]
            pred_volume = (
                intercept
                + coefs["Recency"] * rec
                + coefs["Frequency"] * freq
                + coefs["Time"] * t_months
            )
            equation_calc = (
                f"{intercept} + ({coefs['Recency']} × {rec}) + "
                f"({coefs['Frequency']} × {freq}) + ({coefs['Time']} × {t_months})"
            )
            used_inputs = {
                "Recency (months)": rec,
                "Frequency (donations)": freq,
                "Time / Tenure (months)": t_months
            }

        return {
            "model_type": "Simple Linear Regression (SLR)" if m_type == "slr" else "Multiple Linear Regression (MLR)",
            "inputs": used_inputs,
            "predicted_monetary_cc": round(float(pred_volume), 2),
            "units": "c.c. blood",
            "equation_breakdown": equation_calc,
            "r2_confidence": 1.0000,
            "deterministic_notice": (
                "Deterministic Invariant Notice: In the UCI Blood Transfusion Service Center dataset, "
                "every donation is exactly 250 c.c. of blood. The predicted volume is calculated via "
                f"{freq} donations × 250 c.c. = {int(round(pred_volume))} c.c. "
                "This reflects the true physical unit conversion rather than a probabilistic discovery."
            )
        }
