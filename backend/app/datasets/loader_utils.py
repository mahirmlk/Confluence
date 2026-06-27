"""Shared utility for loading preprocessed CSV datasets."""
import numpy as np
import pandas as pd
from pathlib import Path

PREP_DIR = Path(__file__).parent / "data" / "preprocessed"


def load_preprocessed(
    relative_path: str,
    feature_cols: list[str],
    target_col: str,
    n_samples: int | None = None,
    noise: float = 0.0,
    seed: int = 42,
) -> tuple[np.ndarray, np.ndarray]:
    """Load a preprocessed CSV and return (X, y) as numpy arrays.

    Args:
        relative_path: Path relative to preprocessed/ dir (e.g. "classification/titanic.csv")
        feature_cols: Column names for features
        target_col: Column name for target
        n_samples: Subsample to this many rows (None = use all)
        noise: Add Gaussian noise scaled by feature std * noise * 0.1
        seed: Random seed
    """
    fp = PREP_DIR / relative_path
    if not fp.exists():
        raise FileNotFoundError(f"Preprocessed file not found: {fp}")

    df = pd.read_csv(fp)
    df = df[feature_cols + [target_col]].dropna()

    X = df[feature_cols].values.astype(float)
    y = df[target_col].values.astype(float)

    # Ensure target is int for classification
    if len(np.unique(y)) <= 20:
        y = y.astype(int)

    rng = np.random.RandomState(seed)
    if n_samples and n_samples < len(X):
        idx = rng.choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]

    if noise > 0:
        stds = np.std(X, axis=0)
        stds[stds == 0] = 1.0
        X = X + rng.randn(*X.shape) * noise * stds * 0.1

    return X, y
