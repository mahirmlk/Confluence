"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api/client";

interface WrongPredictionExplorerProps {
  algorithm: string;
  datasetName: string;
  hyperparameters: Record<string, number>;
  noise: number;
  nSamples: number;
  onClose: () => void;
}

interface WrongPrediction {
  index: number;
  features: number[];
  expected_class: number;
  predicted_class: number;
  probability: number;
  class_probabilities: number[];
  decision_path: string[];
  nearest_correct: Array<{ index: number; distance: number; label: number; features: number[] }>;
  confidence_gap: number;
}

interface WrongPredictionsResult {
  total_wrong: number;
  total_samples: number;
  error_rate: number;
  analyses: WrongPrediction[];
}

export function WrongPredictionExplorer({ algorithm, datasetName, hyperparameters, noise, nSamples, onClose }: WrongPredictionExplorerProps) {
  const [result, setResult] = useState<WrongPredictionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.post("/wrong-predictions", {
      algorithm, dataset_name: datasetName, hyperparameters, noise, n_samples: nSamples,
    }).then((res) => setResult(res.data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [algorithm, datasetName, hyperparameters, noise, nSamples]);

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm text-muted-foreground animate-pulse">Analyzing wrong predictions...</div>
      </div>
    </div>
  );

  if (!result) return null;

  const analysis = result.analyses[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Wrong Predictions</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
        </div>

        <div className="flex gap-4 text-xs mb-4">
          <span className="text-muted-foreground">Total wrong: <span className="font-mono font-semibold">{result.total_wrong}</span></span>
          <span className="text-muted-foreground">Error rate: <span className="font-mono font-semibold">{(result.error_rate * 100).toFixed(1)}%</span></span>
        </div>

        {analysis && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">Sample #{analysis.index}</span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                Expected: Class {analysis.expected_class}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Predicted: Class {analysis.predicted_class}
              </span>
            </div>

            <div className="flex gap-4">
              <span className="text-muted-foreground">Confidence: <span className="font-mono">{(analysis.probability * 100).toFixed(1)}%</span></span>
              <span className="text-muted-foreground">Gap: <span className="font-mono">{analysis.confidence_gap.toFixed(3)}</span></span>
            </div>

            {analysis.class_probabilities.length > 0 && (
              <div className="space-y-1">
                <div className="text-muted-foreground">Class Probabilities:</div>
                {analysis.class_probabilities.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-12 text-muted-foreground">Class {i}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${i === analysis.expected_class ? "bg-green-500" : i === analysis.predicted_class ? "bg-blue-500" : "bg-muted-foreground/30"}`}
                        style={{ width: `${p * 100}%` }} />
                    </div>
                    <span className="font-mono w-12 text-right">{(p * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}

            {analysis.decision_path.length > 0 && (
              <div>
                <div className="text-muted-foreground mb-1">Decision Path:</div>
                <div className="font-mono space-y-0.5 bg-muted p-2 rounded">
                  {analysis.decision_path.map((step, i) => (
                    <div key={i} className="text-[10px]">{step}</div>
                  ))}
                </div>
              </div>
            )}

            {analysis.nearest_correct.length > 0 && (
              <div>
                <div className="text-muted-foreground mb-1">Nearest Correct Neighbors:</div>
                <div className="space-y-1">
                  {analysis.nearest_correct.map((n, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1 rounded bg-muted/50">
                      <span className="text-muted-foreground">#{n.index}</span>
                      <span className="font-mono">Class {n.label}</span>
                      <span className="text-muted-foreground ml-auto">dist: {n.distance.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {result.analyses.length > 1 && (
          <div className="flex items-center gap-2 mt-4">
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}
              className="px-2 py-1 rounded border border-border text-xs disabled:opacity-50">◀</button>
            <span className="text-xs text-muted-foreground">{currentIndex + 1} / {result.analyses.length}</span>
            <button onClick={() => setCurrentIndex(Math.min(result.analyses.length - 1, currentIndex + 1))} disabled={currentIndex >= result.analyses.length - 1}
              className="px-2 py-1 rounded border border-border text-xs disabled:opacity-50">▶</button>
          </div>
        )}
      </div>
    </div>
  );
}
