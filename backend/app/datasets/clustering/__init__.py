import numpy as np
from ..registry import DatasetRegistry
from ..metadata import DatasetEntry
from ..loader_utils import load_preprocessed


def _load_mall_customers(n_samples=200, noise=0.0):
    return load_preprocessed("clustering/mall_customers.csv",
        ["Income", "Score"], "cluster", n_samples, noise)

def _load_wholesale_customers(n_samples=440, noise=0.0):
    return load_preprocessed("clustering/wholesale_customers.csv",
        ["Fresh", "Milk", "Grocery", "Frozen"], "cluster", n_samples, noise)

def _load_seeds(n_samples=199, noise=0.0):
    return load_preprocessed("clustering/seeds.csv",
        ["area", "perimeter", "compactness", "kernel_length"], "cluster", n_samples, noise)


def register():
    datasets = [
        DatasetEntry(name="mall-customers", display_name="Mall Customers (Kaggle)",
            description="Customer segmentation — income vs spending", source="kaggle",
            story="Segment mall customers by income and spending score.", family="clustering", category="business",
            target_column=None, n_rows=200, n_features=2, n_classes=4,
            feature_names=["annual_income", "spending_score"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["kmeans", "dbscan", "agglomerative", "gmm"],
            tags=["business", "clustering", "kaggle"], license="CC0", loader=_load_mall_customers),
        DatasetEntry(name="wholesale-customers", display_name="Wholesale Customers (Kaggle)",
            description="Wholesale spending patterns", source="kaggle",
            story="Cluster wholesale customers by product spending.", family="clustering", category="business",
            target_column=None, n_rows=440, n_features=4, n_classes=4,
            feature_names=["fresh", "milk", "grocery", "frozen"], feature_types=["numeric"] * 4,
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["kmeans", "dbscan", "gmm"],
            tags=["business", "clustering", "kaggle"], license="CC0", loader=_load_wholesale_customers),
        DatasetEntry(name="seeds", display_name="Wheat Seeds (Kaggle)",
            description="Wheat seed varieties", source="kaggle",
            story="Cluster wheat seeds into 3 varieties by kernel measurements.", family="clustering", category="general",
            target_column=None, n_rows=199, n_features=4, n_classes=3,
            feature_names=["area", "perimeter", "compactness", "kernel_length"], feature_types=["numeric"] * 4,
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["kmeans", "agglomerative", "gmm", "spectral"],
            tags=["classic", "clustering", "kaggle"], license="CC0", loader=_load_seeds),
    ]
    for entry in datasets:
        DatasetRegistry.register(entry)
