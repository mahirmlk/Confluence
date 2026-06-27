import asyncio
import logging
from fastapi import APIRouter
from ..models.schemas import (
    PredictionRequest, PredictionResponse, DatasetSample, MetricsRequest,
    ClassificationMetrics, DatasetListResponse,
    CrossValidationRequest, CrossValidationResponse,
    CoefficientRequest, CoefficientResponse,
    LearningCurveRequest, LearningCurveResponse,
    SensitivityRequest, SensitivityResponse,
    DecisionPathRequest, DecisionPathResponse,
)
from ..algorithms.datasets import generate_dataset
from ..algorithms.classification import CLASSIFICATION_ALGORITHMS, fit_and_predict_grid
from ..algorithms.metrics import compute_classification_metrics
from ..pipeline import run_pipeline
from ..cache import make_cache_key, get_cached_grid, set_cached_grid

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/classification", tags=["classification"])


@router.post("/predict", response_model=PredictionResponse)
async def predict_classification(request: PredictionRequest):
    if request.algorithm not in CLASSIFICATION_ALGORITHMS:
        raise ValueError(f"Unknown classification algorithm: '{request.algorithm}'. Available: {list(CLASSIFICATION_ALGORITHMS.keys())}")

    cache_key = make_cache_key(
        request.algorithm, request.hyperparameters,
        request.dataset_name, request.resolution,
        noise=request.noise, n_samples=request.n_samples, family="classification"
    )
    cached = await get_cached_grid(cache_key)

    X, y = await asyncio.to_thread(generate_dataset, request.dataset_name, n_samples=request.n_samples, noise=request.noise)

    if cached is not None:
        # Re-run pipeline for metadata but use cached grid
        pipeline_result = await asyncio.to_thread(
            run_pipeline, X, y, request.algorithm, request.hyperparameters,
            fit_and_predict_grid, request.resolution, dataset_name=request.dataset_name
        )
        if cached.shape == pipeline_result["grid"].shape:
            pipeline_result["grid"] = cached
            pipeline_result["cache_hit"] = True
        return PredictionResponse(
            grid=pipeline_result["grid"].tolist(),
            contour_lines=pipeline_result["contour_lines"],
            points=DatasetSample(X=pipeline_result["points_x"], y=pipeline_result["points_y"]),
            algorithm=request.algorithm,
            cache_hit=pipeline_result["cache_hit"],
            grid_bounds=pipeline_result["grid_bounds"],
            viz_metadata=pipeline_result["metadata"],
        )

    pipeline_result = await asyncio.to_thread(
        run_pipeline, X, y, request.algorithm, request.hyperparameters,
        fit_and_predict_grid, request.resolution, dataset_name=request.dataset_name
    )

    await set_cached_grid(cache_key, pipeline_result["grid"])

    return PredictionResponse(
        grid=pipeline_result["grid"].tolist(),
        contour_lines=pipeline_result["contour_lines"],
        points=DatasetSample(X=pipeline_result["points_x"], y=pipeline_result["points_y"]),
        algorithm=request.algorithm,
        cache_hit=False,
        grid_bounds=pipeline_result["grid_bounds"],
        viz_metadata=pipeline_result["metadata"],
    )


@router.post("/metrics", response_model=ClassificationMetrics)
async def classification_metrics(request: MetricsRequest):
    result = await asyncio.to_thread(
        compute_classification_metrics,
        request.algorithm, request.hyperparameters,
        request.dataset_name, request.noise, request.n_samples
    )
    return ClassificationMetrics(**result)


@router.get("/datasets", response_model=DatasetListResponse)
async def list_datasets():
    return {
        "datasets": [
            {"name": "blobs", "description": "Gaussian blobs"},
            {"name": "blobs-3class", "description": "Gaussian blobs (3 classes)"},
            {"name": "blobs-4class", "description": "Gaussian blobs (4 classes)"},
            {"name": "moons", "description": "Interleaving half circles"},
            {"name": "circles", "description": "Concentric circles"},
            {"name": "spirals", "description": "Spiral patterns"},
            {"name": "xor", "description": "XOR distribution"},
            {"name": "linearly-separable", "description": "Linearly separable"},
            {"name": "checkerboard", "description": "Checkerboard pattern"},
            {"name": "iris", "description": "Fisher's Iris (petal length/width, 3 classes)"},
            {"name": "wine", "description": "Wine dataset (alcohol/proline, 3 classes)"},
            {"name": "breast-cancer", "description": "Breast Cancer (radius/texture, 2 classes)"},
        ]
    }


@router.post("/cross-validation", response_model=CrossValidationResponse)
async def cross_validation(request: CrossValidationRequest):
    from ..algorithms.metrics import compute_cross_validation
    result = await asyncio.to_thread(
        compute_cross_validation,
        request.algorithm, request.hyperparameters,
        request.dataset_name, request.n_folds,
        request.noise, request.n_samples
    )
    return CrossValidationResponse(**result)


@router.post("/coefficients", response_model=CoefficientResponse)
async def get_coefficients(request: CoefficientRequest):
    from ..algorithms.metrics import compute_coefficients
    result = await asyncio.to_thread(
        compute_coefficients,
        request.algorithm, request.hyperparameters,
        request.dataset_name, request.noise, request.n_samples
    )
    return CoefficientResponse(**result)


@router.post("/learning-curve", response_model=LearningCurveResponse)
async def get_learning_curve(request: LearningCurveRequest):
    from ..algorithms.metrics import compute_learning_curve
    result = await asyncio.to_thread(
        compute_learning_curve,
        request.algorithm, request.hyperparameters,
        request.dataset_name, request.noise, request.n_samples
    )
    return LearningCurveResponse(**result)


@router.post("/sensitivity", response_model=SensitivityResponse)
async def get_sensitivity(request: SensitivityRequest):
    from ..algorithms.metrics import compute_sensitivity
    result = await asyncio.to_thread(
        compute_sensitivity,
        request.algorithm, request.hyperparameters,
        request.dataset_name,
        request.param1, [float(v) for v in request.param1_range],
        request.param2, [float(v) for v in request.param2_range],
        request.noise, request.n_samples
    )
    return SensitivityResponse(**result)


@router.post("/decision-path", response_model=DecisionPathResponse)
async def get_decision_path(request: DecisionPathRequest):
    from ..algorithms.metrics import compute_decision_path
    result = await asyncio.to_thread(
        compute_decision_path,
        request.algorithm, request.hyperparameters,
        request.dataset_name, request.point,
        request.noise, request.n_samples
    )
    return DecisionPathResponse(**result)
