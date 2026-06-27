# Contributing to Confluence

## Development Setup

1. Python 3.11+, Node.js 20+, Redis
2. `pip install -r requirements.txt` (backend)
3. `npm install` (frontend)
4. Copy `.env.example` to `.env`

## Running

```bash
# Backend
cd backend && python -m uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev
```

## Code Quality

Before submitting changes:

```bash
make typecheck     # Frontend TypeScript check
make lint          # Frontend lint
make test-backend  # Backend tests
```

## Project Structure

```
backend/app/
├── algorithms/          # ML algorithm wrappers
│   ├── classification.py
│   ├── regression.py
│   ├── clustering.py
│   ├── dim_reduction.py
│   ├── datasets.py      # Synthetic dataset generators
│   ├── metrics.py        # Metric computations
│   ├── explainers/       # Prediction & metric explainers
│   └── generators/       # Data generator studio
├── datasets/            # Real-world dataset registry
│   ├── registry.py
│   ├── metadata.py
│   ├── classification/
│   ├── regression/
│   └── clustering/
├── routers/             # API endpoints
│   ├── classification.py
│   ├── regression.py
│   ├── datasets.py
│   ├── explain.py
│   ├── training.py
│   ├── compare.py
│   └── tools.py
├── models/schemas.py    # Pydantic request/response models
└── cache.py             # Redis caching layer

frontend/src/
├── app/                 # Next.js App Router pages
├── components/
│   ├── canvas/          # Canvas renderers
│   ├── metrics/         # Metric dashboards
│   ├── controls/        # Algorithm panel, dataset selector
│   ├── explain/         # Prediction explainer, tree builder
│   ├── training/        # Training playground, confusion matrix
│   ├── compare/         # Hyperparameter comparison, race
│   └── tools/           # PCA explorer, code gen, AI assistant
└── lib/
    ├── store/index.ts   # Zustand state
    └── api/client.ts    # API client
```

## Adding a New Algorithm

### Backend

1. Add the algorithm to the appropriate file in `backend/app/algorithms/`:

```python
# backend/app/algorithms/classification.py
CLASSIFICATION_ALGORITHMS["my-algorithm"] = lambda params: MyAlgorithm(
    param1=params.get("param1", default_value),
    random_state=42,
)
```

2. Add hyperparameter config in `frontend/src/lib/store/index.ts`:

```typescript
// HYPERPARAMETER_CONFIGS
"my-algorithm": [
  { name: "param1", min: 0.1, max: 100, step: 0.1, default: 1.0 },
],
```

3. Add the algorithm to the ALGORITHMS array in store:

```typescript
{ name: "my-algorithm", label: "My Algorithm", taxonomyTag: "my-tag", family: "classification",
  description: "Description of what it does", complexity: { fit: "O(n)", predict: "O(1)" } },
```

4. Regenerate types: `npm run generate-types` (requires backend running)

### Testing

- Run backend tests: `make test-backend`
- Run frontend checks: `make typecheck && make lint`
- Verify the algorithm appears in the selector and trains correctly

## Adding a New Dataset

### Option 1: sklearn Built-in Dataset

1. Add a loader function in `backend/app/datasets/classification/__init__.py`:

```python
def _load_my_dataset(n_samples: int = 300, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    from sklearn.datasets import load_my_dataset
    data = load_my_dataset()
    X, y = data.data, data.target
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y
```

2. Register it in the `register()` function:

```python
DatasetEntry(
    name="my-dataset",
    display_name="My Dataset",
    description="Short description",
    story="Educational explanation of what this dataset represents",
    source="sklearn",
    family="classification",
    category="general",
    target_column="target",
    n_rows=300,
    n_features=2,
    n_classes=2,
    feature_names=["feature_1", "feature_2"],
    feature_types=["numeric", "numeric"],
    missing_values=False,
    difficulty="beginner",
    recommended_algorithms=["logistic-regression", "random-forest"],
    tags=["classic", "binary"],
    license="Public Domain",
    loader=_load_my_dataset,
)
```

3. Add it to `FAMILY_DATASETS` in `frontend/src/lib/store/index.ts`

### Option 2: CSV Dataset

1. Place CSV in `backend/app/datasets/data/`
2. Create a loader that reads and preprocesses the CSV
3. Register as above

### Option 3: Synthetic Generator

1. Add generator in `backend/app/algorithms/generators/core.py`:

```python
def generate_my_pattern(n_samples: int = 300, noise: float = 0.5, **kwargs):
    # Generate X, y
    return X, y
```

2. Add to the `GENERATORS` dict

## Adding a New Visualization

1. Create component in `frontend/src/components/`
2. Add API endpoint in `backend/app/routers/` if needed
3. Add schemas in `backend/app/models/schemas.py`
4. Wire into the main app page
5. Add API client function in `frontend/src/lib/api/client.ts`

## Type Safety

Frontend types are auto-generated from the backend's OpenAPI schema. Never hand-edit `src/lib/api/types.ts` — run `npm run generate-types` instead.

## Commit Messages

Use conventional commits:
- `feat(scope): description`
- `fix(scope): description`
- `docs(scope): description`
- `test(scope): description`
- `perf(scope): description`

## Plugin Architecture

Confluence supports community plugins for algorithms and datasets.

### Algorithm Plugin

Create a Python file in `backend/app/plugins/community/`:

```python
from backend.app.plugins import AlgorithmPlugin

class MyAlgorithmPlugin(AlgorithmPlugin):
    name = "my-algorithm"
    family = "classification"
    description = "My custom algorithm"

    def create_model(self, params: dict):
        from sklearn.something import MyAlgorithm
        return MyAlgorithm(**params)

    def get_hyperparameters(self):
        return [{"name": "param1", "min": 0.1, "max": 10, "step": 0.1, "default": 1.0}]
```

### Dataset Plugin

```python
from backend.app.plugins import DatasetPlugin

class MyDatasetPlugin(DatasetPlugin):
    name = "my-dataset"
    family = "classification"
    description = "My custom dataset"

    def load(self):
        import pandas as pd
        df = pd.read_csv("path/to/data.csv")
        X = df.drop("target", axis=1).values
        y = df["target"].values
        return X, y

    def get_metadata(self):
        return {
            "n_rows": 1000,
            "n_features": 5,
            "n_classes": 2,
            "feature_names": ["a", "b", "c", "d", "e"],
        }
```
