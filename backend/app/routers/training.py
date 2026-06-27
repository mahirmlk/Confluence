import asyncio
import logging
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..models.schemas import ExplainPredictionRequest
from ..algorithms.datasets import generate_dataset
from ..algorithms.classification import CLASSIFICATION_ALGORITHMS
from ..grid import generate_meshgrid, compute_grid_bounds

logger = logging.getLogger(__name__)
router = APIRouter(tags=["training"])


# --- WebSocket Training Playground ---

async def _stream_logistic_regression(ws, X, y, params, resolution):
    from sklearn.linear_model import SGDClassifier
    from sklearn.metrics import accuracy_score, log_loss

    n_epochs = int(params.get("n_epochs", 50))
    model = SGDClassifier(loss="log_loss", random_state=42, warm_start=True)

    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), resolution)
    grid_points = np.column_stack([xx.ravel(), yy.ravel()])

    losses = []
    for epoch in range(1, n_epochs + 1):
        model.fit(X, y)
        probas = model.predict_proba(grid_points)
        grid = probas[:, 1].reshape(xx.shape) if probas.shape[1] == 2 else probas.argmax(axis=1).astype(float).reshape(xx.shape)

        y_pred_proba = model.predict_proba(X)
        loss = float(log_loss(y, y_pred_proba))
        losses.append(loss)

        coef = model.coef_[0].tolist() if hasattr(model, 'coef_') else []
        intercept = float(model.intercept_[0]) if hasattr(model, 'intercept_') else 0

        await ws.send_json({
            "type": "frame",
            "epoch": epoch, "total_epochs": n_epochs,
            "grid": grid.tolist(),
            "loss": loss, "loss_history": losses,
            "weights": {"coef": [round(c, 4) for c in coef], "intercept": round(intercept, 4)},
            "train_accuracy": round(float(accuracy_score(y, model.predict(X))), 4),
            "grid_bounds": {"x_min": float(x_min), "x_max": float(x_max), "y_min": float(y_min), "y_max": float(y_max)},
        })
        await asyncio.sleep(0.08)

    await ws.send_json({"type": "done"})


async def _stream_mlp(ws, X, y, params, resolution):
    from sklearn.neural_network import MLPClassifier
    from sklearn.metrics import accuracy_score

    max_epochs = int(params.get("max_epochs", 50))
    hidden_size = int(params.get("hidden_layer_sizes", 50))

    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), resolution)
    grid_points = np.column_stack([xx.ravel(), yy.ravel()])

    model = MLPClassifier(hidden_layer_sizes=(hidden_size,), max_iter=1, warm_start=True, random_state=42)

    losses = []
    for epoch in range(1, max_epochs + 1):
        model.fit(X, y)
        probas = model.predict_proba(grid_points)
        grid = probas[:, 1].reshape(xx.shape) if probas.shape[1] == 2 else probas.argmax(axis=1).astype(float).reshape(xx.shape)

        loss = float(model.loss_)
        losses.append(loss)
        weight_norms = [round(float(np.linalg.norm(coef)), 4) for coef in model.coefs_]

        await ws.send_json({
            "type": "frame",
            "epoch": epoch, "total_epochs": max_epochs,
            "grid": grid.tolist(),
            "loss": loss, "loss_history": losses,
            "weights": {"layer_norms": weight_norms, "n_layers": len(model.coefs_)},
            "train_accuracy": round(float(accuracy_score(y, model.predict(X))), 4),
            "grid_bounds": {"x_min": float(x_min), "x_max": float(x_max), "y_min": float(y_min), "y_max": float(y_max)},
        })
        await asyncio.sleep(0.1)

    await ws.send_json({"type": "done"})


async def _stream_decision_tree(ws, X, y, params, resolution):
    from sklearn.tree import DecisionTreeClassifier
    from sklearn.metrics import accuracy_score

    max_depth = int(params.get("max_depth", 10))
    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), resolution)
    grid_points = np.column_stack([xx.ravel(), yy.ravel()])

    for depth in range(1, max_depth + 1):
        model = DecisionTreeClassifier(max_depth=depth, random_state=42)
        model.fit(X, y)
        probas = model.predict_proba(grid_points)
        grid = probas[:, 1].reshape(xx.shape) if probas.shape[1] == 2 else probas.argmax(axis=1).astype(float).reshape(xx.shape)

        await ws.send_json({
            "type": "frame",
            "depth": depth, "max_depth": max_depth,
            "grid": grid.tolist(),
            "train_accuracy": round(float(accuracy_score(y, model.predict(X))), 4),
            "n_leaves": int(model.get_n_leaves()),
            "n_nodes": int(model.tree_.node_count),
            "grid_bounds": {"x_min": float(x_min), "x_max": float(x_max), "y_min": float(y_min), "y_max": float(y_max)},
        })
        await asyncio.sleep(0.2)

    await ws.send_json({"type": "done"})


async def _stream_knn(ws, X, y, params, resolution):
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.metrics import accuracy_score

    max_k = int(params.get("max_k", 15))
    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), resolution)
    grid_points = np.column_stack([xx.ravel(), yy.ravel()])

    for k in range(1, max_k + 1):
        model = KNeighborsClassifier(n_neighbors=k)
        model.fit(X, y)
        probas = model.predict_proba(grid_points)
        grid = probas[:, 1].reshape(xx.shape) if probas.shape[1] == 2 else probas.argmax(axis=1).astype(float).reshape(xx.shape)

        await ws.send_json({
            "type": "frame",
            "k": k, "max_k": max_k,
            "grid": grid.tolist(),
            "train_accuracy": round(float(accuracy_score(y, model.predict(X))), 4),
            "grid_bounds": {"x_min": float(x_min), "x_max": float(x_max), "y_min": float(y_min), "y_max": float(y_max)},
        })
        await asyncio.sleep(0.15)

    await ws.send_json({"type": "done"})


async def _stream_boosting(ws, algorithm, X, y, params, resolution):
    from sklearn.ensemble import GradientBoostingClassifier, AdaBoostClassifier, RandomForestClassifier
    from sklearn.metrics import accuracy_score

    n_estimators = int(params.get("n_estimators", 50))
    step = max(1, n_estimators // 25)

    x_min, x_max, y_min, y_max = compute_grid_bounds(X)
    xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), resolution)
    grid_points = np.column_stack([xx.ravel(), yy.ravel()])

    if algorithm == "adaboost":
        model = AdaBoostClassifier(n_estimators=1, random_state=42)
    elif algorithm == "gradient-boosting":
        model = GradientBoostingClassifier(n_estimators=1, random_state=42, warm_start=True)
    else:
        model = RandomForestClassifier(n_estimators=1, random_state=42, warm_start=True)

    acc_history = []
    for n_trees in range(1, n_estimators + 1, step):
        model.set_params(n_estimators=n_trees)
        model.fit(X, y)
        probas = model.predict_proba(grid_points)
        grid = probas[:, 1].reshape(xx.shape) if probas.shape[1] == 2 else probas.max(axis=1).reshape(xx.shape)

        acc = float(accuracy_score(y, model.predict(X)))
        acc_history.append(acc)

        await ws.send_json({
            "type": "frame",
            "n_trees": n_trees, "total_trees": n_estimators,
            "grid": grid.tolist(),
            "train_accuracy": round(acc, 4),
            "accuracy_history": acc_history,
            "grid_bounds": {"x_min": float(x_min), "x_max": float(x_max), "y_min": float(y_min), "y_max": float(y_max)},
        })
        await asyncio.sleep(0.08)

    await ws.send_json({"type": "done"})


TRAINING_ALGORITHMS = {
    "logistic-regression": _stream_logistic_regression,
    "mlp": _stream_mlp,
    "decision-tree": _stream_decision_tree,
    "knn": _stream_knn,
    "adaboost": _stream_boosting,
    "gradient-boosting": _stream_boosting,
    "random-forest": _stream_boosting,
}


@router.websocket("/ws/training-playground")
async def training_playground(ws: WebSocket):
    await ws.accept()
    try:
        data = await ws.receive_json()
        if not isinstance(data, dict):
            await ws.send_json({"type": "error", "message": "Invalid format"})
            return

        algorithm = data.get("algorithm", "")
        params = data.get("hyperparameters", {})
        if not isinstance(params, dict):
            params = {}
        dataset_name = data.get("dataset_name", "blobs")
        resolution = min(int(data.get("resolution", 80)), 120)
        noise = float(data.get("noise", 0.5))
        n_samples = min(int(data.get("n_samples", 300)), 5000)

        params["n_estimators"] = min(int(params.get("n_estimators", 50)), 200)
        params["max_depth"] = min(int(params.get("max_depth", 10)), 20)
        params["n_epochs"] = min(int(params.get("n_epochs", 30)), 100)
        params["max_epochs"] = min(int(params.get("max_epochs", 30)), 100)
        params["hidden_layer_sizes"] = min(int(params.get("hidden_layer_sizes", 50)), 200)
        params["max_k"] = min(int(params.get("max_k", 15)), 30)

        X, y = await asyncio.to_thread(generate_dataset, dataset_name, n_samples=n_samples, noise=noise)

        stream_fn = TRAINING_ALGORITHMS.get(algorithm)
        if not stream_fn:
            await ws.send_json({"type": "error", "message": f"Not available for {algorithm}. Available: {list(TRAINING_ALGORITHMS.keys())}"})
            return

        if stream_fn is _stream_boosting:
            await stream_fn(ws, algorithm, X, y, params, resolution)
        else:
            await stream_fn(ws, X, y, params, resolution)

    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("Training playground error")
        try:
            await ws.send_json({"type": "error", "message": "An error occurred"})
        except Exception:
            pass
    finally:
        try:
            await ws.close()
        except Exception:
            pass


# --- Wrong Predictions Analyzer ---

@router.post("/wrong-predictions")
async def analyze_wrong_predictions(request: ExplainPredictionRequest):
    X, y = await asyncio.to_thread(
        generate_dataset, request.dataset_name,
        n_samples=request.n_samples, noise=request.noise
    )

    if request.algorithm not in CLASSIFICATION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {request.algorithm}")

    model = CLASSIFICATION_ALGORITHMS[request.algorithm](request.hyperparameters)
    model.fit(X, y)
    y_pred = model.predict(X)
    y_true = y.astype(int)
    y_pred = y_pred.astype(int)

    wrong_mask = y_pred != y_true
    wrong_indices = np.where(wrong_mask)[0]

    from ..datasets.registry import DatasetRegistry
    feature_names = [f"Feature {i+1}" for i in range(X.shape[1])]
    if DatasetRegistry.exists(request.dataset_name):
        feature_names = DatasetRegistry.get(request.dataset_name).feature_names

    analyses = []
    for idx in wrong_indices[:20]:
        point = X[idx]
        expected = int(y_true[idx])
        predicted = int(y_pred[idx])

        proba = model.predict_proba(point.reshape(1, -1))[0].tolist() if hasattr(model, 'predict_proba') else []

        correct_mask = ~wrong_mask
        correct_indices = np.where(correct_mask)[0]
        nearest_correct = []
        if len(correct_indices) > 0:
            distances = np.linalg.norm(X[correct_indices] - point, axis=1)
            top_k = min(3, len(correct_indices))
            nearest_idx = np.argsort(distances)[:top_k]
            for ni in nearest_idx:
                ci = correct_indices[ni]
                nearest_correct.append({
                    "index": int(ci),
                    "distance": round(float(distances[ni]), 4),
                    "label": int(y_true[ci]),
                    "features": [round(float(v), 4) for v in X[ci][:5]],
                })

        decision_path = []
        if hasattr(model, 'tree_'):
            tree = model.tree_
            node = 0
            while tree.children_left[node] != tree.children_right[node]:
                f = tree.feature[node]
                t = tree.threshold[node]
                fname = feature_names[f] if f < len(feature_names) else f"f{f}"
                direction = "left" if point[f] <= t else "right"
                decision_path.append(f"{fname} {'≤' if direction == 'left' else '>'} {t:.3f} → {direction}")
                node = tree.children_left[node] if direction == "left" else tree.children_right[node]
            decision_path.append(f"Leaf → Class {predicted}")

        analyses.append({
            "index": int(idx),
            "features": [round(float(v), 4) for v in point[:5]],
            "expected_class": expected,
            "predicted_class": predicted,
            "probability": round(float(max(proba)), 4) if proba else 0,
            "class_probabilities": [round(float(p), 4) for p in proba],
            "decision_path": decision_path,
            "nearest_correct": nearest_correct,
            "confidence_gap": round(float(abs(proba[expected] - proba[predicted])), 4) if proba and len(proba) > max(expected, predicted) else 0,
        })

    return {
        "total_wrong": int(np.sum(wrong_mask)),
        "total_samples": len(y),
        "error_rate": round(float(np.mean(wrong_mask)), 4),
        "analyses": analyses,
    }
