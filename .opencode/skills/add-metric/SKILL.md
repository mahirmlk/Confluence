---
name: add-metric
description: Adds a new metric visualization to the Confluence frontend. Covers React component creation, API client function, backend metric computation, and dashboard integration. Use when adding new classification, regression, or clustering metrics.
---

# Add Metric Visualization

End-to-end guide for adding new metrics to Confluence.

## Architecture

```
Backend: algorithms/metrics.py → routers/<family>.py → Pydantic schema
Frontend: api/client.ts → components/metrics/<Metric>.tsx → app/app/page.tsx
```

## Step-by-Step

### Step 1: Backend Metric Computation

**File:** `backend/app/algorithms/metrics.py`

Add a new function:

```python
def compute_my_metric(
    algorithm_name: str,
    params: dict,
    dataset_name: str,
    noise: float = 0.5,
    n_samples: int = 300,
) -> dict:
    X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)

    if algorithm_name not in CLASSIFICATION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    model = CLASSIFICATION_ALGORITHMS[algorithm_name](params)
    model.fit(X, y)

    # Compute your metric
    metric_value = ...

    return {
        "metric_name": metric_value,
        # ... other fields
    }
```

### Step 2: Add Pydantic Schema

**File:** `backend/app/models/schemas.py`

```python
class MyMetricResponse(BaseModel):
    metric_name: float
    # ... other fields
```

### Step 3: Add API Endpoint

**File:** `backend/app/routers/<family>.py`

```python
@router.post("/my-metric", response_model=MyMetricResponse)
async def my_metric(request: MetricsRequest):
    from ..algorithms.metrics import compute_my_metric
    result = await asyncio.to_thread(
        compute_my_metric,
        request.algorithm, request.hyperparameters,
        request.dataset_name, request.noise, request.n_samples
    )
    return MyMetricResponse(**result)
```

### Step 4: Add Frontend API Client

**File:** `frontend/src/lib/api/client.ts`

```typescript
export interface MyMetricResponse {
  metric_name: number;
  // ...
}

export async function getMyMetric(
  request: Omit<PredictionRequest, "resolution">
): Promise<MyMetricResponse> {
  const { data } = await api.post<MyMetricResponse>("/api/family/my-metric", request);
  return data;
}
```

### Step 5: Create React Component

**File:** `frontend/src/components/metrics/MyMetric.tsx`

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyMetric, type PredictionRequest } from "@/lib/api/client";

interface MyMetricProps {
  algorithm: string;
  datasetName: string;
  hyperparameters: Record<string, number>;
  noise: number;
  nSamples: number;
}

export function MyMetric({
  algorithm,
  datasetName,
  hyperparameters,
  noise,
  nSamples,
}: MyMetricProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["myMetric", algorithm, datasetName, hyperparameters, noise, nSamples],
    queryFn: () =>
      getMyMetric({
        algorithm,
        dataset_name: datasetName,
        hyperparameters,
        noise,
        n_samples: nSamples,
      }),
    enabled: !!algorithm && !!datasetName,
  });

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading...</div>;
  if (!data) return null;

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-sm font-bold mb-2">My Metric</h3>
      <p className="text-2xl font-mono">{data.metric_name.toFixed(3)}</p>
    </div>
  );
}
```

### Step 6: Integrate into Dashboard

**File:** `frontend/src/app/app/page.tsx`

Import and add the component to the metrics section:

```tsx
import { MyMetric } from "@/components/metrics/MyMetric";

// In the metrics tab/section:
<MyMetric
  algorithm={algorithm}
  datasetName={datasetName}
  hyperparameters={hyperparameters}
  noise={noise}
  nSamples={nSamples}
/>
```

### Step 7: Verify

```bash
make typecheck
make lint
make test-backend
```

## Existing Metric Components

| Component | File | Purpose |
|-----------|------|---------|
| `MetricsDashboard` | `metrics/MetricsDashboard.tsx` | Classification metrics overview |
| `RegressionMetricsDashboard` | `metrics/RegressionMetricsDashboard.tsx` | Regression metrics overview |
| `ClusteringMetricsDashboard` | `metrics/ClusteringMetricsDashboard.tsx` | Clustering metrics overview |
| `ConfusionMatrix` | `metrics/ConfusionMatrix.tsx` | Confusion matrix heatmap |
| `ROCCurve` | `metrics/ROCCurve.tsx` | ROC/AUC curve |
| `CrossValidationView` | `metrics/CrossValidationView.tsx` | Per-fold boundaries |
| `CoefficientInspector` | `metrics/CoefficientInspector.tsx` | Model coefficients |
| `LearningCurvePlot` | `metrics/LearningCurvePlot.tsx` | Learning curves |
| `DecisionPathView` | `metrics/DecisionPathView.tsx` | Tree decision path |

## Rules

- **Always wrap ML calls in `asyncio.to_thread()`** on the backend
- **Use TanStack Query** for data fetching on the frontend
- **Show loading states** while data is being fetched
- **Handle errors gracefully** — show a message, don't crash
- **Match existing component style** — check neighboring components for conventions
