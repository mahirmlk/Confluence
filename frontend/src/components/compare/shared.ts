import { compareHyperparameters as apiCompareHyperparameters, runBenchmark as apiRunBenchmark, type HyperparamComparisonResult as ApiHyperparamComparisonResult, type BenchmarkResult as ApiBenchmarkResult } from "@/lib/api/client";

export type HyperparamComparisonResult = ApiHyperparamComparisonResult;
export type BenchmarkResult = ApiBenchmarkResult;

export { apiCompareHyperparameters as compareHyperparameters, apiRunBenchmark as runBenchmark };

export const HYPERPARAM_PRESETS: Record<string, { name: string; values: number[] }> = {
  "decision-tree": { name: "max_depth", values: [2, 5, 10, 20] },
  "knn": { name: "n_neighbors", values: [1, 5, 15, 30] },
  "logistic-regression": { name: "C", values: [0.01, 0.1, 1.0, 100.0] },
  "rbf-svm": { name: "C", values: [0.01, 0.1, 1.0, 100.0] },
  "linear-svm": { name: "C", values: [0.01, 0.1, 1.0, 100.0] },
  "random-forest": { name: "n_estimators", values: [1, 10, 50, 200] },
  "gradient-boosting": { name: "n_estimators", values: [1, 10, 50, 200] },
  "mlp": { name: "hidden_layer_sizes", values: [5, 20, 50, 200] },
};

export const ALL_CLASSIFICATION_ALGORITHMS = [
  "logistic-regression", "knn", "decision-tree", "rbf-svm", "linear-svm",
  "random-forest", "gradient-boosting", "gaussian-nb", "mlp",
];

export const DEFAULT_DATASETS = ["blobs", "moons", "circles", "spirals", "iris", "wine", "breast-cancer"];
