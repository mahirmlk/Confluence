import asyncio
import numpy as np
from fastapi import APIRouter
from ..models.schemas import (
    RegressionRequest, RegressionResponse, DatasetSample, DatasetListResponse,
    RegressionMetricsRequest, RegressionMetricsResponse,
    LearningCurveRequest, LearningCurveResponse,
    CrossValidationRequest,
)
from ..algorithms.datasets import generate_dataset
from ..algorithms.regression import REGRESSION_ALGORITHMS, fit_and_predict_grid_regression
from ..grid import generate_meshgrid, extract_contours, compute_grid_bounds
from ..cache import make_cache_key, get_cached_grid, set_cached_grid

router = APIRouter(prefix="/api/regression", tags=["regression"])


def make_sine_dataset(n_samples: int = 300, noise: float = 0.3):
    rng = np.random.RandomState(42)
    X = rng.uniform(-5, 5, (n_samples, 2))
    y = np.sin(X[:, 0]) * np.cos(X[:, 1]) + rng.randn(n_samples) * noise
    return X, y


DATASET_GENERATORS_REGRESSION = {
    "sine": make_sine_dataset,
}


@router.post("/predict", response_model=RegressionResponse)
async def predict_regression(request: RegressionRequest):
    if request.algorithm not in REGRESSION_ALGORITHMS:
        raise ValueError(f"Unknown regression algorithm: '{request.algorithm}'. Available: {list(REGRESSION_ALGORITHMS.keys())}")

    cache_key = make_cache_key(
        request.algorithm, request.hyperparameters,
        request.dataset_name, request.resolution,
        noise=request.noise, n_samples=request.n_samples, family="regression"
    )
    cached = await get_cached_grid(cache_key)

    if request.dataset_name in DATASET_GENERATORS_REGRESSION:
        X, y = await asyncio.to_thread(
            DATASET_GENERATORS_REGRESSION[request.dataset_name],
            n_samples=request.n_samples, noise=request.noise
        )
    else:
        X, y = await asyncio.to_thread(
            generate_dataset,
            request.dataset_name, n_samples=request.n_samples, noise=request.noise
        )

    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), request.resolution)

    if cached is not None and cached.shape == xx.shape:
        pred_grid = cached
        cache_hit = True
        std_grid = None
    else:
        pred_grid, std_grid = await asyncio.to_thread(
            fit_and_predict_grid_regression,
            request.algorithm, request.hyperparameters, X, y, xx, yy
        )
        await set_cached_grid(cache_key, pred_grid)
        cache_hit = False

    return RegressionResponse(
        grid=pred_grid.tolist(),
        uncertainty_grid=std_grid.tolist() if std_grid is not None else None,
        points=DatasetSample(X=X.tolist(), y=y.tolist()),
        algorithm=request.algorithm,
        cache_hit=cache_hit,
        grid_bounds={"x_min": float(x_min), "x_max": float(x_max), "y_min": float(y_min), "y_max": float(y_max)},
    )


@router.get("/datasets", response_model=DatasetListResponse)
async def list_datasets():
    return {
        "datasets": [
            {"name": "sine", "description": "Sine-cosine wave surface"},
            {"name": "blobs", "description": "Gaussian blobs (binary target)"},
            {"name": "moons", "description": "Interleaving half circles (binary target)"},
            {"name": "circles", "description": "Concentric circles (binary target)"},
            {"name": "spirals", "description": "Spiral patterns (binary target)"},
            {"name": "xor", "description": "XOR distribution (binary target)"},
            {"name": "linearly-separable", "description": "Linearly separable (binary target)"},
            {"name": "iris", "description": "Fisher's Iris (petal length/width)"},
            {"name": "wine", "description": "Wine dataset (alcohol/proline)"},
            {"name": "breast-cancer", "description": "Breast Cancer (radius/texture)"},
        ]
    }


@router.post("/metrics", response_model=RegressionMetricsResponse)
async def regression_metrics(request: RegressionMetricsRequest):
    from ..algorithms.metrics import compute_regression_metrics
    result = await asyncio.to_thread(
        compute_regression_metrics,
        request.algorithm, request.hyperparameters,
        request.dataset_name, request.noise, request.n_samples
    )
    return RegressionMetricsResponse(**result)


@router.post("/learning-curve", response_model=LearningCurveResponse)
async def get_regression_learning_curve(request: LearningCurveRequest):
    from ..algorithms.metrics import compute_regression_learning_curve
    result = await asyncio.to_thread(
        compute_regression_learning_curve,
        request.algorithm, request.hyperparameters,
        request.dataset_name, request.noise, request.n_samples
    )
    return LearningCurveResponse(**result)


@router.post("/cross-validation")
async def regression_cross_validation(request: CrossValidationRequest):
    from ..algorithms.metrics import compute_regression_cross_validation
    result = await asyncio.to_thread(
        compute_regression_cross_validation,
        request.algorithm, request.hyperparameters,
        request.dataset_name, request.n_folds,
        request.noise, request.n_samples
    )
    return result
