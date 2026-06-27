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
