"""
Lab 05 Service: Attribute Relevance & Decision Tree Classification
Calculates Mutual Information relevance scores, trains an entropy-based DecisionTreeClassifier,
extracts the visual tree hierarchy, computes confusion matrix & metrics, and performs real-time inference.
"""
import logging
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.feature_selection import mutual_info_classif
from sklearn.tree import DecisionTreeClassifier
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

logger = logging.getLogger("Lab5Service")


class Lab5Service:
    _cached_results: Optional[Dict[str, Any]] = None

    FEATURE_CONFIG = {
        "recency_months": {
            "name": "Recency (months)",
            "short": "Recency",
            "unit": "months",
            "description": "Months elapsed since last donation",
            "min": 0,
            "max": 74
        },
        "frequency_times": {
            "name": "Frequency (times)",
            "short": "Frequency",
            "unit": "donations",
            "description": "Total number of previous donations",
            "min": 1,
            "max": 50
        },
        "monetary_cc": {
            "name": "Monetary (c.c.)",
            "short": "Monetary",
            "unit": "c.c. blood",
            "description": "Total volume of blood donated (c.c.)",
            "min": 250,
            "max": 12500
        },
        "time_months": {
            "name": "Time / Tenure (months)",
            "short": "Time",
            "unit": "months",
            "description": "Months elapsed since first donation",
            "min": 2,
            "max": 98
        }
    }

    TARGET_CONFIG = {
        "name": "donated_march_2007",
        "label": "Donated in March 2007",
        "classes": {
            0: {"label": "Did Not Donate (Class 0)", "short": "Non-Donor", "color": "#8C87A8"},
            1: {"label": "Donated Blood (Class 1)", "short": "Donor", "color": "#FF786B"}
        }
    }

    @classmethod
    def execute_decision_tree_suite(
        cls,
        selected_features: Optional[List[str]] = None,
        max_depth: int = 3,
        min_samples_leaf: int = 5,
        criterion: str = "entropy",
        force_refresh: bool = False
    ) -> Dict[str, Any]:
        """
        Executes complete Lab 05 workflow:
        1. Mutual Information ranking
        2. Stratified 70/30 train/test split
        3. Decision tree training (entropy criterion)
        4. Evaluation metrics & confusion matrix
        5. Visual tree structure extraction
        """
        df = DataService.load_dataset()
        total_rows = len(df)

        available_features = list(cls.FEATURE_CONFIG.keys())
        features = selected_features or ["recency_months", "frequency_times", "time_months"]
        # Ensure at least 1 feature is selected
        valid_features = [f for f in features if f in available_features]
        if not valid_features:
            valid_features = ["recency_months", "frequency_times", "time_months"]

        X_full = df[available_features].values
        y_full = df["donated_march_2007"].values

        # ---------------------------------------------------------------------
        # 1. MUTUAL INFORMATION RELEVANCE SCORES
        # ---------------------------------------------------------------------
        mi_scores = mutual_info_classif(X_full, y_full, discrete_features=False, random_state=42)
        mi_ranking = []
        for feat, score in zip(available_features, mi_scores):
            mi_ranking.append({
                "feature": feat,
                "label": cls.FEATURE_CONFIG[feat]["name"],
                "short_label": cls.FEATURE_CONFIG[feat]["short"],
                "mi_score": round(float(score), 4),
                "is_selected": feat in valid_features,
                "description": cls.FEATURE_CONFIG[feat]["description"]
            })
        mi_ranking.sort(key=lambda x: x["mi_score"], reverse=True)

        # ---------------------------------------------------------------------
        # 2. STRATIFIED 70% TRAIN / 30% TEST SPLIT
        # ---------------------------------------------------------------------
        X_selected = df[valid_features].values
        y = y_full

        X_train, X_test, y_train, y_test = train_test_split(
            X_selected, y, test_size=0.30, random_state=42, stratify=y
        )

        train_counts = pd.Series(y_train).value_counts().to_dict()
        test_counts = pd.Series(y_test).value_counts().to_dict()

        # ---------------------------------------------------------------------
        # 3. DECISION TREE CLASSIFIER (Entropy Criterion)
        # ---------------------------------------------------------------------
        safe_depth = max(2, min(8, int(max_depth)))
        safe_min_leaf = max(1, min(25, int(min_samples_leaf)))

        clf = DecisionTreeClassifier(
            criterion=criterion if criterion in ["entropy", "gini"] else "entropy",
            max_depth=safe_depth,
            min_samples_leaf=safe_min_leaf,
            random_state=42
        )
        clf.fit(X_train, y_train)

        y_pred = clf.predict(X_test)
        y_pred_train = clf.predict(X_train)

        # ---------------------------------------------------------------------
        # 4. METRICS & CONFUSION MATRIX
        # ---------------------------------------------------------------------
        acc = round(float(accuracy_score(y_test, y_pred)), 4)
        prec = round(float(precision_score(y_test, y_pred, zero_division=0)), 4)
        rec = round(float(recall_score(y_test, y_pred, zero_division=0)), 4)
        f1 = round(float(f1_score(y_test, y_pred, zero_division=0)), 4)

        train_acc = round(float(accuracy_score(y_train, y_pred_train)), 4)

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

        # Feature importance from tree
        importances = []
        for feat, imp in zip(valid_features, clf.feature_importances_):
            importances.append({
                "feature": feat,
                "label": cls.FEATURE_CONFIG[feat]["name"],
                "short_label": cls.FEATURE_CONFIG[feat]["short"],
                "importance": round(float(imp), 4),
                "importance_pct": round(float(imp) * 100, 1)
            })
        importances.sort(key=lambda x: x["importance"], reverse=True)

        # ---------------------------------------------------------------------
        # 5. TREE STRUCTURE PARSING FOR VISUAL DIAGRAM
        # ---------------------------------------------------------------------
        tree_ = clf.tree_

        def recurse_tree(node_id: int, depth: int = 0) -> Dict[str, Any]:
            is_leaf = tree_.children_left[node_id] == tree_.children_right[node_id]
            value_counts = tree_.value[node_id][0].tolist()
            total_node_samples = int(tree_.n_node_samples[node_id])
            entropy_val = round(float(tree_.impurity[node_id]), 3)

            pred_class = int(np.argmax(value_counts))
            class_label = "Donated (1)" if pred_class == 1 else "Did Not Donate (0)"

            node_dict: Dict[str, Any] = {
                "id": node_id,
                "depth": depth,
                "is_leaf": bool(is_leaf),
                "samples": total_node_samples,
                "entropy": entropy_val,
                "value": [int(v) for v in value_counts],
                "predicted_class": pred_class,
                "class_label": class_label,
                "class_distribution_pct": {
                    "non_donors": round(value_counts[0] / max(1, total_node_samples) * 100, 1),
                    "donors": round(value_counts[1] / max(1, total_node_samples) * 100, 1)
                }
            }

            if not is_leaf:
                feat_idx = tree_.feature[node_id]
                feat_name = valid_features[feat_idx]
                threshold = round(float(tree_.threshold[node_id]), 2)
                node_dict["split_feature"] = feat_name
                node_dict["split_label"] = cls.FEATURE_CONFIG[feat_name]["short"]
                node_dict["split_unit"] = cls.FEATURE_CONFIG[feat_name]["unit"]
                node_dict["threshold"] = threshold
                node_dict["condition_str"] = f"{cls.FEATURE_CONFIG[feat_name]['short']} ≤ {threshold} {cls.FEATURE_CONFIG[feat_name]['unit']}"

                left_child = recurse_tree(int(tree_.children_left[node_id]), depth + 1)
                right_child = recurse_tree(int(tree_.children_right[node_id]), depth + 1)
                node_dict["children"] = [left_child, right_child]

            return node_dict

        tree_hierarchy = recurse_tree(0, 0)

        # ---------------------------------------------------------------------
        # 6. DYNAMIC OBSERVATIONS
        # ---------------------------------------------------------------------
        top_mi = mi_ranking[0]
        top_tree_feat = importances[0] if importances else {"label": "None", "importance_pct": 0}

        observation = (
            f"Mutual Information analysis ranks '{top_mi['label']}' as the most informative predictor (MI = {top_mi['mi_score']}). "
            f"The Decision Tree (max_depth={safe_depth}, criterion='{criterion}') achieves {round(acc*100, 1)}% test accuracy, "
            f"with '{top_tree_feat['label']}' contributing {top_tree_feat['importance_pct']}% of tree split importance. "
            f"False Negatives ({fn}) represent the primary misclassification due to the natural 76/24% class imbalance."
        )

        return {
            "lab_id": 5,
            "title": "Lab 05: Attribute Relevance & Decision Tree Classification",
            "dataset_info": {
                "name": "UCI Blood Transfusion Service Center Dataset",
                "source": "data/raw/transfusion.data",
                "total_records": total_rows,
                "train_records": len(X_train),
                "test_records": len(X_test),
                "split_ratio": "70% Train / 30% Test (Stratified)",
                "available_features": [cls.FEATURE_CONFIG[f]["name"] for f in available_features],
                "selected_features": [cls.FEATURE_CONFIG[f]["name"] for f in valid_features],
                "target_variable": "donated_march_2007",
                "target_label": "Observed Donation Response in March 2007 (0 = No, 1 = Yes)"
            },
            "parameters": {
                "criterion": criterion,
                "max_depth": safe_depth,
                "min_samples_leaf": safe_min_leaf,
                "selected_features": valid_features
            },
            "mutual_information": {
                "ranking": mi_ranking,
                "top_feature": top_mi["label"],
                "top_score": top_mi["mi_score"]
            },
            "class_distributions": {
                "train": [
                    {"class": "Did Not Donate (0)", "count": int(train_counts.get(0, 0))},
                    {"class": "Donated Blood (1)", "count": int(train_counts.get(1, 0))}
                ],
                "test": [
                    {"class": "Did Not Donate (0)", "count": int(test_counts.get(0, 0))},
                    {"class": "Donated Blood (1)", "count": int(test_counts.get(1, 0))}
                ]
            },
            "metrics": {
                "accuracy": acc,
                "precision": prec,
                "recall": rec,
                "f1_score": f1,
                "train_accuracy": train_acc,
                "total_test_samples": len(y_test)
            },
            "confusion_matrix": cm_data,
            "feature_importance": importances,
            "tree_structure": tree_hierarchy,
            "observation": observation
        }

    @classmethod
    def predict_single_record(
        cls,
        recency: int = 4,
        frequency: int = 5,
        monetary: int = 1250,
        time: int = 20,
        selected_features: Optional[List[str]] = None,
        max_depth: int = 3,
        min_samples_leaf: int = 5
    ) -> Dict[str, Any]:
        """
        Infers single unseen donor record through the trained decision tree.
        """
        df = DataService.load_dataset()
        available_features = list(cls.FEATURE_CONFIG.keys())
        features = selected_features or ["recency_months", "frequency_times", "time_months"]
        valid_features = [f for f in features if f in available_features]
        if not valid_features:
            valid_features = ["recency_months", "frequency_times", "time_months"]

        X = df[valid_features].values
        y = df["donated_march_2007"].values

        clf = DecisionTreeClassifier(
            criterion="entropy",
            max_depth=max_depth,
            min_samples_leaf=min_samples_leaf,
            random_state=42
        )
        clf.fit(X, y)

        input_map = {
            "recency_months": int(recency),
            "frequency_times": int(frequency),
            "monetary_cc": int(frequency * 250) if "monetary_cc" in valid_features and monetary is None else int(monetary),
            "time_months": max(int(time), int(recency))
        }

        user_vec = np.array([[input_map[f] for f in valid_features]])
        pred_class = int(clf.predict(user_vec)[0])
        pred_probs = clf.predict_proba(user_vec)[0].tolist()

        # Extract decision path
        node_indicator = clf.decision_path(user_vec)
        leaf_id = int(clf.apply(user_vec)[0])
        node_index = node_indicator.indices[node_indicator.indptr[0]:node_indicator.indptr[1]]

        path_rules = []
        tree_ = clf.tree_
        for node_id in node_index:
            if leaf_id == node_id:
                continue
            feat_idx = tree_.feature[node_id]
            feat_name = valid_features[feat_idx]
            threshold = tree_.threshold[node_id]
            val = input_map[feat_name]
            if val <= threshold:
                path_rules.append(f"{cls.FEATURE_CONFIG[feat_name]['short']} ({val}) ≤ {round(threshold, 1)} {cls.FEATURE_CONFIG[feat_name]['unit']}")
            else:
                path_rules.append(f"{cls.FEATURE_CONFIG[feat_name]['short']} ({val}) > {round(threshold, 1)} {cls.FEATURE_CONFIG[feat_name]['unit']}")

        return {
            "predicted_class": pred_class,
            "prediction_label": "Likely to Donate (1)" if pred_class == 1 else "Unlikely to Donate (0)",
            "confidence_pct": round(max(pred_probs) * 100, 1),
            "probabilities": {
                "non_donor_prob": round(pred_probs[0], 4),
                "donor_prob": round(pred_probs[1], 4)
            },
            "decision_path": path_rules,
            "inputs": input_map
        }
