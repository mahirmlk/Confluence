import numpy as np
from pydantic import BaseModel, Field
from typing import Optional


class DatasetSample(BaseModel):
    X: list[list[float]]
    y: list[float]


class PredictionRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    resolution: int = Field(default=100, ge=1, le=200)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class PredictionResponse(BaseModel):
    grid: list[list[float]]
    contour_lines: list[list[list[float]]]
    points: DatasetSample
    algorithm: str
    cache_hit: bool
    grid_bounds: dict


class MetricsRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class ClassificationMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1: float
    confusion_matrix: list[list[int]]
    roc_curve: dict
    log_loss: Optional[float] = None


class RegressionRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    resolution: int = Field(default=100, ge=1, le=200)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class RegressionResponse(BaseModel):
    grid: list[list[float]]
    uncertainty_grid: Optional[list[list[float]]] = None
    points: DatasetSample
    algorithm: str
    cache_hit: bool
    grid_bounds: dict


class ClusteringRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    resolution: int = Field(default=100, ge=1, le=200)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class ClusteringResponse(BaseModel):
    label_grid: list[list[float]]
    points: DatasetSample
    algorithm: str
    metrics: dict
    cache_hit: bool
    grid_bounds: dict


class DimReductionRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    n_components: int = Field(default=2, ge=2, le=3)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class DimReductionResponse(BaseModel):
    embedding: list[list[float]]
    points: DatasetSample
    algorithm: str
    info: dict
    cache_hit: bool


class HealthResponse(BaseModel):
    status: str
    version: str


class DatasetInfo(BaseModel):
    name: str
    description: str


class DatasetListResponse(BaseModel):
    datasets: list[DatasetInfo]


class AlgorithmInfo(BaseModel):
    name: str
    description: str
    tag: str


class AlgorithmListResponse(BaseModel):
    algorithms: list[AlgorithmInfo]


class RegressionMetricsRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class RegressionMetricsResponse(BaseModel):
    r2: float
    mse: float
    rmse: float
    mae: float
    residuals: list[float]
    predicted: list[float]
    actual: list[float]


class ClusteringElbowRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    k_min: int = Field(default=2, ge=2, le=5)
    k_max: int = Field(default=10, ge=3, le=15)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class ClusteringElbowResponse(BaseModel):
    k_values: list[int]
    inertias: list[float]
    silhouettes: list[float]


class CrossValidationRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    n_folds: int = Field(default=5, ge=3, le=10)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class FoldResult(BaseModel):
    fold: int
    accuracy: float
    grid: list[list[float]]
    contour_lines: list[list[list[float]]]
    grid_bounds: dict


class CrossValidationResponse(BaseModel):
    folds: list[FoldResult]
    mean_accuracy: float
    std_accuracy: float


class CoefficientRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class CoefficientResponse(BaseModel):
    coefficients: list[float]
    intercept: float
    feature_names: list[str]
    model_type: str


class LearningCurveRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class LearningCurveResponse(BaseModel):
    train_sizes: list[int]
    train_scores: list[float]
    validation_scores: list[float]


class SensitivityRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    param1: str = Field(min_length=1, max_length=50)
    param1_range: list[float]
    param2: str = Field(min_length=1, max_length=50)
    param2_range: list[float]
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class SensitivityResponse(BaseModel):
    param1_values: list[float]
    param2_values: list[float]
    accuracy_grid: list[list[float]]


class DecisionPathRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    point: list[float]
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class DecisionPathResponse(BaseModel):
    path: list[str]
    prediction: int
    model_type: str


# --- V2 Dataset Schemas ---

class DatasetMetadataV2(BaseModel):
    name: str
    display_name: str
    description: str
    story: str
    source: str
    family: str
    category: str
    target_column: Optional[str] = None
    n_rows: int
    n_features: int
    n_classes: Optional[int] = None
    feature_names: list[str]
    feature_types: list[str]
    missing_values: bool
    difficulty: str
    recommended_algorithms: list[str]
    tags: list[str]
    license: Optional[str] = None


class DatasetListV2Response(BaseModel):
    datasets: list[DatasetMetadataV2]
    total: int


class DatasetDetailV2Response(BaseModel):
    metadata: DatasetMetadataV2
    sample: list[list[str]]


class GeneratorRequest(BaseModel):
    generator: str = Field(min_length=1, max_length=50)
    n_samples: int = Field(default=300, ge=10, le=5000)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_classes: int = Field(default=2, ge=2, le=5)
    custom_params: dict = Field(default={}, max_length=20)


class GeneratorResponse(BaseModel):
    X: list[list[float]]
    y: list[float]
    generator: str
    n_samples: int
    n_classes: int


# --- Explain Schemas ---

class ExplainPredictionRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    point: list[float]
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class ExplainPredictionResponse(BaseModel):
    prediction: int
    probabilities: list[float]
    explanation: dict


class ExplainMetricRequest(BaseModel):
    metric: str = Field(min_length=1, max_length=50)
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


class ExplainMetricResponse(BaseModel):
    metric: str
    explanation: dict


class LearningTipRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    element: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    value: Optional[float] = None


class LearningTipResponse(BaseModel):
    tip: str
    element: str
    algorithm: str


class TreeBuildRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)
    max_depth: int = Field(default=5, ge=1, le=15)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)
