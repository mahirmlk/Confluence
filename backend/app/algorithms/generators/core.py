import numpy as np
from sklearn.datasets import make_blobs, make_moons, make_circles


def generate_spiral(n_samples: int = 300, noise: float = 0.5, n_classes: int = 2, **kwargs) -> tuple[np.ndarray, np.ndarray]:
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


def generate_xor(n_samples: int = 300, noise: float = 0.15, **kwargs) -> tuple[np.ndarray, np.ndarray]:
    n = n_samples // 4
    rng = np.random.RandomState(42)
    X = np.zeros((n_samples, 2))
    y = np.zeros(n_samples, dtype=int)
    X[:n] = rng.multivariate_normal([1, 1], [[noise, 0], [0, noise]], n)
    X[n:2*n] = rng.multivariate_normal([-1, -1], [[noise, 0], [0, noise]], n)
    X[2*n:3*n] = rng.multivariate_normal([1, -1], [[noise, 0], [0, noise]], n)
    X[3*n:4*n] = rng.multivariate_normal([-1, 1], [[noise, 0], [0, noise]], n)
    y[:n] = 0
    y[n:2*n] = 0
    y[2*n:3*n] = 1
    y[3*n:4*n] = 1
    return X, y


def generate_gaussian(n_samples: int = 300, noise: float = 0.5, n_classes: int = 2, **kwargs) -> tuple[np.ndarray, np.ndarray]:
    X, y = make_blobs(n_samples=n_samples, centers=n_classes, cluster_std=noise, random_state=42)
    return X, y


def generate_swiss_roll(n_samples: int = 300, noise: float = 0.5, **kwargs) -> tuple[np.ndarray, np.ndarray]:
    t = 1.5 * np.pi * (1 + 2 * np.random.RandomState(42).rand(n_samples))
    x = t * np.cos(t)
    z = t * np.sin(t)
    y_continuous = t
    y = (y_continuous > np.median(y_continuous)).astype(int)
    X = np.column_stack([x, z])
    X += np.random.RandomState(42).randn(*X.shape) * noise
    return X, y


def generate_circles(n_samples: int = 300, noise: float = 0.05, **kwargs) -> tuple[np.ndarray, np.ndarray]:
    X, y = make_circles(n_samples=n_samples, noise=noise, factor=0.5, random_state=42)
    return X, y


def generate_moons(n_samples: int = 300, noise: float = 0.1, **kwargs) -> tuple[np.ndarray, np.ndarray]:
    X, y = make_moons(n_samples=n_samples, noise=noise, random_state=42)
    return X, y


def generate_linearly_separable(n_samples: int = 300, noise: float = 0.3, **kwargs) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.RandomState(42)
    X = rng.randn(n_samples, 2) * 2
    y = (X[:, 0] + X[:, 1] > 0).astype(int)
    X += rng.randn(n_samples, 2) * noise
    return X, y


GENERATORS = {
    "spiral": generate_spiral,
    "xor": generate_xor,
    "gaussian": generate_gaussian,
    "swiss-roll": generate_swiss_roll,
    "circles": generate_circles,
    "moons": generate_moons,
    "linearly-separable": generate_linearly_separable,
}
