"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import { AlgorithmPanel } from "@/components/controls/AlgorithmPanel";
import { UploadPanel } from "@/components/controls/UploadPanel";
import { InlineDataEditor } from "@/components/controls/InlineDataEditor";
import { RecommendPanel } from "@/components/controls/RecommendPanel";
import { HeatmapCanvas } from "@/components/canvas/HeatmapCanvas";
import { regressionColormap } from "@/components/canvas/HeatmapCanvas";
import { ClusteringCanvas } from "@/components/canvas/ClusteringCanvas";
import { DimReductionCanvas } from "@/components/canvas/DimReductionCanvas";
import { PointEditor } from "@/components/canvas/PointEditor";
import { DataGeneratorStudio } from "@/components/controls/DataGeneratorStudio";
import { PredictionExplainer, LearningModeToggle, MetricExplainerModal, TreeBuilder } from "@/components/explain";
import { TrainingPlayground, WrongPredictionExplorer } from "@/components/training";
import { HyperparameterComparison, AlgorithmRace, BenchmarkSuite } from "@/components/compare";
import { PCAExplorer, CodeGenerator, AIAssistant, FloatingAIAssistant } from "@/components/tools";
import { explainPrediction, type ExplainPredictionResponse } from "@/lib/api/client";
import { ErrorBoundary } from "@/components/canvas/ErrorBoundary";
import { MetricsDashboard } from "@/components/metrics/MetricsDashboard";
import { RegressionMetricsDashboard } from "@/components/metrics/RegressionMetricsDashboard";
import { ClusteringMetricsDashboard, ElbowPlot } from "@/components/metrics/ClusteringMetricsDashboard";
import { CrossValidationView } from "@/components/metrics/CrossValidationView";
import { CoefficientInspector } from "@/components/metrics/CoefficientInspector";
import { LearningCurvePlot } from "@/components/metrics/LearningCurvePlot";
import { DecisionPathView } from "@/components/metrics/DecisionPathView";
import { TaxonomyExplorer } from "@/components/taxonomy/TaxonomyExplorer";
import { ComparisonMode } from "@/components/comparison/ComparisonMode";
import { StreamingViz } from "@/components/streaming/StreamingViz";
import { Scene3D } from "@/components/three/Scene3D";
import { HelpPanel } from "@/components/controls/HelpPanel";
import { AppNavbar } from "@/components/layout/AppNavbar";
import {
  predictClassification,
  predictRegression,
  predictClustering,
  reduceDimensions,
  getClassificationMetrics,
  getRegressionMetrics,
  getRegressionLearningCurve,
  getRegressionCrossValidation,
  getCrossValidation,
  getCoefficients,
  getLearningCurve,
  getDecisionPath,
  type PredictionResponse,
  type ClassificationMetrics,
  type RegressionResponse,
  type RegressionMetricsResponse,
  type ClusteringResponse,
  type DimReductionResponse,
  type CrossValidationResponse,
  type CoefficientResponse,
  type LearningCurveResponse,
  type DecisionPathResponse,
} from "@/lib/api/client";
import { useUrlState, ShareButton, ExportButton, ThemeToggle } from "@/components/ui/UrlState";

const queryClient = new QueryClient();

type Tab = "explore" | "compare" | "taxonomy" | "stream" | "playground" | "tools" | "help";
type DataSource = "synthetic" | "upload" | "custom" | "inline" | "generator";
type AnalysisPanel = "metrics" | "cv" | "coefficients" | "learning" | "decision" | "elbow" | "recommend" | "explain" | "tree-build" | "metric-explain";

interface CustomPoint { x: number; y: number; label: number; }

function ExploreView() {
  const { family, algorithm, hyperparameters, datasetName, noise, nSamples, setAlgorithm, uploadedDatasetId, customDatasetId } = useAppStore();
  const [result, setResult] = useState<PredictionResponse | RegressionResponse | ClusteringResponse | DimReductionResponse | null>(null);
  const [classMetrics, setClassMetrics] = useState<ClassificationMetrics | null>(null);
  const [regMetrics, setRegMetrics] = useState<RegressionMetricsResponse | null>(null);
  const [clustMetrics, setClustMetrics] = useState<{ silhouette?: number; davies_bouldin?: number; inertia?: number } | null>(null);
  const [cvResult, setCvResult] = useState<CrossValidationResponse | null>(null);
  const [coefResult, setCoefResult] = useState<CoefficientResponse | null>(null);
  const [lcResult, setLcResult] = useState<LearningCurveResponse | null>(null);
  const [dpResult, setDpResult] = useState<DecisionPathResponse | null>(null);
  const [elbowResult, setElbowResult] = useState<{ k_values: number[]; inertias: number[]; silhouettes: number[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>("synthetic");
  const [activePanel, setActivePanel] = useState<AnalysisPanel | null>(null);
  const [customPoints, setCustomPoints] = useState<CustomPoint[]>([]);
  const [showPointEditor, setShowPointEditor] = useState(false);
  const [explainResult, setExplainResult] = useState<ExplainPredictionResponse | null>(null);
  const [learningMode, setLearningMode] = useState(false);
  const [metricExplainTarget, setMetricExplainTarget] = useState<{ name: string; value: number } | null>(null);
  const [showWrongPredictions, setShowWrongPredictions] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchPrediction = useCallback(async () => {
    setLoading(true);
    try {
      const base: Record<string, unknown> = { algorithm, dataset_name: datasetName, hyperparameters, noise, n_samples: nSamples };
      if (dataSource === "upload" && uploadedDatasetId) {
        base.session_id = uploadedDatasetId;
      } else if (dataSource === "custom" && customDatasetId) {
        base.session_id = customDatasetId;
      }
      if (family === "classification") setResult(await predictClassification(base as never));
      else if (family === "regression") setResult(await predictRegression(base as never));
      else if (family === "clustering") setResult(await predictClustering(base as never));
      else if (family === "dim-reduction") setResult(await reduceDimensions({ ...base, n_components: 2 } as never));
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [family, algorithm, datasetName, hyperparameters, noise, nSamples, dataSource, uploadedDatasetId, customDatasetId]);

  const fetchClassMetrics = useCallback(async () => {
    try {
      const data = await getClassificationMetrics({ algorithm, dataset_name: datasetName, hyperparameters, noise, n_samples: nSamples });
      setClassMetrics(data);
      setActivePanel("metrics");
    } catch (err) { console.error(err); }
  }, [algorithm, datasetName, hyperparameters, noise, nSamples]);

  const fetchRegMetrics = useCallback(async () => {
    try {
      const data = await getRegressionMetrics({ algorithm, dataset_name: datasetName, hyperparameters, noise, n_samples: nSamples });
      setRegMetrics(data);
      setActivePanel("metrics");
    } catch (err) { console.error(err); }
  }, [algorithm, datasetName, hyperparameters, noise, nSamples]);

  const fetchClustMetrics = useCallback(async () => {
    if (result && "metrics" in result) {
      setClustMetrics((result as ClusteringResponse).metrics);
      setActivePanel("metrics");
    }
  }, [result]);

  const fetchCV = useCallback(async () => {
    try {
      const data = await getCrossValidation({ algorithm, dataset_name: datasetName, hyperparameters, noise, n_samples: nSamples });
      setCvResult(data);
      setActivePanel("cv");
    } catch (err) { console.error(err); }
  }, [algorithm, datasetName, hyperparameters, noise, nSamples]);

  const fetchCoef = useCallback(async () => {
    try {
      const data = await getCoefficients({ algorithm, dataset_name: datasetName, hyperparameters, noise, n_samples: nSamples });
      setCoefResult(data);
      setActivePanel("coefficients");
    } catch (err) { console.error(err); }
  }, [algorithm, datasetName, hyperparameters, noise, nSamples]);

  const fetchLC = useCallback(async () => {
    try {
      const data = await getLearningCurve({ algorithm, dataset_name: datasetName, hyperparameters, noise, n_samples: nSamples });
      setLcResult(data);
      setActivePanel("learning");
    } catch (err) { console.error(err); }
  }, [algorithm, datasetName, hyperparameters, noise, nSamples]);

  const fetchRegLC = useCallback(async () => {
    try {
      const data = await getRegressionLearningCurve({ algorithm, dataset_name: datasetName, hyperparameters, noise, n_samples: nSamples });
      setLcResult(data);
      setActivePanel("learning");
    } catch (err) { console.error(err); }
  }, [algorithm, datasetName, hyperparameters, noise, nSamples]);

  const fetchRegCV = useCallback(async () => {
    try {
      const data = await getRegressionCrossValidation({ algorithm, dataset_name: datasetName, hyperparameters, noise, n_samples: nSamples });
      setCvResult(data);
      setActivePanel("cv");
    } catch (err) { console.error(err); }
  }, [algorithm, datasetName, hyperparameters, noise, nSamples]);

  const fetchElbow = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/clustering/elbow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ algorithm: "kmeans", dataset_name: datasetName, hyperparameters, noise, n_samples: nSamples }),
      });
      const data = await res.json();
      setElbowResult(data);
      setActivePanel("elbow");
    } catch (err) { console.error(err); }
  }, [datasetName, hyperparameters, noise, nSamples]);

  const fetchDecisionPath = useCallback(async (point: number[]) => {
    try {
      const data = await getDecisionPath({ algorithm, dataset_name: datasetName, hyperparameters, point, noise, n_samples: nSamples });
      setDpResult(data);
      setActivePanel("decision");
    } catch (err) { console.error(err); }
  }, [algorithm, datasetName, hyperparameters, noise, nSamples]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchPrediction(); }, 300);
    return () => clearTimeout(timer);
  }, [fetchPrediction]);

  const isClass = (r: unknown): r is PredictionResponse => r !== null && "contour_lines" in (r as Record<string, unknown>);
  const isReg = (r: unknown): r is RegressionResponse => r !== null && "uncertainty_grid" in (r as Record<string, unknown>);
  const isClust = (r: unknown): r is ClusteringResponse => r !== null && "label_grid" in (r as Record<string, unknown>);

  const handleCustomDatasetReady = (datasetId: string, name: string) => {
    if (name === "uploaded") {
      useAppStore.getState().setUploadedDatasetId(datasetId);
      setDataSource("upload");
    } else {
      useAppStore.getState().setCustomDatasetId(datasetId);
      setDataSource("custom");
    }
    useAppStore.getState().setDatasetName(name);
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!result) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    let bounds: { x_min: number; x_max: number; y_min: number; y_max: number } | null = null;
    if (isClass(result)) bounds = result.grid_bounds;
    else if (isReg(result)) bounds = result.grid_bounds;
    else if (isClust(result)) bounds = result.grid_bounds;

    if (!bounds) return;
    const { x_min, x_max, y_min, y_max } = bounds;
    const dataX = (px / w) * (x_max - x_min) + x_min;
    const dataY = ((h - py) / h) * (y_max - y_min) + y_min;

    if (learningMode && family === "classification") {
      try {
        const res = await explainPrediction({
          algorithm,
          dataset_name: datasetName,
          hyperparameters,
          point: [dataX, dataY],
          noise,
          n_samples: nSamples,
        });
        setExplainResult(res);
        setActivePanel("explain");
      } catch (err) { console.error(err); }
    } else if (showPointEditor) {
      fetchDecisionPath([dataX, dataY]);
    }
  };

  const showMetricsBtn = family === "classification" || family === "regression" || family === "clustering";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-card/50 flex-wrap">
        {/* Data source selector */}
        <div className="flex rounded-md border border-border overflow-hidden">
          {(["synthetic", "upload", "inline", "custom", "generator"] as DataSource[]).map((ds) => (
            <button
              key={ds}
              onClick={() => {
                setDataSource(ds);
                if (ds === "custom") setShowPointEditor(true);
                else setShowPointEditor(false);
              }}
              className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                dataSource === ds ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
              }`}
            >
              {ds === "synthetic" ? "Synthetic" : ds === "upload" ? "CSV" : ds === "inline" ? "Paste" : ds === "custom" ? "Draw" : "Generate"}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-border" />

        <button onClick={fetchPrediction} disabled={loading} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? "Computing..." : "Run"}
        </button>

        {showMetricsBtn && (
          <button
            onClick={() => {
              if (family === "classification") fetchClassMetrics();
              else if (family === "regression") fetchRegMetrics();
              else fetchClustMetrics();
            }}
            className="px-3 py-1.5 rounded-md border border-border text-foreground text-xs font-medium hover:bg-accent transition-colors"
          >
            Metrics
          </button>
        )}

        {family === "classification" && (
          <>
            <button onClick={fetchCV} className="px-2 py-1.5 rounded-md border border-border text-foreground text-[10px] font-medium hover:bg-accent transition-colors">CV</button>
            <button onClick={fetchCoef} className="px-2 py-1.5 rounded-md border border-border text-foreground text-[10px] font-medium hover:bg-accent transition-colors">Coefficients</button>
            <button onClick={fetchLC} className="px-2 py-1.5 rounded-md border border-border text-foreground text-[10px] font-medium hover:bg-accent transition-colors">Learning Curve</button>
            <LearningModeToggle
              enabled={learningMode}
              onToggle={setLearningMode}
            />
            {algorithm === "decision-tree" && (
              <button onClick={() => setActivePanel("tree-build")} className="px-2 py-1.5 rounded-md border border-border text-foreground text-[10px] font-medium hover:bg-accent transition-colors">Tree Builder</button>
            )}
            <button onClick={() => setShowWrongPredictions(true)} className="px-2 py-1.5 rounded-md border border-border text-foreground text-[10px] font-medium hover:bg-accent transition-colors">Wrong</button>
          </>
        )}

        {family === "regression" && (
          <>
            <button onClick={fetchRegCV} className="px-2 py-1.5 rounded-md border border-border text-foreground text-[10px] font-medium hover:bg-accent transition-colors">CV</button>
            <button onClick={fetchRegLC} className="px-2 py-1.5 rounded-md border border-border text-foreground text-[10px] font-medium hover:bg-accent transition-colors">Learning Curve</button>
          </>
        )}

        {family === "clustering" && (
          <button onClick={fetchElbow} className="px-2 py-1.5 rounded-md border border-border text-foreground text-[10px] font-medium hover:bg-accent transition-colors">Elbow</button>
        )}

        {(family === "classification" || family === "regression") && result && isClass(result) && (
          <button onClick={() => setShow3D(!show3D)} className="px-2 py-1.5 rounded-md border border-border text-foreground text-[10px] font-medium hover:bg-accent transition-colors">
            {show3D ? "2D" : "3D"}
          </button>
        )}

        <div className="ml-auto flex gap-1">
          <ExportButton
            canvasRef={canvasRef}
            metrics={(classMetrics ?? regMetrics ?? undefined) as Record<string, unknown> | undefined}
            config={{ algorithm, hyperparameters, datasetName }}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Data source panels */}
        {dataSource === "upload" && (
          <div className="w-72 border-r border-border bg-card p-4 overflow-y-auto">
            <UploadPanel onDatasetReady={handleCustomDatasetReady} />
          </div>
        )}
        {dataSource === "inline" && (
          <div className="w-72 border-r border-border bg-card p-4 overflow-y-auto">
            <InlineDataEditor onDatasetReady={handleCustomDatasetReady} />
          </div>
        )}
        {dataSource === "custom" && (
          <div className="w-72 border-r border-border bg-card p-4 overflow-y-auto">
            <PointEditor
              width={250}
              height={250}
              nClasses={2}
              points={customPoints}
              onPointsChange={setCustomPoints}
            />
            {customPoints.length >= 4 && (
              <button
                onClick={async () => {
                  const points = customPoints.map(p => [p.x, p.y]);
                  const labels = customPoints.map(p => p.label);
                  try {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                    const res = await fetch(`${API_URL}/api/datasets/custom`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ points, labels, dataset_name: "custom" }),
                    });
                    const data = await res.json();
                    handleCustomDatasetReady(data.dataset_id, "custom");
                  } catch (err) { console.error(err); }
                }}
                className="w-full mt-3 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Use This Dataset
              </button>
            )}
          </div>
        )}
        {dataSource === "generator" && (
          <div className="w-72 border-r border-border bg-card p-4 overflow-y-auto">
            <DataGeneratorStudio
              onDatasetReady={(X, y, name) => {
                useAppStore.getState().setDatasetName(name);
                setDataSource("synthetic");
              }}
            />
          </div>
        )}

        {/* Main canvas area */}
        <div className="flex-1 flex items-center justify-center p-6 relative overflow-auto" onClick={handleCanvasClick}>
          {show3D && result && isClass(result) && (
            <div className="w-full h-[600px] rounded-lg border border-border overflow-hidden">
              <Scene3D grid={result.grid} points={result.points} />
            </div>
          )}

          {!show3D && result && isClass(result) && (
            <ErrorBoundary>
              <HeatmapCanvas
                ref={canvasRef}
                grid={result.grid}
                contourLines={result.contour_lines}
                points={result.points}
                gridBounds={result.grid_bounds}
                width={700}
                height={600}
                vizMetadata={"viz_metadata" in result ? (result as { viz_metadata?: { original_features: number; displayed_dimensions: number; scaled: boolean; pca_applied: boolean; explained_variance_ratio: number[] | null; total_variance_explained: number | null } }).viz_metadata : null}
              />
            </ErrorBoundary>
          )}
          {!show3D && result && isReg(result) && (
            <ErrorBoundary>
              <HeatmapCanvas
                ref={canvasRef}
                grid={result.grid}
                points={result.points}
                gridBounds={result.grid_bounds}
                width={700}
                height={600}
                colormap={regressionColormap}
                vizMetadata={"viz_metadata" in result ? (result as { viz_metadata?: { original_features: number; displayed_dimensions: number; scaled: boolean; pca_applied: boolean; explained_variance_ratio: number[] | null; total_variance_explained: number | null } }).viz_metadata : null}
              />
            </ErrorBoundary>
          )}
          {!show3D && result && isClust(result) && (
            <ErrorBoundary>
              <ClusteringCanvas
                labelGrid={result.label_grid}
                points={result.points}
                gridBounds={result.grid_bounds}
                width={700}
                height={600}
                vizMetadata={"viz_metadata" in result ? (result as { viz_metadata?: { original_features: number; displayed_dimensions: number; scaled: boolean; pca_applied: boolean; explained_variance_ratio: number[] | null; total_variance_explained: number | null } }).viz_metadata : null}
              />
            </ErrorBoundary>
          )}
          {!show3D && result && "embedding" in (result as Record<string, unknown>) && (
            <ErrorBoundary>
              <DimReductionCanvas embedding={(result as DimReductionResponse).embedding} points={(result as DimReductionResponse).points} width={700} height={600} info={(result as DimReductionResponse).info} />
            </ErrorBoundary>
          )}

          {!result && !loading && <div className="text-muted-foreground text-sm">Click Run to visualize</div>}
          {loading && <div className="text-muted-foreground text-sm animate-pulse">Computing...</div>}

          {/* Visualization metadata badge */}
          {result && "viz_metadata" in result && (() => {
            const meta = (result as { viz_metadata?: { original_features: number; pca_applied: boolean; explained_variance_ratio: number[] | null; total_variance_explained: number | null; scaled: boolean } }).viz_metadata;
            if (!meta) return null;
            return (
              <div className="absolute bottom-4 right-4 bg-card/90 border border-border rounded-lg px-3 py-2 text-[10px] text-muted-foreground backdrop-blur-sm max-w-[200px]">
                <div className="space-y-0.5">
                  {meta.pca_applied && (
                    <div className="text-[#255EBA] font-medium">
                      PCA 2D ({(meta.total_variance_explained! * 100).toFixed(0)}% var)
                    </div>
                  )}
                  <div>Features: {meta.original_features} → 2D</div>
                  {meta.scaled && <div>Scaled: StandardScaler</div>}
                  {meta.pca_applied && meta.explained_variance_ratio && (
                    <div>PC1: {(meta.explained_variance_ratio[0] * 100).toFixed(1)}% | PC2: {(meta.explained_variance_ratio[1] * 100).toFixed(1)}%</div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Analysis panels overlay */}
          {activePanel && (
            <div className="absolute top-4 left-4 w-72 bg-card border border-border rounded-lg p-4 max-h-[80vh] overflow-y-auto z-20 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  {activePanel === "metrics" ? "Metrics" : activePanel === "cv" ? "Cross-Validation" : activePanel === "coefficients" ? "Coefficients" : activePanel === "learning" ? "Learning Curve" : activePanel === "decision" ? "Decision Path" : activePanel === "elbow" ? "Elbow Plot" : activePanel === "explain" ? "Prediction Explanation" : activePanel === "tree-build" ? "Tree Builder" : "Recommend"}
                </span>
                <button onClick={() => setActivePanel(null)} className="text-xs text-muted-foreground hover:text-foreground">x</button>
              </div>
              {activePanel === "metrics" && classMetrics && <MetricsDashboard metrics={classMetrics} />}
              {activePanel === "metrics" && regMetrics && <RegressionMetricsDashboard metrics={regMetrics} />}
              {activePanel === "metrics" && clustMetrics && <ClusteringMetricsDashboard metrics={clustMetrics} />}
              {activePanel === "cv" && cvResult && <CrossValidationView folds={cvResult.folds} meanAccuracy={cvResult.mean_accuracy} stdAccuracy={cvResult.std_accuracy} />}
              {activePanel === "coefficients" && coefResult && <CoefficientInspector coefficients={coefResult.coefficients} intercept={coefResult.intercept} featureNames={coefResult.feature_names} modelType={coefResult.model_type} />}
              {activePanel === "learning" && lcResult && <LearningCurvePlot trainSizes={lcResult.train_sizes} trainScores={lcResult.train_scores} validationScores={lcResult.validation_scores} />}
              {activePanel === "decision" && dpResult && <DecisionPathView path={dpResult.path} prediction={dpResult.prediction} modelType={dpResult.model_type} />}
              {activePanel === "elbow" && elbowResult && <ElbowPlot kValues={elbowResult.k_values} inertias={elbowResult.inertias} silhouettes={elbowResult.silhouettes} />}
              {activePanel === "explain" && explainResult && <PredictionExplainer result={explainResult} />}
              {activePanel === "tree-build" && (
                <TreeBuilder
                  datasetName={datasetName}
                  hyperparameters={hyperparameters}
                  noise={noise}
                  nSamples={nSamples}
                />
              )}
              {activePanel === "recommend" && <RecommendPanel onAlgorithmSelect={(name) => { setAlgorithm(name); setActivePanel(null); }} />}
            </div>
          )}
        </div>

        {/* Right panel: recommend */}
        {dataSource === "synthetic" && (
          <div className="w-56 border-l border-border bg-card p-4 overflow-y-auto">
            <RecommendPanel onAlgorithmSelect={(name) => setAlgorithm(name)} />
          </div>
        )}
      </div>

      {/* Metric Explainer Modal */}
      {metricExplainTarget && (
        <MetricExplainerModal
          metric={metricExplainTarget.name}
          value={metricExplainTarget.value}
          algorithm={algorithm}
          datasetName={datasetName}
          hyperparameters={hyperparameters}
          onClose={() => setMetricExplainTarget(null)}
        />
      )}

      {/* Wrong Predictions Explorer */}
      {showWrongPredictions && family === "classification" && (
        <WrongPredictionExplorer
          algorithm={algorithm}
          datasetName={datasetName}
          hyperparameters={hyperparameters}
          noise={noise}
          nSamples={nSamples}
          onClose={() => setShowWrongPredictions(false)}
        />
      )}
    </div>
  );
}

function AppContent() {
  const [tab, setTab] = useState<Tab>("explore");
  const { algorithm, hyperparameters, datasetName, resolution, noise, nSamples } = useAppStore();
  useUrlState();

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppNavbar />
      <FloatingAIAssistant algorithm={algorithm} datasetName={datasetName} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r border-border bg-card p-4 overflow-y-auto flex-shrink-0">
          <div className="flex items-center gap-2 mb-4 px-1">
            <ShareButton />
            <ThemeToggle />
          </div>
          <div className="flex flex-wrap gap-1 mb-6 border border-border rounded-lg p-1">
            {(["explore", "compare", "taxonomy", "stream", "playground", "tools", "help"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"}`}>
                {t === "explore" ? "Explore" : t === "compare" ? "Compare" : t === "taxonomy" ? "Taxonomy" : t === "stream" ? "Stream" : t === "playground" ? "Train" : t === "tools" ? "Tools" : "Help"}
              </button>
            ))}
          </div>
          {(tab === "explore" || tab === "stream" || tab === "playground") && <AlgorithmPanel />}
          {tab === "tools" && (
            <div className="p-4 space-y-4">
              <CodeGenerator algorithm={algorithm} datasetName={datasetName} hyperparameters={hyperparameters} />
            </div>
          )}
          {tab === "stream" && (
            <div className="mt-4 px-4">
              <div className="text-[10px] text-muted-foreground bg-muted/50 rounded-md p-2">
                Streaming supports: AdaBoost, Gradient Boosting, Random Forest, SGD, Decision Tree, MLP
              </div>
            </div>
          )}
          {tab === "taxonomy" && <div className="px-4 text-xs text-muted-foreground">Filter algorithms by boundary geometry</div>}
          {tab === "help" && <HelpPanel />}
        </aside>

        <main className="flex-1 overflow-auto bg-background">
          {tab === "explore" && <ExploreView />}
          {tab === "taxonomy" && <div className="p-8"><TaxonomyExplorer /></div>}
          {tab === "compare" && (
            <div className="p-8 space-y-8">
              <ComparisonMode />
              <div className="border-t border-border pt-8">
                <HyperparameterComparison
                  algorithm={algorithm}
                  datasetName={datasetName}
                  noise={noise}
                  nSamples={nSamples}
                />
              </div>
              <div className="border-t border-border pt-8">
                <AlgorithmRace datasetName={datasetName} noise={noise} nSamples={nSamples} />
              </div>
              <div className="border-t border-border pt-8">
                <BenchmarkSuite />
              </div>
            </div>
          )}
          {tab === "stream" && (
            <div className="flex items-center justify-center p-8">
              <StreamingViz algorithm={algorithm} datasetName={datasetName} hyperparameters={hyperparameters} resolution={resolution} noise={noise} nSamples={nSamples} width={600} height={600} />
            </div>
          )}
          {tab === "playground" && (
            <div className="p-8 max-w-4xl mx-auto">
              <TrainingPlayground
                algorithm={algorithm}
                datasetName={datasetName}
                hyperparameters={hyperparameters}
                noise={noise}
                nSamples={nSamples}
              />
            </div>
          )}
          {tab === "tools" && (
            <div className="p-8 max-w-4xl mx-auto space-y-8">
              <PCAExplorer datasetName={datasetName} noise={noise} nSamples={nSamples} />
              <div className="border-t border-border pt-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <CodeGenerator algorithm={algorithm} datasetName={datasetName} hyperparameters={hyperparameters} />
                  </div>
                  <div className="h-96">
                    <AIAssistant algorithm={algorithm} datasetName={datasetName} />
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "help" && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="text-4xl mb-4">?</div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Confluence Help</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse the help topics in the left panel to learn how to use the visualization tool, understand algorithm outputs, and master the analysis tools.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button onClick={() => setTab("explore")} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                    Start Exploring
                  </button>
                  <button onClick={() => setTab("compare")} className="px-3 py-1.5 rounded-md border border-border text-foreground text-xs font-medium hover:bg-accent transition-colors">
                    Compare Algorithms
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AppPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
