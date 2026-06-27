import numpy as np
from sklearn.datasets import make_blobs, make_moons, make_circles, load_iris, load_wine, load_breast_cancer


def make_spirals(n_samples: int = 300, noise: float = 0.5, n_classes: int = 2) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.RandomState(42)
    n_per_class = n_samples // n_classes
    total = n_per_class * n_classes
    X = np.zeros((total, 2))
    y = np.zeros(total, dtype=int)
    for c in range(n_classes):
        idx = range(n_per_class * c, n_per_class * (c + 1))
        r = np.linspace(0.0, 1, n_per_class)
        t = np.linspace(c * 4, (c + 1) * 4, n_per_class) + rng.randn(n_per_class) * noise * 0.3
        X[idx] = np.column_stack([r * np.sin(t * 2.5), r * np.cos(t * 2.5)])
        y[idx] = c
    return X, y


def make_xor(n_samples: int = 300, noise: float = 0.1) -> tuple[np.ndarray, np.ndarray]:
    n = n_samples // 4
    rng = np.random.RandomState(42)
    X = np.zeros((n_samples, 2))
    y = np.zeros(n_samples, dtype=int)

    X[:n] = rng.multivariate_normal([1, 1], [[noise, 0], [0, noise]], n)
    y[:n] = 0
    X[n:2*n] = rng.multivariate_normal([-1, -1], [[noise, 0], [0, noise]], n)
    y[n:2*n] = 0
    X[2*n:3*n] = rng.multivariate_normal([1, -1], [[noise, 0], [0, noise]], n)
    y[2*n:3*n] = 1
    X[3*n:4*n] = rng.multivariate_normal([-1, 1], [[noise, 0], [0, noise]], n)
    y[3*n:4*n] = 1

    return X, y


def make_linearly_separable(n_samples: int = 300, noise: float = 0.1) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.RandomState(42)
    X = rng.randn(n_samples, 2) * 2
    y = (X[:, 0] + X[:, 1] > 0).astype(int)
    X += rng.randn(n_samples, 2) * noise
    return X, y


def make_checkerboard(n_samples: int = 300, noise: float = 0.1) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.RandomState(42)
    n = int(np.sqrt(n_samples))
    X = rng.uniform(-3, 3, (n_samples, 2))
    y = ((np.floor(X[:, 0]).astype(int) + np.floor(X[:, 1]).astype(int)) % 2 == 0).astype(int)
    X += rng.randn(n_samples, 2) * noise
    return X, y


def _load_iris_2d(n_samples: int = 300, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_iris()
    X = data.data[:, [2, 3]]
    y = data.target
    if noise > 0:
        rng = np.random.RandomState(42)
        X = X + rng.randn(*X.shape) * noise * 0.5
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_wine_2d(n_samples: int = 300, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_wine()
    X = data.data[:, [0, 12]]
    y = data.target
    if noise > 0:
        rng = np.random.RandomState(42)
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.3
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_breast_cancer_2d(n_samples: int = 300, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_breast_cancer()
    X = data.data[:, [0, 1]]
    y = data.target
    if noise > 0:
        rng = np.random.RandomState(42)
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.3
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


DATASET_GENERATORS = {
    "blobs": lambda n=300, noise=0.5: make_blobs(n_samples=n, centers=2, cluster_std=noise, random_state=42),
    "blobs-3class": lambda n=300, noise=0.5: make_blobs(n_samples=n, centers=3, cluster_std=noise, random_state=42),
    "blobs-4class": lambda n=300, noise=0.5: make_blobs(n_samples=n, centers=4, cluster_std=noise, random_state=42),
    "moons": lambda n=300, noise=0.1: make_moons(n_samples=n, noise=noise, random_state=42),
    "circles": lambda n=300, noise=0.05: make_circles(n_samples=n, noise=noise, factor=0.5, random_state=42),
    "spirals": lambda n=300, noise=0.5: make_spirals(n_samples=n, noise=noise),
    "xor": lambda n=300, noise=0.15: make_xor(n_samples=n, noise=noise),
    "linearly-separable": lambda n=300, noise=0.3: make_linearly_separable(n_samples=n, noise=noise),
    "checkerboard": lambda n=300, noise=0.1: make_checkerboard(n_samples=n, noise=noise),
    "iris": lambda n=300, noise=0.0: _load_iris_2d(n_samples=n, noise=noise),
    "wine": lambda n=300, noise=0.0: _load_wine_2d(n_samples=n, noise=noise),
    "breast-cancer": lambda n=300, noise=0.0: _load_breast_cancer_2d(n_samples=n, noise=noise),
}


def generate_dataset(name: str, n_samples: int = 300, noise: float = 0.5) -> tuple[np.ndarray, np.ndarray]:
    if name in DATASET_GENERATORS:
        return DATASET_GENERATORS[name](n=n_samples, noise=noise)

    from ..datasets.registry import DatasetRegistry
    if not DatasetRegistry.names():
        from ..datasets.loaders import register_all_datasets
        register_all_datasets()

    if DatasetRegistry.exists(name):
        entry = DatasetRegistry.get(name)
        return entry.loader(n_samples=n_samples, noise=noise)

    raise ValueError(f"Unknown dataset: {name}. Available: {list(DATASET_GENERATORS.keys()) + DatasetRegistry.names()}")
