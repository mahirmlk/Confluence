from app.algorithms.sanitize import sanitize_params


def test_sanitize_clamps_explosive_values():
    clean = sanitize_params({
        "n_estimators": 10**9,
        "max_depth": -5,
        "C": 1e12,
        "hidden_layer_sizes": 10**9,
        "unknown_key": "kept",
    })
    assert clean["n_estimators"] == 500
    assert clean["max_depth"] == 1
    assert clean["C"] == 1e4
    assert clean["hidden_layer_sizes"] == 500
    assert clean["unknown_key"] == "kept"


def test_sanitize_drops_non_finite_floats():
    clean = sanitize_params({"C": float("nan"), "alpha": float("inf")})
    assert "C" not in clean
    assert "alpha" not in clean


def test_sanitize_rejects_non_dict():
    assert sanitize_params([]) == {}
    assert sanitize_params(None) == {}


def test_compare_rejects_oversized_payload(client):
    response = client.post(
        "/api/compare/benchmark",
        json={
            "algorithms": ["logistic-regression"] * 11,
            "datasets": ["blobs"],
        },
    )
    assert response.status_code == 422


def test_sensitivity_rejects_huge_grid(client):
    response = client.post(
        "/api/classification/sensitivity",
        json={
            "algorithm": "logistic-regression",
            "dataset_name": "blobs",
            "param1": "C",
            "param1_range": [0.1] * 16,
            "param2": "C",
            "param2_range": [0.1],
        },
    )
    assert response.status_code == 422
