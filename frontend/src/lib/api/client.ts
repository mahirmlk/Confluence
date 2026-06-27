import axios from "axios";
import type { components } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export type DatasetSample = components["schemas"]["DatasetSample"];

export type PredictionRequest = Omit<components["schemas"]["PredictionRequest"], "noise" | "n_samples"> & {
  noise?: number;
  n_samples?: number;
};

export type PredictionResponse = components["schemas"]["PredictionResponse"] & {
  grid_bounds: { x_min: number; x_max: number; y_min: number; y_max: number };
};

export type ClassificationMetrics = Omit<components["schemas"]["ClassificationMetrics"], "roc_curve"> & {
  roc_curve: { fpr: number[]; tpr: number[] };
};

export type RegressionResponse = components["schemas"]["RegressionResponse"] & {
  grid_bounds: { x_min: number; x_max: number; y_min: number; y_max: number };
};

export type ClusteringResponse = components["schemas"]["ClusteringResponse"] & {
  grid_bounds: { x_min: number; x_max: number; y_min: number; y_max: number };
};

export type DimReductionResponse = components["schemas"]["DimReductionResponse"];

export interface RegressionMetricsResponse {
  r2: number;
  mse: number;
  rmse: number;
  mae: number;
  residuals: number[];
  predicted: number[];
  actual: number[];
}

export interface ClusteringElbowResponse {
  k_values: number[];
  inertias: number[];
  silhouettes: number[];
}

export interface CrossValidationResponse {
  folds: { fold: number; accuracy: number; grid: number[][]; contour_lines: number[][][]; grid_bounds: { x_min: number; x_max: number; y_min: number; y_max: number } }[];
  mean_accuracy: number;
  std_accuracy: number;
}

export interface CoefficientResponse {
  coefficients: number[];
  intercept: number;
  feature_names: string[];
  model_type: string;
}

export interface LearningCurveResponse {
  train_sizes: number[];
  train_scores: number[];
  validation_scores: number[];
}

export interface SensitivityResponse {
  param1_values: number[];
  param2_values: number[];
  accuracy_grid: number[][];
}

export interface DecisionPathResponse {
  path: string[];
  prediction: number;
  model_type: string;
}

export async function predictClassification(request: PredictionRequest): Promise<PredictionResponse> {
  const { data } = await api.post<PredictionResponse>("/api/classification/predict", request);
  return data;
}

export async function getClassificationMetrics(
  request: Omit<PredictionRequest, "resolution">
): Promise<ClassificationMetrics> {
  const { data } = await api.post<ClassificationMetrics>("/api/classification/metrics", request);
  return data;
}

export async function predictRegression(request: PredictionRequest): Promise<RegressionResponse> {
  const { data } = await api.post<RegressionResponse>("/api/regression/predict", request);
  return data;
}

export async function getRegressionMetrics(
  request: Omit<PredictionRequest, "resolution">
): Promise<RegressionMetricsResponse> {
  const { data } = await api.post<RegressionMetricsResponse>("/api/regression/metrics", request);
  return data;
}

export async function getRegressionLearningCurve(
  request: Omit<PredictionRequest, "resolution">
): Promise<LearningCurveResponse> {
  const { data } = await api.post<LearningCurveResponse>("/api/regression/learning-curve", request);
  return data;
}

export async function getRegressionCrossValidation(
  request: Omit<PredictionRequest, "resolution"> & { n_folds?: number }
): Promise<CrossValidationResponse> {
  const { data } = await api.post<CrossValidationResponse>("/api/regression/cross-validation", request);
  return data;
}

export async function predictClustering(request: PredictionRequest): Promise<ClusteringResponse> {
  const { data } = await api.post<ClusteringResponse>("/api/clustering/predict", request);
  return data;
}

export async function getClusteringElbow(
  request: Omit<PredictionRequest, "resolution"> & { k_min?: number; k_max?: number }
): Promise<ClusteringElbowResponse> {
  const { data } = await api.post<ClusteringElbowResponse>("/api/clustering/elbow", request);
  return data;
}

export async function reduceDimensions(
  request: Omit<PredictionRequest, "resolution"> & { n_components?: number }
): Promise<DimReductionResponse> {
  const { data } = await api.post<DimReductionResponse>("/api/dim-reduction/reduce", request);
  return data;
}

export async function getCrossValidation(
  request: Omit<PredictionRequest, "resolution"> & { n_folds?: number }
): Promise<CrossValidationResponse> {
  const { data } = await api.post<CrossValidationResponse>("/api/classification/cross-validation", request);
  return data;
}

export async function getCoefficients(
  request: Omit<PredictionRequest, "resolution">
): Promise<CoefficientResponse> {
  const { data } = await api.post<CoefficientResponse>("/api/classification/coefficients", request);
  return data;
}

export async function getLearningCurve(
  request: Omit<PredictionRequest, "resolution">
): Promise<LearningCurveResponse> {
  const { data } = await api.post<LearningCurveResponse>("/api/classification/learning-curve", request);
  return data;
}

export async function getSensitivity(
  request: Omit<PredictionRequest, "resolution"> & {
    param1: string; param1_range: number[];
    param2: string; param2_range: number[];
  }
): Promise<SensitivityResponse> {
  const { data } = await api.post<SensitivityResponse>("/api/classification/sensitivity", request);
  return data;
}

export async function getDecisionPath(
  request: Omit<PredictionRequest, "resolution"> & { point: number[] }
): Promise<DecisionPathResponse> {
  const { data } = await api.post<DecisionPathResponse>("/api/classification/decision-path", request);
  return data;
}

// --- V2 Dataset APIs ---

export interface DatasetMetaV2 {
  name: string;
  display_name: string;
  description: string;
  story: string;
  source: string;
  family: string;
  category: string;
  target_column: string | null;
  n_rows: number;
  n_features: number;
  n_classes: number | null;
  feature_names: string[];
  feature_types: string[];
  missing_values: boolean;
  difficulty: string;
  recommended_algorithms: string[];
  tags: string[];
  license: string | null;
}

export interface DatasetListV2Response {
  datasets: DatasetMetaV2[];
  total: number;
}

export interface DatasetDetailV2Response {
  metadata: DatasetMetaV2;
  sample: string[][];
}

export interface CategoryInfo {
  name: string;
  count: number;
  families: string[];
}

export async function listDatasetsV2(params?: {
  family?: string;
  category?: string;
  difficulty?: string;
  source?: string;
  search?: string;
}): Promise<DatasetListV2Response> {
  const { data } = await api.get<DatasetListV2Response>("/api/datasets/v2/datasets", { params });
  return data;
}

export async function getDatasetDetailV2(name: string): Promise<DatasetDetailV2Response> {
  const { data } = await api.get<DatasetDetailV2Response>(`/api/datasets/v2/datasets/${name}`);
  return data;
}

export async function listCategories(): Promise<{ categories: CategoryInfo[] }> {
  const { data } = await api.get("/api/datasets/v2/categories");
  return data;
}

export async function generateDatasetV2(request: {
  generator: string;
  n_samples?: number;
  noise?: number;
  n_classes?: number;
}): Promise<{ X: number[][]; y: number[]; generator: string; n_samples: number; n_classes: number }> {
  const { data } = await api.post("/api/datasets/v2/generate", request);
  return data;
}

// --- Explain APIs ---

export interface ExplainPredictionResponse {
  prediction: number;
  probabilities: number[];
  explanation: {
    path?: Array<Record<string, unknown>>;
    contributions?: Array<Record<string, unknown>>;
    feature_importance?: Array<Record<string, unknown>>;
    neighbors?: Array<Record<string, unknown>>;
    model_type: string;
    [key: string]: unknown;
  };
}

export interface ExplainMetricResponse {
  metric: string;
  explanation: {
    value?: number;
    formula?: string;
    calculation?: string;
    explanation?: string;
    breakdown_by_class?: Array<Record<string, unknown>>;
    details?: Array<Record<string, unknown>>;
    [key: string]: unknown;
  };
}

export interface LearningTipResponse {
  tip: string;
  element: string;
  algorithm: string;
}

export async function explainPrediction(request: {
  algorithm: string;
  dataset_name: string;
  hyperparameters?: Record<string, number>;
  point: number[];
  noise?: number;
  n_samples?: number;
}): Promise<ExplainPredictionResponse> {
  const { data } = await api.post("/api/explain/prediction", request);
  return data;
}

export async function explainMetric(request: {
  metric: string;
  algorithm: string;
  dataset_name: string;
  hyperparameters?: Record<string, number>;
  noise?: number;
  n_samples?: number;
}): Promise<ExplainMetricResponse> {
  const { data } = await api.post("/api/explain/metric", request);
  return data;
}

export async function getLearningTip(request: {
  algorithm: string;
  element: string;
  hyperparameters?: Record<string, number>;
  value?: number;
}): Promise<LearningTipResponse> {
  const { data } = await api.post("/api/explain/learning-tip", request);
  return data;
}

// --- Compare APIs ---

export interface HyperparamComparisonResult {
  config: Record<string, number>;
  config_label: string;
  grid: number[][];
  contour_lines: number[][][];
  train_accuracy: number;
  test_accuracy: number;
  gap: number;
}

export interface HyperparamComparisonResponse {
  results: HyperparamComparisonResult[];
  grid_bounds: { x_min: number; x_max: number; y_min: number; y_max: number };
}

export interface RaceResult {
  algorithm: string;
  grid: number[][];
  accuracy: number;
  train_time: number;
  pred_time: number;
  grid_bounds: { x_min: number; x_max: number; y_min: number; y_max: number };
}

export interface BenchmarkResult {
  algorithm: string;
  dataset: string;
  accuracy: number;
  train_time: number;
  pred_time: number;
  peak_memory_kb: number;
  n_samples: number;
  n_features: number;
  error?: string;
}

export async function compareHyperparameters(request: {
  algorithm: string;
  dataset_name: string;
  configs: Record<string, number>[];
  noise?: number;
  n_samples?: number;
  resolution?: number;
}): Promise<HyperparamComparisonResponse> {
  const { data } = await api.post("/api/compare/hyperparameter-comparison", request);
  return data;
}

export async function runBenchmark(request: {
  algorithms: string[];
  datasets: string[];
  n_samples?: number;
  noise?: number;
}): Promise<{ results: BenchmarkResult[] }> {
  const { data } = await api.post("/api/compare/benchmark", request);
  return data;
}

// --- Tools APIs ---

export interface PCAResponse {
  embedding: number[][];
  labels: number[];
  feature_names: string[];
  n_components: number;
  total_variance_explained: number;
  variance_per_component: number[];
  cumulative_variance: number[];
  all_variance: number[];
  feature_contributions: Array<{
    pc: number;
    variance_explained: number;
    contributions: Array<{ feature: string; loading: number; abs_loading: number }>;
  }>;
}

export interface CodeResponse {
  code: string;
  language: string;
}

export interface AssistantResponse {
  response: string;
  source: string;
}

export async function pcaExplore(request: {
  dataset_name: string;
  n_components?: number;
  noise?: number;
  n_samples?: number;
}): Promise<PCAResponse> {
  const { data } = await api.post("/api/tools/pca-explore", request);
  return data;
}

export async function generateCode(request: {
  algorithm: string;
  dataset_name: string;
  hyperparameters?: Record<string, number>;
}): Promise<CodeResponse> {
  const { data } = await api.post("/api/tools/generate-code", request);
  return data;
}

export async function assistantChat(request: {
  message: string;
  context?: Record<string, unknown>;
}): Promise<AssistantResponse> {
  const { data } = await api.post("/api/tools/assistant", request);
  return data;
}
