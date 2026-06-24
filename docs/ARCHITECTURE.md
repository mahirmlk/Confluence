# Architecture

Deep dive into Confluence's system design, data flow, and component interactions.

## Table of Contents

- [System Overview](#system-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Type Safety Contract](#type-safety-contract)
- [Caching Strategy](#caching-strategy)
- [WebSocket Protocol](#websocket-protocol)
- [Component Hierarchy](#component-hierarchy)
- [State Management](#state-management)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│                                                                  │
│  Next.js 15 (App Router) + React 19 + TypeScript 5              │
│                                                                  │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Zustand  │ │ TanStack  │ │ Canvas2D │ │ Three.js         │  │
│  │ (global  │ │ Query     │ │ (2D      │ │ (3D mode)        │  │
│  │  state)  │ │ (server   │ │  render) │ │                  │  │
│  │          │ │  cache)   │ │          │ │                  │  │
│  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └────────┬─────────┘  │
│       │             │            │                 │             │
│       └─────────────┴────────────┴─────────────────┘             │
│                            │                                     │
│                     Axios + WebSocket                             │
└────────────────────────────────────┬─────────────────────────────┘
                                     │
                          REST (JSON) + WS (JSON)
                                     │
┌────────────────────────────────────┴─────────────────────────────┐
│                      FASTAPI BACKEND                              │
│                                                                  │
│  Python 3.11 + FastAPI 0.115 + Pydantic 2.10                    │
│                                                                  │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Routers  │ │Algorithm  │ │ Pydantic │ │ Redis            │  │
│  │ (HTTP    │→│ Wrappers  │→│ Schemas  │ │ (optional cache) │  │
│  │  + WS)   │ │ (sklearn) │ │          │ │                  │  │
│  └──────────┘ └───────────┘ └──────────┘ └──────────────────┘  │
│                                                                  │
│  OpenAPI Schema ──► openapi-typescript ──► TS types (auto-gen)   │
└──────────────────────────────────────────────────────────────────┘
```

### Service Boundaries

| Service | Language | Framework | Port | Responsibility |
|---------|----------|-----------|------|----------------|
| Frontend | TypeScript | Next.js 15 | 3000 | UI, state, rendering |
| Backend | Python 3.11 | FastAPI | 8000 | ML computation, API |
| Cache | — | Redis 7 | 6379 | Prediction grid cache |

---

## Frontend Architecture

### Technology Choices

| Concern | Technology | Why |
|---------|-----------|-----|
| Routing | Next.js App Router | File-based routing, SSR/CSR split |
| State | Zustand 5 | Minimal boilerplate, no providers |
| Server cache | TanStack Query 5 | Dedup, stale-while-revalidate, retry |
| Styling | Tailwind CSS 4 | Utility-first, no CSS-in-JS overhead |
| Components | Radix UI | Accessible primitives (WAI-ARIA) |
| Animation | Framer Motion | Layout animations, transitions |
| 3D | Three.js + R3F | WebGL scene graph in React |
| HTTP | Axios | Interceptors, cancellation |
| Types | openapi-typescript | Auto-generated from backend OpenAPI |

### Page Structure

```
/ (route)
├── page.tsx                    → Landing page (marketing, features)
├── app/
│   ├── layout.tsx              → Pass-through layout
│   └── page.tsx                → Main visualizer (interactive)
└── algorithms/
    └── page.tsx                → Algorithm encyclopedia (reference)
```

### Rendering Strategy

| Page | Strategy | Reason |
|------|----------|--------|
| Landing (`/`) | Static (SSG) | Marketing content, no dynamic data |
| App (`/app`) | Client (CSR) | Heavy interactivity, Canvas, WebSocket |
| Encyclopedia (`/algorithms`) | Client (CSR) | Filterable, searchable reference |

### Component Architecture

```
app/page.tsx (Main Visualizer)
├── AlgorithmPanel              → Algorithm selection + hyperparameter sliders
├── UploadPanel                 → CSV upload + column mapping
├── InlineDataEditor            → Paste data directly
├── RecommendPanel              → Algorithm recommendations
├── ErrorBoundary               → Canvas error recovery
│
├── [Classification Mode]
│   └── HeatmapCanvas           → Canvas2D decision boundary
├── [Regression Mode]
│   └── HeatmapCanvas           → Canvas2D prediction surface
├── [Clustering Mode]
│   └── ClusteringCanvas        → Canvas2D cluster labels
├── [Dim-Reduction Mode]
│   └── DimReductionCanvas      → Canvas2D embedding scatter
│
├── MetricsDashboard            → Classification metrics
├── RegressionMetricsDashboard  → Regression metrics
├── ClusteringMetricsDashboard  → Clustering metrics
├── ConfusionMatrix             → Confusion matrix heatmap
├── ROCCurve                    → ROC/AUC plot
├── CrossValidationView         → Per-fold boundaries
├── CoefficientInspector        → Model coefficients
├── LearningCurvePlot           → Train vs. validation
├── DecisionPathView            → Tree decision path
│
├── ComparisonMode              → Side-by-side 2-4 algorithms
├── StreamingViz                → WebSocket training animation
├── TaxonomyExplorer            → Boundary type filter
├── Scene3D                     → Three.js 3D mode
└── UrlState                    → URL state sync, share, export, theme
```

---

## Backend Architecture

### Technology Choices

| Concern | Technology | Why |
|---------|-----------|-----|
| Framework | FastAPI | Async, auto OpenAPI, Pydantic integration |
| ML | scikit-learn 1.6 | Industry standard, consistent API |
| Numerics | numpy 2.2 | Array operations, meshgrid |
| Contours | scikit-image 0.25 | `find_contours` for boundary extraction |
| Validation | Pydantic 2.10 | Runtime type checking, schema generation |
| Cache | Redis 7 (optional) | Async, TTL-based caching |
| Server | uvicorn | ASGI with WebSocket support |

### Module Structure

```
backend/app/
├── main.py                     → App factory, middleware, exception handlers
├── cache.py                    → Redis connection pool, get/set/stats
├── grid.py                     → Meshgrid generation, contour extraction
│
├── algorithms/
│   ├── classification.py       → 15 algorithm wrappers (dict of lambdas)
│   ├── regression.py           → 13 algorithm wrappers
│   ├── clustering.py           → 5 algorithm wrappers + KNN grid prediction
│   ├── dim_reduction.py        → 5 algorithm wrappers (PCA, t-SNE, UMAP, etc.)
│   ├── datasets.py             → 12 dataset generators
│   └── metrics.py              → Classification, regression, CV, learning curves
│
├── models/
│   └── schemas.py              → 25 Pydantic request/response models
│
└── routers/
    ├── classification.py       → 8 endpoints
    ├── regression.py           → 5 endpoints
    ├── clustering.py           → 3 endpoints
    ├── dim_reduction.py        → 2 endpoints
    ├── datasets.py             → 4 endpoints (upload, map, custom, recommend)
    ├── health.py               → 1 endpoint
    └── streaming.py            → 1 WebSocket endpoint + 4 stream functions
```

### Async Execution Model

All CPU-bound ML operations run in thread pool to avoid blocking the event loop:

```python
# Correct pattern (used throughout)
result = await asyncio.to_thread(fit_and_predict_grid, ...)

# Wrong pattern (blocks event loop)
result = fit_and_predict_grid(...)
```

### Algorithm Registry Pattern

Each algorithm family uses a dictionary mapping names to factory functions:

```python
CLASSIFICATION_ALGORITHMS = {
    "logistic-regression": lambda params: LogisticRegression(
        C=params.get("C", 1.0), max_iter=1000, random_state=42
    ),
    "knn": lambda params: KNeighborsClassifier(
        n_neighbors=int(params.get("n_neighbors", 5))
    ),
    # ... 13 more
}
```

This pattern:
- Keeps algorithm configuration in one place
- Makes it easy to add new algorithms
- Allows hyperparameter injection from the frontend

---

## Data Flow

### Classification Prediction

```
1. User selects: algorithm="random-forest", dataset="moons", n_estimators=100

2. Frontend (Zustand) → builds PredictionRequest
   → TanStack Query checks cache (dedup)
   → POST /api/classification/predict

3. Backend:
   a. make_cache_key(algorithm, params, dataset, resolution)
   b. get_cached_grid(key) → Redis lookup
   c. If cache miss:
      - generate_dataset("moons", n_samples=300, noise=0.5)
      - compute_grid_bounds(X) → (x_min, x_max, y_min, y_max)
      - generate_meshgrid(bounds, resolution=100) → xx, yy (100×100)
      - fit_and_predict_grid("random-forest", params, X, y, xx, yy)
        → model.fit(X_train, y_train)
        → model.predict_proba(meshgrid) → prob_grid (100×100)
      - set_cached_grid(key, prob_grid, ttl=3600)
   d. extract_contours(prob_grid, threshold=0.5) → contour polylines

4. Response: { grid, contour_lines, points, algorithm, cache_hit, grid_bounds }

5. Frontend:
   - Canvas2D: render grid as ImageData (probability → color mapping)
   - SVG overlay: draw contour polylines
   - Framer Motion: cross-fade from previous grid
```

### WebSocket Training Animation

```
1. User clicks "Stream" on gradient-boosting

2. Frontend opens WS → ws://localhost:8000/ws/stream
   Sends: { algorithm, hyperparameters, dataset_name, resolution }

3. Backend (streaming.py):
   a. Validate + clamp input bounds
   b. Call stream_boosting_frames(ws, algorithm, params, dataset, resolution)
   c. For n_estimators in range(1, 50, step=2):
      - model.set_params(n_estimators=n_trees)
      - asyncio.to_thread(model.fit, X, y)
      - asyncio.to_thread(model.predict_proba, grid_points)
      - ws.send_json({ type: "frame", step, total_steps, grid })
      - asyncio.sleep(0.1)
   d. ws.send_json({ type: "done" })

4. Frontend:
   - Buffer incoming frames
   - Scrubber component controls which frame to render
   - Canvas2D renders the selected frame's grid
```

---

## Type Safety Contract

The frontend and backend share a type contract via OpenAPI:

```
FastAPI (Python)
    │
    │ Auto-generated OpenAPI schema
    ▼
openapi-typescript (CLI)
    │
    │ Generates TypeScript interfaces
    ▼
frontend/src/lib/api/types.ts
    │
    │ Imported by API client
    ▼
frontend/src/lib/api/client.ts
```

**Enforcement:**
- `npm run generate-types` regenerates types from the running backend
- TypeScript compiler catches any drift at build time
- CI runs `npm run typecheck` on every push

**Never hand-edit `types.ts`** — always regenerate from OpenAPI.

---

## Caching Strategy

### Cache Key

```python
payload = json.dumps({
    "algorithm": algorithm,
    "params": sorted(params.items()),
    "dataset": dataset,
    "resolution": resolution,
}, sort_keys=True)
key = f"grid:{sha256(payload)[:16]}"
```

### Cache Behavior

| Scenario | Behavior |
|----------|----------|
| Cache hit, same resolution | Return cached grid directly |
| Cache hit, different resolution | Cache miss (resolution in key) |
| Cache miss | Compute, cache, return |
| Redis unavailable | Graceful degradation (compute without caching) |
| Redis write failure | Log warning, return computed result |

### TTL

Default: 1 hour. Configurable per call.

### What's Cached

- Prediction grids (classification, regression, clustering)
- NOT cached: metrics, cross-validation, learning curves (variance-dependent)

---

## WebSocket Protocol

### Connection Lifecycle

```
Client                          Server
  │                               │
  │──── WS Connect ──────────────→│
  │←─── 101 Switching Protocols ──│
  │                               │
  │──── { algorithm, params } ───→│
  │                               │
  │←─── { type: "frame", ... } ───│  (repeated)
  │←─── { type: "frame", ... } ───│
  │←─── { type: "frame", ... } ───│
  │                               │
  │←─── { type: "done" } ─────────│
  │                               │
  │──── Close ───────────────────→│
```

### Error Handling

- Invalid message format → `{ type: "error", message: "Invalid message format" }`
- Unknown algorithm → `{ type: "error", message: "Streaming not available for ..." }`
- Computation error → `{ type: "error", message: "An error occurred during computation" }`
- Client disconnect → `WebSocketDisconnect` caught, connection cleaned up

### DoS Protection

All user-controlled parameters are clamped:

```python
resolution = min(int(data.get("resolution", 100)), 200)
params["n_estimators"] = min(int(params.get("n_estimators", 50)), 200)
params["max_depth"] = min(int(params.get("max_depth", 10)), 20)
```

---

## Component Hierarchy

### Canvas Rendering Pipeline

```
Canvas Component (HeatmapCanvas / ClusteringCanvas / DimReductionCanvas)
├── useEffect: draw grid as ImageData
│   ├── For each pixel: map probability → RGBA color
│   └── ctx.putImageData(imageData)
├── SVG Overlay: draw contour polylines
│   └── <polyline points="..." />
└── InteractiveCanvas: pan/zoom controls
    ├── Mouse wheel → zoom
    ├── Mouse drag → pan
    └── Touch → pinch-to-zoom
```

### Color Mapping

**Classification (binary):**
```
probability 0.0 → blue (#3b82f6)
probability 0.5 → white (#ffffff)
probability 1.0 → red (#ef4444)
```

**Regression:**
```
prediction min → blue (#3b82f6)
prediction mid → white (#ffffff)
prediction max → red (#ef4444)
```

**Clustering:**
```
cluster 0 → color[0]
cluster 1 → color[1]
...
noise (-1) → gray (#9ca3af)
```

---

## State Management

### Zustand Store

```typescript
interface AppState {
  // Selection
  family: AlgorithmFamily;          // "classification" | "regression" | ...
  algorithm: string;                // "random-forest"
  hyperparameters: Record<string, number>;  // { n_estimators: 100 }
  datasetName: string;              // "moons"

  // Parameters
  resolution: number;               // 1-200, default 100
  noise: number;                    // 0-5, default 0.5
  nSamples: number;                 // 10-5000, default 300

  // Custom data
  uploadedDatasetId: string | null;
  customDatasetId: string | null;

  // Actions
  setFamily, setAlgorithm, setHyperparameters, ...
}
```

### TanStack Query

Used for all API calls with automatic:
- **Deduplication**: identical requests share the in-flight promise
- **Caching**: responses cached with configurable stale time
- **Retry**: automatic retry on failure
- **Refetch**: stale-while-revalidate pattern

### URL State

The `UrlState` component syncs selected state to URL query parameters:
- `?family=classification&algorithm=random-forest&dataset=moons`
- Enables shareable links
- Enables browser back/forward navigation
