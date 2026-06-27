import asyncio
import logging
import numpy as np
from fastapi import APIRouter
from ..models.schemas import ClusteringRequest, ClusteringResponse, DatasetSample, DatasetListResponse, ClusteringElbowRequest, ClusteringElbowResponse
from ..algorithms.datasets import generate_dataset
from ..algorithms.clustering import CLUSTERING_ALGORITHMS, fit_and_predict_clustering
from ..pipeline import VisualizationPipeline
from ..grid import generate_meshgrid, compute_grid_bounds

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/clustering", tags=["clustering"])


@router.post("/predict", response_model=ClusteringResponse)
async def predict_clustering(request: ClusteringRequest):
    if request.algorithm not in CLUSTERING_ALGORITHMS:
        raise ValueError(f"Unknown clustering algorithm: '{request.algorithm}'. Available: {list(CLUSTERING_ALGORITHMS.keys())}")

    X, y = await asyncio.to_thread(generate_dataset, request.dataset_name, n_samples=request.n_samples, noise=request.noise)

    # Use unified pipeline (no scaling for clustering — algorithms are scale-sensitive differently)
    pipeline = VisualizationPipeline()
    X_2d, metadata = pipeline.process(X, request.algorithm, scale=False)

    # Add class names
    from ..pipeline import DATASET_CLASS_NAMES
    metadata["class_names"] = DATASET_CLASS_NAMES.get(request.dataset_name, [])

    bounds = compute_grid_bounds(X_2d)
    xx, yy = generate_meshgrid((bounds[0], bounds[1]), (bounds[2], bounds[3]), request.resolution)

    label_grid, metrics = await asyncio.to_thread(
        fit_and_predict_clustering,
        request.algorithm, request.hyperparameters, X_2d, xx, yy
    )

    return ClusteringResponse(
        label_grid=label_grid.tolist(),
        points=DatasetSample(X=X_2d.tolist(), y=y.tolist()),
        algorithm=request.algorithm,
        metrics=metrics,
        cache_hit=False,
        grid_bounds={"x_min": float(bounds[0]), "x_max": float(bounds[1]), "y_min": float(bounds[2]), "y_max": float(bounds[3])},
        viz_metadata=metadata,
    )


@router.get("/datasets", response_model=DatasetListResponse)
async def list_datasets():
    return {
        "datasets": [
            {"name": "blobs", "description": "Gaussian blobs"},
            {"name": "moons", "description": "Interleaving half circles"},
            {"name": "circles", "description": "Concentric circles"},
            {"name": "spirals", "description": "Spiral patterns"},
            {"name": "xor", "description": "XOR distribution"},
            {"name": "iris", "description": "Fisher's Iris (petal length/width)"},
            {"name": "wine", "description": "Wine dataset (alcohol/proline)"},
            {"name": "breast-cancer", "description": "Breast Cancer (radius/texture)"},
        ]
    }


@router.post("/elbow", response_model=ClusteringElbowResponse)
async def clustering_elbow(request: ClusteringElbowRequest):
    from sklearn.cluster import KMeans
    from sklearn.metrics import silhouette_score

    X, _ = await asyncio.to_thread(
        generate_dataset, request.dataset_name,
        n_samples=request.n_samples, noise=request.noise
    )

    # PCA for elbow plot if needed
    if X.shape[1] > 2:
        from sklearn.decomposition import PCA
        X = PCA(n_components=2, random_state=42).fit_transform(X)

    k_values = list(range(request.k_min, request.k_max + 1))
    inertias = []
    silhouettes = []

    for k in k_values:
        model = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = await asyncio.to_thread(model.fit_predict, X)
        inertias.append(float(model.inertia_))
        try:
            sil = float(silhouette_score(X, labels))
        except Exception:
            sil = 0.0
        silhouettes.append(sil)

    return ClusteringElbowResponse(
        k_values=k_values,
        inertias=inertias,
        silhouettes=silhouettes,
    )
