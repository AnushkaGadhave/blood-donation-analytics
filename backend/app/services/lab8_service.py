"""
Lab 08 Service: Hierarchical Agglomerative Clustering
Executes Agglomerative Clustering on the UCI Blood Transfusion Service Center dataset.
Computes dendrogram hierarchies across 4 linkage methods (Ward, Complete, Average, Single),
evaluates Silhouette and Davies-Bouldin metrics across linkages, and generates cluster scatter profiles.
"""
import logging
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import linkage, dendrogram
try:
    from sklearn.cluster import AgglomerativeClustering
except (ImportError, Exception):
    from app.utils.ml_algorithms import CustomAgglomerativeClustering as AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, davies_bouldin_score

from app.services.data_service import DataService

logger = logging.getLogger("Lab8Service")


class Lab8Service:
    _cached_results: Optional[Dict[str, Any]] = None

    FEATURE_CONFIG = {
        "recency_months": {"name": "Recency (months)", "short": "Recency", "unit": "months"},
        "frequency_times": {"name": "Frequency (times)", "short": "Frequency", "unit": "donations"},
        "monetary_cc": {"name": "Monetary (c.c.)", "short": "Monetary", "unit": "c.c. blood"},
        "time_months": {"name": "Time / Tenure (months)", "short": "Tenure", "unit": "months"}
    }

    LINKAGE_INFO = {
        "ward": {
            "name": "Ward Linkage",
            "metric": "euclidean",
            "description": "Minimizes the total within-cluster variance (sum of squared Euclidean distances).",
            "color": "#7956E8"
        },
        "complete": {
            "name": "Complete Linkage (Maximum)",
            "metric": "euclidean",
            "description": "Uses the maximum pairwise Euclidean distance between observations of two clusters.",
            "color": "#58B8F5"
        },
        "average": {
            "name": "Average Linkage (UPGMA)",
            "metric": "euclidean",
            "description": "Uses the average pairwise distance between all observations of two clusters.",
            "color": "#56C9A5"
        },
        "single": {
            "name": "Single Linkage (Minimum)",
            "metric": "euclidean",
            "description": "Uses the minimum distance between any single pair of points in two clusters (chaining tendency).",
            "color": "#FF786B"
        }
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
    def execute_hierarchical_suite(
        cls,
        k: int = 4,
        linkage_method: str = "ward",
        features: Optional[List[str]] = None,
        x_axis_feature: str = "recency_months",
        y_axis_feature: str = "frequency_times",
        force_refresh: bool = False
    ) -> Dict[str, Any]:
        """
        Executes complete Hierarchical Clustering workflow:
        1. Feature scaling
        2. Linkage matrix computation for all 4 methods
        3. Dendrogram data structure generation
        4. Benchmarking metrics (Silhouette & Davies-Bouldin) across 4 linkages
        5. Cluster assignments, cluster sizes, and scatter plot for active linkage
        """
        df = DataService.load_dataset()
        total_rows = len(df)

        available_features = list(cls.FEATURE_CONFIG.keys())
        selected_feats = features or ["recency_months", "frequency_times", "time_months"]
        valid_feats = [f for f in selected_feats if f in available_features]
        if len(valid_feats) < 2:
            valid_feats = ["recency_months", "frequency_times", "time_months"]

        X_raw = df[valid_feats].values
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_raw)

        safe_k = max(2, min(8, int(k)))
        active_linkage = linkage_method.lower() if linkage_method.lower() in cls.LINKAGE_INFO else "ward"

        # ---------------------------------------------------------------------
        # 1. 4-LINKAGE BENCHMARK EVALUATION & LINKAGE MATRICES
        # ---------------------------------------------------------------------
        linkage_benchmarks = []
        linkage_matrices: Dict[str, Any] = {}

        for l_method, l_meta in cls.LINKAGE_INFO.items():
            Z = linkage(X_scaled, method=l_method, metric=l_meta["metric"])
            linkage_matrices[l_method] = Z

            agg = AgglomerativeClustering(n_clusters=safe_k, linkage=l_method)
            labels = agg.fit_predict(X_scaled)

            sil = round(float(silhouette_score(X_scaled, labels)), 4)
            db = round(float(davies_bouldin_score(X_scaled, labels)), 4)

            linkage_benchmarks.append({
                "method_key": l_method,
                "method_name": l_meta["name"],
                "description": l_meta["description"],
                "silhouette_score": sil,
                "davies_bouldin": db,
                "color": l_meta["color"],
                "is_active": (l_method == active_linkage)
            })

        # Sort benchmarks by silhouette descending
        best_linkage = max(linkage_benchmarks, key=lambda x: x["silhouette_score"])

        # ---------------------------------------------------------------------
        # 2. DENDROGRAM GENERATION FOR ACTIVE LINKAGE (Representative Sample for UI)
        # ---------------------------------------------------------------------
        # Downsample to 40 representative donors to maintain fast and crisp SVG rendering in browser
        np.random.seed(42)
        sample_indices = np.random.choice(total_rows, size=min(40, total_rows), replace=False)
        X_sample_scaled = X_scaled[sample_indices]

        Z_sample = linkage(X_sample_scaled, method=active_linkage, metric=cls.LINKAGE_INFO[active_linkage]["metric"])
        dendro_dict = dendrogram(Z_sample, no_plot=True)

        # Structure dendrogram paths for SVG rendering
        dendrogram_lines = []
        for xs, ys in zip(dendro_dict["icoord"], dendro_dict["dcoord"]):
            # xs: [x1, x1, x2, x2], ys: [y1, y2, y2, y1]
            dendrogram_lines.append({
                "x_coords": [round(float(x), 2) for x in xs],
                "y_coords": [round(float(y), 2) for y in ys]
            })

        # Cut threshold height approximation for K clusters
        # The (N - K)th merge height in linkage matrix represents the cut threshold
        cut_height = round(float(Z_sample[-(safe_k - 1), 2]), 2) if safe_k > 1 else 0.0

        # ---------------------------------------------------------------------
        # 3. ACTIVE LINKAGE CLUSTERING & PROFILES
        # ---------------------------------------------------------------------
        active_agg = AgglomerativeClustering(n_clusters=safe_k, linkage=active_linkage)
        active_labels = active_agg.fit_predict(X_scaled)

        df_clustered = df.copy()
        df_clustered["cluster"] = active_labels

        cluster_profiles = []
        cluster_distribution = []

        for c_id in range(safe_k):
            c_df = df_clustered[df_clustered["cluster"] == c_id]
            c_count = len(c_df)
            c_pct = round(c_count / total_rows * 100, 1)

            feat_stats = {}
            for feat in valid_feats:
                feat_stats[feat] = {
                    "label": cls.FEATURE_CONFIG[feat]["name"],
                    "short": cls.FEATURE_CONFIG[feat]["short"],
                    "unit": cls.FEATURE_CONFIG[feat]["unit"],
                    "mean": round(float(c_df[feat].mean()), 2),
                    "median": round(float(c_df[feat].median()), 2),
                    "min": round(float(c_df[feat].min()), 2),
                    "max": round(float(c_df[feat].max()), 2)
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
        # 4. 2D SCATTER POINTS FOR ACTIVE CLUSTERING
        # ---------------------------------------------------------------------
        safe_x = x_axis_feature if x_axis_feature in valid_feats else valid_feats[0]
        safe_y = y_axis_feature if y_axis_feature in valid_feats else valid_feats[1]

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

        # ---------------------------------------------------------------------
        # 5. DYNAMIC OBSERVATION
        # ---------------------------------------------------------------------
        active_bench = next(b for b in linkage_benchmarks if b["method_key"] == active_linkage)
        observation = (
            f"Hierarchical Clustering with '{active_bench['method_name']}' at K={safe_k} yields "
            f"Silhouette Score = {active_bench['silhouette_score']} and Davies-Bouldin = {active_bench['davies_bouldin']}. "
            f"Across all four linkage strategies, '{best_linkage['method_name']}' achieves the highest silhouette score "
            f"({best_linkage['silhouette_score']}). Cluster sizes for '{active_bench['method_name']}' span from "
            f"{min(c['donor_count'] for c in cluster_profiles)} to {max(c['donor_count'] for c in cluster_profiles)} donors."
        )

        return {
            "lab_id": 8,
            "title": "Lab 08: Hierarchical Agglomerative Clustering & Dendrograms",
            "dataset_info": {
                "name": "UCI Blood Transfusion Service Center Dataset",
                "source": "data/raw/transfusion.data",
                "total_records": total_rows,
                "features": [cls.FEATURE_CONFIG[f]["name"] for f in valid_feats],
                "selected_features": valid_feats,
                "standardized": True
            },
            "parameters": {
                "k": safe_k,
                "linkage_method": active_linkage,
                "linkage_name": cls.LINKAGE_INFO[active_linkage]["name"],
                "x_axis": safe_x,
                "y_axis": safe_y,
                "x_axis_label": cls.FEATURE_CONFIG[safe_x]["name"],
                "y_axis_label": cls.FEATURE_CONFIG[safe_y]["name"]
            },
            "benchmarks": linkage_benchmarks,
            "best_linkage": best_linkage["method_name"],
            "dendrogram": {
                "lines": dendrogram_lines,
                "cut_threshold": cut_height,
                "sample_size": len(sample_indices),
                "linkage_name": cls.LINKAGE_INFO[active_linkage]["name"]
            },
            "cluster_distribution": cluster_distribution,
            "cluster_profiles": cluster_profiles,
            "scatter_points": scatter_points,
            "observation": observation
        }
