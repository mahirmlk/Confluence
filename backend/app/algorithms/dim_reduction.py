import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler


DIM_REDUCTION_ALGORITHMS = ["pca", "tsne", "umap", "isomap", "lda"]


def fit_and_reduce(
    algorithm_name: str,
    params: dict,
    X: np.ndarray,
    n_components: int = 2,
    y: np.ndarray | None = None,
) -> tuple[np.ndarray, dict]:
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    info = {}

    if algorithm_name == "pca":
        model = PCA(n_components=n_components, random_state=42)
        X_reduced = model.fit_transform(X_scaled)
        info["explained_variance"] = model.explained_variance_ratio_.tolist()
        info["components"] = model.components_.tolist()

    elif algorithm_name == "tsne":
        perplexity = min(int(params.get("perplexity", 30)), X.shape[0] - 1)
        model = TSNE(n_components=n_components, perplexity=perplexity, random_state=42)
        X_reduced = model.fit_transform(X_scaled)
        info["kl_divergence"] = float(model.kl_divergence_)

    elif algorithm_name == "umap":
        try:
            import umap
            n_neighbors = int(params.get("n_neighbors", 15))
            reducer = umap.UMAP(n_components=n_components, n_neighbors=n_neighbors, random_state=42)
            X_reduced = reducer.fit_transform(X_scaled)
        except ImportError:
            model = PCA(n_components=n_components, random_state=42)
            X_reduced = model.fit_transform(X_scaled)
            info["fallback"] = "PCA (UMAP not installed)"

    elif algorithm_name == "isomap":
        from sklearn.manifold import Isomap
        n_neighbors = int(params.get("n_neighbors", 5))
        model = Isomap(n_components=n_components, n_neighbors=n_neighbors)
        X_reduced = model.fit_transform(X_scaled)
        info["reconstruction_error"] = float(model.reconstruction_error())

    elif algorithm_name == "lda":
        from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
        labels = y if y is not None else X[:, 0].astype(int)
        max_components = min(X.shape[1], len(np.unique(labels)) - 1)
        if max_components < 1:
            max_components = 1
        actual_components = min(n_components, max_components)
        model = LinearDiscriminantAnalysis(n_components=actual_components)
        X_reduced = model.fit_transform(X_scaled, labels)
        if X_reduced.shape[1] < n_components:
            padding = np.zeros((X_reduced.shape[0], n_components - X_reduced.shape[1]))
            X_reduced = np.column_stack([X_reduced, padding])
        info["explained_variance"] = model.explained_variance_ratio_.tolist()

    else:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    return X_reduced, info
