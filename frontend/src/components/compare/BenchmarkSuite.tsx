"use client";

import React, { useState, useCallback } from "react";
import { runBenchmark, type BenchmarkResult, ALL_CLASSIFICATION_ALGORITHMS, DEFAULT_DATASETS } from "./shared";

export function BenchmarkSuite() {
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>(["logistic-regression", "decision-tree", "random-forest", "rbf-svm"]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>(["blobs", "moons", "iris"]);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleAlgo = (algo: string) => {
    setSelectedAlgos((prev) => prev.includes(algo) ? prev.filter((a) => a !== algo) : [...prev, algo]);
  };

  const toggleDataset = (ds: string) => {
    setSelectedDatasets((prev) => prev.includes(ds) ? prev.filter((d) => d !== ds) : [...prev, ds]);
  };

  const startBenchmark = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await runBenchmark({
        algorithms: selectedAlgos,
        datasets: selectedDatasets,
        n_samples: 300,
        noise: 0.5,
      });
      setResults(data.results);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Benchmark failed");
    }
    setLoading(false);
  }, [selectedAlgos, selectedDatasets]);

  const algoLabels: Record<string, string> = {
    "logistic-regression": "LR", "knn": "KNN", "decision-tree": "DT", "rbf-svm": "SVM",
    "random-forest": "RF", "gradient-boosting": "GB", "gaussian-nb": "NB", "mlp": "MLP",
  };

  const algoScores: Record<string, number> = {};
  const algoTimes: Record<string, number> = {};
  for (const r of results) {
    if (!algoScores[r.algorithm]) { algoScores[r.algorithm] = 0; algoTimes[r.algorithm] = 0; }
    algoScores[r.algorithm] += r.accuracy;
    algoTimes[r.algorithm] += r.train_time;
  }
  const rankedAlgos = Object.keys(algoScores).sort((a, b) => algoScores[b] - algoScores[a]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Benchmark Suite</h3>

      <div className="space-y-2">
        <div className="text-[10px] text-muted-foreground">Algorithms:</div>
        <div className="flex flex-wrap gap-1">
          {ALL_CLASSIFICATION_ALGORITHMS.map((algo) => (
            <button key={algo} onClick={() => toggleAlgo(algo)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                selectedAlgos.includes(algo) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}>
              {algoLabels[algo] || algo}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] text-muted-foreground">Datasets:</div>
        <div className="flex flex-wrap gap-1">
          {DEFAULT_DATASETS.map((ds) => (
            <button key={ds} onClick={() => toggleDataset(ds)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                selectedDatasets.includes(ds) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}>
              {ds}
            </button>
          ))}
        </div>
      </div>

      <button onClick={startBenchmark} disabled={loading || selectedAlgos.length === 0 || selectedDatasets.length === 0}
        className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
        {loading ? "Running..." : "Run Benchmark"}
      </button>

      {error && <div className="text-xs text-red-500">{error}</div>}

      {results.length > 0 && (
        <>
          {/* Accuracy Heatmap */}
          <div className="border border-border rounded-lg p-3 overflow-x-auto">
            <div className="text-[10px] text-muted-foreground mb-2">Accuracy Heatmap</div>
            <table className="text-xs font-mono w-full">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left"></th>
                  {selectedDatasets.map((ds) => (
                    <th key={ds} className="px-2 py-1 text-muted-foreground">{ds}</th>
                  ))}
                  <th className="px-2 py-1 text-muted-foreground">Avg</th>
                </tr>
              </thead>
              <tbody>
                {rankedAlgos.map((algo) => {
                  const avg = algoScores[algo] / selectedDatasets.length;
                  return (
                    <tr key={algo}>
                      <td className="px-2 py-1 font-semibold">{algoLabels[algo]}</td>
                      {selectedDatasets.map((ds) => {
                        const r = results.find((x) => x.algorithm === algo && x.dataset === ds);
                        const acc = r?.accuracy ?? 0;
                        const intensity = acc;
                        return (
                          <td key={ds} className="px-2 py-1 text-center"
                            style={{ backgroundColor: `rgba(59, 130, 246, ${intensity * 0.5})` }}>
                            {acc > 0 ? `${(acc * 100).toFixed(0)}%` : "-"}
                          </td>
                        );
                      })}
                      <td className="px-2 py-1 font-semibold">{(avg * 100).toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Speed Ranking */}
          <div className="border border-border rounded-lg p-3 text-xs">
            <div className="text-muted-foreground mb-2">Speed Ranking (train time):</div>
            <div className="space-y-1">
              {rankedAlgos.sort((a, b) => algoTimes[a] - algoTimes[b]).map((algo, i) => (
                <div key={algo} className="flex items-center gap-2">
                  <span className="w-4 text-muted-foreground">{i + 1}.</span>
                  <span className="w-12 font-mono">{algoLabels[algo]}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (algoTimes[algo] / Math.max(...Object.values(algoTimes))) * 100)}%` }} />
                  </div>
                  <span className="font-mono w-16 text-right">{algoTimes[algo].toFixed(3)}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* Composite Leaderboard */}
          <div className="border border-border rounded-lg p-3 text-xs">
            <div className="text-muted-foreground mb-2">Overall Leaderboard (by avg accuracy):</div>
            <div className="space-y-1">
              {rankedAlgos.sort((a, b) => algoScores[b] - algoScores[a]).map((algo, i) => {
                const avg = algoScores[algo] / selectedDatasets.length;
                return (
                  <div key={algo} className={`flex items-center gap-2 px-2 py-1 rounded ${i === 0 ? "bg-primary/5" : ""}`}>
                    <span className="w-4 font-semibold">{i + 1}.</span>
                    <span className="w-12 font-mono font-semibold">{algoLabels[algo]}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`}
                        style={{ width: `${avg * 100}%` }} />
                    </div>
                    <span className="font-mono w-14 text-right">{(avg * 100).toFixed(1)}%</span>
                    <span className="font-mono w-14 text-right text-muted-foreground">{algoTimes[algo].toFixed(3)}s</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
