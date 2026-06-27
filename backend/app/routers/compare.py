import asyncio
import time
import logging
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from typing import Optional
from ..algorithms.datasets import generate_dataset
from ..algorithms.classification import CLASSIFICATION_ALGORITHMS
from ..algorithms.regression import REGRESSION_ALGORITHMS
from ..grid import generate_meshgrid, compute_grid_bounds, extract_contours
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/compare", tags=["compare"])


# --- Hyperparameter Comparison ---

class HyperparamConfig(BaseModel):
    params: dict = Field(default={})


class HyperparamComparisonRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    configs: list[dict]
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)
    resolution: int = Field(default=80, ge=10, le=150)


@router.post("/hyperparameter-comparison")
async def compare_hyperparameters(request: HyperparamComparisonRequest):
    X, y = await asyncio.to_thread(generate_dataset, request.dataset_name, n_samples=request.n_samples, noise=request.noise)

    if request.algorithm not in CLASSIFICATION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {request.algorithm}")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), request.resolution)
    grid_points = np.column_stack([xx.ravel(), yy.ravel()])

    results = []
    for config in request.configs:
        model = CLASSIFICATION_ALGORITHMS[request.algorithm](config)
        model.fit(X_train, y_train)

        probas = model.predict_proba(grid_points)
        grid = probas[:, 1].reshape(xx.shape) if probas.shape[1] == 2 else probas.argmax(axis=1).astype(float).reshape(xx.shape)
        contours = extract_contours(grid, threshold=0.5)

        train_acc = float(accuracy_score(y_train, model.predict(X_train)))
        test_acc = float(accuracy_score(y_test, model.predict(X_test)))

        results.append({
            "config": config,
            "config_label": ", ".join(f"{k}={v}" for k, v in config.items()),
            "grid": grid.tolist(),
            "contour_lines": contours,
            "train_accuracy": round(train_acc, 4),
            "test_accuracy": round(test_acc, 4),
            "gap": round(train_acc - test_acc, 4),
        })

    return {
        "results": results,
        "grid_bounds": {"x_min": float(x_min), "x_max": float(x_max), "y_min": float(y_min), "y_max": float(y_max)},
    }


# --- Algorithm Race ---

class RaceRequest(BaseModel):
    algorithms: list[str]
    dataset_name: str = Field(min_length=1, max_length=50)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)
    resolution: int = Field(default=80, ge=10, le=150)


@router.websocket("/race")
async def algorithm_race(ws: WebSocket):
    await ws.accept()
    try:
        data = await ws.receive_json()
        if not isinstance(data, dict):
            await ws.send_json({"type": "error", "message": "Invalid format"})
            return

        algorithms = data.get("algorithms", [])
        dataset_name = data.get("dataset_name", "blobs")
        noise = float(data.get("noise", 0.5))
        n_samples = min(int(data.get("n_samples", 300)), 5000)
        resolution = min(int(data.get("resolution", 80)), 120)

        X, y = await asyncio.to_thread(generate_dataset, dataset_name, n_samples=n_samples, noise=noise)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        x_min, x_max, y_min, y_max = compute_grid_bounds(X)
        xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), resolution)
        grid_points = np.column_stack([xx.ravel(), yy.ravel()])

        all_results = {}
        for algo_name in algorithms:
            if algo_name not in CLASSIFICATION_ALGORITHMS:
                await ws.send_json({"type": "error", "message": f"Unknown algorithm: {algo_name}"})
                continue

            start_time = time.time()
            model = CLASSIFICATION_ALGORITHMS[algo_name]({})
            await asyncio.to_thread(model.fit, X_train, y_train)
            train_time = time.time() - start_time

            start_pred = time.time()
            y_pred = await asyncio.to_thread(model.predict, X_test)
            pred_time = time.time() - start_pred

            probas = await asyncio.to_thread(model.predict_proba, grid_points)
            grid = probas[:, 1].reshape(xx.shape) if probas.shape[1] == 2 else probas.argmax(axis=1).astype(float).reshape(xx.shape)

            acc = float(accuracy_score(y_test, y_pred))

            result = {
                "algorithm": algo_name,
                "grid": grid.tolist(),
                "accuracy": round(acc, 4),
                "train_time": round(train_time, 4),
                "pred_time": round(pred_time, 6),
                "grid_bounds": {"x_min": float(x_min), "x_max": float(x_max), "y_min": float(y_min), "y_max": float(y_max)},
            }
            all_results[algo_name] = result

            await ws.send_json({"type": "algorithm_done", "algorithm": algo_name, "result": result})

        await ws.send_json({"type": "race_complete", "results": all_results})

    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("Algorithm race error")
        try:
            await ws.send_json({"type": "error", "message": "An error occurred"})
        except Exception:
            pass
    finally:
        try:
            await ws.close()
        except Exception:
            pass


# --- Benchmark Suite ---

class BenchmarkRequest(BaseModel):
    algorithms: list[str]
    datasets: list[str]
    n_samples: int = Field(default=300, ge=10, le=5000)
    noise: float = Field(default=0.5, ge=0, le=5)


@router.post("/benchmark")
async def run_benchmark(request: BenchmarkRequest):
    results = []

    for dataset_name in request.datasets:
        try:
            X, y = await asyncio.to_thread(generate_dataset, dataset_name, n_samples=request.n_samples, noise=request.noise)
        except Exception:
            continue

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        for algo_name in request.algorithms:
            if algo_name not in CLASSIFICATION_ALGORITHMS:
                continue

            try:
                import tracemalloc
                tracemalloc.start()

                start_time = time.time()
                model = CLASSIFICATION_ALGORITHMS[algo_name]({})
                model.fit(X_train, y_train)
                train_time = time.time() - start_time

                current, peak_memory = tracemalloc.get_traced_memory()
                tracemalloc.stop()

                start_pred = time.time()
                for _ in range(10):
                    model.predict(X_test[:10])
                pred_time = (time.time() - start_pred) / 10

                y_pred = model.predict(X_test)
                acc = float(accuracy_score(y_test, y_pred))

                results.append({
                    "algorithm": algo_name,
                    "dataset": dataset_name,
                    "accuracy": round(acc, 4),
                    "train_time": round(train_time, 4),
                    "pred_time": round(pred_time, 6),
                    "peak_memory_kb": round(peak_memory / 1024, 2),
                    "n_samples": len(X),
                    "n_features": X.shape[1],
                })
            except Exception as e:
                logger.warning("Benchmark failed for %s on %s: %s", algo_name, dataset_name, e)
                results.append({
                    "algorithm": algo_name,
                    "dataset": dataset_name,
                    "accuracy": 0,
                    "train_time": 0,
                    "pred_time": 0,
                    "peak_memory_kb": 0,
                    "n_samples": 0,
                    "n_features": 0,
                    "error": str(e),
                })

    return {"results": results}
