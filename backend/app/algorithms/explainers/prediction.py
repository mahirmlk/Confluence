import numpy as np
from typing import Any


class PredictionExplainer:
    """Explains why a model made a specific prediction."""

    @staticmethod
    def explain_tree(model, point: np.ndarray, feature_names: list[str]) -> dict:
        tree = model.tree_
        path = []
        node = 0
        while tree.children_left[node] != tree.children_right[node]:
            feature = tree.feature[node]
            threshold = tree.threshold[node]
            gini = tree.impurity[node]
            n_samples = tree.n_node_samples[node]
            value = tree.value[node].tolist()[0]

            direction = "left" if point[feature] <= threshold else "right"
            path.append({
                "node_id": int(node),
                "type": "split",
                "feature": feature_names[feature] if feature < len(feature_names) else f"feature_{feature}",
                "feature_idx": int(feature),
                "threshold": round(float(threshold), 4),
                "direction": direction,
                "gini": round(float(gini), 4),
                "samples": int(n_samples),
                "class_counts": [int(v) for v in value],
                "point_value": round(float(point[feature]), 4),
            })
            node = tree.children_left[node] if direction == "left" else tree.children_right[node]

        leaf_value = tree.value[node].tolist()[0]
        path.append({
            "node_id": int(node),
            "type": "leaf",
            "prediction": int(np.argmax(leaf_value)),
            "class_counts": [int(v) for v in leaf_value],
            "samples": int(tree.n_node_samples[node]),
            "confidence": round(float(max(leaf_value) / sum(leaf_value)), 4),
        })
        return {"path": path, "model_type": "tree"}

    @staticmethod
    def explain_linear(model, point: np.ndarray, feature_names: list[str]) -> dict:
        coef = model.coef_[0] if model.coef_.ndim > 1 else model.coef_
        intercept = float(model.intercept_[0]) if hasattr(model.intercept_, '__len__') else float(model.intercept_)

        contributions = []
        for i, (feat_val, weight) in enumerate(zip(point, coef)):
            contrib = float(feat_val * weight)
            fname = feature_names[i] if i < len(feature_names) else f"feature_{i}"
            contributions.append({
                "feature": fname,
                "value": round(float(feat_val), 4),
                "weight": round(float(weight), 4),
                "contribution": round(contrib, 4),
            })

        contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        raw_score = float(np.dot(coef, point) + intercept)

        return {
            "contributions": contributions,
            "intercept": round(intercept, 4),
            "raw_score": round(raw_score, 4),
            "model_type": "linear",
        }

    @staticmethod
    def explain_ensemble(model, point: np.ndarray, feature_names: list[str]) -> dict:
        importances = model.feature_importances_
        top_k = min(5, len(importances))
        top_features = np.argsort(importances)[::-1][:top_k]

        feature_imp = []
        for idx in top_features:
            fname = feature_names[idx] if idx < len(feature_names) else f"feature_{idx}"
            feature_imp.append({
                "feature": fname,
                "importance": round(float(importances[idx]), 4),
            })

        n_sample = min(20, len(model.estimators_))
        tree_preds = []
        for est in model.estimators_[:n_sample]:
            pred = est.predict(point.reshape(1, -1))[0]
            tree_preds.append(int(pred))

        class_counts = {}
        for p in tree_preds:
            class_counts[p] = class_counts.get(p, 0) + 1

        return {
            "feature_importance": feature_imp,
            "tree_agreement": class_counts,
            "n_trees_sampled": n_sample,
            "model_type": "ensemble",
        }

    @staticmethod
    def explain_knn(model, point: np.ndarray, X_train: np.ndarray, y_train: np.ndarray, feature_names: list[str]) -> dict:
        from sklearn.neighbors import NearestNeighbors
        k = model.n_neighbors
        nn = NearestNeighbors(n_neighbors=min(k, len(X_train)))
        nn.fit(X_train)
        distances, indices = nn.kneighbors(point.reshape(1, -1))

        neighbors = []
        for dist, idx in zip(distances[0], indices[0]):
            neighbors.append({
                "index": int(idx),
                "distance": round(float(dist), 4),
                "label": int(y_train[idx]),
                "features": [round(float(v), 4) for v in X_train[idx][:5]],
            })

        return {
            "neighbors": neighbors,
            "k": k,
            "model_type": "knn",
        }

    @staticmethod
    def explain_generic(model, point: np.ndarray, feature_names: list[str]) -> dict:
        prediction = int(model.predict(point.reshape(1, -1))[0])
        proba = model.predict_proba(point.reshape(1, -1))[0].tolist() if hasattr(model, 'predict_proba') else []
        return {
            "prediction": prediction,
            "probabilities": [round(p, 4) for p in proba],
            "model_type": "generic",
        }

    @classmethod
    def explain(cls, model, point: np.ndarray, feature_names: list[str],
                X_train: np.ndarray = None, y_train: np.ndarray = None) -> dict:
        prediction = int(model.predict(point.reshape(1, -1))[0])
        proba = model.predict_proba(point.reshape(1, -1))[0].tolist() if hasattr(model, 'predict_proba') else []

        if hasattr(model, 'tree_'):
            explanation = cls.explain_tree(model, point, feature_names)
        elif hasattr(model, 'coef_'):
            explanation = cls.explain_linear(model, point, feature_names)
        elif hasattr(model, 'estimators_') and hasattr(model, 'feature_importances_'):
            explanation = cls.explain_ensemble(model, point, feature_names)
        elif hasattr(model, 'n_neighbors') and X_train is not None and y_train is not None:
            explanation = cls.explain_knn(model, point, X_train, y_train, feature_names)
        else:
            explanation = cls.explain_generic(model, point, feature_names)

        return {
            "prediction": prediction,
            "probabilities": [round(p, 4) for p in proba],
            "explanation": explanation,
        }
