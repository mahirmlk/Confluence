import csv
import io
import uuid
import time
import asyncio
import logging
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from ..models.schemas import GeneratorRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/datasets", tags=["datasets"])

_uploaded_store: dict[str, dict] = {}
_STORE_TTL = 3600
_MAX_STORE_SIZE = 100  # max concurrent uploads


def _cleanup_expired():
    now = time.time()
    expired = [k for k, v in _uploaded_store.items() if now - v["created_at"] > _STORE_TTL]
    for k in expired:
        del _uploaded_store[k]
    if len(_uploaded_store) > _MAX_STORE_SIZE:
        oldest = sorted(_uploaded_store, key=lambda k: _uploaded_store[k]["created_at"])[:len(_uploaded_store) - _MAX_STORE_SIZE]
        for k in oldest:
            del _uploaded_store[k]


class UploadResponse(BaseModel):
    session_id: str
    columns: list[str]
    n_rows: int
    n_numeric_columns: int
    sample: list[list[str]]


class ColumnMappingRequest(BaseModel):
    session_id: str
    x_columns: list[str] = Field(min_length=1, max_length=10)
    y_column: str
    dataset_name: str = "uploaded"


class ColumnMappingResponse(BaseModel):
    dataset_id: str
    n_samples: int
    n_features: int
    class_labels: list[int]


class CustomPointsRequest(BaseModel):
    points: list[list[float]] = Field(min_length=2, max_length=500)
    labels: list[int] = Field(min_length=2, max_length=500)
    dataset_name: str = "custom"


class CustomPointsResponse(BaseModel):
    dataset_id: str
    n_samples: int
    n_features: int
    class_labels: list[int]


class RecommendRequest(BaseModel):
    dataset_name: str
    n_samples: int = 300
    noise: float = 0.5
    session_id: Optional[str] = None


class AlgorithmRecommendation(BaseModel):
    name: str
    label: str
    confidence: float
    reason: str


class RecommendResponse(BaseModel):
    recommendations: list[AlgorithmRecommendation]


_FORBIDDEN_PATTERNS = ["=", "+", "-", "@", "\t"]


def _validate_csv_content(content: str) -> tuple[list[str], list[list[str]]]:
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    reader = csv.reader(io.StringIO(content))
    rows = []
    for i, row in enumerate(reader):
        if i > 10001:
            raise HTTPException(status_code=413, detail="Too many rows (max 10,000)")
        for cell in row:
            for pattern in _FORBIDDEN_PATTERNS:
                if cell.strip().startswith(pattern):
                    raise HTTPException(
                        status_code=422,
                        detail=f"Potentially unsafe content detected in row {i + 1}: cell starts with '{pattern}'"
                    )
        rows.append(row)

    if len(rows) < 2:
        raise HTTPException(status_code=422, detail="CSV must have a header row and at least one data row")

    columns = rows[0]
    if len(columns) < 2:
        raise HTTPException(status_code=422, detail="CSV must have at least 2 columns")

    seen = set()
    for col in columns:
        if col in seen:
            raise HTTPException(status_code=422, detail=f"Duplicate column name: '{col}'")
        seen.add(col)

    return columns, rows[1:]


def _detect_numeric_columns(columns: list[str], data_rows: list[list[str]]) -> list[str]:
    numeric_cols = []
    for col_idx in range(len(columns)):
        is_numeric = True
        for row in data_rows[:20]:
            if col_idx >= len(row):
                continue
            val = row[col_idx].strip()
            if not val:
                continue
            try:
                float(val)
            except ValueError:
                is_numeric = False
                break
        if is_numeric:
            numeric_cols.append(columns[col_idx])
    return numeric_cols


@router.post("/upload", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    _cleanup_expired()

    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ("csv", "tsv", "txt"):
        raise HTTPException(status_code=400, detail="Only .csv, .tsv, .txt files are accepted")

    raw = await file.read()
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    try:
        content = raw.decode("utf-8")
    except UnicodeDecodeError:
        try:
            content = raw.decode("latin-1")
        except UnicodeDecodeError:
            raise HTTPException(status_code=422, detail="Could not decode file as UTF-8 or Latin-1")

    columns, data_rows = await asyncio.to_thread(_validate_csv_content, content)
    numeric_cols = await asyncio.to_thread(_detect_numeric_columns, columns, data_rows)

    session_id = str(uuid.uuid4())
    _uploaded_store[session_id] = {
        "columns": columns,
        "data": data_rows,
        "numeric_columns": numeric_cols,
        "created_at": time.time(),
    }

    sample = data_rows[:5]

    return UploadResponse(
        session_id=session_id,
        columns=columns,
        n_rows=len(data_rows),
        n_numeric_columns=len(numeric_cols),
        sample=sample,
    )


@router.post("/map-columns", response_model=ColumnMappingResponse)
async def map_columns(request: ColumnMappingRequest):
    _cleanup_expired()

    session = _uploaded_store.get(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    columns = session["columns"]
    data_rows = session["data"]

    for col in request.x_columns:
        if col not in columns:
            raise HTTPException(status_code=422, detail=f"Column '{col}' not found in dataset")
    if request.y_column not in columns:
        raise HTTPException(status_code=422, detail=f"Column '{request.y_column}' not found in dataset")
    if request.y_column in request.x_columns:
        raise HTTPException(status_code=422, detail="y_column cannot also be an x_column")

    col_to_idx = {c: i for i, c in enumerate(columns)}
    x_indices = [col_to_idx[c] for c in request.x_columns]
    y_index = col_to_idx[request.y_column]

    X = []
    y = []
    for row in data_rows:
        try:
            x_vals = [float(row[i]) for i in x_indices]
            y_val = float(row[y_index])
            X.append(x_vals)
            y.append(int(y_val))
        except (IndexError, ValueError):
            continue

    if len(X) < 2:
        raise HTTPException(status_code=422, detail="Not enough valid numeric rows after parsing")

    X_arr = np.array(X)
    means = np.nanmean(X_arr, axis=0)
    stds = np.nanstd(X_arr, axis=0)
    stds[stds == 0] = 1.0
    X_normalized = (X_arr - means) / stds

    dataset_id = str(uuid.uuid4())
    _uploaded_store[dataset_id] = {
        "X": X_arr.tolist(),
        "y": y,
        "X_normalized": X_normalized.tolist(),
        "means": means.tolist(),
        "stds": stds.tolist(),
        "feature_names": request.x_columns,
        "created_at": time.time(),
    }

    return ColumnMappingResponse(
        dataset_id=dataset_id,
        n_samples=len(X),
        n_features=len(request.x_columns),
        class_labels=sorted(set(y)),
    )


@router.post("/custom", response_model=CustomPointsResponse)
async def create_custom_dataset(request: CustomPointsRequest):
    _cleanup_expired()

    if len(request.points) != len(request.labels):
        raise HTTPException(status_code=422, detail="points and labels must have the same length")

    for i, point in enumerate(request.points):
        if len(point) != 2:
            raise HTTPException(status_code=422, detail=f"Point {i} must be 2-dimensional, got {len(point)}")

    dataset_id = str(uuid.uuid4())
    _uploaded_store[dataset_id] = {
        "X": request.points,
        "y": request.labels,
        "created_at": time.time(),
    }

    return CustomPointsResponse(
        dataset_id=dataset_id,
        n_samples=len(request.points),
        n_features=2,
        class_labels=sorted(set(request.labels)),
    )


def _get_uploaded_dataset(dataset_id: str) -> tuple[np.ndarray, np.ndarray]:
    session = _uploaded_store.get(dataset_id)
    if not session or "X" not in session:
        raise HTTPException(status_code=404, detail="Dataset not found or expired")
    return np.array(session["X"]), np.array(session["y"])


@router.post("/recommend", response_model=RecommendResponse)
async def recommend_algorithms(request: RecommendRequest):
    from ..algorithms.datasets import generate_dataset

    if request.session_id:
        X, y = _get_uploaded_dataset(request.session_id)
    else:
        X, y = await asyncio.to_thread(
            generate_dataset, request.dataset_name,
            n_samples=request.n_samples, noise=request.noise
        )

    n_samples, n_features = X.shape
    n_classes = len(set(y.tolist()))
    class_counts = np.bincount(y.astype(int))
    class_balance = class_counts.min() / class_counts.max() if class_counts.max() > 0 else 0

    recommendations = []

    if n_samples < 500:
        recommendations.append(AlgorithmRecommendation(
            name="knn", label="K-Nearest Neighbors", confidence=0.9,
            reason="Small dataset — KNN works well with limited samples"
        ))
        recommendations.append(AlgorithmRecommendation(
            name="gaussian-nb", label="Gaussian Naive Bayes", confidence=0.85,
            reason="Small dataset — Naive Bayes is robust with few samples"
        ))
        recommendations.append(AlgorithmRecommendation(
            name="logistic-regression", label="Logistic Regression", confidence=0.8,
            reason="Small dataset — simple linear model generalizes well"
        ))
    elif n_samples < 2000:
        recommendations.append(AlgorithmRecommendation(
            name="random-forest", label="Random Forest", confidence=0.9,
            reason="Medium dataset — ensemble method handles complexity well"
        ))
        recommendations.append(AlgorithmRecommendation(
            name="rbf-svm", label="SVM (RBF Kernel)", confidence=0.85,
            reason="Medium dataset — RBF SVM captures non-linear boundaries"
        ))
        recommendations.append(AlgorithmRecommendation(
            name="gradient-boosting", label="Gradient Boosting", confidence=0.85,
            reason="Medium dataset — strong performance on tabular data"
        ))
    else:
        recommendations.append(AlgorithmRecommendation(
            name="gradient-boosting", label="Gradient Boosting", confidence=0.9,
            reason="Large dataset — gradient boosting excels with ample data"
        ))
        recommendations.append(AlgorithmRecommendation(
            name="random-forest", label="Random Forest", confidence=0.85,
            reason="Large dataset — scales well, resistant to overfitting"
        ))

    if class_balance < 0.5:
        recommendations.append(AlgorithmRecommendation(
            name="random-forest", label="Random Forest", confidence=0.75,
            reason="Imbalanced classes — ensemble methods handle imbalance better"
        ))

    if n_features > 10:
        recommendations.append(AlgorithmRecommendation(
            name="random-forest", label="Random Forest", confidence=0.8,
            reason="High dimensionality — built-in feature importance"
        ))

    seen = set()
    unique = []
    for r in recommendations:
        if r.name not in seen:
            seen.add(r.name)
            unique.append(r)
    recommendations = unique[:5]

    return RecommendResponse(recommendations=recommendations)


# --- V2 Endpoints ---


@router.get("/v2/datasets")
async def list_datasets_v2(
    family: str = None,
    category: str = None,
    difficulty: str = None,
    source: str = None,
    search: str = None,
):
    from ..datasets.registry import DatasetRegistry

    datasets = DatasetRegistry.list_all()

    if family:
        datasets = [d for d in datasets if d.family == family]
    if category:
        datasets = [d for d in datasets if d.category == category]
    if difficulty:
        datasets = [d for d in datasets if d.difficulty == difficulty]
    if source:
        datasets = [d for d in datasets if d.source == source]
    if search:
        datasets = DatasetRegistry.search(search)

    return {
        "datasets": [
            {
                "name": d.name,
                "display_name": d.display_name,
                "description": d.description,
                "story": d.story,
                "source": d.source,
                "family": d.family,
                "category": d.category,
                "target_column": d.target_column,
                "n_rows": d.n_rows,
                "n_features": d.n_features,
                "n_classes": d.n_classes,
                "feature_names": d.feature_names,
                "feature_types": d.feature_types,
                "missing_values": d.missing_values,
                "difficulty": d.difficulty,
                "recommended_algorithms": d.recommended_algorithms,
                "tags": d.tags,
                "license": d.license,
            }
            for d in datasets
        ],
        "total": len(datasets),
    }


@router.get("/v2/datasets/{name}")
async def get_dataset_detail_v2(name: str):
    from ..datasets.registry import DatasetRegistry

    entry = DatasetRegistry.get(name)
    X, y = entry.loader(n_samples=5, noise=0.0)

    sample = []
    for i in range(min(5, len(X))):
        row = [f"{v:.4f}" if isinstance(v, float) else str(v) for v in X[i]]
        row.append(str(int(y[i])))
        sample.append(row)

    return {
        "metadata": {
            "name": entry.name,
            "display_name": entry.display_name,
            "description": entry.description,
            "story": entry.story,
            "source": entry.source,
            "family": entry.family,
            "category": entry.category,
            "target_column": entry.target_column,
            "n_rows": entry.n_rows,
            "n_features": entry.n_features,
            "n_classes": entry.n_classes,
            "feature_names": entry.feature_names,
            "feature_types": entry.feature_types,
            "missing_values": entry.missing_values,
            "difficulty": entry.difficulty,
            "recommended_algorithms": entry.recommended_algorithms,
            "tags": entry.tags,
            "license": entry.license,
        },
        "sample": sample,
    }


@router.get("/v2/categories")
async def list_categories():
    from ..datasets.registry import DatasetRegistry

    datasets = DatasetRegistry.list_all()
    categories = {}
    for d in datasets:
        if d.category not in categories:
            categories[d.category] = {"count": 0, "families": set()}
        categories[d.category]["count"] += 1
        categories[d.category]["families"].add(d.family)

    return {
        "categories": [
            {"name": k, "count": v["count"], "families": list(v["families"])}
            for k, v in sorted(categories.items())
        ]
    }


@router.post("/v2/generate")
async def generate_dataset_v2(request: GeneratorRequest):
    from ..algorithms.generators import GENERATORS

    if request.generator not in GENERATORS:
        raise ValueError(f"Unknown generator: '{request.generator}'. Available: {list(GENERATORS.keys())}")

    gen_fn = GENERATORS[request.generator]
    X, y = gen_fn(
        n_samples=request.n_samples,
        noise=request.noise,
        n_classes=request.n_classes,
    )

    return {
        "X": X.tolist(),
        "y": y.tolist(),
        "generator": request.generator,
        "n_samples": len(X),
        "n_classes": len(set(y.tolist())),
    }
