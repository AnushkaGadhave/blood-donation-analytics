"""
Lab 07 Service: K-Means Clustering & Unsupervised Donor Segmentation
Performs K-Means clustering on the UCI Blood Transfusion Service Center dataset.
Computes Elbow Curve (Inertia/WCSS), Silhouette scores, Davies-Bouldin index for K=1..10,
cluster assignments, centroids in original/scaled space, cluster profiles, and 2D scatter visualizations.
"""
import logging
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
try:
    from sklearn.cluster import KMeans
except (ImportError, Exception):
    from app.utils.ml_algorithms import CustomKMeans as KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, davies_bouldin_score

from app.services.data_service import DataService

logger = logging.getLogger("Lab7Service")


class Lab7Service:
    _cached_results: Optional[Dict[str, Any]] = None

    FEATURE_CONFIG = {
        "recency_months": {"name": "Recency (months)", "short": "Recency", "unit": "months"},
        "frequency_times": {"name": "Frequency (times)", "short": "Frequency", "unit": "donations"},
        "monetary_cc": {"name": "Monetary (c.c.)", "short": "Monetary", "unit": "c.c. blood"},
        "time_months": {"name": "Time / Tenure (months)", "short": "Tenure", "unit": "months"}
    }

    CLUSTER_PALETTE = [
        "#7956E8",  # Electric Violet
        "#FF786B",  # Coral Pop
        "#56C9A5",  # Mint Fresh
        "#58B8F5",  # Sky Blue
        "#FFD166",  # Sunny Yellow
        "#EC79B9",  # Berry Pink
        "#84CC16",  # Lime Green
        "#F97316"   # Amber Orange
    ]

    @classmethod
    def execute_kmeans_suite(
        cls,
        k: int = 3,
        features: Optional[List[str]] = None,
        use_scaling: bool = True,
        x_axis_feature: str = "recency_months",
        y_axis_feature: str = "frequency_times",
        force_refresh: bool = False
    ) -> Dict[str, Any]:
        """
        Executes complete K-Means workflow:
        1. Feature selection and scaling
        2. Elbow Curve (WCSS), Silhouette, Davies-Bouldin evaluation across K=1..10
        3. Fit KMeans for selected K
        4. Centroids, cluster sizes, cluster profiles, and 2D scatter points
        """
        df = DataService.load_dataset()
        total_rows = len(df)

        available_features = list(cls.FEATURE_CONFIG.keys())
        selected_feats = features or ["recency_months", "frequency_times", "time_months"]
        valid_feats = [f for f in selected_feats if f in available_features]
        if len(valid_feats) < 2:
            valid_feats = ["recency_months", "frequency_times", "time_months"]

        X_raw = df[valid_feats].values

        if use_scaling:
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X_raw)
        else:
            scaler = None
            X_scaled = X_raw

        # ---------------------------------------------------------------------
        # 1. ELBOW CURVE (INERTIA), SILHOUETTE, AND DAVIES-BOULDIN METRICS
        # ---------------------------------------------------------------------
        elbow_curve = []
        silhouette_curve = []
        davies_bouldin_curve = []

        for k_val in range(1, 11):
            km = KMeans(n_clusters=k_val, random_state=42, n_init=10)
            km.fit(X_scaled)
            elbow_curve.append({
                "k": k_val,
                "wcss": round(float(km.inertia_), 2)
            })

            if k_val >= 2:
                labels = km.labels_
                sil = silhouette_score(X_scaled, labels)
                db = davies_bouldin_score(X_scaled, labels)
                silhouette_curve.append({
                    "k": k_val,
                    "silhouette": round(float(sil), 4)
                })
                davies_bouldin_curve.append({
                    "k": k_val,
                    "davies_bouldin": round(float(db), 4)
                })

        # ---------------------------------------------------------------------
        # 2. FIT K-MEANS FOR CHOSEN K
        # ---------------------------------------------------------------------
        safe_k = max(2, min(8, int(k)))
        active_km = KMeans(n_clusters=safe_k, random_state=42, n_init=10)
        cluster_labels = active_km.fit_predict(X_scaled)

        active_sil = round(float(silhouette_score(X_scaled, cluster_labels)), 4)
        active_db = round(float(davies_bouldin_score(X_scaled, cluster_labels)), 4)
        active_inertia = round(float(active_km.inertia_), 2)

        # ---------------------------------------------------------------------
        # 3. CENTROIDS & CLUSTER PROFILES
        # ---------------------------------------------------------------------
        df_clustered = df.copy()
        df_clustered["cluster"] = cluster_labels

        if use_scaling and scaler is not None:
            centroids_unscaled = scaler.inverse_transform(active_km.cluster_centers_)
        else:
            centroids_unscaled = active_km.cluster_centers_

        cluster_profiles = []
        cluster_distribution = []

        for c_id in range(safe_k):
            c_df = df_clustered[df_clustered["cluster"] == c_id]
            c_count = len(c_df)
            c_pct = round(c_count / total_rows * 100, 1)

            feat_stats = {}
            for feat_idx, feat in enumerate(valid_feats):
                feat_stats[feat] = {
                    "label": cls.FEATURE_CONFIG[feat]["name"],
                    "short": cls.FEATURE_CONFIG[feat]["short"],
                    "unit": cls.FEATURE_CONFIG[feat]["unit"],
                    "mean": round(float(c_df[feat].mean()), 2),
                    "median": round(float(c_df[feat].median()), 2),
                    "std": round(float(c_df[feat].std()), 2),
                    "min": round(float(c_df[feat].min()), 2),
                    "max": round(float(c_df[feat].max()), 2),
                    "centroid": round(float(centroids_unscaled[c_id, feat_idx]), 2)
                }

            cluster_profiles.append({
                "cluster_id": c_id,
                "cluster_name": f"Cluster {c_id}",
                "color": cls.CLUSTER_PALETTE[c_id % len(cls.CLUSTER_PALETTE)],
                "donor_count": c_count,
                "percentage": c_pct,
                "feature_stats": feat_stats,
                "return_rate_pct": round(float(c_df["donated_march_2007"].mean()) * 100, 1)
            })

            cluster_distribution.append({
                "cluster_name": f"Cluster {c_id}",
                "donor_count": c_count,
                "percentage": c_pct,
                "color": cls.CLUSTER_PALETTE[c_id % len(cls.CLUSTER_PALETTE)]
            })

        # ---------------------------------------------------------------------
        # 4. 2D SCATTER POINTS FOR VISUALIZATION
        # ---------------------------------------------------------------------
        safe_x = x_axis_feature if x_axis_feature in valid_feats else valid_feats[0]
        safe_y = y_axis_feature if y_axis_feature in valid_feats else valid_feats[1]

        x_idx = valid_feats.index(safe_x)
        y_idx = valid_feats.index(safe_y)

        scatter_points = []
        for i, row in df_clustered.iterrows():
            c_id = int(row["cluster"])
            scatter_points.append({
                "id": int(i + 1),
                "x": round(float(row[safe_x]), 1),
                "y": round(float(row[safe_y]), 1),
                "cluster_id": c_id,
                "cluster_name": f"Cluster {c_id}",
                "color": cls.CLUSTER_PALETTE[c_id % len(cls.CLUSTER_PALETTE)],
                "recency": int(row["recency_months"]),
                "frequency": int(row["frequency_times"]),
                "time": int(row["time_months"]),
                "donated": int(row["donated_march_2007"])
            })

        centroids_2d = []
        for c_id in range(safe_k):
            centroids_2d.append({
                "cluster_id": c_id,
                "cluster_name": f"Centroid {c_id}",
                "x": round(float(centroids_unscaled[c_id, x_idx]), 2),
                "y": round(float(centroids_unscaled[c_id, y_idx]), 2),
                "color": cls.CLUSTER_PALETTE[c_id % len(cls.CLUSTER_PALETTE)]
            })

        # ---------------------------------------------------------------------
        # 5. DYNAMIC OBSERVATION
        # ---------------------------------------------------------------------
        best_sil_k = max(silhouette_curve, key=lambda x: x["silhouette"])
        observation = (
            f"K-Means with K={safe_k} partitions {total_rows} donors with Silhouette Score = {active_sil} "
            f"and Davies-Bouldin Index = {active_db}. The highest silhouette score ({best_sil_k['silhouette']}) "
            f"occurs at K={best_sil_k['k']}. Cluster sizes range from {min(c['donor_count'] for c in cluster_profiles)} "
            f"to {max(c['donor_count'] for c in cluster_profiles)} donors."
        )

        return {
            "lab_id": 7,
            "title": "Lab 07: K-Means Clustering & Unsupervised Segmentation",
            "dataset_info": {
                "name": "UCI Blood Transfusion Service Center Dataset",
                "source": "data/raw/transfusion.data",
                "total_records": total_rows,
                "features": [cls.FEATURE_CONFIG[f]["name"] for f in valid_feats],
                "selected_features": valid_feats,
                "standardized": use_scaling
            },
            "parameters": {
                "k": safe_k,
                "x_axis": safe_x,
                "y_axis": safe_y,
                "x_axis_label": cls.FEATURE_CONFIG[safe_x]["name"],
                "y_axis_label": cls.FEATURE_CONFIG[safe_y]["name"],
                "use_scaling": use_scaling
            },
            "metrics": {
                "active_k": safe_k,
                "inertia": active_inertia,
                "silhouette_score": active_sil,
                "davies_bouldin_score": active_db
            },
            "elbow_curve": elbow_curve,
            "silhouette_curve": silhouette_curve,
            "davies_bouldin_curve": davies_bouldin_curve,
            "cluster_distribution": cluster_distribution,
            "cluster_profiles": cluster_profiles,
            "scatter_points": scatter_points,
            "centroids_2d": centroids_2d,
            "observation": observation
        }
