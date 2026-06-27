import { create } from "zustand";

export type AlgorithmFamily = "classification" | "regression" | "clustering" | "dim-reduction";

export interface AlgorithmConfig {
  name: string;
  label: string;
  taxonomyTag: string;
  family: AlgorithmFamily;
  description: string;
  complexity?: { fit: string; predict: string };
}

export const ALGORITHMS: AlgorithmConfig[] = [
  { name: "logistic-regression", label: "Logistic Regression", taxonomyTag: "linear", family: "classification", description: "Linear decision boundary via logistic function", complexity: { fit: "O(n·d)", predict: "O(d)" } },
  { name: "knn", label: "K-Nearest Neighbors", taxonomyTag: "instance-based", family: "classification", description: "Classification by majority vote of k nearest points", complexity: { fit: "O(1)", predict: "O(n·d)" } },
  { name: "decision-tree", label: "Decision Tree", taxonomyTag: "tree-based", family: "classification", description: "Axis-aligned splits creating piecewise boundaries", complexity: { fit: "O(n·d·log n)", predict: "O(log n)" } },
  { name: "rbf-svm", label: "SVM (RBF Kernel)", taxonomyTag: "margin-kernel", family: "classification", description: "Maximum margin classifier with RBF kernel", complexity: { fit: "O(n²·d)", predict: "O(sv·d)" } },
  { name: "linear-svm", label: "SVM (Linear)", taxonomyTag: "linear", family: "classification", description: "Linear maximum margin classifier", complexity: { fit: "O(n·d)", predict: "O(d)" } },
  { name: "poly-svm", label: "SVM (Polynomial)", taxonomyTag: "margin-kernel", family: "classification", description: "SVM with polynomial kernel", complexity: { fit: "O(n²·d)", predict: "O(sv·d)" } },
  { name: "random-forest", label: "Random Forest", taxonomyTag: "tree-based", family: "classification", description: "Ensemble of decision trees with bagging", complexity: { fit: "O(k·n·d·log n)", predict: "O(k·log n)" } },
  { name: "extra-trees", label: "Extra Trees", taxonomyTag: "tree-based", family: "classification", description: "Extremely randomized trees ensemble", complexity: { fit: "O(k·n·d·log n)", predict: "O(k·log n)" } },
  { name: "adaboost", label: "AdaBoost", taxonomyTag: "boosting", family: "classification", description: "Sequential ensemble focusing on hard examples", complexity: { fit: "O(T·n·d)", predict: "O(T)" } },
  { name: "gradient-boosting", label: "Gradient Boosting", taxonomyTag: "boosting", family: "classification", description: "Sequential ensemble optimizing gradient", complexity: { fit: "O(T·n·d·log n)", predict: "O(T·log n)" } },
  { name: "gaussian-nb", label: "Gaussian Naive Bayes", taxonomyTag: "probabilistic", family: "classification", description: "Probabilistic classifier with feature independence", complexity: { fit: "O(n·d)", predict: "O(d)" } },
  { name: "qda", label: "Quadratic Discriminant Analysis", taxonomyTag: "probabilistic", family: "classification", description: "Quadratic decision boundary via Bayes' theorem", complexity: { fit: "O(n·d²)", predict: "O(d²)" } },
  { name: "gp-classifier", label: "Gaussian Process Classifier", taxonomyTag: "probabilistic", family: "classification", description: "Bayesian classification with uncertainty estimates", complexity: { fit: "O(n³)", predict: "O(n²)" } },
  { name: "perceptron", label: "Perceptron", taxonomyTag: "linear", family: "classification", description: "Simple single-layer neural network", complexity: { fit: "O(n·d·i)", predict: "O(d)" } },
  { name: "mlp", label: "MLP Classifier", taxonomyTag: "neural", family: "classification", description: "Shallow neural network with 1-2 hidden layers", complexity: { fit: "O(n·d·h·i)", predict: "O(d·h)" } },
  { name: "linear-regression", label: "Linear Regression", taxonomyTag: "linear", family: "regression", description: "Linear fit minimizing squared error", complexity: { fit: "O(n·d²)", predict: "O(d)" } },
  { name: "ridge", label: "Ridge", taxonomyTag: "linear", family: "regression", description: "Linear regression with L2 regularization", complexity: { fit: "O(n·d²)", predict: "O(d)" } },
  { name: "lasso", label: "Lasso", taxonomyTag: "linear", family: "regression", description: "Linear regression with L1 regularization", complexity: { fit: "O(n·d·i)", predict: "O(d)" } },
  { name: "elastic-net", label: "Elastic Net", taxonomyTag: "linear", family: "regression", description: "Combined L1 + L2 regularization", complexity: { fit: "O(n·d·i)", predict: "O(d)" } },
  { name: "decision-tree-regressor", label: "Decision Tree Regressor", taxonomyTag: "tree-based", family: "regression", description: "Tree-based regression with axis-aligned splits", complexity: { fit: "O(n·d·log n)", predict: "O(log n)" } },
  { name: "random-forest-regressor", label: "Random Forest Regressor", taxonomyTag: "tree-based", family: "regression", description: "Ensemble tree regression", complexity: { fit: "O(k·n·d·log n)", predict: "O(k·log n)" } },
  { name: "gradient-boosting-regressor", label: "GBR", taxonomyTag: "boosting", family: "regression", description: "Gradient boosting regression", complexity: { fit: "O(T·n·d·log n)", predict: "O(T·log n)" } },
  { name: "svr-linear", label: "SVR (Linear)", taxonomyTag: "margin-kernel", family: "regression", description: "Support vector regression with linear kernel", complexity: { fit: "O(n²·d)", predict: "O(sv·d)" } },
  { name: "svr-rbf", label: "SVR (RBF)", taxonomyTag: "margin-kernel", family: "regression", description: "Support vector regression with RBF kernel", complexity: { fit: "O(n²·d)", predict: "O(sv·d)" } },
  { name: "svr-poly", label: "SVR (Polynomial)", taxonomyTag: "margin-kernel", family: "regression", description: "Support vector regression with polynomial kernel", complexity: { fit: "O(n²·d)", predict: "O(sv·d)" } },
  { name: "knn-regressor", label: "KNN Regressor", taxonomyTag: "instance-based", family: "regression", description: "Instance-based regression by neighbor averaging", complexity: { fit: "O(1)", predict: "O(n·d)" } },
  { name: "gaussian-process-regressor", label: "Gaussian Process", taxonomyTag: "probabilistic", family: "regression", description: "Probabilistic regression with uncertainty bands", complexity: { fit: "O(n³)", predict: "O(n²)" } },
  { name: "mlp-regressor", label: "MLP Regressor", taxonomyTag: "neural", family: "regression", description: "Neural network regression", complexity: { fit: "O(n·d·h·i)", predict: "O(d·h)" } },
  { name: "kmeans", label: "K-Means", taxonomyTag: "centroid-based", family: "clustering", description: "Partition into k clusters by centroid proximity", complexity: { fit: "O(n·k·d·i)", predict: "O(k·d)" } },
  { name: "dbscan", label: "DBSCAN", taxonomyTag: "density-based", family: "clustering", description: "Density-based clustering with noise detection", complexity: { fit: "O(n·log n)", predict: "O(n·log n)" } },
  { name: "agglomerative", label: "Agglomerative", taxonomyTag: "hierarchical", family: "clustering", description: "Bottom-up hierarchical clustering", complexity: { fit: "O(n³)", predict: "O(n)" } },
  { name: "gmm", label: "GMM", taxonomyTag: "distribution-based", family: "clustering", description: "Gaussian mixture model clustering", complexity: { fit: "O(n·k·d²·i)", predict: "O(k·d²)" } },
  { name: "spectral", label: "Spectral", taxonomyTag: "graph-based", family: "clustering", description: "Graph-based spectral clustering", complexity: { fit: "O(n³)", predict: "O(n·k)" } },
  { name: "pca", label: "PCA", taxonomyTag: "linear", family: "dim-reduction", description: "Linear projection maximizing variance", complexity: { fit: "O(min(n²d, nd²))", predict: "O(d)" } },
  { name: "tsne", label: "t-SNE", taxonomyTag: "manifold", family: "dim-reduction", description: "Nonlinear embedding preserving local structure", complexity: { fit: "O(n²)", predict: "N/A" } },
  { name: "umap", label: "UMAP", taxonomyTag: "manifold", family: "dim-reduction", description: "Uniform manifold approximation", complexity: { fit: "O(n·log n)", predict: "O(n)" } },
  { name: "isomap", label: "Isomap", taxonomyTag: "manifold", family: "dim-reduction", description: "Isometric feature mapping", complexity: { fit: "O(n³)", predict: "O(n)" } },
  { name: "lda", label: "LDA", taxonomyTag: "linear", family: "dim-reduction", description: "Linear discriminant analysis projection", complexity: { fit: "O(n·d²)", predict: "O(d)" } },
];

export const HYPERPARAMETER_CONFIGS: Record<string, { name: string; min: number; max: number; step: number; default: number }[]> = {
  "logistic-regression": [{ name: "C", min: 0.01, max: 100, step: 0.01, default: 1.0 }],
  "knn": [{ name: "n_neighbors", min: 1, max: 30, step: 1, default: 5 }],
  "decision-tree": [{ name: "max_depth", min: 1, max: 20, step: 1, default: 5 }],
  "rbf-svm": [{ name: "C", min: 0.01, max: 100, step: 0.1, default: 1.0 }],
  "linear-svm": [{ name: "C", min: 0.01, max: 100, step: 0.1, default: 1.0 }],
  "poly-svm": [
    { name: "C", min: 0.01, max: 100, step: 0.1, default: 1.0 },
    { name: "degree", min: 2, max: 5, step: 1, default: 3 },
  ],
  "random-forest": [{ name: "n_estimators", min: 1, max: 200, step: 1, default: 100 }],
  "extra-trees": [{ name: "n_estimators", min: 1, max: 200, step: 1, default: 100 }],
  "adaboost": [{ name: "n_estimators", min: 1, max: 200, step: 1, default: 50 }],
  "gradient-boosting": [{ name: "n_estimators", min: 1, max: 200, step: 1, default: 100 }],
  "gaussian-nb": [{ name: "var_smoothing", min: 0.000000001, max: 0.1, step: 0.001, default: 0.000000001 }],
  "qda": [{ name: "reg_param", min: 0.0, max: 1.0, step: 0.01, default: 0.01 }],
  "gp-classifier": [{ name: "length_scale", min: 0.1, max: 10.0, step: 0.1, default: 1.0 }],
  "perceptron": [{ name: "alpha", min: 0.0001, max: 1.0, step: 0.0001, default: 0.0001 }],
  "mlp": [{ name: "hidden_layer_sizes", min: 1, max: 200, step: 1, default: 100 }],
  "linear-regression": [],
  "ridge": [{ name: "alpha", min: 0.01, max: 100, step: 0.01, default: 1.0 }],
  "lasso": [{ name: "alpha", min: 0.01, max: 100, step: 0.01, default: 1.0 }],
  "elastic-net": [
    { name: "alpha", min: 0.01, max: 100, step: 0.01, default: 1.0 },
    { name: "l1_ratio", min: 0.0, max: 1.0, step: 0.05, default: 0.5 },
  ],
  "decision-tree-regressor": [{ name: "max_depth", min: 1, max: 20, step: 1, default: 5 }],
  "random-forest-regressor": [{ name: "n_estimators", min: 1, max: 200, step: 1, default: 100 }],
  "gradient-boosting-regressor": [{ name: "n_estimators", min: 1, max: 200, step: 1, default: 100 }],
  "svr-linear": [{ name: "C", min: 0.01, max: 100, step: 0.1, default: 1.0 }],
  "svr-rbf": [{ name: "C", min: 0.01, max: 100, step: 0.1, default: 1.0 }],
  "svr-poly": [
    { name: "C", min: 0.01, max: 100, step: 0.1, default: 1.0 },
    { name: "degree", min: 2, max: 5, step: 1, default: 3 },
  ],
  "knn-regressor": [{ name: "n_neighbors", min: 1, max: 30, step: 1, default: 5 }],
  "gaussian-process-regressor": [{ name: "alpha", min: 0.0001, max: 1.0, step: 0.0001, default: 0.01 }],
  "mlp-regressor": [{ name: "hidden_layer_sizes", min: 1, max: 200, step: 1, default: 100 }],
  "kmeans": [{ name: "n_clusters", min: 2, max: 10, step: 1, default: 3 }],
  "dbscan": [
    { name: "eps", min: 0.1, max: 5.0, step: 0.1, default: 0.5 },
    { name: "min_samples", min: 1, max: 20, step: 1, default: 5 },
  ],
  "agglomerative": [{ name: "n_clusters", min: 2, max: 10, step: 1, default: 3 }],
  "gmm": [{ name: "n_clusters", min: 2, max: 10, step: 1, default: 3 }],
  "spectral": [{ name: "n_clusters", min: 2, max: 10, step: 1, default: 3 }],
  "pca": [],
  "tsne": [{ name: "perplexity", min: 5, max: 50, step: 1, default: 30 }],
  "umap": [{ name: "n_neighbors", min: 2, max: 50, step: 1, default: 15 }],
  "isomap": [{ name: "n_neighbors", min: 2, max: 50, step: 1, default: 5 }],
  "lda": [],
};

export const FAMILY_DATASETS: Record<AlgorithmFamily, string[]> = {
  classification: ["blobs", "blobs-3class", "blobs-4class", "moons", "circles", "spirals", "xor", "linearly-separable", "checkerboard", "iris", "iris-full", "wine", "wine-full", "breast-cancer", "breast-cancer-full", "digits-2d", "digits-full", "titanic", "penguins", "heart-disease", "adult-income", "mushroom", "wine-quality"],
  regression: ["sine", "blobs", "moons", "circles", "spirals", "xor", "linearly-separable", "iris", "wine", "breast-cancer", "california-housing", "california-housing-full", "diabetes", "diabetes-full", "bike-sharing", "insurance", "concrete"],
  clustering: ["blobs", "moons", "circles", "spirals", "xor", "iris", "wine", "breast-cancer", "mall-customers", "wholesale-customers", "seeds"],
  "dim-reduction": ["blobs", "blobs-3class", "blobs-4class", "moons", "circles", "spirals", "xor", "linearly-separable", "checkerboard", "iris", "iris-full", "wine", "wine-full", "breast-cancer", "breast-cancer-full", "digits-2d", "digits-full"],
};

export interface AppState {
  family: AlgorithmFamily;
  algorithm: string;
  hyperparameters: Record<string, number>;
  datasetName: string;
  resolution: number;
  noise: number;
  nSamples: number;
  uploadedDatasetId: string | null;
  customDatasetId: string | null;
  setFamily: (family: AlgorithmFamily) => void;
  setAlgorithm: (algorithm: string) => void;
  setHyperparameters: (params: Record<string, number>) => void;
  setDatasetName: (name: string) => void;
  setResolution: (resolution: number) => void;
  setNoise: (noise: number) => void;
  setNSamples: (nSamples: number) => void;
  setUploadedDatasetId: (id: string | null) => void;
  setCustomDatasetId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  family: "classification",
  algorithm: "logistic-regression",
  hyperparameters: { C: 1.0 },
  datasetName: "blobs",
  resolution: 100,
  noise: 0.5,
  nSamples: 300,
  uploadedDatasetId: null,
  customDatasetId: null,
  setFamily: (family) => set({ family }),
  setAlgorithm: (algorithm) => set({ algorithm }),
  setHyperparameters: (hyperparameters) => set({ hyperparameters }),
  setDatasetName: (datasetName) => set({ datasetName }),
  setResolution: (resolution) => set({ resolution }),
  setNoise: (noise) => set({ noise }),
  setNSamples: (nSamples) => set({ nSamples }),
  setUploadedDatasetId: (id) => set({ uploadedDatasetId: id }),
  setCustomDatasetId: (id) => set({ customDatasetId: id }),
}));
