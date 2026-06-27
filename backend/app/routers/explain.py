import asyncio
import numpy as np
from fastapi import APIRouter
from ..models.schemas import (
    ExplainPredictionRequest, ExplainPredictionResponse,
    ExplainMetricRequest, ExplainMetricResponse,
    LearningTipRequest, LearningTipResponse,
)
from ..algorithms.datasets import generate_dataset
from ..algorithms.classification import CLASSIFICATION_ALGORITHMS
from ..algorithms.regression import REGRESSION_ALGORITHMS
from ..algorithms.explainers import PredictionExplainer, LearningMode, MetricExplainer
from ..algorithms.metrics import compute_classification_metrics

router = APIRouter(prefix="/api/explain", tags=["explain"])

FEATURE_NAMES_2D = ["Feature 1", "Feature 2"]


def _get_feature_names(dataset_name: str, n_features: int) -> list[str]:
    from ..datasets.registry import DatasetRegistry
    if DatasetRegistry.exists(dataset_name):
        entry = DatasetRegistry.get(dataset_name)
        return entry.feature_names
    return [f"Feature {i+1}" for i in range(n_features)]


@router.post("/prediction", response_model=ExplainPredictionResponse)
async def explain_prediction(request: ExplainPredictionRequest):
    X, y = await asyncio.to_thread(
        generate_dataset, request.dataset_name,
        n_samples=request.n_samples, noise=request.noise
    )

    if request.algorithm in CLASSIFICATION_ALGORITHMS:
        model = CLASSIFICATION_ALGORITHMS[request.algorithm](request.hyperparameters)
    elif request.algorithm in REGRESSION_ALGORITHMS:
        model = REGRESSION_ALGORITHMS[request.algorithm](request.hyperparameters)
    else:
        raise ValueError(f"Unknown algorithm: {request.algorithm}")

    model.fit(X, y)
    point = np.array(request.point)
    feature_names = _get_feature_names(request.dataset_name, X.shape[1])

    result = PredictionExplainer.explain(
        model, point, feature_names,
        X_train=X, y_train=y
    )
    return ExplainPredictionResponse(**result)


@router.post("/metric", response_model=ExplainMetricResponse)
async def explain_metric(request: ExplainMetricRequest):
    X, y = await asyncio.to_thread(
        generate_dataset, request.dataset_name,
        n_samples=request.n_samples, noise=request.noise
    )

    if request.algorithm in CLASSIFICATION_ALGORITHMS:
        model = CLASSIFICATION_ALGORITHMS[request.algorithm](request.hyperparameters)
    else:
        raise ValueError(f"Only classification algorithms supported for metric explanation")

    from sklearn.model_selection import cross_val_predict
    try:
        y_probas = await asyncio.to_thread(cross_val_predict, model, X, y, cv=5, method="predict_proba")
        y_pred = y_probas.argmax(axis=1)
    except Exception:
        model.fit(X, y)
        y_pred = model.predict(X)

    y_true = y.astype(int)
    y_pred = y_pred.astype(int)

    metric = request.metric.lower()
    if metric in ("accuracy", "precision", "recall", "f1"):
        explanation = MetricExplainer.explain(metric, y_true=y_true, y_pred=y_pred)
    elif metric == "confusion_matrix":
        from sklearn.metrics import confusion_matrix
        cm = confusion_matrix(y_true, y_pred).tolist()
        explanation = MetricExplainer.explain("confusion_matrix", cm=cm)
    else:
        explanation = {"error": f"Metric '{metric}' not supported yet."}

    return ExplainMetricResponse(metric=request.metric, explanation=explanation)


@router.post("/learning-tip", response_model=LearningTipResponse)
async def get_learning_tip(request: LearningTipRequest):
    if request.element == "boundary":
        tip = LearningMode.explain_boundary(request.algorithm, request.hyperparameters)
    elif request.element == "hyperparameter":
        param_name = request.hyperparameters.get("_param", "unknown")
        value = request.value if request.value is not None else 0
        tip = LearningMode.explain_hyperparameter(request.algorithm, param_name, value)
    else:
        tip = f"Hover over visual elements to learn how {request.algorithm} works."

    return LearningTipResponse(tip=tip, element=request.element, algorithm=request.algorithm)
