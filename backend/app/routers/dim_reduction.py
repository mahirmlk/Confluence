import asyncio
import numpy as np
from fastapi import APIRouter
from ..models.schemas import DimReductionRequest, DimReductionResponse, DatasetSample, AlgorithmListResponse
from ..algorithms.datasets import generate_dataset
from ..algorithms.dim_reduction import fit_and_reduce

router = APIRouter(prefix="/api/dim-reduction", tags=["dimensionality-reduction"])


@router.post("/reduce", response_model=DimReductionResponse)
async def reduce_dimensions(request: DimReductionRequest):
    X, y = await asyncio.to_thread(generate_dataset, request.dataset_name, n_samples=request.n_samples, noise=request.noise)

    embedding, info = await asyncio.to_thread(
        fit_and_reduce,
        request.algorithm, request.hyperparameters, X, request.n_components, y
    )

    return DimReductionResponse(
        embedding=embedding.tolist(),
        points=DatasetSample(X=X.tolist(), y=y.tolist()),
        algorithm=request.algorithm,
        info=info,
        cache_hit=False,
    )


@router.get("/algorithms", response_model=AlgorithmListResponse)
async def list_algorithms():
    return {
        "algorithms": [
            {"name": "pca", "description": "Principal Component Analysis", "tag": "linear"},
            {"name": "tsne", "description": "t-Distributed Stochastic Neighbor Embedding", "tag": "manifold"},
            {"name": "umap", "description": "Uniform Manifold Approximation and Projection", "tag": "manifold"},
            {"name": "isomap", "description": "Isometric Mapping", "tag": "manifold"},
            {"name": "lda", "description": "Linear Discriminant Analysis", "tag": "linear"},
        ]
    }
