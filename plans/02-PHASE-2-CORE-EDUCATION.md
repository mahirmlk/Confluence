# Phase 2: Core Education — Explain Predictions, Learning Mode, Tree Builder, Metric Explanations

## Goal
Make every visualization educational. Users should understand *why* the model makes each decision, *how* it learns, and *what* each metric means. This phase turns Confluence from a visualization tool into a learning platform.

**Dependencies:** Phase 1 (dataset system)

---

## 2A: Explain Every Prediction (Backend + Frontend)

### Backend

**File:** `backend/app/algorithms/explainers.py` (new)

Create explainers for each algorithm family:

```python
class PredictionExplainer:
    """Explains why a model made a specific prediction."""

    @staticmethod
    def explain_tree(model, point: np.ndarray, feature_names: list[str]) -> dict:
        """Full decision path with Gini/entropy at each node."""
        tree = model.tree_
        path = []
        node = 0
        while tree.children_left[node] != tree.children_right[node]:
            feature = tree.feature[node]
            threshold = tree.threshold[node]
            gini = tree.impurity[node]
            n_samples = tree.n_node_samples[node]

            direction = "left" if point[feature] <= threshold else "right"
            path.append({
                "node_id": node,
                "feature": feature_names[feature],
                "feature_idx": feature,
                "threshold": round(threshold, 4),
                "direction": direction,
                "gini_before": round(gini, 4),
                "samples_at_node": int(n_samples),
                "value": tree.value[node].tolist(),
            })
            node = tree.children_left[node] if direction == "left" else tree.children_right[node]

        # Leaf node
        path.append({
            "node_id": node,
            "is_leaf": True,
            "prediction": int(tree.value[node].argmax()),
            "class_counts": tree.value[node].tolist()[0],
            "samples_at_leaf": int(tree.n_node_samples[node]),
        })
        return {"path": path, "model_type": "tree"}

    @staticmethod
    def explain_linear(model, point: np.ndarray, feature_names: list[str]) -> dict:
        """Show contribution of each feature to the decision."""
        coef = model.coef_[0] if model.coef_.ndim > 1 else model.coef_
        intercept = float(model.intercept_[0]) if hasattr(model.intercept_, '__len__') else float(model.intercept_)

        contributions = []
        for i, (feat_val, weight) in enumerate(zip(point, coef)):
            contrib = float(feat_val * weight)
            contributions.append({
                "feature": feature_names[i],
                "value": round(float(feat_val), 4),
                "weight": round(float(weight), 4),
                "contribution": round(contrib, 4),
            })

        contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        return {
            "contributions": contributions,
            "intercept": round(intercept, 4),
            "raw_score": round(float(np.dot(coef, point) + intercept), 4),
            "model_type": "linear",
        }

    @staticmethod
    def explain_ensemble(model, point: np.ndarray, feature_names: list[str]) -> dict:
        """Feature importance + individual tree predictions."""
        importances = model.feature_importances_
        top_features = np.argsort(importances)[::-1][:5]

        feature_imp = []
        for idx in top_features:
            feature_imp.append({
                "feature": feature_names[idx],
                "importance": round(float(importances[idx]), 4),
            })

        # Get individual tree predictions for variance estimate
        tree_preds = [int(est.predict(point.reshape(1, -1))[0]) for est in model.estimators_[:20]]
        class_counts = {}
        for p in tree_preds:
            class_counts[p] = class_counts.get(p, 0) + 1

        return {
            "feature_importance": feature_imp,
            "tree_agreement": class_counts,
            "n_trees_sampled": min(20, len(model.estimators_)),
            "model_type": "ensemble",
        }

    @staticmethod
    def explain_knn(model, point: np.ndarray, X_train: np.ndarray, y_train: np.ndarray, feature_names: list[str]) -> dict:
        """Show nearest neighbors and their influence."""
        from sklearn.neighbors import NearestNeighbors
        k = model.n_neighbors
        nn = NearestNeighbors(n_neighbors=k)
        nn.fit(X_train)
        distances, indices = nn.kneighbors(point.reshape(1, -1))

        neighbors = []
        for dist, idx in zip(distances[0], indices[0]):
            neighbors.append({
                "index": int(idx),
                "distance": round(float(dist), 4),
                "label": int(y_train[idx]),
                "features": [round(float(v), 4) for v in X_train[idx]],
            })

        return {
            "neighbors": neighbors,
            "k": k,
            "model_type": "knn",
        }
```

### New Endpoint

**File:** `backend/app/routers/classification.py` (extend)

```python
@router.post("/explain-prediction")
async def explain_prediction(request: ExplainPredictionRequest):
    """Explain why a specific point was classified a certain way."""
    X, y = generate_dataset(request.dataset_name, ...)
    model = CLASSIFICATION_ALGORITHMS[request.algorithm](request.hyperparameters)
    model.fit(X, y)

    point = np.array(request.point)
    prediction = int(model.predict(point.reshape(1, -1))[0])
    probabilities = model.predict_proba(point.reshape(1, -1))[0].tolist()

    explainer = PredictionExplainer()
    if hasattr(model, 'tree_'):
        explanation = explainer.explain_tree(model, point, feature_names)
    elif hasattr(model, 'coef_'):
        explanation = explainer.explain_linear(model, point, feature_names)
    elif hasattr(model, 'estimators_'):
        explanation = explainer.explain_ensemble(model, point, feature_names)
    else:
        explanation = {"model_type": "other"}

    return {
        "prediction": prediction,
        "probabilities": probabilities,
        "explanation": explanation,
    }
```

### Frontend: Prediction Explanation Panel

**File:** `frontend/src/components/metrics/PredictionExplainer.tsx` (new)

```
┌─────────────────────────────────────┐
│ Prediction Explanation              │
│                                     │
│ Prediction: Class A                 │
│ Probability: 96%                    │
│                                     │
│ Decision Path:                      │
│ Root (Gini: 0.50, n=300)          │
│   ↓ Feature X < 2.3               │
│   Node (Gini: 0.31, n=142)        │
│   ↓ Feature Y > 5.1               │
│   Node (Gini: 0.12, n=67)         │
│   ↓ Leaf → Class A (96%)          │
│                                     │
│ Feature Contributions:              │
│ ████████████░░░ Feature X: +0.42   │
│ ██████░░░░░░░░░ Feature Y: +0.21   │
│ ██░░░░░░░░░░░░░ Feature Z: -0.05   │
│                                     │
│ [Show on Canvas] [Compare Classes]  │
└─────────────────────────────────────┘
```

### Integration
- Click any point on the canvas → opens explanation panel
- Hover over decision boundary → shows which features dominate
- Works for all classification algorithms
- For regression: show feature contributions to prediction value

---

## 2B: Learning Mode (Backend + Frontend)

### Concept
Every visualization should answer "Why?" Hover over any element to get an educational tooltip.

### Backend

**File:** `backend/app/algorithms/learning.py` (new)

```python
class LearningMode:
    """Provides educational context for visual elements."""

    @staticmethod
    def explain_boundary_region(algorithm: str, region_type: str, hyperparams: dict) -> str:
        """Explain why a boundary exists at this location."""
        explanations = {
            "decision-tree": {
                "boundary": "Decision Tree splits here because Gini impurity decreased by {gini_delta:.3f}. "
                           "This split separates {n_left} samples (left) from {n_right} samples (right).",
                "leaf": "This is a leaf node containing {n_samples} samples. "
                       "Prediction: class {pred} ({confidence:.0%} confidence).",
            },
            "logistic-regression": {
                "boundary": "Logistic Regression places the boundary where P(y=1) = 0.5. "
                           "The linear function w·x + b = 0 at this line. "
                           "Weight vector w = [{w0:.3f}, {w1:.3f}] defines the orientation.",
            },
            "knn": {
                "boundary": "KNN boundary shifts based on local class density. "
                           "Here, {k} neighbors vote: {n_class_a} for A, {n_class_b} for B.",
            },
            "svm": {
                "boundary": "SVM places this boundary to maximize the margin between classes. "
                           "The margin width is {margin_width:.3f}. "
                           "{n_support} support vectors define this boundary.",
            },
        }
        # Return contextual explanation based on algorithm and region
        ...

    @staticmethod
    def explain_hyperparameter_effect(algorithm: str, param: str, value: float) -> str:
        """Explain what changing a hyperparameter does."""
        effects = {
            "decision-tree": {
                "max_depth": {
                    "low": "Shallow tree (depth={value}) — simple boundary, may underfit. "
                           "Only {n_splits} splits allowed.",
                    "high": "Deep tree (depth={value}) — complex boundary, may overfit. "
                            "Can create {max_leaves} leaf nodes.",
                },
            },
            "knn": {
                "n_neighbors": {
                    "low": "Small k={value} — captures local patterns, sensitive to noise. "
                           "Boundary is jagged.",
                    "high": "Large k={value} — smoother boundary, may miss local structure. "
                            "Higher bias, lower variance.",
                },
            },
            # ... more
        }
        ...

    @staticmethod
    def explain_metric(metric_name: str, value: float, context: dict) -> dict:
        """Break down a metric into its components."""
        ...
```

### Frontend: Learning Mode Overlay

**File:** `frontend/src/components/controls/LearningMode.tsx` (new)

- Toggle button in toolbar: "Learning Mode: ON/OFF"
- When ON, hover over any visual element to see explanation
- Tooltip appears near cursor with educational content
- Works on: decision boundaries, data points, metric values, hyperparameter sliders

**File:** `frontend/src/components/controls/LearningTooltip.tsx` (new)

```
┌─────────────────────────────────────┐
│ ℹ️ Decision Boundary                │
│                                     │
│ Decision Tree splits here because   │
│ Gini impurity decreased by 0.42.    │
│                                     │
│ This split separates 142 samples    │
│ (left) from 158 samples (right).    │
│                                     │
│ Left: 89% Class A, 11% Class B     │
│ Right: 12% Class A, 88% Class B    │
└─────────────────────────────────────┘
```

### Implementation
- Learning mode state in Zustand store
- Canvas overlay renders tooltips on hover
- Hyperparameter sliders show effect descriptions
- Metric values show breakdown on click

---

## 2C: Step-by-Step Tree Builder (Backend + Frontend)

### Backend

**File:** `backend/app/routers/streaming.py` (extend)

Add a new WebSocket endpoint for tree construction animation:

```python
@router.websocket("/ws/tree-build")
async def stream_tree_build(websocket: WebSocket):
    """Stream decision tree construction step by step."""
    await websocket.accept()
    data = await websocket.receive_json()

    X, y = generate_dataset(data["dataset_name"], ...)
    max_depth = int(data.get("max_depth", 5))

    for depth in range(1, max_depth + 1):
        model = DecisionTreeClassifier(max_depth=depth, random_state=42)
        model.fit(X, y)

        # Extract tree structure
        tree_data = extract_tree_structure(model, feature_names)

        # Compute decision boundary
        grid_points = np.column_stack([xx.ravel(), yy.ravel()])
        probas = model.predict_proba(grid_points)
        grid = probas[:, 1].reshape(xx.shape) if probas.shape[1] == 2 else probas.argmax(axis=1).reshape(xx.shape)

        await websocket.send_json({
            "type": "step",
            "depth": depth,
            "tree": tree_data,
            "grid": grid.tolist(),
            "metrics": {
                "train_accuracy": float(accuracy_score(y, model.predict(X))),
                "n_leaves": int(model.get_n_leaves()),
                "n_nodes": int(model.tree_.node_count),
            },
        })
        await asyncio.sleep(0.5)

    await websocket.send_json({"type": "done"})


def extract_tree_structure(model, feature_names: list[str]) -> dict:
    """Extract tree as nested dict for visualization."""
    tree = model.tree_

    def build_node(node_id):
        if tree.children_left[node_id] == tree.children_right[node_id]:
            return {
                "id": node_id,
                "type": "leaf",
                "prediction": int(tree.value[node_id].argmax()),
                "samples": int(tree.n_node_samples[node_id]),
                "gini": round(float(tree.impurity[node_id]), 4),
            }
        return {
            "id": node_id,
            "type": "split",
            "feature": feature_names[tree.feature[node_id]],
            "threshold": round(float(tree.threshold[node_id]), 4),
            "gini": round(float(tree.impurity[node_id]), 4),
            "samples": int(tree.n_node_samples[node_id]),
            "left": build_node(tree.children_left[node_id]),
            "right": build_node(tree.children_right[node_id]),
        }

    return build_node(0)
```

### Frontend: Tree Builder Animation

**File:** `frontend/src/components/streaming/TreeBuilder.tsx` (new)

```
┌─────────────────────────────────────────────────┐
│ Step-by-Step Tree Builder                        │
│                                                  │
│ Depth: 3/5  [◀] [▶] [▶▶] [Reset]               │
│                                                  │
│ ┌──────────────────┐  ┌──────────────────────┐  │
│ │   Tree Diagram   │  │  Decision Boundary   │  │
│ │                  │  │                      │  │
│ │    [Root]        │  │   (canvas showing    │  │
│ │   /      \       │  │    boundary at       │  │
│ │ [L]     [R]      │  │    current depth)    │  │
│ │  /\     /  \     │  │                      │  │
│ │ [L][L] [R]  [R]  │  │                      │  │
│ └──────────────────┘  └──────────────────────┘  │
│                                                  │
│ Split Info:                                      │
│ Feature X ≤ 2.3 | Gini: 0.50 → 0.31            │
│ Samples: 300 → 142 + 158                         │
│                                                  │
│ Metrics:                                         │
│ Train Accuracy: 94.2% | Leaves: 8 | Nodes: 15   │
└─────────────────────────────────────────────────┘
```

### Tree Visualization Component

**File:** `frontend/src/components/canvas/TreeVisualization.tsx` (new)

- SVG-based tree diagram
- Nodes show: feature, threshold, gini, samples
- Leaves show: prediction, confidence, class distribution
- Highlight the current split being animated
- Click a node to see detailed statistics

### Integration
- New tab in streaming section: "Tree Builder"
- Works for Decision Tree, Random Forest (show first tree)
- Animated: each step adds one level of depth
- Synced: tree diagram and boundary canvas update together

---

## 2D: Explain Every Metric (Backend + Frontend)

### Backend

**File:** `backend/app/algorithms/metric_explainer.py` (new)

```python
class MetricExplainer:
    """Breaks down metrics into understandable components."""

    @staticmethod
    def explain_accuracy(y_true, y_pred) -> dict:
        correct = int(np.sum(y_true == y_pred))
        total = len(y_true)
        return {
            "value": round(correct / total, 4),
            "formula": "correct / total",
            "calculation": f"{correct} / {total}",
            "explanation": f"Out of {total} predictions, {correct} were correct.",
            "breakdown_by_class": MetricExplainer._per_class_breakdown(y_true, y_pred),
        }

    @staticmethod
    def explain_precision(y_true, y_pred, class_label=1) -> dict:
        tp = int(np.sum((y_pred == class_label) & (y_true == class_label)))
        fp = int(np.sum((y_pred == class_label) & (y_true != class_label)))
        return {
            "value": round(tp / (tp + fp) if (tp + fp) > 0 else 0, 4),
            "formula": "TP / (TP + FP)",
            "calculation": f"{tp} / ({tp} + {fp})",
            "explanation": f"Of the {tp + fp} samples predicted as class {class_label}, "
                          f"{tp} were actually class {class_label}.",
            "tp": tp, "fp": fp,
        }

    @staticmethod
    def explain_recall(y_true, y_pred, class_label=1) -> dict:
        tp = int(np.sum((y_pred == class_label) & (y_true == class_label)))
        fn = int(np.sum((y_pred != class_label) & (y_true == class_label)))
        return {
            "value": round(tp / (tp + fn) if (tp + fn) > 0 else 0, 4),
            "formula": "TP / (TP + FN)",
            "calculation": f"{tp} / ({tp} + {fn})",
            "explanation": f"Of the {tp + fn} actual class {class_label} samples, "
                          f"{tp} were correctly identified.",
            "tp": tp, "fn": fn,
        }

    @staticmethod
    def explain_f1(y_true, y_pred) -> dict:
        p = MetricExplainer.explain_precision(y_true, y_pred)
        r = MetricExplainer.explain_recall(y_true, y_pred)
        f1 = 2 * p["value"] * r["value"] / (p["value"] + r["value"]) if (p["value"] + r["value"]) > 0 else 0
        return {
            "value": round(f1, 4),
            "formula": "2 * (precision * recall) / (precision + recall)",
            "calculation": f"2 * ({p['value']:.4f} * {r['value']:.4f}) / ({p['value']:.4f} + {r['value']:.4f})",
            "explanation": "Harmonic mean of precision and recall. Balances both metrics.",
            "precision": p, "recall": r,
        }

    @staticmethod
    def explain_confusion_matrix(cm: list[list[int]]) -> dict:
        n = len(cm)
        total = sum(sum(row) for row in cm)
        details = []
        for i in range(n):
            for j in range(n):
                label = "TP" if i == j == 1 else "TN" if i == j == 0 else "FP" if j == 1 else "FN"
                details.append({
                    "actual": i, "predicted": j,
                    "count": cm[i][j],
                    "percentage": round(cm[i][j] / total * 100, 1),
                    "label": label if n == 2 else f"({i},{j})",
                })
        return {"details": details, "total": total}

    @staticmethod
    def explain_r2(y_true, y_pred) -> dict:
        ss_res = float(np.sum((y_true - y_pred) ** 2))
        ss_tot = float(np.sum((y_true - np.mean(y_true)) ** 2))
        r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0
        return {
            "value": round(r2, 4),
            "formula": "1 - SS_res / SS_tot",
            "calculation": f"1 - {ss_res:.2f} / {ss_tot:.2f}",
            "explanation": f"The model explains {r2*100:.1f}% of the variance in the target.",
            "ss_res": round(ss_res, 2), "ss_tot": round(ss_tot, 2),
        }
```

### New Endpoint

```python
@router.post("/api/v2/explain-metric")
async def explain_metric(request: ExplainMetricRequest):
    """Provide detailed breakdown of a metric."""
    ...
```

### Frontend: Metric Explanation Modal

**File:** `frontend/src/components/metrics/MetricExplainer.tsx` (new)

When user clicks on any metric value:

```
┌─────────────────────────────────────┐
│ Accuracy: 92%                       │
│                                     │
│ Why 92%?                            │
│                                     │
│ Formula: correct / total            │
│ Calculation: 276 / 300              │
│                                     │
│ Out of 300 predictions, 276 were    │
│ correct.                            │
│                                     │
│ Breakdown by Class:                 │
│ Class A: 142/150 correct (94.7%)    │
│ Class B: 134/150 correct (89.3%)    │
│                                     │
│ Class B has more errors — consider   │
│ if this matters for your use case.   │
│                                     │
│ [Show Misclassified Points]         │
└─────────────────────────────────────┘
```

### Integration
- Every metric card becomes clickable
- Click opens explanation modal with formula, calculation, interpretation
- "Show Misclassified Points" highlights errors on canvas
- Works for classification (accuracy, precision, recall, F1) and regression (R2, MSE, MAE)

---

## Phase 2 Verification

- [ ] Click any data point → prediction explanation appears
- [ ] Decision path shows correct tree traversal for tree-based models
- [ ] Feature contributions shown for linear models
- [ ] Nearest neighbors shown for KNN
- [ ] Learning mode tooltips appear on hover over boundaries
- [ ] Tree builder animates depth-by-depth construction
- [ ] Tree diagram syncs with boundary canvas
- [ ] Click any metric → detailed explanation modal
- [ ] Metric calculations are mathematically correct
- [ ] All existing features still work
- [ ] New tests for explainer logic
