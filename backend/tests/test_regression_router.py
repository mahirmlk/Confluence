def test_predict_regression_returns_grid(client):
    response = client.post("/api/regression/predict", json={
        "algorithm": "linear-regression",
        "dataset_name": "sine",
        "hyperparameters": {},
        "resolution": 20,
        "noise": 0.5,
        "n_samples": 50,
    })
    assert response.status_code == 200
    data = response.json()
    assert "grid" in data
    assert "points" in data
    assert data["algorithm"] == "linear-regression"
    assert isinstance(data["grid"], list)
    assert len(data["grid"]) > 0


def test_predict_regression_datasets(client):
    response = client.get("/api/regression/datasets")
    assert response.status_code == 200
    data = response.json()
    assert "datasets" in data
    assert len(data["datasets"]) > 0


def test_regression_metrics(client):
    response = client.post("/api/regression/metrics", json={
        "algorithm": "ridge",
        "dataset_name": "sine",
        "hyperparameters": {"alpha": 1.0},
        "noise": 0.3,
        "n_samples": 50,
    })
    assert response.status_code == 200
    data = response.json()
    assert "r2" in data
    assert "mse" in data
    assert "rmse" in data
    assert "mae" in data
    assert "residuals" in data
    assert "predicted" in data
    assert "actual" in data
