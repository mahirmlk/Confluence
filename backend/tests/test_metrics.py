import numpy as np
from app.algorithms.metrics import (
    compute_regression_metrics,
    compute_coefficients,
    compute_learning_curve,
    compute_decision_path,
)


def test_regression_metrics_basic():
    result = compute_regression_metrics("linear-regression", {}, "sine", noise=0.3, n_samples=50)
    assert "r2" in result
    assert "mse" in result
    assert "rmse" in result
    assert "mae" in result
    assert "residuals" in result
    assert "predicted" in result
    assert "actual" in result
    assert len(result["residuals"]) == 50
    assert result["rmse"] >= 0


def test_coefficients_linear():
    result = compute_coefficients("logistic-regression", {"C": 1.0}, "blobs", noise=0.5, n_samples=50)
    assert "coefficients" in result
    assert "intercept" in result
    assert "model_type" in result
    assert result["model_type"] == "linear"
    assert len(result["coefficients"]) > 0


def test_coefficients_tree():
    result = compute_coefficients("random-forest", {"n_estimators": 10}, "blobs", noise=0.5, n_samples=50)
    assert result["model_type"] == "tree"
    assert len(result["coefficients"]) > 0


def test_learning_curve():
    result = compute_learning_curve("logistic-regression", {"C": 1.0}, "blobs", noise=0.5, n_samples=100)
    assert "train_sizes" in result
    assert "train_scores" in result
    assert "validation_scores" in result
    assert len(result["train_sizes"]) == 10
    assert len(result["train_scores"]) == 10


def test_decision_path_tree():
    result = compute_decision_path("decision-tree", {"max_depth": 5}, "blobs", point=[0.0, 0.0], noise=0.5, n_samples=50)
    assert "path" in result
    assert "prediction" in result
    assert "model_type" in result
    assert result["model_type"] == "tree"
    assert len(result["path"]) > 0


def test_decision_path_linear():
    result = compute_decision_path("logistic-regression", {"C": 1.0}, "blobs", point=[0.0, 0.0], noise=0.5, n_samples=50)
    assert result["model_type"] == "linear"
    assert len(result["path"]) > 0
