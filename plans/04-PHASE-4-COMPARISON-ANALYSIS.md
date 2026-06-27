# Phase 4: Comparison & Analysis — Hyperparameter Comparison, Algorithm Race, Benchmark Suite

## Goal
Enable side-by-side comparison of hyperparameter effects, run multiple algorithms simultaneously, and benchmark algorithms on standardized metrics. This phase turns Confluence into an analysis workbench.

**Dependencies:** Phase 1 (dataset system)

---

## 4A: Hyperparameter Comparison (Backend + Frontend)

### Concept
Display multiple hyperparameter configurations simultaneously. Users instantly understand overfitting, underfitting, and the effect of each parameter.

### Backend

**File:** `backend/app/routers/comparison.py` (new)

```python
@router.post("/api/v2/hyperparameter-comparison")
async def compare_hyperparameters(request: HyperparamComparisonRequest):
    """Run same algorithm with multiple hyperparameter configs."""
    results = []
    for config in request.configs:
        params = {**request.base_hyperparameters, **config}
        # Train model
        model = CLASSIFICATION_ALGORITHMS[request.algorithm](params)
        model.fit(X_train, y_train)

        # Grid prediction
        grid_points = np.column_stack([xx.ravel(), yy.ravel()])
        probas = model.predict_proba(grid_points)
        grid = probas[:, 1].reshape(xx.shape) if probas.shape[1] == 2 else ...

        # Metrics
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)

        results.append({
            "config": config,
            "grid": grid.tolist(),
            "accuracy": accuracy,
            "n_leaves": getattr(model, 'get_n_leaves', lambda: None)(),
            "train_accuracy": accuracy_score(y_train, model.predict(X_train)),
        })

    return {"results": results, "grid_bounds": {...}}


class HyperparamComparisonRequest(BaseModel):
    algorithm: str
    dataset_name: str
    base_hyperparameters: dict = {}
    configs: list[dict]  # [{"max_depth": 2}, {"max_depth": 5}, {"max_depth": 10}, {"max_depth": 20}]
    noise: float = 0.5
    n_samples: int = 300
```

### Frontend: Hyperparameter Comparison View

**File:** `frontend/src/components/comparison/HyperparameterComparison.tsx` (new)

```
┌─────────────────────────────────────────────────────────┐
│ Hyperparameter Comparison                                │
│                                                          │
│ Algorithm: [Decision Tree ▼]  Dataset: [Moons ▼]        │
│                                                          │
│ Configurations:                                          │
│ [+ Add Config] [Remove] [Run All]                        │
│                                                          │
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                 │
│ │Depth │  │Depth │  │Depth │  │Depth │                 │
│ │  2   │  │  5   │  │ 10   │  │ 20   │                 │
│ │      │  │      │  │      │  │      │                 │
│ │[grid]│  │[grid]│  │[grid]│  │[grid]│                 │
│ │      │  │      │  │      │  │      │                 │
│ │Acc:  │  │Acc:  │  │Acc:  │  │Acc:  │                 │
│ │78.2% │  │91.4% │  │96.1% │  │98.7% │                 │
│ │      │  │      │  │      │  │      │                 │
│ │Train:│  │Train:│  │Train:│  │Train:│                 │
│ │80.1% │  │95.2% │  │99.8% │  │100%  │                 │
│ └──────┘  └──────┘  └──────┘  └──────┘                 │
│                                                          │
│ Analysis:                                                │
│ • Depth 2: Underfitting — train and test both low        │
│ • Depth 5: Good balance — small train/test gap           │
│ • Depth 10: Slight overfitting — train > test            │
│ • Depth 20: Severe overfitting — train=100%, test=98.7%  │
│                                                          │
│ Train-Test Gap Chart:                                    │
│ Depth 2:  ████ 1.9%                                      │
│ Depth 5:  █████ 3.8%                                     │
│ Depth 10: ████████████ 3.7%                              │
│ Depth 20: █████████████████████████████████████ 1.3%     │
└─────────────────────────────────────────────────────────┘
```

### Implementation Details
- Grid layout: 2x2 or 1x4 canvas views
- Sync zoom/pan across all canvases
- Color-coded accuracy (green = good, yellow = ok, red = bad)
- Auto-analysis: detect underfitting/overfitting patterns
- Works for: max_depth, n_estimators, C, n_neighbors, etc.

### Preset Configs
```typescript
const HYPERPARAM_PRESETS = {
  "decision-tree": {
    "max_depth": [2, 5, 10, 20],
  },
  "knn": {
    "n_neighbors": [1, 5, 15, 30],
  },
  "logistic-regression": {
    "C": [0.01, 0.1, 1.0, 100.0],
  },
  "svm": {
    "C": [0.01, 0.1, 1.0, 100.0],
  },
  "random-forest": {
    "n_estimators": [1, 10, 50, 200],
  },
};
```

---

## 4B: Algorithm Race (Backend + Frontend)

### Concept
Run multiple algorithms on the same dataset simultaneously and compare them in real-time.

### Backend

**File:** `backend/app/routers/race.py` (new)

```python
@router.websocket("/ws/race")
async def algorithm_race(ws: WebSocket):
    """Run multiple algorithms simultaneously, streaming results."""
    await ws.accept()
    data = await ws.receive_json()

    algorithms = data["algorithms"]  # ["logistic-regression", "decision-tree", "random-forest", "svm"]
    dataset_name = data.get("dataset_name", "blobs")
    hyperparameters = data.get("hyperparameters", {})

    X, y = generate_dataset(dataset_name, ...)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    results = {}
    for algo_name in algorithms:
        start_time = time.time()

        model = CLASSIFICATION_ALGORITHMS[algo_name](hyperparameters.get(algo_name, {}))
        model.fit(X_train, y_train)

        train_time = time.time() - start_time

        start_pred = time.time()
        y_pred = model.predict(X_test)
        pred_time = time.time() - start_pred

        # Grid for boundary
        grid_points = np.column_stack([xx.ravel(), yy.ravel()])
        probas = model.predict_proba(grid_points)
        grid = probas[:, 1].reshape(xx.shape) if probas.shape[1] == 2 else ...

        results[algo_name] = {
            "grid": grid.tolist(),
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "train_time": round(train_time, 4),
            "pred_time": round(pred_time, 4),
            "memory_bytes": sys.getsizeof(model),  # Approximate
        }

        await ws.send_json({
            "type": "algorithm_done",
            "algorithm": algo_name,
            "result": results[algo_name],
        })

    await ws.send_json({"type": "race_complete", "results": results})
```

### Frontend: Algorithm Race Dashboard

**File:** `frontend/src/components/race/AlgorithmRace.tsx` (new)

```
┌─────────────────────────────────────────────────────────┐
│ Algorithm Race                                            │
│                                                          │
│ Dataset: [Moons ▼]  [Start Race] [Reset]                 │
│                                                          │
│ Algorithms:                                              │
│ [✓] Logistic Regression    [✓] Decision Tree             │
│ [✓] Random Forest          [✓] SVM (RBF)                 │
│ [ ] KNN                    [ ] Gradient Boosting          │
│                                                          │
│ Race Progress:                                           │
│ ███████████████████████████████████ 4/4 complete         │
│                                                          │
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                 │
│ │ LR   │  │ DT   │  │ RF   │  │ SVM  │                 │
│ │      │  │      │  │      │  │      │                 │
│ │[grid]│  │[grid]│  │[grid]│  │[grid]│                 │
│ └──────┘  └──────┘  └──────┘  └──────┘                 │
│                                                          │
│ Leaderboard:                                             │
│ ┌──────────┬──────────┬──────────┬──────────┬─────┐     │
│ │Algorithm │ Accuracy │Train Time│Pred Time │Rank │     │
│ ├──────────┼──────────┼──────────┼──────────┼─────┤     │
│ │ RF       │ 96.2%    │ 0.12s    │ 0.01s    │ 🥇  │     │
│ │ SVM      │ 94.8%    │ 0.05s    │ 0.02s    │ 🥈  │     │
│ │ DT       │ 91.3%    │ 0.01s    │ 0.001s   │ 🥉  │     │
│ │ LR       │ 87.1%    │ 0.02s    │ 0.001s   │ 4th │     │
│ └──────────┴──────────┴──────────┴──────────┴─────┘     │
│                                                          │
│ Speed Chart:                                             │
│ RF:  ████████████ 0.12s                                  │
│ SVM: █████ 0.05s                                         │
│ LR:  ██ 0.02s                                            │
│ DT:  █ 0.01s                                             │
└─────────────────────────────────────────────────────────┘
```

### Implementation
- WebSocket for real-time progress
- Each algorithm gets its own canvas (2x2 grid)
- Leaderboard sorts by accuracy, speed, or composite score
- Animated progress bars during race
- "Race History" to compare across runs

---

## 4C: Benchmark Suite (Backend + Frontend)

### Concept
Run algorithms against standardized metrics (accuracy, speed, memory, training time, prediction time) across multiple datasets.

### Backend

**File:** `backend/app/routers/benchmark.py` (new)

```python
@router.post("/api/v2/benchmark")
async def run_benchmark(request: BenchmarkRequest):
    """Run comprehensive benchmark across algorithms and datasets."""
    results = []

    for dataset_name in request.datasets:
        X, y = generate_dataset(dataset_name, ...)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        for algo_name in request.algorithms:
            # Memory measurement
            tracemalloc.start()
            start_time = time.time()

            model = CLASSIFICATION_ALGORITHMS[algo_name]({})
            model.fit(X_train, y_train)
            train_time = time.time() - start_time

            current, peak_memory = tracemalloc.get_traced_memory()
            tracemalloc.stop()

            # Prediction time
            start_pred = time.time()
            for _ in range(100):  # Average over 100 predictions
                model.predict(X_test[:10])
            pred_time = (time.time() - start_pred) / 100

            # Accuracy
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)

            results.append({
                "algorithm": algo_name,
                "dataset": dataset_name,
                "accuracy": round(float(accuracy), 4),
                "train_time": round(train_time, 4),
                "pred_time": round(pred_time, 6),
                "peak_memory_kb": round(peak_memory / 1024, 2),
                "n_samples": len(X),
                "n_features": X.shape[1],
            })

    return {"results": results}


class BenchmarkRequest(BaseModel):
    algorithms: list[str]
    datasets: list[str]
    n_samples: int = 300
    noise: float = 0.5
```

### Frontend: Benchmark Dashboard

**File:** `frontend/src/components/benchmark/BenchmarkSuite.tsx` (new)

```
┌─────────────────────────────────────────────────────────┐
│ Benchmark Suite                                           │
│                                                          │
│ Algorithms:                                              │
│ [✓] LR  [✓] DT  [✓] RF  [✓] SVM  [✓] KNN  [✓] GB      │
│                                                          │
│ Datasets:                                                │
│ [✓] Blobs  [✓] Moons  [✓] Circles  [✓] Iris             │
│                                                          │
│ [Run Benchmark]  [Export Results]                         │
│                                                          │
│ Results:                                                 │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Accuracy Heatmap                                     │  │
│ │           Blobs  Moons  Circles  Iris                │  │
│ │ LR        0.87   0.85   0.52    0.95                │  │
│ │ DT        0.91   0.93   0.89    0.94                │  │
│ │ RF        0.94   0.96   0.92    0.97                │  │
│ │ SVM       0.93   0.95   0.91    0.96                │  │
│ │ KNN       0.90   0.94   0.88    0.95                │  │
│ │ GB        0.95   0.97   0.93    0.98                │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                          │
│ Speed Ranking:                                           │
│ 1. DT:   0.008s  █████                                  │
│ 2. LR:   0.015s  ████████                               │
│ 3. KNN:  0.012s  ██████                                 │
│ 4. SVM:  0.045s  ████████████████████                   │
│ 5. RF:   0.120s  ████████████████████████████████████   │
│ 6. GB:   0.180s  ██████████████████████████████████████ │
│                                                          │
│ Memory Ranking:                                          │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘
```

### Features
- Heatmap visualization of accuracy across algorithms × datasets
- Sortable leaderboard by any metric
- Export results as CSV
- Radar chart comparing algorithms across all dimensions
- Composite score: weighted average of accuracy, speed, memory

---

## Phase 4 Verification

- [ ] Hyperparameter comparison shows 4 configs simultaneously
- [ ] Sync zoom/pan across comparison canvases
- [ ] Algorithm race runs 4 algorithms in parallel via WebSocket
- [ ] Race leaderboard updates in real-time
- [ ] Benchmark suite runs all algorithms across all datasets
- [ ] Benchmark heatmap renders correctly
- [ ] Export benchmark results works
- [ ] All existing features still work
- [ ] Performance: race completes within 10 seconds for 4 algorithms
