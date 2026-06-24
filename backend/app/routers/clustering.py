import asyncio
import numpy as np
from fastapi import APIRouter
from ..models.schemas import ClusteringRequest, ClusteringResponse, DatasetSample, DatasetListResponse, ClusteringElbowRequest, ClusteringElbowResponse
from ..algorithms.datasets import generate_dataset
from ..algorithms.clustering import fit_and_predict_clustering
from ..grid import generate_meshgrid, compute_grid_bounds

router = APIRouter(prefix="/api/clustering", tags=["clustering"])


@router.post("/predict", response_model=ClusteringResponse)
async def predict_clustering(request: ClusteringRequest):
    X, y = await asyncio.to_thread(generate_dataset, request.dataset_name, n_samples=request.n_samples, noise=request.noise)

    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), request.resolution)

    label_grid, metrics = await asyncio.to_thread(
        fit_and_predict_clustering,
        request.algorithm, request.hyperparameters, X, xx, yy
    )

    return ClusteringResponse(
        label_grid=label_grid.tolist(),
        points=DatasetSample(X=X.tolist(), y=y.tolist()),
        algorithm=request.algorithm,
        metrics=metrics,
        cache_hit=False,
        grid_bounds={"x_min": x_min, "x_max": x_max, "y_min": y_min, "y_max": y_max},
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
