import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def sample_classification_request():
    return {
        "algorithm": "logistic-regression",
        "dataset_name": "blobs",
        "hyperparameters": {"C": 1.0},
        "resolution": 20,
        "noise": 0.5,
        "n_samples": 50,
    }
