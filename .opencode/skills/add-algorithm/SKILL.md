---
name: add-algorithm
description: Adds a new ML algorithm to Confluence. Covers the full pipeline — backend wrapper, Pydantic schema, frontend store config, API endpoint registration, and optional WebSocket streaming. Use when asked to add a new algorithm to any of the four families (classification, regression, clustering, dimensionality reduction).
---

# Add Algorithm

End-to-end guide for adding a new machine learning algorithm to Confluence.

## Overview

Adding an algorithm touches 6 files across backend and frontend:

```
1. backend/app/algorithms/<family>.py      — Algorithm wrapper
2. backend/app/models/schemas.py           — (if new request/response needed)
3. backend/app/routers/<family>.py         — (if new endpoint needed)
4. frontend/src/lib/store/index.ts         — Algorithm config + hyperparameters
5. frontend/src/lib/api/types.ts           — Auto-regenerated from OpenAPI
6. frontend/src/components/algorithms/diagrams.tsx  — SVG diagram (optional)
```

## Step-by-Step

### Step 1: Backend Algorithm Wrapper

**File:** `backend/app/algorithms/<family>.py`

Add the algorithm to the family's dictionary:

```python
# Classification example
CLASSIFICATION_ALGORITHMS = {
    # ... existing algorithms ...
    "my-new-algorithm": lambda params: MyAlgorithm(
        param1=params.get("param1", default_value),
        param2=params.get("param2", default_value),
    ),
}
```

**Rules:**
- Key must be kebab-case (e.g., `"my-new-algorithm"`)
- Lambda receives `params` dict — use `.get()` with sensible defaults
- Set `random_state=42` for reproducibility where applicable
- Import sklearn class at the top of the file

### Step 2: Frontend Store Config

**File:** `frontend/src/lib/store/index.ts`

Add to `ALGORITHMS` array:

```typescript
{
  name: "my-new-algorithm",
  label: "My New Algorithm",
  taxonomyTag: "linear",  // or "tree-based", "margin-kernel", etc.
  family: "classification",
  description: "One-line description of what it does",
  complexity: { fit: "O(n·d)", predict: "O(d)" }
}
```

Add to `HYPERPARAMETER_CONFIGS`:

```typescript
"my-new-algorithm": [
  { name: "param1", min: 0.01, max: 100, step: 0.01, default: 1.0 },
  { name: "param2", min: 1, max: 50, step: 1, default: 10 },
],
```

Add to `FAMILY_DATASETS` if it only works with specific datasets.

### Step 3: Regenerate Types

```bash
# Start backend first
cd backend && python -m uvicorn app.main:app --reload --port 8000

# In another terminal
cd frontend && npm run generate-types
```

This updates `frontend/src/lib/api/types.ts` from the OpenAPI schema.

### Step 4: Add SVG Diagram (Optional)

**File:** `frontend/src/components/algorithms/diagrams.tsx`

Add an SVG component showing the algorithm's intuition. Keep it minimal — the diagram should be understandable at a glance.

### Step 5: WebSocket Streaming (Optional)

If the algorithm supports staged training (boosting rounds, epochs, depth growth):

**File:** `backend/app/routers/streaming.py`

1. Create a `stream_*_frames` async function
2. Add to `STAGED_ALGORITHMS` dict
3. The function receives `(ws, params, dataset_name, resolution)` and sends JSON frames

### Step 6: Verify

```bash
make typecheck     # Frontend types
make lint          # Frontend lint
make test-backend  # Backend tests
```

## Taxonomy Tags

| Tag | Description | Example Algorithms |
|-----|-------------|-------------------|
| `linear` | Straight line / hyperplane | Logistic Regression, Linear SVM, PCA |
| `tree-based` | Axis-aligned piecewise | Decision Tree, Random Forest |
| `margin-kernel` | Maximum margin or kernel-mapped | SVM (RBF, Poly) |
| `probabilistic` | Soft probability gradient | Gaussian NB, QDA, GP |
| `boosting` | Sequential ensemble | AdaBoost, Gradient Boosting |
| `neural` | Nonlinear from neural networks | MLP |
| `instance-based` | Local point neighborhoods | KNN |
| `centroid-based` | Voronoi tessellation | K-Means |
| `density-based` | Density contours | DBSCAN |
| `hierarchical` | Bottom-up merging | Agglomerative |
| `distribution-based` | Probabilistic mixture | GMM |
| `graph-based` | Graph Laplacian spectral | Spectral Clustering |
| `manifold` | Nonlinear manifold embeddings | t-SNE, UMAP, Isomap |

## Common Pitfalls

- **Forgetting `random_state`** — results won't be reproducible
- **Not wrapping in `asyncio.to_thread`** — blocks the event loop
- **Missing `.get()` default** — KeyError if hyperparameter not sent
- **Wrong lambda signature** — classification uses `lambda params`, clustering uses `lambda params, n_clusters`
