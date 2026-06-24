"use client";

import React, { useState, useCallback } from "react";
import { useAppStore, ALGORITHMS } from "@/lib/store";
import { HeatmapCanvas } from "@/components/canvas/HeatmapCanvas";
import { ClusteringCanvas } from "@/components/canvas/ClusteringCanvas";
import { DimReductionCanvas } from "@/components/canvas/DimReductionCanvas";
import { OverlayCanvas } from "@/components/canvas/OverlayCanvas";
import { InteractiveCanvas, type Transform } from "@/components/canvas/InteractiveCanvas";
import {
  predictClassification,
  predictRegression,
  predictClustering,
  reduceDimensions,
  type PredictionResponse,
  type RegressionResponse,
  type ClusteringResponse,
  type DimReductionResponse,
} from "@/lib/api/client";

interface ComparisonSlot {
  algorithm: string;
  family: string;
  result: PredictionResponse | RegressionResponse | ClusteringResponse | DimReductionResponse | null;
  loading: boolean;
}

export function ComparisonMode() {
  const { datasetName, hyperparameters, resolution, noise, nSamples } = useAppStore();
  const [slots, setSlots] = useState<ComparisonSlot[]>([
    { algorithm: "logistic-regression", family: "classification", result: null, loading: false },
    { algorithm: "knn", family: "classification", result: null, loading: false },
  ]);
  const [overlayMode, setOverlayMode] = useState(false);
  const [syncZoom, setSyncZoom] = useState(true);
  const [transform, setTransform] = useState<Transform>({ offsetX: 0, offsetY: 0, scale: 1 });

  const updateSlot = (index: number, updates: Partial<ComparisonSlot>) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const fetchSlot = useCallback(async (index: number) => {
    const slot = slots[index];
    updateSlot(index, { loading: true });
    try {
      const base = { algorithm: slot.algorithm, dataset_name: datasetName, hyperparameters, noise, n_samples: nSamples };
      let result;
      if (slot.family === "classification") {
        result = await predictClassification({ ...base, resolution });
      } else if (slot.family === "regression") {
        result = await predictRegression({ ...base, resolution });
      } else if (slot.family === "clustering") {
        result = await predictClustering({ ...base, resolution });
      } else {
        result = await reduceDimensions({ ...base, n_components: 2 });
      }
      updateSlot(index, { result, loading: false });
    } catch {
      updateSlot(index, { loading: false });
    }
  }, [slots, datasetName, hyperparameters, resolution, noise, nSamples]);

  const runAll = useCallback(async () => {
    for (let i = 0; i < slots.length; i++) {
      await fetchSlot(i);
    }
  }, [slots.length, fetchSlot]);

  const addSlot = () => {
    if (slots.length < 4) {
      setSlots((prev) => [
        ...prev,
        { algorithm: "decision-tree", family: "classification", result: null, loading: false },
      ]);
    }
  };

  const removeSlot = (index: number) => {
    if (slots.length > 1) {
      setSlots((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const isClassification = (r: unknown): r is PredictionResponse =>
    r !== null && "grid" in (r as Record<string, unknown>) && "contour_lines" in (r as Record<string, unknown>);

  const isRegression = (r: unknown): r is RegressionResponse =>
    r !== null && "uncertainty_grid" in (r as Record<string, unknown>);

  const isClustering = (r: unknown): r is ClusteringResponse =>
    r !== null && "label_grid" in (r as Record<string, unknown>);

  const isDimReduction = (r: unknown): r is DimReductionResponse =>
    r !== null && "embedding" in (r as Record<string, unknown>);

  const showOverlay = overlayMode && slots.length >= 2 && slots[0].result && slots[1].result &&
    isClassification(slots[0].result) && isClassification(slots[1].result);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Comparison Mode</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSyncZoom(!syncZoom)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              syncZoom ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:bg-accent"
            }`}
          >
            {syncZoom ? "Sync On" : "Sync Off"}
          </button>
          <button
            onClick={() => setOverlayMode(!overlayMode)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              overlayMode ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:bg-accent"
            }`}
          >
            {overlayMode ? "Overlay On" : "Overlay Off"}
          </button>
          <button
            onClick={runAll}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Run All
          </button>
          {slots.length < 4 && (
            <button
              onClick={addSlot}
              className="px-3 py-1.5 rounded-md text-xs font-medium border border-border text-foreground hover:bg-accent"
            >
              + Add Model
            </button>
          )}
        </div>
      </div>

      {showOverlay && (
        <div className="flex justify-center">
          <div className="space-y-2">
            <div className="text-xs text-center text-muted-foreground">
              Blue = {ALGORITHMS.find(a => a.name === slots[0].algorithm)?.label ?? slots[0].algorithm} &nbsp;|&nbsp;
              Red = {ALGORITHMS.find(a => a.name === slots[1].algorithm)?.label ?? slots[1].algorithm}
            </div>
            <OverlayCanvas
              grid1={(slots[0].result as PredictionResponse).grid}
              grid2={(slots[1].result as PredictionResponse).grid}
              contourLines1={(slots[0].result as PredictionResponse).contour_lines}
              contourLines2={(slots[1].result as PredictionResponse).contour_lines}
              width={500}
              height={500}
            />
          </div>
        </div>
      )}

      {!showOverlay && (
        <div className={`grid gap-4 ${slots.length <= 2 ? "grid-cols-2" : "grid-cols-2"}`}>
          {slots.map((slot, index) => {
            const algoConfig = ALGORITHMS.find((a) => a.name === slot.algorithm);
            const families: Array<{ value: string; label: string }> = [
              { value: "classification", label: "Classification" },
              { value: "regression", label: "Regression" },
              { value: "clustering", label: "Clustering" },
              { value: "dim-reduction", label: "Dim. Reduction" },
            ];
            const filteredAlgos = ALGORITHMS.filter((a) => a.family === slot.family);

            const renderCanvas = () => {
              const size = 300;
              if (slot.result && isClassification(slot.result)) {
                return (
                  <HeatmapCanvas
                    grid={slot.result.grid}
                    contourLines={slot.result.contour_lines}
                    points={slot.result.points}
                    gridBounds={slot.result.grid_bounds}
                    width={size}
                    height={size}
                  />
                );
              }
              if (slot.result && isRegression(slot.result)) {
                return (
                  <HeatmapCanvas
                    grid={slot.result.grid}
                    points={slot.result.points}
                    gridBounds={slot.result.grid_bounds}
                    width={size}
                    height={size}
                  />
                );
              }
              if (slot.result && isClustering(slot.result)) {
                return (
                  <ClusteringCanvas
                    labelGrid={slot.result.label_grid}
                    points={slot.result.points}
                    gridBounds={slot.result.grid_bounds}
                    width={size}
                    height={size}
                  />
                );
              }
              if (slot.result && isDimReduction(slot.result)) {
                return (
                  <DimReductionCanvas
                    embedding={slot.result.embedding}
                    points={slot.result.points}
                    width={size}
                    height={size}
                    info={slot.result.info}
                  />
                );
              }
              return null;
            };

            const canvasContent = (
              <div className="aspect-square bg-secondary/20 rounded overflow-hidden flex items-center justify-center">
                {renderCanvas()}
                {!slot.result && !slot.loading && (
                  <span className="text-xs text-muted-foreground">Click Run</span>
                )}
              </div>
            );

            return (
              <div key={index} className="rounded-lg border border-border bg-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{algoConfig?.label ?? slot.algorithm}</span>
                  <button
                    onClick={() => removeSlot(index)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    x
                  </button>
                </div>
                <div className="flex gap-1">
                  <select
                    value={slot.family}
                    onChange={(e) => updateSlot(index, { family: e.target.value, algorithm: "" })}
                    className="flex-1 rounded border border-border bg-background px-1 py-0.5 text-[10px] text-foreground"
                  >
                    {families.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <select
                    value={slot.algorithm}
                    onChange={(e) => updateSlot(index, { algorithm: e.target.value })}
                    className="flex-1 rounded border border-border bg-background px-1 py-0.5 text-[10px] text-foreground"
                  >
                    {filteredAlgos.map((a) => (
                      <option key={a.name} value={a.name}>{a.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => fetchSlot(index)}
                    disabled={slot.loading}
                    className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-[10px] disabled:opacity-50"
                  >
                    {slot.loading ? "..." : "Run"}
                  </button>
                </div>
                {syncZoom ? (
                  <InteractiveCanvas width={300} height={300} transform={transform} onTransformChange={setTransform}>
                    {() => canvasContent}
                  </InteractiveCanvas>
                ) : canvasContent}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
