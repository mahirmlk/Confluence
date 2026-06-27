import json
import asyncio
import logging
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..algorithms.datasets import generate_dataset
from ..grid import generate_meshgrid, compute_grid_bounds

logger = logging.getLogger(__name__)

router = APIRouter(tags=["streaming"])


async def stream_boosting_frames(ws: WebSocket, algorithm: str, params: dict, dataset_name: str, resolution: int, noise: float = 0.5, n_samples: int = 300):
    X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)
    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), resolution)

    n_estimators = int(params.get("n_estimators", 50))
    step = max(1, n_estimators // 20)

    if algorithm == "adaboost":
        from sklearn.ensemble import AdaBoostClassifier
        model = AdaBoostClassifier(n_estimators=1, random_state=42)
    elif algorithm == "gradient-boosting":
        from sklearn.ensemble import GradientBoostingClassifier
        model = GradientBoostingClassifier(n_estimators=1, random_state=42, warm_start=True)
    else:
        from sklearn.ensemble import RandomForestClassifier
        model = RandomForestClassifier(n_estimators=1, random_state=42, warm_start=True)

    for n_trees in range(1, n_estimators + 1, step):
        if algorithm == "adaboost":
            model.set_params(n_estimators=n_trees)
        elif algorithm == "gradient-boosting":
            model.set_params(n_estimators=n_trees)
        else:
            model.set_params(n_estimators=n_trees)

        await asyncio.to_thread(model.fit, X, y)
        grid_points = np.column_stack([xx.ravel(), yy.ravel()])
        probas = await asyncio.to_thread(model.predict_proba, grid_points)
        if probas.shape[1] == 2:
            grid = probas[:, 1].reshape(xx.shape)
        else:
            grid = probas.max(axis=1).reshape(xx.shape)

        await ws.send_json({
            "type": "frame",
            "step": n_trees,
            "total_steps": n_estimators,
            "grid": grid.tolist(),
        })
        await asyncio.sleep(0.1)

    await ws.send_json({"type": "done"})


async def stream_gradient_descent_frames(ws: WebSocket, params: dict, dataset_name: str, resolution: int, noise: float = 0.5, n_samples: int = 300):
    from sklearn.linear_model import SGDClassifier

    X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)
    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), resolution)

    n_epochs = int(params.get("n_epochs", 20))
    model = SGDClassifier(loss="log_loss", random_state=42, warm_start=True)

    for epoch in range(1, n_epochs + 1):
        await asyncio.to_thread(model.fit, X, y)
        grid_points = np.column_stack([xx.ravel(), yy.ravel()])
        probas = await asyncio.to_thread(model.predict_proba, grid_points)
        if probas.shape[1] == 2:
            grid = probas[:, 1].reshape(xx.shape)
        else:
            grid = probas.max(axis=1).reshape(xx.shape)

        await ws.send_json({
            "type": "frame",
            "step": epoch,
            "total_steps": n_epochs,
            "grid": grid.tolist(),
        })
        await asyncio.sleep(0.15)

    await ws.send_json({"type": "done"})


async def stream_tree_growth_frames(ws: WebSocket, params: dict, dataset_name: str, resolution: int, noise: float = 0.5, n_samples: int = 300):
    from sklearn.tree import DecisionTreeClassifier

    X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)
    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), resolution)

    max_depth = int(params.get("max_depth", 10))

    for depth in range(1, max_depth + 1):
        model = DecisionTreeClassifier(max_depth=depth, random_state=42)
        await asyncio.to_thread(model.fit, X, y)
        grid_points = np.column_stack([xx.ravel(), yy.ravel()])
        probas = await asyncio.to_thread(model.predict_proba, grid_points)
        if probas.shape[1] == 2:
            grid = probas[:, 1].reshape(xx.shape)
        else:
            grid = probas.max(axis=1).reshape(xx.shape)

        await ws.send_json({
            "type": "frame",
            "step": depth,
            "total_steps": max_depth,
            "grid": grid.tolist(),
        })
        await asyncio.sleep(0.2)

    await ws.send_json({"type": "done"})


async def stream_mlp_frames(ws: WebSocket, params: dict, dataset_name: str, resolution: int, noise: float = 0.5, n_samples: int = 300):
    from sklearn.neural_network import MLPClassifier

    X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)
    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), resolution)

    max_epochs = int(params.get("max_epochs", 50))
    model = MLPClassifier(
        hidden_layer_sizes=(int(params.get("hidden_layer_sizes", 100)),),
        max_iter=1, warm_start=True, random_state=42
    )

    for epoch in range(1, max_epochs + 1):
        await asyncio.to_thread(model.fit, X, y)
        grid_points = np.column_stack([xx.ravel(), yy.ravel()])
        probas = await asyncio.to_thread(model.predict_proba, grid_points)
        if probas.shape[1] == 2:
            grid = probas[:, 1].reshape(xx.shape)
        else:
            grid = probas.max(axis=1).reshape(xx.shape)

        await ws.send_json({
            "type": "frame",
            "step": epoch,
            "total_steps": max_epochs,
            "grid": grid.tolist(),
        })
        await asyncio.sleep(0.1)

    await ws.send_json({"type": "done"})


STAGED_ALGORITHMS = {
    "adaboost": stream_boosting_frames,
    "gradient-boosting": stream_boosting_frames,
    "random-forest": stream_boosting_frames,
    "sgd": stream_gradient_descent_frames,
    "decision-tree": stream_tree_growth_frames,
    "mlp": stream_mlp_frames,
}


@router.websocket("/ws/stream")
async def stream_training(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_json()
        if not isinstance(data, dict):
            await websocket.send_json({"type": "error", "message": "Invalid message format"})
            return

        algorithm = data.get("algorithm", "")
        params = data.get("hyperparameters", {})
        if not isinstance(params, dict):
            params = {}
        dataset_name = data.get("dataset_name", "blobs")
        resolution = min(int(data.get("resolution", 100)), 200)
        noise = float(data.get("noise", 0.5))
        n_samples = min(int(data.get("n_samples", 300)), 5000)
        params["n_estimators"] = min(int(params.get("n_estimators", 50)), 200)
        params["max_depth"] = min(int(params.get("max_depth", 10)), 20)
        params["n_epochs"] = min(int(params.get("n_epochs", 20)), 100)
        params["max_epochs"] = min(int(params.get("max_epochs", 50)), 100)

        stream_fn = STAGED_ALGORITHMS.get(algorithm)
        if stream_fn:
            if stream_fn is stream_boosting_frames:
                await stream_fn(websocket, algorithm, params, dataset_name, resolution, noise, n_samples)
            else:
                await stream_fn(websocket, params, dataset_name, resolution, noise, n_samples)
        else:
            await websocket.send_json({
                "type": "error",
                "message": f"Streaming not available for {algorithm}. Available: {list(STAGED_ALGORITHMS.keys())}"
            })
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.exception("WebSocket stream error")
        try:
            await websocket.send_json({"type": "error", "message": "An error occurred during computation"})
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


def _extract_tree_structure(model, feature_names: list[str]) -> dict:
    tree = model.tree_

    def build_node(node_id):
        if tree.children_left[node_id] == tree.children_right[node_id]:
            value = tree.value[node_id].tolist()[0]
            return {
                "id": int(node_id),
                "type": "leaf",
                "prediction": int(np.argmax(value)),
                "samples": int(tree.n_node_samples[node_id]),
                "gini": round(float(tree.impurity[node_id]), 4),
                "class_counts": [int(v) for v in value],
            }
        feature_idx = tree.feature[node_id]
        fname = feature_names[feature_idx] if feature_idx < len(feature_names) else f"f{feature_idx}"
        return {
            "id": int(node_id),
            "type": "split",
            "feature": fname,
            "feature_idx": int(feature_idx),
            "threshold": round(float(tree.threshold[node_id]), 4),
            "gini": round(float(tree.impurity[node_id]), 4),
            "samples": int(tree.n_node_samples[node_id]),
            "left": build_node(tree.children_left[node_id]),
            "right": build_node(tree.children_right[node_id]),
        }

    return build_node(0)


@router.websocket("/ws/tree-build")
async def stream_tree_build(websocket: WebSocket):
    from ..algorithms.datasets import generate_dataset
    from ..algorithms.classification import CLASSIFICATION_ALGORITHMS
    from ..datasets.registry import DatasetRegistry

    await websocket.accept()
    try:
        data = await websocket.receive_json()
        if not isinstance(data, dict):
            await websocket.send_json({"type": "error", "message": "Invalid message format"})
            return

        dataset_name = data.get("dataset_name", "blobs")
        max_depth = min(int(data.get("max_depth", 5)), 15)
        noise = float(data.get("noise", 0.5))
        n_samples = min(int(data.get("n_samples", 300)), 5000)
        params = data.get("hyperparameters", {})

        X, y = await asyncio.to_thread(generate_dataset, dataset_name, n_samples=n_samples, noise=noise)

        feature_names = [f"Feature {i+1}" for i in range(X.shape[1])]
        if DatasetRegistry.exists(dataset_name):
            entry = DatasetRegistry.get(dataset_name)
            feature_names = entry.feature_names

        x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
        y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
        resolution = min(int(data.get("resolution", 80)), 100)
        xx, yy = np.meshgrid(
            np.linspace(x_min, x_max, resolution),
            np.linspace(y_min, y_max, resolution),
        )
        grid_points = np.column_stack([xx.ravel(), yy.ravel()])

        for depth in range(1, max_depth + 1):
            from sklearn.tree import DecisionTreeClassifier
            model = DecisionTreeClassifier(max_depth=depth, random_state=42)
            await asyncio.to_thread(model.fit, X, y)

            probas = await asyncio.to_thread(model.predict_proba, grid_points)
            if probas.shape[1] == 2:
                grid = probas[:, 1].reshape(xx.shape)
            else:
                grid = probas.argmax(axis=1).astype(float).reshape(xx.shape)

            tree_structure = _extract_tree_structure(model, feature_names)

            train_acc = float(np.mean(model.predict(X) == y))

            await websocket.send_json({
                "type": "step",
                "depth": depth,
                "max_depth": max_depth,
                "tree": tree_structure,
                "grid": grid.tolist(),
                "grid_bounds": {
                    "x_min": float(x_min), "x_max": float(x_max),
                    "y_min": float(y_min), "y_max": float(y_max),
                },
                "metrics": {
                    "train_accuracy": round(train_acc, 4),
                    "n_leaves": int(model.get_n_leaves()),
                    "n_nodes": int(model.tree_.node_count),
                },
            })
            await asyncio.sleep(0.3)

        await websocket.send_json({"type": "done"})
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.exception("WebSocket tree-build error")
        try:
            await websocket.send_json({"type": "error", "message": "An error occurred during tree construction"})
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
