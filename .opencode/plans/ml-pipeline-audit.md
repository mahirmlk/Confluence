# ML Pipeline Verification Audit — Implementation Plan

**Project:** Confluence (Interactive ML Visualization Platform)
**Stack:** FastAPI + scikit-learn (backend) / Next.js + React + Canvas (frontend)
**Audited:** 2026-06-26
**Files scanned:** ~50 source files across backend/app and frontend/src
**Domains covered:** Hyperparameter sync, model lifecycle, dataset consistency, decision boundary rendering, metrics accuracy, numerical stability, caching correctness

---

## Deployment Verdict

**BLOCKED** — There is a critical axis-flip visualization bug where decision boundaries are rendered upside-down relative to data points, and a cache key collision that returns stale results when noise/sample-count changes. Both must be fixed before release.

---

## Executive Summary

The backend algorithm implementations correctly delegate to scikit-learn and the frontend UI properly sends hyperparameter values. However, there are **3 critical issues** (axis-flip in all canvases, cache key missing noise/n_samples, spirals non-determinism), **4 high-severity issues** (missing poly-svm degree param, ROC curve wrong for multiclass, regression metrics on training data, log_loss null crash), and several medium/low findings. The core ML math is sound — the bugs are in the rendering, caching, and evaluation layers.

---

## P0 — Critical (must fix before deployment)

### [P0-001] Decision boundary rendered upside-down relative to data points

- **Location:** `frontend/src/components/canvas/HeatmapCanvas.tsx:27-31`, `HeatmapCanvas.tsx:98-100`, `ClusteringCanvas.tsx:40-41`, `ClusteringCanvas.tsx:78-80`
- **Finding:** The heatmap grid is rendered with row 0 at the TOP of the canvas. Backend `np.meshgrid(x, y)` produces `grid[0]` = y_min predictions and `grid[-1]` = y_max predictions. So the heatmap has y_min at the TOP. But data points are plotted with `py = height - ((point[1] - y_min) / yRange) * height`, which puts y_min at the BOTTOM. The grid and points are vertically flipped relative to each other — a data point that should appear in a blue region may visually appear in a red region.
- **Evidence:**
  ```javascript
  // Grid rendering — row 0 (y_min) at TOP
  for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
          const [r, g, b] = colormap(grid[y][x]); // y=0 → top pixel
          const idx = (y * cols + x) * 4;
  }
  ```
  ```javascript
  // Point rendering — y_min at BOTTOM
  const py = height - ((point[1] - y_min) / yRange) * height;
  ```
- **Recommended Fix Strategy:** Flip the grid rendering so y_min maps to the bottom of the canvas (standard math convention: y increases upward). Change `gridToImageData` to read `grid[rows - 1 - y][x]` instead of `grid[y][x]`. Also flip contour rendering from `py = (point[0] / (rows - 1)) * height` to `py = ((rows - 1 - point[0]) / (rows - 1)) * height`. Apply the same fix to `ClusteringCanvas.tsx` and `OverlayCanvas.tsx`.
- **Estimated Effort:** S
- **Affected Files:**
  - `frontend/src/components/canvas/HeatmapCanvas.tsx`
  - `frontend/src/components/canvas/ClusteringCanvas.tsx`
  - `frontend/src/components/canvas/OverlayCanvas.tsx`

### [P0-002] Cache key does not include noise or n_samples — stale results returned

- **Location:** `backend/app/cache.py:35-42`, `backend/app/routers/classification.py:23-26`, `backend/app/routers/regression.py:32-35`
- **Finding:** `make_cache_key` hashes only `(algorithm, params, dataset, resolution)`. But the grid depends on the actual dataset, which varies with `noise` and `n_samples`. If a user changes the noise slider from 0.5 to 0.1, the cache key remains identical, so the old grid (computed on noise=0.5 data) is returned. The grid bounds will be wrong for the new data, producing a completely incorrect visualization.
- **Evidence:**
  ```python
  def make_cache_key(algorithm: str, params: dict, dataset: str, resolution: int) -> str:
      payload = json.dumps({
          "algorithm": algorithm,
          "params": sorted(params.items()),
          "dataset": dataset,
          "resolution": resolution,
          # MISSING: "noise": noise, "n_samples": n_samples
      }, sort_keys=True)
  ```
- **Recommended Fix Strategy:** Add `noise` and `n_samples` to the cache key payload. Update all call sites in classification and regression routers to pass these values.
- **Estimated Effort:** S
- **Affected Files:**
  - `backend/app/cache.py`
  - `backend/app/routers/classification.py`
  - `backend/app/routers/regression.py`

### [P0-003] spirals dataset is non-deterministic — breaks reproducibility

- **Location:** `backend/app/algorithms/datasets.py:5-14`
- **Finding:** `make_spirals` uses `np.random.randn(n_samples)` (global RNG, no seed). Every call produces different data even with identical parameters. All other custom datasets (`make_xor`, `make_linearly_separable`, `make_checkerboard`) use `np.random.RandomState(42)`. This means: (a) repeated runs show different boundaries, (b) prediction and metrics endpoints train on different spirals, (c) cache hits return grids from different data.
- **Evidence:**
  ```python
  def make_spirals(n_samples=300, noise=0.5, n_classes=2):
      ...
      t = np.linspace(...) + np.random.randn(n_samples) * noise * 0.3  # NO SEED
  ```
- **Recommended Fix Strategy:** Change to `rng = np.random.RandomState(42)` and use `rng.randn(n_samples)`.
- **Estimated Effort:** S
- **Affected Files:**
  - `backend/app/algorithms/datasets.py`

---

## P1 — High (fix before any production launch)

### [P1-001] poly-svm missing `degree` hyperparameter

- **Location:** `frontend/src/lib/store/index.ts:61`, `backend/app/algorithms/classification.py:31-33`
- **Finding:** The poly-svm frontend config only exposes `C`, not `degree`. The backend SVC constructor doesn't pass `degree` either, so it always defaults to 3. Users cannot control polynomial degree. By contrast, `svr-poly` correctly exposes and passes `degree`.
- **Evidence:**
  ```typescript
  // Frontend — missing degree
  "poly-svm": [{ name: "C", min: 0.01, max: 100, step: 0.1, default: 1.0 }],
  ```
  ```python
  # Backend — missing degree
  "poly-svm": lambda params: SVC(
      C=params.get("C", 1.0), kernel="poly", probability=True, random_state=42
  ),
  ```
- **Recommended Fix Strategy:** Add `degree` to frontend HYPERPARAMETER_CONFIGS for poly-svm (`min: 2, max: 5, step: 1, default: 3`). Add `degree=int(params.get("degree", 3))` to the backend SVC constructor.
- **Estimated Effort:** S
- **Affected Files:**
  - `frontend/src/lib/store/index.ts`
  - `backend/app/algorithms/classification.py`

### [P1-002] ROC curve incorrect for multiclass (>2 classes)

- **Location:** `backend/app/algorithms/metrics.py:46-51`
- **Finding:** For multiclass, the code passes `y_probas[:, 1]` (probability of class 1 only) to `roc_curve` with `multi_class="ovr"`. The `roc_curve` function with `multi_class="ovr"` expects the full probability matrix `(n_samples, n_classes)`, not a single column. This produces an incorrect ROC curve for 3+ class datasets (blobs-3class, blobs-4class, iris, wine).
- **Evidence:**
  ```python
  if n_classes == 2:
      fpr, tpr, _ = roc_curve(y, y_probas[:, 1])
  else:
      fpr, tpr, _ = roc_curve(y, y_probas[:, 1], multi_class="ovr")  # WRONG
  ```
- **Recommended Fix Strategy:** For multiclass, pass the full `y_probas` matrix to `roc_curve(y, y_probas, multi_class="ovr")`. Also consider computing macro-averaged AUC.
- **Estimated Effort:** M
- **Affected Files:**
  - `backend/app/algorithms/metrics.py`

### [P1-003] Regression metrics computed on training data (no cross-validation)

- **Location:** `backend/app/algorithms/metrics.py:86-88`
- **Finding:** `compute_regression_metrics` fits the model on all data and predicts on the same data. R², MSE, MAE are training-set metrics, not generalization estimates. Classification metrics use `cross_val_predict(cv=5)`, so there's an inconsistent evaluation methodology.
- **Evidence:**
  ```python
  model = REGRESSION_ALGORITHMS[algorithm_name](params)
  model.fit(X, y)
  y_pred = model.predict(X)  # predictions on TRAINING data
  r2 = float(r2_score(y, y_pred))  # inflated R²
  ```
- **Recommended Fix Strategy:** Use `cross_val_predict(model, X, y, cv=5)` for regression metrics, consistent with the classification approach.
- **Estimated Effort:** S
- **Affected Files:**
  - `backend/app/algorithms/metrics.py`

### [P1-004] Frontend crashes when log_loss is null

- **Location:** `frontend/src/components/metrics/MetricsDashboard.tsx:117`
- **Finding:** The backend can return `log_loss: null` when the computation fails. The frontend renders `metrics.log_loss.toFixed(4)` without null-checking, which throws TypeError.
- **Evidence:**
  ```typescript
  // Backend schema allows null
  log_loss: Optional[float] = None
  // Frontend renders without null check
  Log Loss: {metrics.log_loss.toFixed(4)}  // crashes if null
  ```
- **Recommended Fix Strategy:** Add null guard: `{metrics.log_loss != null ? metrics.log_loss.toFixed(4) : "N/A"}`.
- **Estimated Effort:** S
- **Affected Files:**
  - `frontend/src/components/metrics/MetricsDashboard.tsx`

---

## P2 — Medium (fix within the sprint)

### [P2-001] Grid padding is fixed at 1.0 instead of percentage-based

- **Location:** `backend/app/grid.py:20-22`
- **Finding:** `compute_grid_bounds` subtracts/adds a fixed 1.0 padding regardless of data range. For tightly clustered data (range ~0.5), padding is 200% of range. For spread data (range ~20), padding is 5%.
- **Recommended Fix Strategy:** Change to percentage-based: `padding_x = max((x_max - x_min) * 0.15, 0.5)`.
- **Estimated Effort:** S
- **Affected Files:** `backend/app/grid.py`

### [P2-002] Multiclass decision boundary shows confidence, not class identity

- **Location:** `backend/app/algorithms/classification.py:84-87`
- **Finding:** For multiclass, the grid stores `probabilities.max(axis=1)` — the confidence of the most likely class. A class-2 prediction with 90% confidence looks identical to a class-0 prediction with 90% confidence.
- **Recommended Fix Strategy:** For multiclass, return `probabilities.argmax(axis=1)` as a label grid and render with discrete class colors.
- **Estimated Effort:** M
- **Affected Files:** `backend/app/algorithms/classification.py`, `frontend/src/components/canvas/HeatmapCanvas.tsx`

### [P2-003] Missing Calinski-Harabasz score in clustering metrics

- **Location:** `backend/app/algorithms/clustering.py:62-68`
- **Finding:** Only silhouette and davies-bouldin are computed. Calinski-Harabasz is a standard metric available in sklearn.
- **Recommended Fix Strategy:** Add `calinski_harabasz_score` computation and display it in the frontend.
- **Estimated Effort:** S
- **Affected Files:** `backend/app/algorithms/clustering.py`, `frontend/src/components/metrics/ClusteringMetricsDashboard.tsx`

### [P2-004] Streaming endpoints ignore user-specified noise and n_samples

- **Location:** `backend/app/routers/streaming.py:15,62,92,122`
- **Finding:** All streaming functions hardcode `n_samples=300, noise=0.5`.
- **Recommended Fix Strategy:** Extract noise/n_samples from WebSocket message and pass to `generate_dataset`.
- **Estimated Effort:** S
- **Affected Files:** `backend/app/routers/streaming.py`, `frontend/src/components/streaming/StreamingViz.tsx`

### [P2-005] spirals generates n_samples x n_classes points, not n_samples

- **Location:** `backend/app/algorithms/datasets.py:6`
- **Finding:** `make_spirals` creates `n_samples * n_classes` total points. All other datasets generate exactly `n_samples`.
- **Recommended Fix Strategy:** Use `n_per_class = n_samples // n_classes` and pad/truncate to `n_samples`.
- **Estimated Effort:** S
- **Affected Files:** `backend/app/algorithms/datasets.py`

### [P2-006] Cache key has no family prefix — cross-family collision possible

- **Location:** `backend/app/cache.py:42`
- **Recommended Fix Strategy:** Add family to cache key payload and use as prefix.
- **Estimated Effort:** S
- **Affected Files:** `backend/app/cache.py`, classification/regression routers

### [P2-007] Gaussian NB var_smoothing slider has excessive precision

- **Location:** `frontend/src/lib/store/index.ts:66`
- **Finding:** Step size of 1e-9 creates ~100M discrete steps.
- **Recommended Fix Strategy:** Use logarithmic stepping or increase step to 0.001.
- **Estimated Effort:** S
- **Affected Files:** `frontend/src/lib/store/index.ts`

---

## P3 — Low (backlog)

### [P3-001] RecommendPanel sends hardcoded dataset_name "blobs"
- **Location:** `frontend/src/components/controls/RecommendPanel.tsx:33`
- **Fix:** Read actual values from store.

### [P3-002] Streaming boosting doesn't use warm_start
- **Location:** `backend/app/routers/streaming.py:27`
- **Fix:** Add `warm_start=True` to GradientBoosting/RandomForest constructors.

### [P3-003] No input validation for algorithm name against family
- **Location:** `backend/app/routers/classification.py:22`
- **Fix:** Validate algorithm belongs to the correct family endpoint.

### [P3-005] Unused resolution state in store
- **Location:** `frontend/src/lib/store/index.ts:118`
- **Fix:** Either add resolution slider to main view or remove from store.

### [P3-007] Regression surface uses same colormap as classification
- **Location:** `frontend/src/app/app/page.tsx:366`
- **Fix:** Use viridis or single-hue gradient for regression.

---

## Implementation Roadmap

### Phase 1: Critical Fixes (Day 1)
- [ ] P0-001: Fix axis flip in HeatmapCanvas, ClusteringCanvas, OverlayCanvas
- [ ] P0-002: Add noise/n_samples to cache key
- [ ] P0-003: Seed make_spirals with RandomState(42)
- [ ] P1-004: Add null guard for log_loss in MetricsDashboard

### Phase 2: Correctness (Day 2)
- [ ] P1-001: Add degree parameter to poly-svm (frontend + backend)
- [ ] P1-002: Fix multiclass ROC curve computation
- [ ] P1-003: Use cross_val_predict for regression metrics
- [ ] P2-001: Change grid padding to percentage-based

### Phase 3: Completeness (Day 3)
- [ ] P2-002: Multiclass boundary shows class identity, not confidence
- [ ] P2-003: Add Calinski-Harabasz metric
- [ ] P2-004: Streaming uses user's noise/n_samples
- [ ] P2-005: Fix spirals sample count
- [ ] P2-006: Add family prefix to cache keys
- [ ] P2-007: Fix Gaussian NB slider precision

### Phase 4: Polish (Day 4+)
- [ ] P3-001: Fix RecommendPanel to use actual store values
- [ ] P3-002: Add warm_start to streaming models
- [ ] P3-003: Add family-algorithm validation
- [ ] P3-005: Clean up unused resolution state
- [ ] P3-007: Differentiate regression colormap

### Phase 5: Automated Verification
- [ ] Write regression tests comparing backend outputs against direct sklearn computations
- [ ] Add deterministic snapshot tests for decision boundaries
- [ ] Add integration tests for cache key correctness
- [ ] Add tests for multiclass metrics

---

## Summary Table

| ID     | Severity | Domain         | Location                                          | Title                                          | Effort |
|--------|----------|----------------|---------------------------------------------------|------------------------------------------------|--------|
| P0-001 | Critical | Visualization  | HeatmapCanvas.tsx:27,98                           | Grid/points axis flip                          | S      |
| P0-002 | Critical | Caching        | cache.py:35                                       | Cache key missing noise/n_samples              | S      |
| P0-003 | Critical | Reproducibility| datasets.py:11                                    | spirals has no random seed                     | S      |
| P1-001 | High     | Hyperparameters| store/index.ts:61, classification.py:31           | poly-svm missing degree                        | S      |
| P1-002 | High     | Metrics        | metrics.py:50                                     | Multiclass ROC curve wrong                     | M      |
| P1-003 | High     | Metrics        | metrics.py:86                                     | Regression metrics on training data            | S      |
| P1-004 | High     | Frontend       | MetricsDashboard.tsx:117                          | log_loss null crash                            | S      |
| P2-001 | Medium   | Visualization  | grid.py:20                                        | Fixed padding instead of percentage            | S      |
| P2-002 | Medium   | Visualization  | classification.py:87                              | Multiclass shows confidence, not class         | M      |
| P2-003 | Medium   | Metrics        | clustering.py:65                                  | Missing Calinski-Harabasz                      | S      |
| P2-004 | Medium   | Streaming      | streaming.py:15                                   | Streaming ignores noise/n_samples              | S      |
| P2-005 | Medium   | Datasets       | datasets.py:6                                     | spirals generates n*k samples                  | S      |
| P2-006 | Medium   | Caching        | cache.py:42                                       | No family prefix in cache key                  | S      |
| P2-007 | Medium   | UX             | store/index.ts:66                                 | Gaussian NB slider excessive precision         | S      |
| P3-001 | Low      | Recommendations| RecommendPanel.tsx:33                             | Hardcoded dataset in recommend request         | S      |
| P3-002 | Low      | Streaming      | streaming.py:27                                   | No warm_start for boosting streaming           | S      |
| P3-003 | Low      | Validation     | routers/classification.py:22                      | No family-algorithm validation                 | S      |
| P3-005 | Low      | State          | store/index.ts:118                                | Unused resolution state                        | S      |
| P3-007 | Low      | Visualization  | page.tsx:366                                      | Regression uses same colormap as classification| S      |
