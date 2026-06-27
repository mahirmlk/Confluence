# Phase 1: Foundation — Real Dataset Gallery + Data Generator Studio

## Goal
Build the dataset infrastructure that all subsequent phases depend on. Expand from 12 datasets to 30+ with real-world data, create a categorized dataset selector, and add a data generator studio for custom dataset creation.

---

## 1A: Dataset System Architecture (Backend)

### Problem
Currently `backend/app/algorithms/datasets.py` has a flat `DATASET_GENERATORS` dict with 12 entries. No categorization, no metadata, no preprocessing pipeline, no standardized interface.

### New Files

```
backend/app/datasets/
├── __init__.py
├── registry.py          # Central dataset registry
├── metadata.py          # Dataset metadata definitions
├── loaders.py           # Dataset loader functions
├── preprocessing.py     # Preprocessing pipelines
├── importers.py         # Import from sklearn, UCI, OpenML
├── classification/
│   ├── __init__.py
│   ├── iris.py
│   ├── wine.py
│   ├── breast_cancer.py
│   ├── titanic.py
│   ├── penguins.py
│   ├── heart_disease.py
│   ├── adult_income.py
│   └── ...
├── regression/
│   ├── __init__.py
│   ├── california_housing.py
│   ├── diabetes.py
│   ├── bike_sharing.py
│   └── ...
├── clustering/
│   ├── __init__.py
│   ├── mall_customers.py
│   └── ...
└── anomaly/
    ├── __init__.py
    └── ...
```

### Implementation Details

#### `registry.py` — Central Registry
```python
class DatasetRegistry:
    """Singleton registry for all datasets."""
    _datasets: dict[str, DatasetEntry] = {}

    @classmethod
    def register(cls, entry: DatasetEntry): ...
    @classmethod
    def get(cls, name: str) -> DatasetEntry: ...
    @classmethod
    def list_all(cls) -> list[DatasetEntry]: ...
    @classmethod
    def list_by_family(cls, family: str) -> list[DatasetEntry]: ...
    @classmethod
    def list_by_category(cls, category: str) -> list[DatasetEntry]: ...
```

#### `metadata.py` — Dataset Metadata
```python
@dataclass
class DatasetEntry:
    name: str
    display_name: str
    description: str
    story: str                    # Educational explanation
    source: str                   # "sklearn", "uci", "csv", etc.
    family: str                   # "classification", "regression", "clustering"
    category: str                 # "healthcare", "finance", "housing", etc.
    target_column: str
    n_rows: int
    n_features: int
    n_classes: int | None
    feature_names: list[str]
    feature_types: list[str]      # "numeric", "categorical"
    missing_values: bool
    difficulty: str               # "beginner", "intermediate", "advanced"
    recommended_algorithms: list[str]
    tags: list[str]
    license: str | None
    loader: Callable              # Function that returns (X, y, metadata)
    preprocessing: Callable | None
```

#### `loaders.py` — Standard Loader Interface
Every loader returns:
```python
{
    "X": np.ndarray,
    "y": np.ndarray,
    "feature_names": list[str],
    "target_names": list[str],
    "problem_type": str,
    "dataset_name": str,
    "description": str,
    "source": str,
    "rows": int,
    "columns": int,
    "missing_values": int,
    "preprocessing_steps": list[str]
}
```

#### `preprocessing.py` — Per-Dataset Pipelines
Each dataset has its own preprocessing function. Never mutates original data.

```python
def preprocess_titanic(df: pd.DataFrame) -> dict:
    """Handle missing values, encode categoricals, scale features."""
    steps = []
    # 1. Drop rows with missing embarked
    # 2. Fill age with median
    # 3. Fill fare with median
    # 4. One-hot encode sex, embarked
    # 5. Drop name, ticket, cabin
    # 6. StandardScaler on numeric
    return {"X": X, "y": y, "steps": steps, "feature_names": feature_names}
```

### Schema Changes

Add to `backend/app/models/schemas.py`:
```python
class DatasetMetadata(BaseModel):
    name: str
    display_name: str
    description: str
    story: str
    source: str
    family: str
    category: str
    n_rows: int
    n_features: int
    n_classes: int | None
    feature_names: list[str]
    feature_types: list[str]
    missing_values: bool
    difficulty: str
    recommended_algorithms: list[str]
    tags: list[str]
    license: str | None

class DatasetDetailResponse(BaseModel):
    metadata: DatasetMetadata
    sample: list[list[str]]
    preprocessing_steps: list[str]
```

### Router Changes

Extend `backend/app/routers/datasets.py`:
```python
@router.get("/v2/datasets", response_model=PaginatedDatasetList)
async def list_datasets_v2(
    family: str | None = None,
    category: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
    page: int = 1,
    pageSize: int = 20,
): ...

@router.get("/v2/datasets/{name}", response_model=DatasetDetailResponse)
async def get_dataset_detail(name: str): ...

@router.get("/v2/datasets/{name}/preview")
async def preview_dataset(name: str, rows: int = 10): ...
```

### Tests
- Every dataset loader returns valid (X, y) with correct shapes
- Metadata matches actual data
- Preprocessing is reproducible (same output on repeated calls)
- Feature order is consistent
- No data leakage (train/test split uses fixed seed)

---

## 1B: Real Dataset Gallery (Backend + Frontend)

### Datasets to Add

**Tier 1 — sklearn built-in (already have iris, wine, breast-cancer):**
- Digits (classification, 8x8 images)
- Diabetes (regression)
- California Housing (regression)

**Tier 2 — Classic UCI/public (CSV files):**
- Titanic (binary classification)
- Penguins (multi-class classification)
- Heart Disease (binary classification)
- Adult Income (binary classification)
- Mushroom (binary classification)
- Wine Quality (multi-class classification)

**Tier 3 — Regression:**
- Bike Sharing (regression)
- Insurance (regression)
- Concrete Strength (regression)

**Tier 4 — Clustering:**
- Mall Customers (clustering)
- Wholesale Customers (clustering)
- Seeds (clustering)

### Data Acquisition Strategy

For sklearn datasets: use `sklearn.datasets.load_*()` directly.

For CSV datasets:
1. Include small datasets (<500KB) directly in `backend/app/datasets/data/`
2. For larger datasets, implement a download/import workflow
3. Document licensing for each dataset

### Frontend: Dataset Selector Redesign

Replace flat dropdown with categorized selector.

**File:** `frontend/src/components/controls/DatasetSelector.tsx` (new)

```
Dataset Source
◉ Synthetic    ○ Real World

When Synthetic selected:
  Blobs | Moons | Circles | Spirals | XOR | ...

When Real World selected:
  Healthcare
    ├── Breast Cancer
    ├── Diabetes
    ├── Heart Disease
    └── ...
  Finance
    ├── Credit Risk
    └── ...
  Housing
    ├── California Housing
    └── ...
  General
    ├── Iris
    ├── Wine
    ├── Titanic
    └── ...
```

### Frontend: Dataset Info Panel

**File:** `frontend/src/components/controls/DatasetInfoPanel.tsx` (new)

When a dataset is selected, show:
```
┌─────────────────────────────────────┐
│ Dataset: Titanic                    │
│ Predict survival using passenger    │
│ attributes.                         │
│                                     │
│ Rows: 891  Features: 7  Classes: 2 │
│ Source: Kaggle  Difficulty: Beginner│
│                                     │
│ Missing Values: Yes (Age, Cabin)    │
│ Recommended: Random Forest, XGBoost │
│                                     │
│ Preprocessing:                      │
│ Load → Fill Missing → Encode → Scale│
│                                     │
│ Feature Types:                      │
│ Numeric: age, fare, sibsp, parch    │
│ Categorical: sex, embarked, pclass  │
└─────────────────────────────────────┘
```

### Frontend: Store Changes

Extend `frontend/src/lib/store/index.ts`:
```typescript
// Add dataset source concept
type DatasetSource = "synthetic" | "real-world";

// Extend AppState
interface AppState {
  // ... existing
  datasetSource: DatasetSource;
  setDatasetSource: (source: DatasetSource) => void;
}

// New dataset metadata type
interface DatasetMeta {
  name: string;
  displayName: string;
  description: string;
  story: string;
  family: string;
  category: string;
  nRows: number;
  nFeatures: number;
  nClasses: number | null;
  difficulty: string;
  recommendedAlgorithms: string[];
  tags: string[];
}

// Category definitions
const REAL_WORLD_CATEGORIES = {
  healthcare: { label: "Healthcare", icon: "heart" },
  finance: { label: "Finance", icon: "dollar" },
  housing: { label: "Housing", icon: "home" },
  general: { label: "General", icon: "database" },
} as const;
```

### Integration with Existing Algorithms

Update `backend/app/algorithms/datasets.py` to use the new registry:
```python
# Keep existing DATASET_GENERATORS for backward compatibility
# Add registry-based loading for new datasets
# Standard interface: every dataset returns (X, y) tuple
```

Update `FAMILY_DATASETS` in store to include real-world datasets.

### Tests
- All datasets load successfully
- Metadata is correct for each dataset
- Frontend selector renders all categories
- Selecting a real-world dataset updates the store correctly
- Algorithm recommendations update per dataset

---

## 1C: Data Generator Studio (Backend + Frontend)

### Backend

**File:** `backend/app/routers/generators.py` (new)

```python
@router.post("/api/generators/generate")
async def generate_custom_dataset(request: GeneratorRequest):
    """Generate a dataset with custom parameters."""
    ...

class GeneratorRequest(BaseModel):
    generator: str  # "spiral", "xor", "gaussian", "custom"
    n_samples: int = 300
    noise: float = 0.5
    n_classes: int = 2
    n_features: int = 2
    custom_params: dict = {}  # Generator-specific params
```

**File:** `backend/app/algorithms/generators.py` (new)

Extend existing generators:
- `make_spirals` (already exists)
- `make_xor` (already exists)
- `make_gaussian` (new — configurable gaussians)
- `make_swiss_roll` (new — 3D manifold)
- `make_classification_custom` (new — n_classes, n_informative, etc.)

### Frontend: Generator Studio

**File:** `frontend/src/components/controls/DataGeneratorStudio.tsx` (new)

```
┌─────────────────────────────────────┐
│ Data Generator Studio               │
│                                     │
│ Generator Type:                     │
│ [Spiral] [XOR] [Gaussian] [Custom]  │
│                                     │
│ Parameters:                         │
│ Classes:  [2] [3] [4]              │
│ Samples:  ═══════●═══  300          │
│ Noise:    ══●═════════  0.5         │
│                                     │
│ [Preview] [Use This Dataset]        │
│                                     │
│ ┌─────────────────────────────┐     │
│ │     Live Preview Canvas     │     │
│ │     (250 x 250)             │     │
│ │                             │     │
│ └─────────────────────────────┘     │
│                                     │
│ Draw Mode:                          │
│ [Point] [Line] [Area] [Erase]       │
│                                     │
│ Click canvas to add points          │
│ Right-click to change class         │
└─────────────────────────────────────┘
```

### Frontend: Canvas Drawing

**File:** `frontend/src/components/canvas/DrawingCanvas.tsx` (new)

- Click to add points (assign to current class)
- Right-click to toggle class
- Drag to move points
- Brush tool for area painting
- Erase tool
- Export drawn dataset to backend

### API Flow
1. User configures generator params in UI
2. Frontend calls `/api/generators/generate` for preview
3. Preview renders on canvas
4. User clicks "Use This Dataset"
5. Backend stores generated dataset in session
6. All subsequent algorithm calls use this dataset

### Integration
- Add "Generator" tab to data source selector
- Generated datasets work with all existing algorithms
- Generated datasets appear in dataset selector as "Custom: spiral-3class"

---

## Phase 1 Verification

- [ ] All 30+ datasets load without errors
- [ ] Dataset selector shows categorized real-world datasets
- [ ] Dataset info panel shows correct metadata
- [ ] Data generator studio generates valid datasets
- [ ] Generated datasets work with all algorithm families
- [ ] Existing synthetic datasets still work
- [ ] All existing tests pass
- [ ] New tests for dataset registry and loaders
- [ ] API types regenerated
- [ ] Mobile layout functional
