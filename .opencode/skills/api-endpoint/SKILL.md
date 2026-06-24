---
name: api-endpoint
description: Adds a new API endpoint to the Confluence FastAPI backend. Covers router creation, Pydantic schemas, async execution, caching, and OpenAPI documentation. Use when adding new REST endpoints or WebSocket handlers.
---

# Add API Endpoint

Guide for adding new endpoints to the Confluence backend.

## Architecture

```
backend/app/
├── main.py                 — Router registration
├── routers/
│   ├── classification.py   — /api/classification/*
│   ├── regression.py       — /api/regression/*
│   ├── clustering.py       — /api/clustering/*
│   ├── dim_reduction.py    — /api/dim-reduction/*
│   ├── datasets.py         — /api/datasets/*
│   ├── health.py           — /health
│   └── streaming.py        — /ws/stream
├── models/
│   └── schemas.py          — Pydantic request/response models
└── algorithms/
    ├── classification.py   — Algorithm wrappers
    ├── regression.py
    ├── clustering.py
    ├── dim_reduction.py
    ├── datasets.py         — Dataset generators
    └── metrics.py          — Metric computation
```

## Step-by-Step

### Step 1: Define Schemas

**File:** `backend/app/models/schemas.py`

```python
class MyNewRequest(BaseModel):
    algorithm: str
    dataset_name: str
    hyperparameters: dict = {}
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)

class MyNewResponse(BaseModel):
    result: list[float]
    algorithm: str
    cache_hit: bool
```

**Rules:**
- Always use `Field()` with `ge`, `le`, `min_length`, `max_length` for validation
- `resolution` must have `ge=1, le=200` (DoS protection)
- `n_samples` must have `ge=10, le=5000`
- `noise` must have `ge=0, le=5`

### Step 2: Create Router Function

**File:** `backend/app/routers/<family>.py`

```python
from fastapi import APIRouter
from ..models.schemas import MyNewRequest, MyNewResponse
from ..algorithms.datasets import generate_dataset
from ..algorithms.<family> import fit_and_predict_<family>

router = APIRouter(prefix="/api/<family>", tags=["<family>"])

@router.post("/my-endpoint", response_model=MyNewResponse)
async def my_endpoint(request: MyNewRequest):
    # 1. Generate dataset
    X, y = await asyncio.to_thread(
        generate_dataset, request.dataset_name,
        n_samples=request.n_samples, noise=request.noise
    )

    # 2. Run ML computation (ALWAYS in thread pool)
    result = await asyncio.to_thread(
        compute_something,
        request.algorithm, request.hyperparameters, X, y
    )

    # 3. Return typed response
    return MyNewResponse(**result)
```

### Step 3: Register Router

**File:** `backend/app/main.py`

```python
from .routers import my_new_router
app.include_router(my_new_router)
```

### Step 4: Add Caching (Optional)

**File:** `backend/app/cache.py`

```python
from ..cache import make_cache_key, get_cached_grid, set_cached_grid

cache_key = make_cache_key(
    request.algorithm, request.hyperparameters,
    request.dataset_name, request.resolution
)
cached = await get_cached_grid(cache_key)

if cached is not None:
    result = cached
    cache_hit = True
else:
    result = await asyncio.to_thread(expensive_computation, ...)
    await set_cached_grid(cache_key, result)
    cache_hit = False
```

### Step 5: Regenerate Frontend Types

```bash
cd frontend && npm run generate-types
```

### Step 6: Add Frontend API Client Function

**File:** `frontend/src/lib/api/client.ts`

```typescript
export async function myNewEndpoint(
  request: Omit<PredictionRequest, "resolution">
): Promise<MyNewResponse> {
  const { data } = await api.post<MyNewResponse>("/api/family/my-endpoint", request);
  return data;
}
```

## Rules

- **Always use `asyncio.to_thread()`** for CPU-bound ML operations
- **Never block the event loop** — every synchronous sklearn call must be wrapped
- **Always validate input** — use Pydantic `Field()` constraints
- **Always set `response_model`** — enables OpenAPI documentation
- **Cache expensive computations** — use deterministic cache keys
- **Log errors** — use `logging.getLogger(__name__)`
- **Return structured errors** — raise `ValueError` or `HTTPException`
