def test_dim_reduction_pca(client):
    response = client.post("/api/dim-reduction/reduce", json={
        "algorithm": "pca",
        "dataset_name": "blobs",
        "hyperparameters": {},
        "n_components": 2,
        "noise": 0.5,
        "n_samples": 50,
    })
    assert response.status_code == 200
    data = response.json()
    assert "embedding" in data
    assert "points" in data
    assert "info" in data
    assert len(data["embedding"]) == 50
    assert len(data["embedding"][0]) == 2


def test_dim_reduction_tsne(client):
    response = client.post("/api/dim-reduction/reduce", json={
        "algorithm": "tsne",
        "dataset_name": "moons",
        "hyperparameters": {"perplexity": 10},
        "n_components": 2,
        "noise": 0.5,
        "n_samples": 50,
    })
    assert response.status_code == 200
    data = response.json()
    assert "embedding" in data
    assert len(data["embedding"]) == 50


def test_dim_reduction_algorithms(client):
    response = client.get("/api/dim-reduction/algorithms")
    assert response.status_code == 200
    data = response.json()
    assert "algorithms" in data
    assert len(data["algorithms"]) > 0
