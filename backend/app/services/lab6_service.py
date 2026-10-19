"""
Lab 06 Service: Gaussian Naïve Bayes Classification
Trains a Gaussian Naive Bayes classifier on the UCI Blood Transfusion Service Center dataset.
Computes class prior probabilities, feature Gaussian distribution parameters (mean, variance),
evaluates classification performance (Accuracy, Precision, Recall, F1, Confusion Matrix),
and performs real-time posterior probability inference for unseen donor instances.
"""
import logging
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

from app.services.data_service import DataService

logger = logging.getLogger("Lab6Service")


class Lab6Service:
    _cached_results: Optional[Dict[str, Any]] = None

    FEATURE_CONFIG = {
        "recency_months": {
            "name": "Recency (months)",
            "short": "Recency",
            "unit": "months",
            "description": "Months elapsed since last donation"
        },
        "frequency_times": {
            "name": "Frequency (times)",
            "short": "Frequency",
            "unit": "donations",
            "description": "Total number of previous donations"
        },
        "monetary_cc": {
            "name": "Monetary (c.c.)",
            "short": "Monetary",
            "unit": "c.c. blood",
            "description": "Total volume of blood donated (c.c.)"
        },
        "time_months": {
            "name": "Time / Tenure (months)",
            "short": "Time",
            "unit": "months",
            "description": "Months elapsed since first donation"
        }
    }

    TARGET_CONFIG = {
        0: {"label": "Did Not Donate (Class 0)", "short": "Non-Donor", "color": "#8C87A8"},
        1: {"label": "Donated Blood (Class 1)", "short": "Donor", "color": "#EC79B9"}
    }

    @classmethod
    def execute_naive_bayes_suite(cls, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Executes complete Lab 06 Gaussian Naive Bayes workflow:
        1. 70/30 stratified train-test split
        2. GaussianNB training
        3. Prior probabilities and Gaussian (mean, variance) parameter extraction
        4. Test predictions & posterior probabilities
        5. Confusion matrix, classification report, and evaluation metrics
        """
        if cls._cached_results is not None and not force_refresh:
            return cls._cached_results

        df = DataService.load_dataset()
        total_rows = len(df)

        feature_cols = ["recency_months", "frequency_times", "monetary_cc", "time_months"]
        X = df[feature_cols].values
        y = df["donated_march_2007"].values

        # ---------------------------------------------------------------------
        # 1. STRATIFIED 70/30 TRAIN/TEST SPLIT
        # ---------------------------------------------------------------------
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.30, random_state=42, stratify=y
        )

        test_indices = X_test.tolist()

        # ---------------------------------------------------------------------
        # 2. GAUSSIAN NAIVE BAYES TRAINING
        # ---------------------------------------------------------------------
        gnb = GaussianNB()
        gnb.fit(X_train, y_train)

        y_pred = gnb.predict(X_test)
        y_proba = gnb.predict_proba(X_test)
        y_train_pred = gnb.predict(X_train)

        # ---------------------------------------------------------------------
        # 3. CLASS PRIORS & GAUSSIAN PARAMETERS (MEAN & VARIANCE)
        # ---------------------------------------------------------------------
        class_priors = {
            "non_donor_prior": round(float(gnb.class_prior_[0]), 4),
            "donor_prior": round(float(gnb.class_prior_[1]), 4),
            "priors_list": [
                {"class": "Did Not Donate (0)", "prior": round(float(gnb.class_prior_[0]), 4), "percentage": round(float(gnb.class_prior_[0]) * 100, 1)},
                {"class": "Donated Blood (1)", "prior": round(float(gnb.class_prior_[1]), 4), "percentage": round(float(gnb.class_prior_[1]) * 100, 1)}
            ]
        }

        # Extract conditional means (theta_) and variances (var_) for each class
        feature_params = []
        for idx, col in enumerate(feature_cols):
            mean_c0 = round(float(gnb.theta_[0, idx]), 2)
            var_c0 = round(float(gnb.var_[0, idx]), 2)
            std_c0 = round(float(np.sqrt(gnb.var_[0, idx])), 2)

            mean_c1 = round(float(gnb.theta_[1, idx]), 2)
            var_c1 = round(float(gnb.var_[1, idx]), 2)
            std_c1 = round(float(np.sqrt(gnb.var_[1, idx])), 2)

            feature_params.append({
                "feature": col,
                "label": cls.FEATURE_CONFIG[col]["name"],
                "short_label": cls.FEATURE_CONFIG[col]["short"],
                "unit": cls.FEATURE_CONFIG[col]["unit"],
                "class_0_non_donors": {
                    "mean": mean_c0,
                    "variance": var_c0,
                    "std": std_c0
                },
                "class_1_donors": {
                    "mean": mean_c1,
                    "variance": var_c1,
                    "std": std_c1
                }
            })

        # ---------------------------------------------------------------------
        # 4. EVALUATION METRICS & CONFUSION MATRIX
        # ---------------------------------------------------------------------
        acc = round(float(accuracy_score(y_test, y_pred)), 4)
        prec = round(float(precision_score(y_test, y_pred, zero_division=0)), 4)
        rec = round(float(recall_score(y_test, y_pred, zero_division=0)), 4)
        f1 = round(float(f1_score(y_test, y_pred, zero_division=0)), 4)

        train_acc = round(float(accuracy_score(y_train, y_train_pred)), 4)

        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()

        cm_data = {
            "matrix": cm.tolist(),
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
            "labels": ["Did Not Donate (0)", "Donated (1)"]
        }

        # Actual vs Predicted Class Distribution
        test_actual_counts = pd.Series(y_test).value_counts().to_dict()
        test_pred_counts = pd.Series(y_pred).value_counts().to_dict()

        class_distribution_comparison = [
            {
                "class": "Did Not Donate (0)",
                "actual": int(test_actual_counts.get(0, 0)),
                "predicted": int(test_pred_counts.get(0, 0))
            },
            {
                "class": "Donated Blood (1)",
                "actual": int(test_actual_counts.get(1, 0)),
                "predicted": int(test_pred_counts.get(1, 0))
            }
        ]

        # ---------------------------------------------------------------------
        # 5. SAMPLE TEST SET PREDICTIONS WITH POSTERIOR PROBABILITIES
        # ---------------------------------------------------------------------
        sample_test_predictions = []
        for i, (x_row, actual, pred, prob) in enumerate(zip(X_test[:50], y_test[:50], y_pred[:50], y_proba[:50])):
            sample_test_predictions.append({
                "sample_id": i + 1,
                "recency": int(x_row[0]),
                "frequency": int(x_row[1]),
                "monetary": int(x_row[2]),
                "time": int(x_row[3]),
                "actual_class": int(actual),
                "actual_label": "Donated (1)" if actual == 1 else "Non-Donor (0)",
                "predicted_class": int(pred),
                "predicted_label": "Donated (1)" if pred == 1 else "Non-Donor (0)",
                "prob_non_donor": round(float(prob[0]), 4),
                "prob_donor": round(float(prob[1]), 4),
                "confidence_pct": round(float(max(prob)) * 100, 1),
                "is_correct": bool(actual == pred)
            })

        # ---------------------------------------------------------------------
        # 6. DYNAMIC OBSERVATION
        # ---------------------------------------------------------------------
        observation = (
            f"Gaussian Naïve Bayes achieves {round(acc * 100, 1)}% test accuracy with class priors "
            f"P(Non-Donor) = {class_priors['non_donor_prior']} and P(Donor) = {class_priors['donor_prior']}. "
            f"The Gaussian likelihood parameters indicate returning donors have significantly lower mean Recency "
            f"({feature_params[0]['class_1_donors']['mean']}m vs {feature_params[0]['class_0_non_donors']['mean']}m) "
            f"and higher Frequency ({feature_params[1]['class_1_donors']['mean']} vs {feature_params[1]['class_0_non_donors']['mean']} donations)."
        )

        cls._cached_results = {
            "lab_id": 6,
            "title": "Lab 06: Gaussian Naïve Bayes Classification",
            "dataset_info": {
                "name": "UCI Blood Transfusion Service Center Dataset",
                "source": "data/raw/transfusion.data",
                "total_records": total_rows,
                "train_records": len(X_train),
                "test_records": len(X_test),
                "split_ratio": "70% Train / 30% Test (Stratified)",
                "features": [cls.FEATURE_CONFIG[f]["name"] for f in feature_cols],
                "target_variable": "donated_march_2007",
                "target_label": "March 2007 Donation Response"
            },
            "class_priors": class_priors,
            "gaussian_parameters": feature_params,
            "metrics": {
                "accuracy": acc,
                "precision": prec,
                "recall": rec,
                "f1_score": f1,
                "train_accuracy": train_acc,
                "total_test_samples": len(y_test)
            },
            "confusion_matrix": cm_data,
            "class_distributions": class_distribution_comparison,
            "sample_predictions": sample_test_predictions,
            "observation": observation
        }

        return cls._cached_results

    @classmethod
    def predict_donor_probability(
        cls,
        recency: int = 4,
        frequency: int = 5,
        monetary: Optional[int] = None,
        time: int = 20
    ) -> Dict[str, Any]:
        """
        Computes Gaussian Naive Bayes posterior probabilities P(C_k | X) for an individual donor.
        """
        df = DataService.load_dataset()
        feature_cols = ["recency_months", "frequency_times", "monetary_cc", "time_months"]
        X = df[feature_cols].values
        y = df["donated_march_2007"].values

        gnb = GaussianNB()
        gnb.fit(X, y)

        m_val = int(frequency * 250) if monetary is None else int(monetary)
        t_val = max(int(time), int(recency))

        input_vector = np.array([[int(recency), int(frequency), m_val, t_val]])
        pred_class = int(gnb.predict(input_vector)[0])
        pred_probs = gnb.predict_proba(input_vector)[0].tolist()

        return {
            "predicted_class": pred_class,
            "prediction_label": "Likely to Donate in March 2007" if pred_class == 1 else "Unlikely to Donate in March 2007",
            "confidence_pct": round(max(pred_probs) * 100, 1),
            "posterior_probabilities": {
                "non_donor_probability": round(pred_probs[0], 4),
                "donor_probability": round(pred_probs[1], 4)
            },
            "probability_bars": [
                {"class_name": "Did Not Donate (Class 0)", "probability": round(pred_probs[0], 4), "percentage": round(pred_probs[0] * 100, 1), "color": "#8C87A8"},
                {"class_name": "Donated Blood (Class 1)", "probability": round(pred_probs[1], 4), "percentage": round(pred_probs[1] * 100, 1), "color": "#EC79B9"}
            ],
            "inputs": {
                "Recency (months)": int(recency),
                "Frequency (donations)": int(frequency),
                "Monetary (c.c.)": m_val,
                "Time / Tenure (months)": t_val
            }
        }
