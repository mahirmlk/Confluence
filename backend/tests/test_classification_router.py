def test_predict_classification_returns_grid(client, sample_classification_request):
    response = client.post("/api/classification/predict", json=sample_classification_request)
    assert response.status_code == 200
    data = response.json()
    assert "grid" in data
    assert "contour_lines" in data
    assert "points" in data
    assert data["algorithm"] == "logistic-regression"
    assert isinstance(data["grid"], list)
    assert len(data["grid"]) > 0


def test_predict_classification_datasets_endpoint(client):
    response = client.get("/api/classification/datasets")
    assert response.status_code == 200
    data = response.json()
    assert "datasets" in data
    assert len(data["datasets"]) > 0


def test_predict_classification_unknown_algorithm(client):
    bad_request = {
        "algorithm": "nonexistent-algo",
        "dataset_name": "blobs",
        "hyperparameters": {},
        "resolution": 20,
    }
    response = client.post("/api/classification/predict", json=bad_request)
    assert response.status_code == 422  # ValueError caught by global exception handler


def test_predict_classification_metrics(client, sample_classification_request):
    metrics_request = {
        "algorithm": sample_classification_request["algorithm"],
        "dataset_name": sample_classification_request["dataset_name"],
        "hyperparameters": sample_classification_request["hyperparameters"],
        "noise": sample_classification_request["noise"],
        "n_samples": sample_classification_request["n_samples"],
    }
    response = client.post("/api/classification/metrics", json=metrics_request)
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "precision" in data
    assert "f1" in data
    assert "confusion_matrix" in data
