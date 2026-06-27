"""Unified visualization pipeline.

Ensures consistency between:
- data preprocessing (scaling, PCA)
- model training space
- meshgrid generation
- decision boundary computation
- scatter plot coordinates

All happen in the SAME 2D visualization space.
"""
import logging
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

logger = logging.getLogger(__name__)

# Algorithms that REQUIRE feature scaling for correct behavior
SCALE_SENSITIVE = {
    "logistic-regression", "linear-svm", "rbf-svm", "poly-svm",
    "knn", "knn-regressor", "mlp", "mlp-regressor",
    "perceptron", "gp-classifier",
    "svr-linear", "svr-rbf", "svr-poly",
    "gaussian-process-regressor",
}

# Algorithms that are scale-invariant (tree-based, naive bayes)
SCALE_INVARIANT = {
    "decision-tree", "random-forest", "extra-trees",
    "adaboost", "gradient-boosting", "gaussian-nb", "qda",
    "decision-tree-regressor", "random-forest-regressor",
    "gradient-boosting-regressor",
}

# Dataset-specific class names
DATASET_CLASS_NAMES: dict[str, list[str]] = {
    "iris": ["Setosa", "Versicolor", "Virginica"],
    "iris-full": ["Setosa", "Versicolor", "Virginica"],
    "wine": ["Class 0", "Class 1", "Class 2"],
    "wine-full": ["Class 0", "Class 1", "Class 2"],
    "breast-cancer": ["Benign", "Malignant"],
    "breast-cancer-full": ["Benign", "Malignant"],
    "digits-2d": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    "digits-full": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    "titanic": ["Did Not Survive", "Survived"],
    "penguins": ["Adelie", "Chinstrap", "Gentoo"],
    "heart-disease": ["Healthy", "Heart Disease"],
    "adult-income": ["<=50K", ">50K"],
    "mushroom": ["Edible", "Poisonous"],
    "wine-quality": ["Bad (<6)", "Good (>=6)"],
    "blobs": ["Class 0", "Class 1"],
    "blobs-3class": ["Class 0", "Class 1", "Class 2"],
    "blobs-4class": ["Class 0", "Class 1", "Class 2", "Class 3"],
    "moons": ["Class 0", "Class 1"],
    "circles": ["Class 0", "Class 1"],
    "spirals": ["Class 0", "Class 1"],
    "xor": ["Class 0", "Class 1"],
    "linearly-separable": ["Class 0", "Class 1"],
    "checkerboard": ["Class 0", "Class 1"],
    "mall-customers": ["Low-Low", "Low-High", "High-Low", "High-High"],
    "wholesale-customers": ["Fresh-dominant", "Milk-dominant", "Grocery-dominant", "Frozen-dominant"],
    "seeds": ["Kama", "Rosa", "Canadian"],
}


class VisualizationPipeline:
    """Unified pipeline: raw data -> 2D visualization space with metadata."""

    def __init__(self):
        self.scaler: StandardScaler | None = None
        self.pca: PCA | None = None
        self.original_n_features: int = 0
        self.needs_scaling: bool = False
        self.needs_pca: bool = False

    def process(
        self,
        X: np.ndarray,
        algorithm: str,
        scale: bool | None = None,
    ) -> tuple[np.ndarray, dict]:
        """Process raw feature data into 2D visualization space.

        Args:
            X: Raw feature matrix (n_samples, n_features)
            algorithm: Algorithm name (determines if scaling needed)
            scale: Override scaling (None = auto-detect from algorithm)

        Returns:
            X_2d: 2D projected data
            metadata: Dict with PCA info, scaling status, etc.
        """
        self.original_n_features = X.shape[1]
        metadata = {
            "original_features": X.shape[1],
            "displayed_dimensions": 2,
            "scaled": False,
            "pca_applied": False,
            "explained_variance_ratio": None,
            "total_variance_explained": None,
        }

        # Step 1: Always scale before PCA (prevents large-range features dominating)
        self.pca_scaler = StandardScaler()
        X_scaled = self.pca_scaler.fit_transform(X)

        # Step 2: PCA projection if >2 features
        if X.shape[1] > 2:
            self.needs_pca = True
            self.pca = PCA(n_components=2, random_state=42)
            X_2d = self.pca.fit_transform(X_scaled)
            metadata["pca_applied"] = True
            metadata["explained_variance_ratio"] = self.pca.explained_variance_ratio_.tolist()
            metadata["total_variance_explained"] = float(self.pca.explained_variance_ratio_.sum())
            logger.debug(
                "PCA applied: %dD -> 2D, explained variance: %.1f%%",
                X.shape[1], metadata["total_variance_explained"] * 100
            )
        elif X.shape[1] == 2:
            X_2d = X_scaled
        else:
            raise ValueError(f"Dataset must have at least 2 features, got {X.shape[1]}")

        # Step 3: Additional scaling for scale-sensitive algorithms
        # (PCA data is already standardized, but some algorithms benefit from it)
        if scale is None:
            self.needs_scaling = algorithm in SCALE_SENSITIVE
        else:
            self.needs_scaling = scale

        if self.needs_scaling and not metadata["pca_applied"]:
            # Only apply additional scaling if PCA wasn't applied
            # (PCA output is already standardized)
            self.scaler = StandardScaler()
            X_2d = self.scaler.fit_transform(X_2d)
            metadata["scaled"] = True
            logger.debug("Applied StandardScaler (algorithm=%s)", algorithm)

        # Step 4: Validation warnings
        self._validate(X_2d, metadata)

        return X_2d, metadata

    def _validate(self, X_2d: np.ndarray, metadata: dict) -> None:
        """Check for visualization quality issues."""
        for dim in range(2):
            variance = np.var(X_2d[:, dim])
            if variance < 1e-8:
                logger.warning(
                    "WARNING: Dimension %d has near-zero variance (%.2e). "
                    "Visualization may appear as a flat line.", dim, variance
                )

        # Check for collapsed data
        x_range = X_2d[:, 0].max() - X_2d[:, 0].min()
        y_range = X_2d[:, 1].max() - X_2d[:, 1].min()
        if x_range < 1e-6 or y_range < 1e-6:
            logger.warning("WARNING: Data collapsed into a line or point. Check preprocessing.")

        # Check if PCA captured enough variance
        if metadata["pca_applied"] and metadata["total_variance_explained"] < 0.5:
            logger.warning(
                "WARNING: PCA only captures %.1f%% of variance. "
                "Visualization may be misleading.",
                metadata["total_variance_explained"] * 100
            )


def run_pipeline(
    X: np.ndarray,
    y: np.ndarray,
    algorithm: str,
    hyperparameters: dict,
    fit_and_predict_grid_fn,
    resolution: int = 100,
    scale: bool | None = None,
    dataset_name: str = "",
) -> dict:
    """Run the full visualization pipeline end-to-end.

    Args:
        X: Raw feature matrix
        y: Target vector
        algorithm: Algorithm name
        hyperparameters: Algorithm hyperparameters
        fit_and_predict_grid_fn: Function to fit model and predict on grid
        resolution: Meshgrid resolution
        scale: Override scaling
        dataset_name: Dataset name for class labels

    Returns:
        Dict with grid, points, bounds, metadata
    """
    from .grid import generate_meshgrid, compute_grid_bounds, extract_contours

    pipeline = VisualizationPipeline()
    X_2d, metadata = pipeline.process(X, algorithm, scale)

    # Add class names
    metadata["class_names"] = DATASET_CLASS_NAMES.get(dataset_name, [])

    # Compute bounds in visualization space
    bounds = compute_grid_bounds(X_2d)
    xx, yy = generate_meshgrid((bounds[0], bounds[1]), (bounds[2], bounds[3]), resolution)

    # Fit model and predict on grid (in visualization space)
    prob_grid, model = fit_and_predict_grid_fn(
        algorithm, hyperparameters, X_2d, y, xx, yy
    )

    contours = extract_contours(prob_grid, threshold=0.5)

    return {
        "grid": prob_grid,
        "contour_lines": contours,
        "points_x": X_2d.tolist(),
        "points_y": y.tolist(),
        "grid_bounds": {
            "x_min": bounds[0], "x_max": bounds[1],
            "y_min": bounds[2], "y_max": bounds[3],
        },
        "metadata": metadata,
    }
