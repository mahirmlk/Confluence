# Phase 3: Training & Visualization — Training Playground, Interactive Matrices, ROC/PR, Wrong Predictions

## Goal
Let users watch algorithms train in real-time, interact with confusion matrices and ROC curves, and understand wrong predictions. This phase makes the learning process visible and tangible.

**Dependencies:** Phase 1 (dataset system)

---

## 3A: Training Playground (Backend + Frontend)

### Concept
Don't just show the final decision boundary — animate how the model learns. Each algorithm family gets its own training animation.

### Backend

**File:** `backend/app/routers/training.py` (new)

New WebSocket endpoint with richer training data than existing streaming:

```python
@router.websocket("/ws/training-playground")
async def training_playground(ws: WebSocket):
    """Rich training animation with loss curves, weights, and metrics."""
    await ws.accept()
    data = await ws.receive_json()
    algorithm = data["algorithm"]
    params = data.get("hyperparameters", {})
    dataset_name = data.get("dataset_name", "blobs")

    X, y = generate_dataset(dataset_name, ...)

    if algorithm == "logistic-regression":
        await stream_logistic_regression(ws, X, y, params)
    elif algorithm == "mlp":
        await stream_mlp_training(ws, X, y, params)
    elif algorithm == "decision-tree":
        await stream_tree_growth(ws, X, y, params)
    elif algorithm in ("gradient-boosting", "adaboost", "random-forest"):
        await stream_ensemble_training(ws, algorithm, X, y, params)
    elif algorithm in ("kmeans",):
        await stream_kmeans_iterations(ws, X, y, params)
```

#### Logistic Regression Animation
```python
async def stream_logistic_regression(ws, X, y, params):
    """Stream gradient descent iterations with loss curve."""
    from sklearn.linear_model import SGDClassifier

    n_epochs = int(params.get("n_epochs", 50))
    model = SGDClassifier(loss="log_loss", random_state=42, warm_start=True)

    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), 80)

    losses = []
    for epoch in range(1, n_epochs + 1):
        model.fit(X, y)

        # Compute grid
        grid_points = np.column_stack([xx.ravel(), yy.ravel()])
        probas = model.predict_proba(grid_points)
        grid = probas[:, 1].reshape(xx.shape) if probas.shape[1] == 2 else probas.argmax(axis=1).reshape(xx.shape)

        # Compute loss
        y_pred_proba = model.predict_proba(X)
        loss = float(log_loss(y, y_pred_proba))
        losses.append(loss)

        # Get weights
        coef = model.coef_[0].tolist() if hasattr(model, 'coef_') else []
        intercept = float(model.intercept_[0]) if hasattr(model, 'intercept_') else 0

        await ws.send_json({
            "type": "frame",
            "epoch": epoch,
            "total_epochs": n_epochs,
            "grid": grid.tolist(),
            "loss": loss,
            "loss_history": losses,
            "weights": {"coef": coef, "intercept": intercept},
            "train_accuracy": float(accuracy_score(y, model.predict(X))),
        })
        await asyncio.sleep(0.08)

    await ws.send_json({"type": "done"})
```

#### MLP Training Animation
```python
async def stream_mlp_training(ws, X, y, params):
    """Stream neural network training with weight snapshots."""
    from sklearn.neural_network import MLPClassifier

    max_epochs = int(params.get("max_epochs", 100))
    hidden_size = int(params.get("hidden_layer_sizes", 50))

    model = MLPClassifier(
        hidden_layer_sizes=(hidden_size,),
        max_iter=1, warm_start=True, random_state=42
    )

    for epoch in range(1, max_epochs + 1):
        model.fit(X, y)

        # Get hidden layer activations for visualization
        activations = get_mlp_activations(model, X[:50])  # First 50 points

        # Grid prediction
        grid_points = np.column_stack([xx.ravel(), yy.ravel()])
        probas = model.predict_proba(grid_points)
        grid = ...

        await ws.send_json({
            "type": "frame",
            "epoch": epoch,
            "grid": grid.tolist(),
            "loss": float(model.loss_),
            "n_layers": len(model.coefs_),
            "layer_sizes": [coef.shape for coef in model.coefs_],
            "weight_norms": [float(np.linalg.norm(coef)) for coef in model.coefs_],
            "activations_sample": activations.tolist(),
        })
        await asyncio.sleep(0.1)
```

#### K-Means Iteration Animation
```python
async def stream_kmeans_iterations(ws, X, y, params):
    """Stream K-Means iterations showing centroid movement."""
    from sklearn.cluster import KMeans

    n_clusters = int(params.get("n_clusters", 3))
    max_iter = int(params.get("max_iter", 20))

    # Manual iteration to capture centroids at each step
    rng = np.random.RandomState(42)
    initial_idx = rng.choice(len(X), n_clusters, replace=False)
    centroids = X[initial_idx].copy()

    for iteration in range(max_iter):
        # Assign
        distances = np.linalg.norm(X[:, np.newaxis] - centroids, axis=2)
        labels = distances.argmin(axis=1)

        # Update
        new_centroids = np.array([X[labels == k].mean(axis=0) if np.sum(labels == k) > 0 else centroids[k]
                                   for k in range(n_clusters)])

        inertia = float(np.sum((X - centroids[labels]) ** 2))

        await ws.send_json({
            "type": "frame",
            "iteration": iteration + 1,
            "labels": labels.tolist(),
            "centroids": centroids.tolist(),
            "new_centroids": new_centroids.tolist(),
            "inertia": inertia,
            "movement": float(np.linalg.norm(new_centroids - centroids)),
        })

        if np.allclose(centroids, new_centroids, atol=1e-6):
            await ws.send_json({"type": "converged", "iteration": iteration + 1})
            break

        centroids = new_centroids
        await asyncio.sleep(0.3)

    await ws.send_json({"type": "done"})
```

### Frontend: Training Playground

**File:** `frontend/src/components/training/TrainingPlayground.tsx` (new)

```
┌─────────────────────────────────────────────────────────┐
│ Training Playground                                      │
│                                                          │
│ Algorithm: [Logistic Regression ▼]  Dataset: [Moons ▼]  │
│                                                          │
│ ┌─────────────────────┐  ┌─────────────────────────┐    │
│ │  Decision Boundary   │  │  Loss Curve             │    │
│ │  (animated canvas)   │  │  ┌───────────────────┐  │    │
│ │                      │  │  │ ╲                 │  │    │
│ │  [boundary moving    │  │  │  ╲                │  │    │
│ │   as model learns]   │  │  │   ╲_______________│  │    │
│ │                      │  │  └───────────────────┘  │    │
│ └─────────────────────┘  └─────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Controls: [◀] [▶] [▶▶] [⏸] [Reset]  Speed: 1x    │  │
│ │ Epoch: 23/50  Loss: 0.342  Accuracy: 87.2%         │  │
│ │                                                     │  │
│ │ Weight Evolution:                                   │  │
│ │ w1: ████████░░░░ 0.42    w2: ██████░░░░░░ 0.21     │  │
│ │ b:  ██░░░░░░░░░ 0.05                               │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Algorithm-Specific Panels:                          │  │
│ │ • Logistic Regression: weight vectors, loss curve   │  │
│ │ • MLP: layer activations, weight norms              │  │
│ │ • Decision Tree: tree growth, split visualization   │  │
│ │ • K-Means: centroid movement, inertia decrease      │  │
│ │ • Ensemble: per-learner contribution                │  │
│ └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Sub-Components

**File:** `frontend/src/components/training/LossCurve.tsx` (new)
- Real-time loss curve with history
- Animated line drawing
- Hover to see exact values

**File:** `frontend/src/components/training/WeightVisualizer.tsx` (new)
- Bar chart of weight magnitudes
- Animated weight updates
- For MLP: layer-by-layer weight norms

**File:** `frontend/src/components/training/CentroidTracker.tsx` (new)
- Show centroid positions on canvas
- Animate centroid movement between iterations
- Draw assignment lines (point → centroid)

### Playback Controls
- Step forward/back
- Play/pause
- Speed control (0.5x, 1x, 2x, 4x)
- Reset
- Scrubber timeline

---

## 3B: Interactive Confusion Matrix (Frontend)

### Concept
Click on any cell in the confusion matrix to highlight those specific data points on the canvas.

### Frontend

**File:** `frontend/src/components/metrics/InteractiveConfusionMatrix.tsx` (new)

Replace existing `ConfusionMatrix.tsx` with interactive version:

```
┌─────────────────────────────────────┐
│ Interactive Confusion Matrix        │
│                                     │
│              Predicted              │
│              A      B               │
│ Actual A  [ 142 ] [   8 ]          │
│ Actual B  [  12 ] [ 138 ]          │
│                                     │
│ Click any cell to see those points  │
│ on the visualization.               │
│                                     │
│ Selected: False Positives (12)      │
│ → 12 points highlighted on canvas   │
└─────────────────────────────────────┘
```

### Implementation Details

1. Extend `ClassificationMetrics` response to include per-sample predictions:
```python
# In backend metrics computation
y_pred_per_sample = y_pred.tolist()
y_true_per_sample = y.tolist()
```

2. New endpoint to get misclassified sample indices:
```python
@router.post("/api/v2/misclassified-samples")
async def get_misclassified_samples(request: MisclassifiedRequest):
    """Return indices of TP, FP, FN, TN samples."""
    ...
```

3. Canvas overlay to highlight selected points:
```typescript
// When user clicks "FP" cell, highlight all FP points on canvas
const highlightFilter = (point, index) => {
  return y_pred[index] === 1 && y_true[index] === 0; // FP
};
```

### Interaction Matrix

| Click | Highlight | Description |
|-------|-----------|-------------|
| TP cell | Green dots | Correctly predicted positive |
| TN cell | Green dots | Correctly predicted negative |
| FP cell | Red dots | Incorrectly predicted positive (Type I) |
| FN cell | Red dots | Incorrectly predicted negative (Type II) |

### Integration
- Replace existing ConfusionMatrix with InteractiveConfusionMatrix
- Canvas shows highlighted points as larger, colored markers
- Tooltip on each cell: "12 samples — click to highlight"
- Works with multi-class (click any off-diagonal cell)

---

## 3C: Interactive ROC & PR Curves (Frontend)

### Concept
Hover over any point on the ROC curve to see the threshold, precision, recall, FPR, TPR, and the corresponding predictions.

### Frontend

**File:** `frontend/src/components/metrics/InteractiveROCCurve.tsx` (new)

```
┌─────────────────────────────────────┐
│ ROC Curve (AUC = 0.94)              │
│                                     │
│ TPR ┌───────────────────────┐       │
│ 1.0 │       ●───────────────│       │
│     │     ╱                 │       │
│ 0.8 │   ╱   ← hover here   │       │
│     │  ╱                    │       │
│ 0.6 │ ╱                     │       │
│     │╱                      │       │
│ 0.4 │                       │       │
│     │                       │       │
│ 0.2 │                       │       │
│     │                       │       │
│ 0.0 └───────────────────────┘       │
│     0.0  0.2  0.4  0.6  0.8  1.0   │
│                    FPR              │
│                                     │
│ Threshold: 0.42                     │
│ TPR: 0.88  FPR: 0.12               │
│ Precision: 0.91  Recall: 0.88       │
│ → 23 TP, 3 FN, 5 FP, 169 TN       │
└─────────────────────────────────────┘
```

### Backend

Add threshold-aware endpoint:
```python
@router.post("/api/v2/roc-at-threshold")
async def get_roc_at_threshold(request: ROCThresholdRequest):
    """Return metrics at a specific threshold."""
    ...
    return {
        "threshold": threshold,
        "tpr": tpr_at_threshold,
        "fpr": fpr_at_threshold,
        "precision": precision_at_threshold,
        "recall": recall_at_threshold,
        "tp": tp, "fp": fp, "fn": fn, "tn": tn,
    }
```

### PR Curve Component

**File:** `frontend/src/components/metrics/InteractivePRCurve.tsx` (new)

Same interaction model but for Precision-Recall curve:
- Hover to see threshold, precision, recall
- Click to highlight corresponding predictions
- Especially useful for imbalanced datasets

### Implementation
- Canvas-based rendering with hover detection
- Vertical line at current threshold position
- Animated transition when hovering
- Tooltip with all metrics at that threshold
- "Highlight on Canvas" button to show those predictions

---

## 3D: Explain Wrong Predictions (Backend + Frontend)

### Backend

**File:** `backend/app/algorithms/wrong_predictions.py` (new)

```python
class WrongPredictionAnalyzer:
    """Analyzes misclassified samples to explain errors."""

    @staticmethod
    def analyze_wrong_predictions(model, X, y, feature_names: list[str]) -> dict:
        y_pred = model.predict(X)
        wrong_mask = y_pred != y
        wrong_indices = np.where(wrong_mask)[0]

        analyses = []
        for idx in wrong_indices[:20]:  # Limit to 20
            point = X[idx]
            expected = int(y[idx])
            predicted = int(y_pred[idx])

            # Get prediction probabilities
            proba = model.predict_proba(point.reshape(1, -1))[0]

            # Find nearest correctly classified points
            correct_mask = ~wrong_mask
            correct_indices = np.where(correct_mask)[0]
            if len(correct_indices) > 0:
                distances = np.linalg.norm(X[correct_indices] - point, axis=1)
                nearest_correct_idx = correct_indices[np.argsort(distances)[:3]]
                nearest_correct = [{
                    "index": int(i),
                    "distance": round(float(distances[np.where(correct_indices == i)[0][0]]), 4),
                    "label": int(y[i]),
                    "features": X[i].tolist(),
                } for i in nearest_correct_idx]
            else:
                nearest_correct = []

            # Decision path (for tree-based models)
            decision_path = []
            if hasattr(model, 'tree_'):
                decision_path = get_tree_path(model, point)

            analyses.append({
                "index": int(idx),
                "features": point.tolist(),
                "expected_class": expected,
                "predicted_class": predicted,
                "probability": round(float(max(proba)), 4),
                "class_probabilities": [round(float(p), 4) for p in proba],
                "decision_path": decision_path,
                "nearest_correct_neighbors": nearest_correct,
                "confidence_gap": round(float(abs(proba[expected] - proba[predicted])), 4),
            })

        return {
            "total_wrong": int(np.sum(wrong_mask)),
            "total_samples": len(y),
            "error_rate": round(float(np.mean(wrong_mask)), 4),
            "analyses": analyses,
        }
```

### New Endpoint

```python
@router.post("/api/v2/explain-wrong-predictions")
async def explain_wrong_predictions(request: WrongPredictionsRequest):
    """Analyze and explain misclassified samples."""
    ...
```

### Frontend: Wrong Prediction Explorer

**File:** `frontend/src/components/metrics/WrongPredictionExplorer.tsx` (new)

```
┌─────────────────────────────────────┐
│ Wrong Predictions (18 / 300 = 6%)   │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ Misclassified Point #3        │   │
│ │                               │   │
│ │ Expected: Class A             │   │
│ │ Predicted: Class B (78%)      │   │
│ │ Class A probability: 22%      │   │
│ │ Confidence gap: 0.56          │   │
│ │                               │   │
│ │ Decision Path:                │   │
│ │ Feature X < 2.3 → left       │   │
│ │ Feature Y > 5.1 → right      │   │
│ │ → Class B (borderline)        │   │
│ │                               │   │
│ │ Nearest Correct Neighbors:    │   │
│ │ #42 (Class A, dist: 0.12)    │   │
│ │ #87 (Class A, dist: 0.18)    │   │
│ │ #103 (Class A, dist: 0.23)   │   │
│ │                               │   │
│ │ [Highlight on Canvas]         │   │
│ └───────────────────────────────┘   │
│                                     │
│ [◀ Prev] 3/18 [Next ▶]            │
└─────────────────────────────────────┘
```

### Integration
- Accessible from metrics panel: "View Wrong Predictions"
- Each wrong prediction shows full analysis
- "Highlight on Canvas" marks the point with a special marker
- "Nearest Correct" shows reference points
- Carousel navigation through all wrong predictions

---

## Phase 3 Verification

- [ ] Training playground animates logistic regression with loss curve
- [ ] Training playground animates MLP with weight updates
- [ ] Training playground animates K-Means with centroid movement
- [ ] Playback controls (step, play, pause, speed) work
- [ ] Confusion matrix cells are clickable
- [ ] Clicking FP highlights false positive points on canvas
- [ ] ROC curve shows threshold info on hover
- [ ] PR curve shows threshold info on hover
- [ ] Wrong prediction explorer shows detailed analysis
- [ ] Nearest correct neighbors computed correctly
- [ ] All existing features still work
- [ ] Performance: animations run at 10+ FPS
