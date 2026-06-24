def test_cross_validation(client):
    response = client.post("/api/classification/cross-validation", json={
        "algorithm": "logistic-regression",
        "dataset_name": "blobs",
        "hyperparameters": {"C": 1.0},
        "n_folds": 3,
        "noise": 0.5,
        "n_samples": 50,
    })
    assert response.status_code == 200
    data = response.json()
    assert "folds" in data
    assert "mean_accuracy" in data
    assert "std_accuracy" in data
    assert len(data["folds"]) == 3
    assert all("accuracy" in f and "grid" in f for f in data["folds"])


def test_coefficients_endpoint(client):
    response = client.post("/api/classification/coefficients", json={
        "algorithm": "logistic-regression",
        "dataset_name": "blobs",
        "hyperparameters": {"C": 1.0},
        "noise": 0.5,
        "n_samples": 50,
    })
    assert response.status_code == 200
    data = response.json()
    assert "coefficients" in data
    assert "model_type" in data


def test_learning_curve_endpoint(client):
    response = client.post("/api/classification/learning-curve", json={
        "algorithm": "logistic-regression",
        "dataset_name": "blobs",
        "hyperparameters": {"C": 1.0},
        "noise": 0.5,
        "n_samples": 80,
    })
    assert response.status_code == 200
    data = response.json()
    assert "train_sizes" in data
    assert "train_scores" in data
    assert "validation_scores" in data


def test_sensitivity_endpoint(client):
    response = client.post("/api/classification/sensitivity", json={
        "algorithm": "logistic-regression",
        "dataset_name": "blobs",
        "hyperparameters": {},
        "param1": "C",
        "param1_range": [0.1, 1.0, 10.0],
        "param2": "C",
        "param2_range": [0.1, 1.0, 10.0],
        "noise": 0.5,
        "n_samples": 50,
    })
    assert response.status_code == 200
    data = response.json()
    assert "param1_values" in data
    assert "param2_values" in data
    assert "accuracy_grid" in data


def test_decision_path_endpoint(client):
    response = client.post("/api/classification/decision-path", json={
        "algorithm": "decision-tree",
        "dataset_name": "blobs",
        "hyperparameters": {"max_depth": 5},
        "point": [0.0, 0.0],
        "noise": 0.5,
        "n_samples": 50,
    })
    assert response.status_code == 200
    data = response.json()
    assert "path" in data
    assert "prediction" in data
    assert "model_type" in data
