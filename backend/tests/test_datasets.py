import numpy as np
from app.algorithms.datasets import generate_dataset, DATASET_GENERATORS


def test_generate_dataset_returns_numpy_arrays():
    X, y = generate_dataset("blobs", n_samples=100, noise=0.5)
    assert isinstance(X, np.ndarray)
    assert isinstance(y, np.ndarray)
    assert X.shape == (100, 2)
    assert y.shape == (100,)


def test_all_datasets_produce_valid_output():
    for name in DATASET_GENERATORS:
        X, y = generate_dataset(name, n_samples=50, noise=0.3)
        assert X.ndim == 2
        assert y.ndim == 1
        assert len(X) == len(y)


def test_unknown_dataset_raises():
    import pytest
    with pytest.raises(ValueError, match="Unknown dataset"):
        generate_dataset("nonexistent-dataset")
