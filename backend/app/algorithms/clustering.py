import numpy as np
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, SpectralClustering
from sklearn.neighbors import KNeighborsClassifier
from sklearn.mixture import GaussianMixture


CLUSTERING_ALGORITHMS = {
    "kmeans": lambda params, n_clusters: KMeans(n_clusters=n_clusters, random_state=42, n_init=10),
    "dbscan": lambda params, n_clusters: DBSCAN(
        eps=params.get("eps", 0.5), min_samples=params.get("min_samples", 5)
    ),
    "agglomerative": lambda params, n_clusters: AgglomerativeClustering(n_clusters=n_clusters),
    "gmm": lambda params, n_clusters: GaussianMixture(n_components=n_clusters, random_state=42),
    "spectral": lambda params, n_clusters: SpectralClustering(n_clusters=n_clusters, random_state=42, affinity="rbf"),
}


def fit_and_predict_clustering(
    algorithm_name: str,
    params: dict,
    X: np.ndarray,
    xx: np.ndarray,
    yy: np.ndarray,
) -> tuple[np.ndarray, dict]:
    n_clusters = int(params.get("n_clusters", 3))

    if algorithm_name not in CLUSTERING_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    grid_points = np.column_stack([xx.ravel(), yy.ravel()])

    if algorithm_name == "dbscan":
        model = CLUSTERING_ALGORITHMS[algorithm_name](params, n_clusters)
        labels = model.fit_predict(X)
        knn = KNeighborsClassifier(n_neighbors=5)
        knn.fit(X, labels)
        grid_labels = knn.predict(grid_points)
        label_grid = grid_labels.reshape(xx.shape)

    elif algorithm_name == "gmm":
        model = CLUSTERING_ALGORITHMS[algorithm_name](params, n_clusters)
        labels = model.fit_predict(X)
        grid_labels = model.predict(grid_points)
        label_grid = grid_labels.reshape(xx.shape)

    elif algorithm_name == "spectral":
        model = CLUSTERING_ALGORITHMS[algorithm_name](params, n_clusters)
        labels = model.fit_predict(X)
        knn = KNeighborsClassifier(n_neighbors=5)
        knn.fit(X, labels)
        grid_labels = knn.predict(grid_points)
        label_grid = grid_labels.reshape(xx.shape)

    else:
        model = CLUSTERING_ALGORITHMS[algorithm_name](params, n_clusters)
        labels = model.fit_predict(X)
        knn = KNeighborsClassifier(n_neighbors=5)
        knn.fit(X, labels)
        grid_labels = knn.predict(grid_points)
        label_grid = grid_labels.reshape(xx.shape)

    metrics = {}
    if len(set(labels)) > 1 and -1 not in labels:
        from sklearn.metrics import silhouette_score, davies_bouldin_score
        metrics["silhouette"] = float(silhouette_score(X, labels))
        metrics["davies_bouldin"] = float(davies_bouldin_score(X, labels))
        if hasattr(model, "inertia_"):
            metrics["inertia"] = float(model.inertia_)

    return label_grid.astype(float), metrics
