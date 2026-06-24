# API Reference

Complete reference for all Confluence REST API endpoints and WebSocket protocol.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Classification Endpoints](#classification-endpoints)
- [Regression Endpoints](#regression-endpoints)
- [Clustering Endpoints](#clustering-endpoints)
- [Dimensionality Reduction Endpoints](#dimensionality-reduction-endpoints)
- [Dataset Endpoints](#dataset-endpoints)
- [WebSocket Streaming](#websocket-streaming)
- [Schemas](#schemas)

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:8000` |
| Docker | `http://backend:8000` |
| Production | Set via `CORS_ORIGINS` env var |

## Authentication

No authentication is required. The API is designed for local development and trusted deployments. For production, place behind an authenticated reverse proxy.

## Error Handling

All errors return a structured JSON response:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

| Status | Code | When |
|--------|------|------|
| 422 | `VALIDATION_ERROR` | Invalid input (ValueError) |
| 422 | `MISSING_FIELD` | Missing required field (KeyError) |
| 413 | — | File too large or too many rows |
| 404 | — | Dataset/session not found |
| 500 | `INTERNAL_ERROR` | Unhandled exception |

---

## Classification Endpoints

### POST `/api/classification/predict`

Generate a decision boundary grid for a classification algorithm.

**Request Body:**
```json
{
  "algorithm": "random-forest",
  "dataset_name": "moons",
  "hyperparameters": { "n_estimators": 100 },
  "resolution": 100,
  "noise": 0.3,
  "n_samples": 300
}
```

**Response:**
```json
{
  "grid": [[0.98, 0.97, ...], ...],
  "contour_lines": [[[50.2, 30.1], [50.3, 30.2], ...]],
  "points": {
    "X": [[1.2, -0.5], [-0.3, 0.8], ...],
    "y": [0, 1, ...]
  },
  "algorithm": "random-forest",
  "cache_hit": false,
  "grid_bounds": {
    "x_min": -3.5,
    "x_max": 3.5,
    "y_min": -3.5,
    "y_max": 3.5
  }
}
```

**Grid format:** 2D array of floats in [0, 1] representing probability of the positive class (binary) or max probability (multi-class).

**Contour lines:** Array of polylines at threshold 0.5, where each polyline is an array of `[row, col]` coordinates in grid space.

---

### POST `/api/classification/metrics`

Compute classification metrics using 5-fold cross-validation.

**Request Body:**
```json
{
  "algorithm": "logistic-regression",
  "dataset_name": "iris",
  "hyperparameters": { "C": 1.0 },
  "noise": 0.3,
  "n_samples": 300
}
```

**Response:**
```json
{
  "accuracy": 0.95,
  "precision": 0.94,
  "recall": 0.95,
  "f1": 0.94,
  "confusion_matrix": [[50, 0, 0], [0, 47, 3], [0, 2, 48]],
  "roc_curve": {
    "fpr": [0.0, 0.0, 0.02, ...],
    "tpr": [0.0, 0.95, 0.97, ...]
  },
  "log_loss": 0.15
}
```

---

### POST `/api/classification/cross-validation`

Run k-fold cross-validation with per-fold boundary visualization.

**Request Body:**
```json
{
  "algorithm": "decision-tree",
  "dataset_name": "moons",
  "hyperparameters": { "max_depth": 5 },
  "n_folds": 5,
  "noise": 0.3,
  "n_samples": 300
}
```

**Response:**
```json
{
  "folds": [
    {
      "fold": 1,
      "accuracy": 0.93,
      "grid": [[...]],
      "contour_lines": [[...]],
      "grid_bounds": { "x_min": -3.5, "x_max": 3.5, "y_min": -3.5, "y_max": 3.5 }
    }
  ],
  "mean_accuracy": 0.91,
  "std_accuracy": 0.03
}
```

---

### POST `/api/classification/coefficients`

Extract model coefficients or feature importances.

**Request Body:**
```json
{
  "algorithm": "logistic-regression",
  "dataset_name": "iris",
  "hyperparameters": { "C": 1.0 },
  "noise": 0.3,
  "n_samples": 300
}
```

**Response (linear model):**
```json
{
  "coefficients": [0.45, -0.32],
  "intercept": 0.12,
  "feature_names": ["Feature 1", "Feature 2"],
  "model_type": "linear"
}
```

**Response (tree model):**
```json
{
  "coefficients": [0.72, 0.28],
  "intercept": 0.0,
  "feature_names": ["Feature 1", "Feature 2"],
  "model_type": "tree"
}
```

`model_type` is one of: `linear`, `tree`, `other`.

---

### POST `/api/classification/learning-curve`

Compute learning curve (train vs. validation accuracy at increasing dataset sizes).

**Request Body:**
```json
{
  "algorithm": "random-forest",
  "dataset_name": "moons",
  "hyperparameters": { "n_estimators": 50 },
  "noise": 0.3,
  "n_samples": 300
}
```

**Response:**
```json
{
  "train_sizes": [30, 60, 90, 120, 150, 180, 210, 240, 270, 300],
  "train_scores": [1.0, 0.98, 0.96, ...],
  "validation_scores": [0.72, 0.80, 0.85, ...]
}
```

---

### POST `/api/classification/sensitivity`

Compute accuracy over a 2D hyperparameter grid.

**Request Body:**
```json
{
  "algorithm": "rbf-svm",
  "dataset_name": "moons",
  "hyperparameters": {},
  "param1": "C",
  "param1_range": [0.01, 0.1, 1.0, 10.0],
  "param2": "gamma",
  "param2_range": [0.01, 0.1, 1.0],
  "noise": 0.3,
  "n_samples": 300
}
```

**Response:**
```json
{
  "param1_values": [0.01, 0.1, 1.0, 10.0],
  "param2_values": [0.01, 0.1, 1.0],
  "accuracy_grid": [
    [0.72, 0.85, 0.90],
    [0.80, 0.92, 0.95],
    [0.88, 0.95, 0.93],
    [0.90, 0.92, 0.88]
  ]
}
```

---

### POST `/api/classification/decision-path`

Trace the decision path for a single point through a model.

**Request Body:**
```json
{
  "algorithm": "decision-tree",
  "dataset_name": "moons",
  "hyperparameters": { "max_depth": 5 },
  "point": [1.5, -0.3],
  "noise": 0.3,
  "n_samples": 300
}
```

**Response (tree model):**
```json
{
  "path": [
    "Feature 1 <= 0.234 → left",
    "Feature 2 > -0.512 → right",
    "Feature 1 <= -0.103 → left",
    "Leaf: class 0"
  ],
  "prediction": 0,
  "model_type": "tree"
}
```

**Response (ensemble model):**
```json
{
  "path": [
    "Feature 1: importance 0.720",
    "Feature 2: importance 0.280",
    "Ensemble prediction: class 1"
  ],
  "prediction": 1,
  "model_type": "ensemble"
}
```

---

### GET `/api/classification/datasets`

List available classification datasets.

**Response:**
```json
{
  "datasets": [
    { "name": "blobs", "description": "Gaussian blobs" },
    { "name": "moons", "description": "Interleaving half circles" },
    ...
  ]
}
```

---

## Regression Endpoints

### POST `/api/regression/predict`

Generate a prediction surface for a regression algorithm.

**Request Body:**
```json
{
  "algorithm": "gaussian-process-regressor",
  "dataset_name": "sine",
  "hyperparameters": { "alpha": 0.01 },
  "resolution": 100,
  "noise": 0.3,
  "n_samples": 300
}
```

**Response:**
```json
{
  "grid": [[0.45, 0.47, ...], ...],
  "uncertainty_grid": [[0.12, 0.11, ...], ...],
  "points": { "X": [[...]], "y": [...] },
  "algorithm": "gaussian-process-regressor",
  "cache_hit": false,
  "grid_bounds": { "x_min": -6.0, "x_max": 6.0, "y_min": -6.0, "y_max": 6.0 }
}
```

`uncertainty_grid` is `null` for all algorithms except `gaussian-process-regressor`.

---

### POST `/api/regression/metrics`

Compute regression metrics (R², MSE, RMSE, MAE) with residuals.

**Request Body:**
```json
{
  "algorithm": "ridge",
  "dataset_name": "sine",
  "hyperparameters": { "alpha": 1.0 },
  "noise": 0.3,
  "n_samples": 300
}
```

**Response:**
```json
{
  "r2": 0.85,
  "mse": 0.12,
  "rmse": 0.35,
  "mae": 0.28,
  "residuals": [0.12, -0.05, ...],
  "predicted": [0.45, 0.67, ...],
  "actual": [0.57, 0.62, ...]
}
```

---

### POST `/api/regression/learning-curve`

Learning curve for regression (R² score).

**Request Body:** Same as classification learning curve.

**Response:**
```json
{
  "train_sizes": [30, 60, ...],
  "train_scores": [0.92, 0.89, ...],
  "validation_scores": [0.72, 0.78, ...]
}
```

---

### POST `/api/regression/cross-validation`

Cross-validation for regression models.

**Request Body:**
```json
{
  "algorithm": "random-forest-regressor",
  "dataset_name": "sine",
  "hyperparameters": { "n_estimators": 100 },
  "n_folds": 5,
  "noise": 0.3,
  "n_samples": 300
}
```

**Response:**
```json
{
  "folds": [
    { "fold": 1, "r2": 0.85, "mse": 0.12 },
    { "fold": 2, "r2": 0.82, "mse": 0.15 },
    ...
  ],
  "mean_r2": 0.83,
  "std_r2": 0.02
}
```

---

### GET `/api/regression/datasets`

List available regression datasets.

---

## Clustering Endpoints

### POST `/api/clustering/predict`

Generate a cluster label grid.

**Request Body:**
```json
{
  "algorithm": "kmeans",
  "dataset_name": "blobs",
  "hyperparameters": { "n_clusters": 3 },
  "resolution": 100,
  "noise": 0.5,
  "n_samples": 300
}
```

**Response:**
```json
{
  "label_grid": [[0, 0, 0, ...], ...],
  "points": { "X": [[...]], "y": [...] },
  "algorithm": "kmeans",
  "metrics": {
    "silhouette": 0.72,
    "davies_bouldin": 0.45,
    "inertia": 1234.56
  },
  "cache_hit": false,
  "grid_bounds": { "x_min": -3.5, "x_max": 3.5, "y_min": -3.5, "y_max": 3.5 }
}
```

**Metrics:**
- `silhouette` — [-1, 1], higher is better (not available for DBSCAN with noise)
- `davies_bouldin` — [0, ∞), lower is better
- `inertia` — K-Means only, sum of squared distances to centroids

---

### POST `/api/clustering/elbow`

Compute elbow plot data (inertia and silhouette vs. k).

**Request Body:**
```json
{
  "algorithm": "kmeans",
  "dataset_name": "blobs",
  "hyperparameters": {},
  "k_min": 2,
  "k_max": 10,
  "noise": 0.5,
  "n_samples": 300
}
```

**Response:**
```json
{
  "k_values": [2, 3, 4, 5, 6, 7, 8, 9, 10],
  "inertias": [2500.0, 1234.5, 980.2, ...],
  "silhouettes": [0.55, 0.72, 0.68, ...]
}
```

---

### GET `/api/clustering/datasets`

List available clustering datasets.

---

## Dimensionality Reduction Endpoints

### POST `/api/dim-reduction/reduce`

Project high-dimensional data to 2D or 3D.

**Request Body:**
```json
{
  "algorithm": "tsne",
  "dataset_name": "iris",
  "hyperparameters": { "perplexity": 30 },
  "n_components": 2,
  "noise": 0.3,
  "n_samples": 300
}
```

**Response:**
```json
{
  "embedding": [[-2.3, 1.4], [3.1, -0.8], ...],
  "points": { "X": [[...]], "y": [...] },
  "algorithm": "tsne",
  "info": { "kl_divergence": 0.045 },
  "cache_hit": false
}
```

**Info fields by algorithm:**
- `pca`: `explained_variance`, `components`
- `tsne`: `kl_divergence`
- `umap`: (none, or `fallback` if UMAP not installed)
- `isomap`: `reconstruction_error`
- `lda`: `explained_variance`

---

### GET `/api/dim-reduction/algorithms`

List available dimensionality reduction algorithms.

**Response:**
```json
{
  "algorithms": [
    { "name": "pca", "description": "Principal Component Analysis", "tag": "linear" },
    { "name": "tsne", "description": "t-Distributed Stochastic Neighbor Embedding", "tag": "manifold" },
    ...
  ]
}
```

---

## Dataset Endpoints

### POST `/api/datasets/upload`

Upload a CSV file for use as a dataset.

**Request:** `multipart/form-data` with a `file` field.

**Constraints:**
- Max file size: 10MB
- Max rows: 10,000
- Accepted formats: `.csv`, `.tsv`, `.txt`
- Must have header row + at least 1 data row
- At least 2 columns required
- No duplicate column names
- Cells starting with `=`, `+`, `-`, `@`, `\t` are rejected (formula injection protection)

**Response:**
```json
{
  "session_id": "uuid-here",
  "columns": ["feature1", "feature2", "target"],
  "n_rows": 150,
  "n_numeric_columns": 3,
  "sample": [["5.1", "3.5", "0"], ["4.9", "3.0", "0"], ...]
}
```

---

### POST `/api/datasets/map-columns`

Map uploaded CSV columns to features (X) and target (y).

**Request Body:**
```json
{
  "session_id": "uuid-here",
  "x_columns": ["feature1", "feature2"],
  "y_column": "target",
  "dataset_name": "my-data"
}
```

**Response:**
```json
{
  "dataset_id": "new-uuid",
  "n_samples": 150,
  "n_features": 2,
  "class_labels": [0, 1, 2]
}
```

Features are automatically normalized (zero mean, unit variance).

---

### POST `/api/datasets/custom`

Create a dataset from manually placed points.

**Request Body:**
```json
{
  "points": [[1.0, 2.0], [-1.0, -2.0], [0.5, 0.5]],
  "labels": [0, 1, 0],
  "dataset_name": "my-custom-data"
}
```

**Constraints:**
- Minimum 2 points
- Maximum 500 points
- Each point must be 2-dimensional
- `points` and `labels` must have the same length

**Response:**
```json
{
  "dataset_id": "uuid-here",
  "n_samples": 3,
  "n_features": 2,
  "class_labels": [0, 1]
}
```

---

### POST `/api/datasets/recommend`

Get algorithm recommendations based on dataset characteristics.

**Request Body:**
```json
{
  "dataset_name": "moons",
  "n_samples": 300,
  "noise": 0.5
}
```

Or with an uploaded dataset:
```json
{
  "dataset_name": "uploaded",
  "session_id": "uuid-here"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "name": "knn",
      "label": "K-Nearest Neighbors",
      "confidence": 0.9,
      "reason": "Small dataset — KNN works well with limited samples"
    },
    {
      "name": "random-forest",
      "label": "Random Forest",
      "confidence": 0.85,
      "reason": "Medium dataset — ensemble method handles complexity well"
    }
  ]
}
```

**Recommendation logic:**
- **n < 500**: KNN, Gaussian NB, Logistic Regression
- **500 ≤ n < 2000**: Random Forest, RBF SVM, Gradient Boosting
- **n ≥ 2000**: Gradient Boosting, Random Forest
- **Imbalanced classes**: Random Forest (ensemble robustness)
- **High dimensionality (>10 features)**: Random Forest (feature importance)

---

## WebSocket Streaming

### Endpoint

```
WS /ws/stream
```

### Handshake

1. Client connects to `ws://host:8000/ws/stream`
2. Server accepts the connection
3. Client sends a JSON configuration message
4. Server streams frame-by-frame updates
5. Server sends `{"type": "done"}` when complete

### Client Message

```json
{
  "algorithm": "gradient-boosting",
  "hyperparameters": {
    "n_estimators": 50,
    "max_depth": 10,
    "n_epochs": 20,
    "max_epochs": 50,
    "hidden_layer_sizes": 100
  },
  "dataset_name": "moons",
  "resolution": 100
}
```

### Server Messages

**Frame:**
```json
{
  "type": "frame",
  "step": 5,
  "total_steps": 50,
  "grid": [[0.98, 0.97, ...], ...]
}
```

**Done:**
```json
{ "type": "done" }
```

**Error:**
```json
{ "type": "error", "message": "Streaming not available for logistic-regression" }
```

### Streaming Algorithms

| Algorithm | Stream Function | Parameter | Description |
|-----------|----------------|-----------|-------------|
| `adaboost` | `stream_boosting_frames` | `n_estimators` | Incrementally add boosting rounds |
| `gradient-boosting` | `stream_boosting_frames` | `n_estimators` | Incrementally add boosting rounds |
| `random-forest` | `stream_boosting_frames` | `n_estimators` | Incrementally add trees |
| `sgd` | `stream_gradient_descent_frames` | `n_epochs` | SGDClassifier epoch-by-epoch |
| `decision-tree` | `stream_tree_growth_frames` | `max_depth` | Grow tree depth incrementally |
| `mlp` | `stream_mlp_frames` | `max_epochs` | MLPClassifier epoch-by-epoch |

### Input Bounds (DoS Protection)

| Parameter | Default | Max |
|-----------|---------|-----|
| `resolution` | 100 | 200 |
| `n_estimators` | 50 | 200 |
| `max_depth` | 10 | 20 |
| `n_epochs` | 20 | 100 |
| `max_epochs` | 50 | 100 |

---

## Schemas

All request/response schemas are defined in `backend/app/models/schemas.py` using Pydantic v2.

### Auto-Generated TypeScript Types

Frontend types are auto-generated from the backend's OpenAPI schema:

```bash
# Requires backend running on localhost:8000
cd frontend && npm run generate-types
```

This generates `frontend/src/lib/api/types.ts` — never hand-edit this file.

### Schema Reference

| Schema | Used By |
|--------|---------|
| `PredictionRequest` | `/api/classification/predict` |
| `PredictionResponse` | `/api/classification/predict` |
| `MetricsRequest` | `/api/classification/metrics` |
| `ClassificationMetrics` | `/api/classification/metrics` |
| `RegressionRequest` | `/api/regression/predict` |
| `RegressionResponse` | `/api/regression/predict` |
| `RegressionMetricsRequest` | `/api/regression/metrics` |
| `RegressionMetricsResponse` | `/api/regression/metrics` |
| `ClusteringRequest` | `/api/clustering/predict` |
| `ClusteringResponse` | `/api/clustering/predict` |
| `ClusteringElbowRequest` | `/api/clustering/elbow` |
| `ClusteringElbowResponse` | `/api/clustering/elbow` |
| `DimReductionRequest` | `/api/dim-reduction/reduce` |
| `DimReductionResponse` | `/api/dim-reduction/reduce` |
| `CrossValidationRequest` | `/api/classification/cross-validation` |
| `CrossValidationResponse` | `/api/classification/cross-validation` |
| `CoefficientRequest` | `/api/classification/coefficients` |
| `CoefficientResponse` | `/api/classification/coefficients` |
| `LearningCurveRequest` | `/api/classification/learning-curve` |
| `LearningCurveResponse` | `/api/classification/learning-curve` |
| `SensitivityRequest` | `/api/classification/sensitivity` |
| `SensitivityResponse` | `/api/classification/sensitivity` |
| `DecisionPathRequest` | `/api/classification/decision-path` |
| `DecisionPathResponse` | `/api/classification/decision-path` |
| `DatasetSample` | Used in all prediction responses |
| `DatasetInfo` | Dataset list responses |
| `DatasetListResponse` | All `GET /datasets` endpoints |
| `AlgorithmInfo` | `/api/dim-reduction/algorithms` |
| `AlgorithmListResponse` | `/api/dim-reduction/algorithms` |
| `HealthResponse` | `/health` |
