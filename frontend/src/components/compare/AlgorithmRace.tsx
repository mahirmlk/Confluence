"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { HeatmapCanvas } from "@/components/canvas/HeatmapCanvas";
import { ALL_CLASSIFICATION_ALGORITHMS } from "./shared";
import { WS_URL } from "@/lib/config";

interface AlgorithmRaceProps {
  datasetName: string;
  noise: number;
  nSamples: number;
}

interface RaceResult {
  algorithm: string;
  grid: number[][];
  accuracy: number;
  train_time: number;
  pred_time: number;
  grid_bounds: { x_min: number; x_max: number; y_min: number; y_max: number };
}

const ALGO_LABELS: Record<string, string> = {
  "logistic-regression": "LR",
  "knn": "KNN",
  "decision-tree": "DT",
  "rbf-svm": "SVM",
  "random-forest": "RF",
  "gradient-boosting": "GB",
  "gaussian-nb": "NB",
  "mlp": "MLP",
};

export function AlgorithmRace({ datasetName, noise, nSamples }: AlgorithmRaceProps) {
  const [selected, setSelected] = useState<string[]>(["logistic-regression", "decision-tree", "random-forest", "rbf-svm"]);
  const [results, setResults] = useState<Record<string, RaceResult>>({});
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const toggleAlgo = (algo: string) => {
    setSelected((prev) =>
      prev.includes(algo) ? prev.filter((a) => a !== algo) : prev.length < 6 ? [...prev, algo] : prev
    );
  };

  const startRace = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    setResults({});
    setRunning(true);
    setError(null);

    const wsUrl = `${WS_URL}/api/compare/race`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        algorithms: selected,
        dataset_name: datasetName,
        noise,
        n_samples: nSamples,
        resolution: 80,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "algorithm_done") {
        setResults((prev) => ({ ...prev, [data.algorithm]: data.result }));
      } else if (data.type === "race_complete") {
        setRunning(false);
      } else if (data.type === "error") {
        setError(data.message);
        setRunning(false);
      }
    };

    ws.onerror = () => { setError("Connection failed"); setRunning(false); };
    ws.onclose = () => setRunning(false);
  }, [selected, datasetName, noise, nSamples]);

  useEffect(() => {
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);

  const sorted = Object.values(results).sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Algorithm Race</h3>

      <div className="flex flex-wrap gap-1">
        {ALL_CLASSIFICATION_ALGORITHMS.map((algo) => (
          <button key={algo} onClick={() => toggleAlgo(algo)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              selected.includes(algo) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}>
            {ALGO_LABELS[algo] || algo}
          </button>
        ))}
      </div>

      <button onClick={startRace} disabled={running || selected.length < 2}
        className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
        {running ? "Racing..." : "Start Race"}
      </button>

      {error && <div className="text-xs text-red-500">{error}</div>}

      {sorted.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {sorted.map((r, i) => (
              <div key={r.algorithm} className={`border rounded-lg p-2 space-y-1 ${
                i === 0 ? "border-primary ring-1 ring-primary/20" : "border-border"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{ALGO_LABELS[r.algorithm] || r.algorithm}</span>
                  {i === 0 && <span className="text-[9px] px-1 rounded bg-primary/10 text-primary">Best</span>}
                </div>
                <div className="aspect-square bg-secondary/20 rounded overflow-hidden">
                  <HeatmapCanvas grid={r.grid} contourLines={[]}
                    points={{ X: [], y: [] }}
                    gridBounds={r.grid_bounds}
                    width={150} height={150} />
                </div>
                <div className="text-[10px] space-y-0.5">
                  <div className="flex justify-between"><span className="text-muted-foreground">Accuracy</span><span className="font-mono font-semibold">{(r.accuracy * 100).toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Train</span><span className="font-mono">{r.train_time.toFixed(3)}s</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Predict</span><span className="font-mono">{(r.pred_time * 1000).toFixed(1)}ms</span></div>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-border rounded-lg p-3 text-xs">
            <div className="text-muted-foreground mb-2">Leaderboard:</div>
            <div className="space-y-1">
              {sorted.map((r, i) => (
                <div key={r.algorithm} className="flex items-center gap-2">
                  <span className="w-4 text-muted-foreground">{i + 1}.</span>
                  <span className="w-12 font-mono">{ALGO_LABELS[r.algorithm] || r.algorithm}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`}
                      style={{ width: `${r.accuracy * 100}%` }} />
                  </div>
                  <span className="font-mono w-14 text-right">{(r.accuracy * 100).toFixed(1)}%</span>
                  <span className="font-mono w-14 text-right text-muted-foreground">{r.train_time.toFixed(3)}s</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
