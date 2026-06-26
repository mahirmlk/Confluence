import logging
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_curve, log_loss,
    r2_score, mean_squared_error, mean_absolute_error
)
from sklearn.model_selection import cross_val_predict, KFold
from ..algorithms.classification import CLASSIFICATION_ALGORITHMS
from ..algorithms.regression import REGRESSION_ALGORITHMS
from ..algorithms.datasets import generate_dataset

logger = logging.getLogger(__name__)


def compute_classification_metrics(
    algorithm_name: str,
    params: dict,
    dataset_name: str,
    noise: float = 0.5,
    n_samples: int = 300,
) -> dict:
    X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)

    if algorithm_name not in CLASSIFICATION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    model = CLASSIFICATION_ALGORITHMS[algorithm_name](params)

    try:
        y_probas = cross_val_predict(model, X, y, cv=5, method="predict_proba")
    except ValueError as e:
        logger.warning("cross_val_predict failed (%s), falling back to train-set predictions", e)
        model.fit(X, y)
        y_probas = model.predict_proba(X)

    y_pred = y_probas.argmax(axis=1)

    accuracy = float(accuracy_score(y, y_pred))
    precision = float(precision_score(y, y_pred, average="weighted", zero_division=0))
    recall = float(recall_score(y, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y, y_pred, average="weighted", zero_division=0))
    cm = confusion_matrix(y, y_pred).tolist()

    n_classes = y_probas.shape[1]
    if n_classes == 2:
        fpr, tpr, _ = roc_curve(y, y_probas[:, 1])
        roc = {"fpr": fpr.tolist(), "tpr": tpr.tolist()}
    else:
        fpr, tpr, _ = roc_curve(y, y_probas, multi_class="ovr")
        roc = {"fpr": fpr.tolist(), "tpr": tpr.tolist()}

    try:
        ll = float(log_loss(y, y_probas))
    except ValueError as e:
        logger.warning("log_loss computation failed: %s", e)
        ll = None

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "confusion_matrix": cm,
        "roc_curve": roc,
        "log_loss": ll,
    }


def compute_regression_metrics(
    algorithm_name: str,
    params: dict,
    dataset_name: str,
    noise: float = 0.5,
    n_samples: int = 300,
) -> dict:
    from ..routers.regression import make_sine_dataset, DATASET_GENERATORS_REGRESSION
    if dataset_name in DATASET_GENERATORS_REGRESSION:
        X, y = DATASET_GENERATORS_REGRESSION[dataset_name](n_samples=n_samples, noise=noise)
    else:
        X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)

    if algorithm_name not in REGRESSION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    model = REGRESSION_ALGORITHMS[algorithm_name](params)

    try:
        y_pred = cross_val_predict(model, X, y, cv=5)
    except Exception:
        model.fit(X, y)
        y_pred = model.predict(X)

    r2 = float(r2_score(y, y_pred))
    mse = float(mean_squared_error(y, y_pred))
    rmse = float(np.sqrt(mse))
    mae = float(mean_absolute_error(y, y_pred))
    residuals = (y - y_pred).tolist()

    return {
        "r2": r2,
        "mse": mse,
        "rmse": rmse,
        "mae": mae,
        "residuals": residuals,
        "predicted": y_pred.tolist(),
        "actual": y.tolist(),
    }


def compute_cross_validation(
    algorithm_name: str,
    params: dict,
    dataset_name: str,
    n_folds: int = 5,
    noise: float = 0.5,
    n_samples: int = 300,
) -> dict:
    from ..grid import generate_meshgrid, extract_contours, compute_grid_bounds

    X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)

    if algorithm_name not in CLASSIFICATION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    kf = KFold(n_splits=n_folds, shuffle=True, random_state=42)
    folds = []

    for fold_idx, (train_idx, test_idx) in enumerate(kf.split(X)):
        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]

        model = CLASSIFICATION_ALGORITHMS[algorithm_name](params)
        model.fit(X_train, y_train)
        accuracy = float(accuracy_score(y_test, model.predict(X_test)))

        x_min, x_max, y_min, y_max = compute_grid_bounds(X)
        xx, yy = generate_meshgrid((x_min, x_max), (y_min, y_max), 50)
        grid_points = np.column_stack([xx.ravel(), yy.ravel()])
        probas = model.predict_proba(grid_points)
        if probas.shape[1] == 2:
            prob_grid = probas[:, 1].reshape(xx.shape)
        else:
            prob_grid = probas.max(axis=1).reshape(xx.shape)

        contours = extract_contours(prob_grid, threshold=0.5)

        folds.append({
            "fold": fold_idx + 1,
            "accuracy": accuracy,
            "grid": prob_grid.tolist(),
            "contour_lines": contours,
            "grid_bounds": {"x_min": float(x_min), "x_max": float(x_max), "y_min": float(y_min), "y_max": float(y_max)},
        })

    accuracies = [f["accuracy"] for f in folds]
    return {
        "folds": folds,
        "mean_accuracy": float(np.mean(accuracies)),
        "std_accuracy": float(np.std(accuracies)),
    }


def compute_coefficients(
    algorithm_name: str,
    params: dict,
    dataset_name: str,
    noise: float = 0.5,
    n_samples: int = 300,
) -> dict:
    X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)

    if algorithm_name not in CLASSIFICATION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    model = CLASSIFICATION_ALGORITHMS[algorithm_name](params)
    model.fit(X, y)

    if hasattr(model, "coef_"):
        coef = model.coef_
        if coef.ndim > 1:
            coef = coef[0]
        intercept = float(model.intercept_[0]) if hasattr(model, "intercept_") and hasattr(model.intercept_, "__len__") else float(getattr(model, "intercept_", 0))
        return {
            "coefficients": coef.tolist(),
            "intercept": intercept,
            "feature_names": [f"Feature {i+1}" for i in range(X.shape[1])],
            "model_type": "linear",
        }
    elif hasattr(model, "feature_importances_"):
        return {
            "coefficients": model.feature_importances_.tolist(),
            "intercept": 0.0,
            "feature_names": [f"Feature {i+1}" for i in range(X.shape[1])],
            "model_type": "tree",
        }
    else:
        return {
            "coefficients": [],
            "intercept": 0.0,
            "feature_names": [],
            "model_type": "other",
        }


def compute_learning_curve(
    algorithm_name: str,
    params: dict,
    dataset_name: str,
    noise: float = 0.5,
    n_samples: int = 300,
) -> dict:
    X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)

    if algorithm_name not in CLASSIFICATION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    n = len(X)
    steps = 10
    train_sizes = []
    train_scores = []
    validation_scores = []

    for frac in np.linspace(0.1, 1.0, steps):
        size = max(10, int(n * frac))
        train_sizes.append(size)

        X_sub = X[:size]
        y_sub = y[:size]

        kf = KFold(n_splits=min(5, size), shuffle=True, random_state=42)
        fold_train_scores = []
        fold_val_scores = []

        for train_idx, val_idx in kf.split(X_sub):
            X_train, X_val = X_sub[train_idx], X_sub[val_idx]
            y_train, y_val = y_sub[train_idx], y_sub[val_idx]

            model = CLASSIFICATION_ALGORITHMS[algorithm_name](params)
            model.fit(X_train, y_train)
            fold_train_scores.append(float(accuracy_score(y_train, model.predict(X_train))))
            fold_val_scores.append(float(accuracy_score(y_val, model.predict(X_val))))

        train_scores.append(float(np.mean(fold_train_scores)))
        validation_scores.append(float(np.mean(fold_val_scores)))

    return {
        "train_sizes": train_sizes,
        "train_scores": train_scores,
        "validation_scores": validation_scores,
    }


def compute_regression_learning_curve(
    algorithm_name: str,
    params: dict,
    dataset_name: str,
    noise: float = 0.5,
    n_samples: int = 300,
) -> dict:
    from ..routers.regression import DATASET_GENERATORS_REGRESSION
    if dataset_name in DATASET_GENERATORS_REGRESSION:
        X, y = DATASET_GENERATORS_REGRESSION[dataset_name](n_samples=n_samples, noise=noise)
    else:
        X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)

    if algorithm_name not in REGRESSION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    n = len(X)
    steps = 10
    train_sizes = []
    train_scores = []
    validation_scores = []

    for frac in np.linspace(0.1, 1.0, steps):
        size = max(10, int(n * frac))
        train_sizes.append(size)

        X_sub = X[:size]
        y_sub = y[:size]

        kf = KFold(n_splits=min(5, size), shuffle=True, random_state=42)
        fold_train_scores = []
        fold_val_scores = []

        for train_idx, val_idx in kf.split(X_sub):
            X_train, X_val = X_sub[train_idx], X_sub[val_idx]
            y_train, y_val = y_sub[train_idx], y_sub[val_idx]

            model = REGRESSION_ALGORITHMS[algorithm_name](params)
            model.fit(X_train, y_train)
            fold_train_scores.append(float(r2_score(y_train, model.predict(X_train))))
            fold_val_scores.append(float(r2_score(y_val, model.predict(X_val))))

        train_scores.append(float(np.mean(fold_train_scores)))
        validation_scores.append(float(np.mean(fold_val_scores)))

    return {
        "train_sizes": train_sizes,
        "train_scores": train_scores,
        "validation_scores": validation_scores,
    }


def compute_regression_cross_validation(
    algorithm_name: str,
    params: dict,
    dataset_name: str,
    n_folds: int = 5,
    noise: float = 0.5,
    n_samples: int = 300,
) -> dict:
    from ..routers.regression import DATASET_GENERATORS_REGRESSION
    if dataset_name in DATASET_GENERATORS_REGRESSION:
        X, y = DATASET_GENERATORS_REGRESSION[dataset_name](n_samples=n_samples, noise=noise)
    else:
        X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)

    if algorithm_name not in REGRESSION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    kf = KFold(n_splits=n_folds, shuffle=True, random_state=42)
    folds = []

    for fold_idx, (train_idx, test_idx) in enumerate(kf.split(X)):
        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]

        model = REGRESSION_ALGORITHMS[algorithm_name](params)
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        r2 = float(r2_score(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))

        folds.append({
            "fold": fold_idx + 1,
            "r2": r2,
            "mse": mse,
        })

    r2_scores = [f["r2"] for f in folds]
    return {
        "folds": folds,
        "mean_r2": float(np.mean(r2_scores)),
        "std_r2": float(np.std(r2_scores)),
    }


def compute_sensitivity(
    algorithm_name: str,
    params: dict,
    dataset_name: str,
    param1: str,
    param1_range: list[float],
    param2: str,
    param2_range: list[float],
    noise: float = 0.5,
    n_samples: int = 300,
) -> dict:
    X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)

    if algorithm_name not in CLASSIFICATION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    accuracy_grid = []
    for v1 in param1_range:
        row = []
        for v2 in param2_range:
            test_params = {**params, param1: v1, param2: v2}
            try:
                model = CLASSIFICATION_ALGORITHMS[algorithm_name](test_params)
                model.fit(X, y)
                y_pred = model.predict(X)
                row.append(float(accuracy_score(y, y_pred)))
            except Exception:
                row.append(0.0)
        accuracy_grid.append(row)

    return {
        "param1_values": param1_range,
        "param2_values": param2_range,
        "accuracy_grid": accuracy_grid,
    }


def compute_decision_path(
    algorithm_name: str,
    params: dict,
    dataset_name: str,
    point: list[float],
    noise: float = 0.5,
    n_samples: int = 300,
) -> dict:
    X, y = generate_dataset(dataset_name, n_samples=n_samples, noise=noise)

    if algorithm_name not in CLASSIFICATION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    model = CLASSIFICATION_ALGORITHMS[algorithm_name](params)
    model.fit(X, y)

    point_arr = np.array(point).reshape(1, -1)
    prediction = int(model.predict(point_arr)[0])

    path = []
    if hasattr(model, "tree_"):
        tree = model.tree_
        node = 0
        while tree.children_left[node] != tree.children_right[node]:
            feature = tree.feature[node]
            threshold = tree.threshold[node]
            if point[feature] <= threshold:
                path.append(f"Feature {feature+1} <= {threshold:.3f} → left")
                node = tree.children_left[node]
            else:
                path.append(f"Feature {feature+1} > {threshold:.3f} → right")
                node = tree.children_right[node]
        path.append(f"Leaf: class {prediction}")
        model_type = "tree"
    elif hasattr(model, "estimators_"):
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
            top_features = np.argsort(importances)[::-1][:3]
            for f in top_features:
                path.append(f"Feature {f+1}: importance {importances[f]:.3f}")
            path.append(f"Ensemble prediction: class {prediction}")
            model_type = "ensemble"
        else:
            path.append(f"Model prediction: class {prediction}")
            model_type = "ensemble"
    elif hasattr(model, "coef_"):
        coef = model.coef_[0] if model.coef_.ndim > 1 else model.coef_
        for i, c in enumerate(coef):
            path.append(f"Feature {i+1}: weight {c:.3f}")
        path.append(f"Prediction: class {prediction}")
        model_type = "linear"
    else:
        path.append(f"Model prediction: class {prediction}")
        model_type = "other"

    return {
        "path": path,
        "prediction": prediction,
        "model_type": model_type,
    }
