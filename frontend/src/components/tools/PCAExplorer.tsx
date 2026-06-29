"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { pcaExplore, type PCAResponse } from "@/lib/api/client";

interface PCAExplorerProps {
  datasetName: string;
  noise: number;
  nSamples: number;
}

export function PCAExplorer({ datasetName, noise, nSamples }: PCAExplorerProps) {
  const [result, setResult] = useState<PCAResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [nComponents, setNComponents] = useState(2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screeRef = useRef<HTMLCanvasElement>(null);

  const runPCA = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pcaExplore({ dataset_name: datasetName, n_components: nComponents, noise, n_samples: nSamples });
      setResult(data);
    } catch { /* */ }
    setLoading(false);
  }, [datasetName, nComponents, noise, nSamples]);

  // Draw projection
  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pad = 30;
    ctx.fillStyle = "var(--background, #fff)";
    ctx.fillRect(0, 0, w, h);

    const { embedding, labels } = result;
    if (embedding.length === 0) return;

    const xMin = Math.min(...embedding.map((p) => p[0]));
    const xMax = Math.max(...embedding.map((p) => p[0]));
    const yMin = Math.min(...embedding.map((p) => p[1]));
    const yMax = Math.max(...embedding.map((p) => p[1]));
    const scaleX = (w - pad * 2) / (xMax - xMin || 1);
    const scaleY = (h - pad * 2) / (yMax - yMin || 1);

    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

    for (let i = 0; i < embedding.length; i++) {
      const px = pad + (embedding[i][0] - xMin) * scaleX;
      const py = h - pad - (embedding[i][1] - yMin) * scaleY;
      ctx.fillStyle = colors[labels[i] % colors.length];
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PC1", w / 2, h - 5);
    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("PC2", 0, 0);
    ctx.restore();
  }, [result]);

  // Draw scree plot
  useEffect(() => {
    if (!result || !screeRef.current) return;
    const canvas = screeRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pad = 30;
    ctx.fillStyle = "var(--background, #fff)";
    ctx.fillRect(0, 0, w, h);

    const { all_variance } = result;
    const maxVar = Math.max(...all_variance);
    const barW = Math.min(30, (w - pad * 2) / all_variance.length - 4);

    for (let i = 0; i < all_variance.length; i++) {
      const x = pad + i * (barW + 4) + 2;
      const barH = (all_variance[i] / maxVar) * (h - pad * 2);
      const y = h - pad - barH;

      ctx.fillStyle = i < result.n_components ? "#3b82f6" : "#e2e8f0";
      ctx.fillRect(x, y, barW, barH);

      ctx.fillStyle = "#64748b";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${(all_variance[i] * 100).toFixed(0)}%`, x + barW / 2, y - 4);
    }

    ctx.fillStyle = "#64748b";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Component", w / 2, h - 5);
  }, [result]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">PCA Explorer</h3>
        <button onClick={runPCA} disabled={loading}
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
          {loading ? "Computing..." : "Run PCA"}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Components:</span>
        {[2, 3].map((n) => (
          <button key={n} onClick={() => setNComponents(n)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium ${nComponents === n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {n}
          </button>
        ))}
      </div>

      {result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground mb-1">PCA Projection</div>
              <canvas ref={canvasRef} width={250} height={200} className="w-full" />
            </div>
            <div className="border border-border rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground mb-1">Scree Plot (Variance per PC)</div>
              <canvas ref={screeRef} width={250} height={200} className="w-full" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-4 text-xs">
            <div className="px-2 py-1 rounded bg-muted">
              <span className="text-muted-foreground">Total Variance: </span>
              <span className="font-mono font-semibold">{(result.total_variance_explained * 100).toFixed(1)}%</span>
            </div>
            {result.variance_per_component.map((v, i) => (
              <div key={i} className="px-2 py-1 rounded bg-muted">
                <span className="text-muted-foreground">PC{i + 1}: </span>
                <span className="font-mono">{(v * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>

          {result.feature_contributions.length > 0 && (
            <div className="border border-border rounded-lg p-3 text-xs">
              <div className="text-muted-foreground mb-2">Feature Loadings (PC1):</div>
              <div className="space-y-1">
                {result.feature_contributions[0].contributions.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-16 md:w-24 truncate text-muted-foreground">{c.feature}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c.loading >= 0 ? "bg-blue-500" : "bg-red-500"}`}
                        style={{ width: `${c.abs_loading * 100}%` }} />
                    </div>
                    <span className="font-mono w-12 text-right">{c.loading.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
