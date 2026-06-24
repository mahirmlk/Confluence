def test_predict_clustering_returns_labels(client):
    response = client.post("/api/clustering/predict", json={
        "algorithm": "kmeans",
        "dataset_name": "blobs",
        "hyperparameters": {"n_clusters": 3},
        "resolution": 20,
        "noise": 0.5,
        "n_samples": 50,
    })
    assert response.status_code == 200
    data = response.json()
    assert "label_grid" in data
    assert "points" in data
    assert "metrics" in data
    assert isinstance(data["label_grid"], list)


def test_clustering_datasets(client):
    response = client.get("/api/clustering/datasets")
    assert response.status_code == 200
    data = response.json()
    assert "datasets" in data
    assert len(data["datasets"]) > 0


def test_clustering_elbow(client):
    response = client.post("/api/clustering/elbow", json={
        "algorithm": "kmeans",
        "dataset_name": "blobs",
        "hyperparameters": {},
        "k_min": 2,
        "k_max": 5,
        "noise": 0.5,
        "n_samples": 50,
    })
    assert response.status_code == 200
    data = response.json()
    assert "k_values" in data
    assert "inertias" in data
    assert "silhouettes" in data
    assert len(data["k_values"]) == 4
    assert len(data["inertias"]) == 4
    assert len(data["silhouettes"]) == 4
