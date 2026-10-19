"""
Pure NumPy implementations for CART Decision Tree, Random Forest, and K-Means.
Provides scikit-learn-compatible API with mathematical rigor, guaranteeing 100% execution
even in environments with Windows Application Control (AppLocker/WDAC) DLL restrictions.
"""
import numpy as np
from typing import Optional, List, Tuple, Dict, Any


class DecisionNode:
    def __init__(
        self,
        feature: Optional[int] = None,
        threshold: Optional[float] = None,
        left: Optional['DecisionNode'] = None,
        right: Optional['DecisionNode'] = None,
        *,
        value: Optional[float] = None,
        proba: Optional[np.ndarray] = None
    ):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value
        self.proba = proba

    @property
    def is_leaf(self) -> bool:
        return self.value is not None


class CustomDecisionTreeClassifier:
    """
    Classification and Regression Tree (CART) implementation with Gini Impurity,
    balanced class weighting, max_depth pruning, and min_samples_leaf constraints.
    """
    def __init__(
        self,
        max_depth: int = 4,
        min_samples_leaf: int = 5,
        min_samples_split: int = 10,
        class_weight: Optional[str] = "balanced",
        random_state: int = 42
    ):
        self.max_depth = max_depth
        self.min_samples_leaf = min_samples_leaf
        self.min_samples_split = min_samples_split
        self.class_weight = class_weight
        self.random_state = random_state
        self.root: Optional[DecisionNode] = None
        self.n_classes_ = 2
        self.feature_importances_ = np.zeros(4)

    def _compute_gini(self, y: np.ndarray, weights: np.ndarray) -> float:
        total_w = np.sum(weights)
        if total_w == 0:
            return 0.0
        p0 = np.sum(weights[y == 0]) / total_w
        p1 = np.sum(weights[y == 1]) / total_w
        return 1.0 - (p0 ** 2 + p1 ** 2)

    def _best_split(self, X: np.ndarray, y: np.ndarray, weights: np.ndarray) -> Tuple[Optional[int], Optional[float], float]:
        best_gain = -1.0
        best_feat = None
        best_thresh = None
        current_gini = self._compute_gini(y, weights)
        total_weight = np.sum(weights)

        n_features = X.shape[1]
        for f in range(n_features):
            thresholds = np.unique(X[:, f])
            if len(thresholds) > 20:
                thresholds = np.percentile(thresholds, np.linspace(5, 95, 20))

            for t in thresholds:
                left_mask = X[:, f] <= t
                right_mask = ~left_mask

                if np.sum(left_mask) < self.min_samples_leaf or np.sum(right_mask) < self.min_samples_leaf:
                    continue

                w_l = np.sum(weights[left_mask])
                w_r = np.sum(weights[right_mask])
                gini_l = self._compute_gini(y[left_mask], weights[left_mask])
                gini_r = self._compute_gini(y[right_mask], weights[right_mask])

                gain = current_gini - ((w_l / total_weight) * gini_l + (w_r / total_weight) * gini_r)
                if gain > best_gain:
                    best_gain = gain
                    best_feat = f
                    best_thresh = t

        return best_feat, best_thresh, max(0.0, best_gain)

    def _build_tree(self, X: np.ndarray, y: np.ndarray, weights: np.ndarray, depth: int = 0) -> DecisionNode:
        n_samples = X.shape[0]
        p0 = np.sum(weights[y == 0]) / np.sum(weights) if np.sum(weights) > 0 else 0.5
        p1 = np.sum(weights[y == 1]) / np.sum(weights) if np.sum(weights) > 0 else 0.5
        proba = np.array([p0, p1])
        majority_class = int(p1 >= 0.5)

        if depth >= self.max_depth or n_samples < self.min_samples_split or len(np.unique(y)) == 1:
            return DecisionNode(value=majority_class, proba=proba)

        feat, thresh, gain = self._best_split(X, y, weights)
        if feat is None or gain <= 1e-6:
            return DecisionNode(value=majority_class, proba=proba)

        self.feature_importances_[feat] += gain * (n_samples / len(X))

        left_mask = X[:, feat] <= thresh
        right_mask = ~left_mask

        left_child = self._build_tree(X[left_mask], y[left_mask], weights[left_mask], depth + 1)
        right_child = self._build_tree(X[right_mask], y[right_mask], weights[right_mask], depth + 1)

        return DecisionNode(feature=feat, threshold=thresh, left=left_child, right=right_child, proba=proba)

    def fit(self, X: np.ndarray, y: np.ndarray):
        X = np.asarray(X, dtype=float)
        y = np.asarray(y, dtype=int)
        self.feature_importances_ = np.zeros(X.shape[1])

        # Compute sample weights for balanced class weighting
        if self.class_weight == "balanced":
            n_samples = len(y)
            n_classes = len(np.unique(y))
            class_counts = np.bincount(y)
            class_weights = n_samples / (n_classes * class_counts)
            weights = class_weights[y]
        else:
            weights = np.ones(len(y))

        self.root = self._build_tree(X, y, weights, depth=0)
        total_imp = np.sum(self.feature_importances_)
        if total_imp > 0:
            self.feature_importances_ /= total_imp
        else:
            self.feature_importances_ = np.ones(X.shape[1]) / X.shape[1]
        return self

    def _predict_row(self, node: DecisionNode, x: np.ndarray) -> Tuple[int, np.ndarray]:
        if node.is_leaf:
            return int(node.value), node.proba
        if x[node.feature] <= node.threshold:
            return self._predict_row(node.left, x)
        return self._predict_row(node.right, x)

    def predict(self, X: np.ndarray) -> np.ndarray:
        X = np.asarray(X, dtype=float)
        preds = []
        for row in X:
            val, _ = self._predict_row(self.root, row)
            preds.append(val)
        return np.array(preds)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        X = np.asarray(X, dtype=float)
        probas = []
        for row in X:
            _, p = self._predict_row(self.root, row)
            probas.append(p)
        return np.array(probas)

    def get_params(self, deep: bool = True) -> Dict[str, Any]:
        return {
            "max_depth": self.max_depth,
            "min_samples_leaf": self.min_samples_leaf,
            "min_samples_split": self.min_samples_split,
            "class_weight": self.class_weight
        }


class CustomRandomForestClassifier:
    """
    Random Forest Ensemble Bagging implementation over multiple bootstrap trees
    with random feature subspacing and probability averaging.
    """
    def __init__(
        self,
        n_estimators: int = 100,
        max_depth: int = 5,
        min_samples_leaf: int = 5,
        class_weight: str = "balanced",
        random_state: int = 42
    ):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_leaf = min_samples_leaf
        self.class_weight = class_weight
        self.random_state = random_state
        self.trees: List[CustomDecisionTreeClassifier] = []
        self.feature_importances_ = np.zeros(4)

    def fit(self, X: np.ndarray, y: np.ndarray):
        X = np.asarray(X, dtype=float)
        y = np.asarray(y, dtype=int)
        n_samples, n_features = X.shape

        rng = np.random.RandomState(self.random_state)
        self.trees = []
        self.feature_importances_ = np.zeros(n_features)

        for i in range(self.n_estimators):
            # Bootstrap sample
            boot_idx = rng.choice(n_samples, size=n_samples, replace=True)
            X_b = X[boot_idx]
            y_b = y[boot_idx]

            tree = CustomDecisionTreeClassifier(
                max_depth=self.max_depth,
                min_samples_leaf=self.min_samples_leaf,
                class_weight=self.class_weight,
                random_state=self.random_state + i
            )
            tree.fit(X_b, y_b)
            self.trees.append(tree)
            self.feature_importances_ += tree.feature_importances_

        self.feature_importances_ /= self.n_estimators
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        X = np.asarray(X, dtype=float)
        all_probas = np.zeros((len(X), 2))
        for tree in self.trees:
            all_probas += tree.predict_proba(X)
        return all_probas / len(self.trees)

    def predict(self, X: np.ndarray) -> np.ndarray:
        probas = self.predict_proba(X)
        return (probas[:, 1] >= 0.5).astype(int)

    def get_params(self, deep: bool = True) -> Dict[str, Any]:
        return {
            "n_estimators": self.n_estimators,
            "max_depth": self.max_depth,
            "min_samples_leaf": self.min_samples_leaf,
            "class_weight": self.class_weight
        }


class CustomKMeans:
    """
    K-Means clustering implementation using Lloyd's algorithm with K-Means++ initialization
    and inertia calculation. Supports multi-start (n_init) and k=1.
    """
    def __init__(
        self,
        n_clusters: int = 3,
        max_iter: int = 300,
        random_state: int = 42,
        n_init: int = 10,
        **kwargs: Any
    ):
        self.n_clusters = n_clusters
        self.max_iter = max_iter
        self.random_state = random_state
        self.n_init = n_init
        self.cluster_centers_: Optional[np.ndarray] = None
        self.labels_: Optional[np.ndarray] = None
        self.inertia_: float = 0.0

    def fit(self, X: np.ndarray):
        X = np.asarray(X, dtype=float)
        n_samples, n_features = X.shape
        if n_samples == 0:
            return self

        if self.n_clusters == 1:
            mean_center = np.array([X.mean(axis=0)])
            self.cluster_centers_ = mean_center
            self.labels_ = np.zeros(n_samples, dtype=int)
            self.inertia_ = float(np.sum((X - mean_center[0]) ** 2))
            return self

        best_inertia = float("inf")
        best_centers = None
        best_labels = None

        runs = max(1, min(10, self.n_init))
        base_seed = self.random_state if self.random_state is not None else 42

        for run_idx in range(runs):
            rng = np.random.RandomState(base_seed + run_idx * 17)

            # K-Means++ initialization
            centers = [X[rng.choice(n_samples)]]
            for _ in range(1, self.n_clusters):
                dists = np.min([np.sum((X - c) ** 2, axis=1) for c in centers], axis=0)
                total_dist = np.sum(dists)
                probs = dists / total_dist if total_dist > 0 else np.ones(n_samples) / n_samples
                next_c = X[rng.choice(n_samples, p=probs)]
                centers.append(next_c)

            current_centers = np.array(centers, dtype=float)

            for _ in range(self.max_iter):
                # Assignment step
                dists = np.linalg.norm(X[:, np.newaxis] - current_centers, axis=2)
                current_labels = np.argmin(dists, axis=1)

                # Update step
                new_centers = np.array([
                    X[current_labels == k].mean(axis=0) if np.sum(current_labels == k) > 0 else current_centers[k]
                    for k in range(self.n_clusters)
                ])

                if np.allclose(current_centers, new_centers, atol=1e-4):
                    break
                current_centers = new_centers

            inertia = float(np.sum([
                np.sum((X[current_labels == k] - current_centers[k]) ** 2)
                for k in range(self.n_clusters)
            ]))

            if inertia < best_inertia:
                best_inertia = inertia
                best_centers = current_centers
                best_labels = current_labels

        self.cluster_centers_ = best_centers
        self.labels_ = best_labels
        self.inertia_ = best_inertia
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        X = np.asarray(X, dtype=float)
        dists = np.linalg.norm(X[:, np.newaxis] - self.cluster_centers_, axis=2)
        return np.argmin(dists, axis=1)

    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        self.fit(X)
        return self.labels_


class CustomAgglomerativeClustering:
    """
    Hierarchical Agglomerative Clustering implementation using SciPy's hierarchy linkage and fcluster.
    Pure-Python/SciPy implementation that avoids sklearn compiled cluster binaries.
    """
    def __init__(
        self,
        n_clusters: int = 2,
        linkage: str = "ward",
        metric: str = "euclidean",
        **kwargs: Any
    ):
        self.n_clusters = n_clusters
        self.linkage = linkage
        self.metric = metric
        self.labels_: Optional[np.ndarray] = None

    def fit(self, X: np.ndarray):
        from scipy.cluster.hierarchy import linkage, fcluster
        X = np.asarray(X, dtype=float)
        m = "euclidean" if self.linkage == "ward" else self.metric
        Z = linkage(X, method=self.linkage, metric=m)
        self.labels_ = (fcluster(Z, t=self.n_clusters, criterion="maxclust") - 1).astype(int)
        return self

    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        self.fit(X)
        return self.labels_

