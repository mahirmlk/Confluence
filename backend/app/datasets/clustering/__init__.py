import numpy as np
from ..registry import DatasetRegistry
from ..metadata import DatasetEntry


def _load_mall_customers(n_samples: int = 200, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Mall Customers — synthetic version for clustering."""
    rng = np.random.RandomState(42)
    n = n_samples

    annual_income = np.concatenate([
        rng.normal(15, 5, n // 4).clip(10, 40),
        rng.normal(40, 10, n // 4).clip(20, 70),
        rng.normal(70, 12, n // 4).clip(40, 100),
        rng.normal(90, 15, n // 4).clip(60, 140),
    ])
    spending_score = np.concatenate([
        rng.normal(80, 10, n // 4).clip(50, 100),
        rng.normal(20, 10, n // 4).clip(1, 40),
        rng.normal(50, 15, n // 4).clip(20, 80),
        rng.normal(75, 10, n // 4).clip(50, 100),
    ])
    X = np.column_stack([annual_income[:n], spending_score[:n]])
    y = np.array([0] * (n // 4) + [1] * (n // 4) + [2] * (n // 4) + [3] * (n // 4))[:n]
    return X, y


def _load_wholesale_customers(n_samples: int = 200, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Wholesale Customers — synthetic version."""
    rng = np.random.RandomState(42)
    n = n_samples

    fresh = rng.exponential(10000, n).clip(0, 50000)
    milk = rng.exponential(5000, n).clip(0, 30000)
    grocery = rng.exponential(7000, n).clip(0, 40000)
    frozen = rng.exponential(2000, n).clip(0, 15000)

    X = np.column_stack([fresh, milk, grocery, frozen])
    y = np.zeros(n, dtype=int)
    y[fresh > 15000] = 1
    y[milk > 8000] = 2
    return X, y


def _load_seeds(n_samples: int = 210, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Seeds dataset — synthetic version (3 wheat varieties)."""
    rng = np.random.RandomState(42)
    n_per_class = n_samples // 3

    area = np.concatenate([
        rng.normal(14.8, 0.5, n_per_class),
        rng.normal(18.3, 0.6, n_per_class),
        rng.normal(16.1, 0.5, n_per_class),
    ])
    perimeter = np.concatenate([
        rng.normal(14.5, 0.3, n_per_class),
        rng.normal(16.1, 0.4, n_per_class),
        rng.normal(15.2, 0.3, n_per_class),
    ])
    compactness = np.concatenate([
        rng.normal(0.88, 0.02, n_per_class),
        rng.normal(0.87, 0.02, n_per_class),
        rng.normal(0.88, 0.02, n_per_class),
    ])
    length = np.concatenate([
        rng.normal(5.5, 0.2, n_per_class),
        rng.normal(6.2, 0.2, n_per_class),
        rng.normal(5.8, 0.2, n_per_class),
    ])

    y = np.array([0] * n_per_class + [1] * n_per_class + [2] * n_per_class)
    X = np.column_stack([area, perimeter, compactness, length])
    return X, y


def register() -> None:
    datasets = [
        DatasetEntry(
            name="mall-customers", display_name="Mall Customers",
            description="Customer segmentation (income vs spending)",
            story="Segment mall customers by annual income and spending score. Useful for targeted marketing.",
            source="synthetic", family="clustering", category="business",
            target_column=None, n_rows=200, n_features=2, n_classes=4,
            feature_names=["annual_income", "spending_score"],
            feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["kmeans", "dbscan", "agglomerative", "gmm"],
            tags=["business", "clustering", "segmentation"],
            license="CC0", loader=_load_mall_customers,
        ),
        DatasetEntry(
            name="wholesale-customers", display_name="Wholesale Customers",
            description="Wholesale spending patterns",
            story="Cluster wholesale customers by spending on different product categories.",
            source="synthetic", family="clustering", category="business",
            target_column=None, n_rows=200, n_features=4, n_classes=3,
            feature_names=["fresh", "milk", "grocery", "frozen"],
            feature_types=["numeric", "numeric", "numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["kmeans", "dbscan", "gmm"],
            tags=["business", "clustering", "multi-feature"],
            license="CC0", loader=_load_wholesale_customers,
        ),
        DatasetEntry(
            name="seeds", display_name="Seeds", description="Wheat seed varieties (3 types)",
            story="Cluster wheat seeds into 3 varieties based on geometric measurements of the kernel.",
            source="synthetic", family="clustering", category="general",
            target_column=None, n_rows=210, n_features=4, n_classes=3,
            feature_names=["area", "perimeter", "compactness", "length"],
            feature_types=["numeric", "numeric", "numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["kmeans", "agglomerative", "gmm", "spectral"],
            tags=["classic", "clustering", "agriculture"],
            license="CC0", loader=_load_seeds,
        ),
    ]

    for entry in datasets:
        DatasetRegistry.register(entry)
