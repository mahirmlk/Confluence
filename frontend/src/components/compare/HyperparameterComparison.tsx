"use client";

import React, { useState, useCallback } from "react";
import { compareHyperparameters, type HyperparamComparisonResult, HYPERPARAM_PRESETS } from "./shared";
import { HeatmapCanvas } from "@/components/canvas/HeatmapCanvas";

interface HyperparameterComparisonProps {
  algorithm: string;
  datasetName: string;
  noise: number;
  nSamples: number;
}

export function HyperparameterComparison({ algorithm, datasetName, noise, nSamples }: HyperparameterComparisonProps) {
  const [results, setResults] = useState<HyperparamComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = HYPERPARAM_PRESETS[algorithm];

  const runComparison = useCallback(async () => {
    if (!presets) return;
    setLoading(true);
    setError(null);
    try {
      const paramName = presets.name;
      const configs = presets.values.map((v) => ({ [paramName]: v }));
      const data = await compareHyperparameters({
        algorithm, dataset_name: datasetName, configs,
        noise, n_samples: nSamples, resolution: 80,
      });
      setResults(data.results);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to compare");
    }
    setLoading(false);
  }, [algorithm, datasetName, noise, nSamples, presets]);

  if (!presets) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Hyperparameter Comparison</h3>
        <p className="text-xs text-muted-foreground">No presets available for {algorithm}. Try Decision Tree, KNN, or SVM.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Hyperparameter Comparison</h3>
        <button onClick={runComparison} disabled={loading}
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
          {loading ? "Running..." : "Compare"}
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Comparing {presets.name}: {presets.values.join(", ")}
      </p>

      {error && <div className="text-xs text-red-500">{error}</div>}

      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {results.map((r, i) => (
            <div key={i} className="border border-border rounded-lg p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold">{r.config_label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  r.gap < 0.05 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                  r.gap < 0.15 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                  "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}>
                  {r.gap < 0.05 ? "Good fit" : r.gap < 0.15 ? "Slight overfit" : "Overfitting"}
                </span>
              </div>
              <div className="aspect-square bg-secondary/20 rounded overflow-hidden">
                <HeatmapCanvas grid={r.grid} contourLines={r.contour_lines}
                  points={{ X: [], y: [] }}
                  gridBounds={{ x_min: -3, x_max: 3, y_min: -3, y_max: 3 }}
                  width={200} height={200} />
              </div>
              <div className="flex gap-2 text-[10px]">
                <span className="text-muted-foreground">Train: <span className="font-mono">{(r.train_accuracy * 100).toFixed(1)}%</span></span>
                <span className="text-muted-foreground">Test: <span className="font-mono">{(r.test_accuracy * 100).toFixed(1)}%</span></span>
                <span className="text-muted-foreground">Gap: <span className="font-mono">{(r.gap * 100).toFixed(1)}%</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="border border-border rounded-lg p-3 text-xs">
          <div className="text-muted-foreground mb-2">Analysis:</div>
          <div className="space-y-1">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-mono w-24">{r.config_label}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden flex">
                  <div className="h-full bg-green-500" style={{ width: `${r.test_accuracy * 100}%` }} />
                </div>
                <span className="font-mono w-14 text-right">{(r.test_accuracy * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-2">
            {results[results.length - 1].gap > 0.15
              ? "Higher values overfit — train accuracy is much higher than test. Consider simpler models."
              : "Good generalization — train and test accuracy are close across all configurations."}
          </p>
        </div>
      )}
    </div>
  );
}
