"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { generateDatasetV2 } from "@/lib/api/client";

interface DataGeneratorStudioProps {
  onDatasetReady: (X: number[][], y: number[], name: string) => void;
}

const GENERATORS = [
  { name: "spiral", label: "Spiral", description: "Interleaving spiral arms" },
  { name: "xor", label: "XOR", description: "XOR pattern distribution" },
  { name: "gaussian", label: "Gaussian", description: "Gaussian blob clusters" },
  { name: "moons", label: "Moons", description: "Interleaving half circles" },
  { name: "circles", label: "Circles", description: "Concentric circles" },
  { name: "linearly-separable", label: "Linear", description: "Linearly separable" },
  { name: "swiss-roll", label: "Swiss Roll", description: "Rolled manifold" },
];

export function DataGeneratorStudio({ onDatasetReady }: DataGeneratorStudioProps) {
  const [generator, setGenerator] = useState("spiral");
  const [nSamples, setNSamples] = useState(200);
  const [noise, setNoise] = useState(0.5);
  const [nClasses, setNClasses] = useState(2);
  const [preview, setPreview] = useState<{ X: number[][]; y: number[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchPreview = useCallback(async () => {
    setLoading(true);
    try {
      const data = await generateDatasetV2({
        generator,
        n_samples: nSamples,
        noise,
        n_classes: nClasses,
      });
      setPreview({ X: data.X, y: data.y });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [generator, nSamples, noise, nClasses]);

  useEffect(() => {
    const timer = setTimeout(fetchPreview, 300);
    return () => clearTimeout(timer);
  }, [fetchPreview]);

  useEffect(() => {
    if (!preview || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "var(--background)";
    ctx.fillRect(0, 0, w, h);

    const { X, y } = preview;
    if (X.length === 0) return;

    const xMin = Math.min(...X.map((p) => p[0]));
    const xMax = Math.max(...X.map((p) => p[0]));
    const yMin = Math.min(...X.map((p) => p[1]));
    const yMax = Math.max(...X.map((p) => p[1]));

    const pad = 20;
    const scaleX = (w - pad * 2) / (xMax - xMin || 1);
    const scaleY = (h - pad * 2) / (yMax - yMin || 1);

    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

    for (let i = 0; i < X.length; i++) {
      const px = pad + (X[i][0] - xMin) * scaleX;
      const py = h - pad - (X[i][1] - yMin) * scaleY;
      ctx.fillStyle = colors[y[i] % colors.length];
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [preview]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Data Generator Studio</h3>

      {/* Generator Selection */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Generator Type</label>
        <div className="grid grid-cols-2 gap-1">
          {GENERATORS.map((g) => (
            <button
              key={g.name}
              onClick={() => setGenerator(g.name)}
              className={`px-2 py-1.5 rounded text-[10px] font-medium transition-colors text-left ${
                generator === g.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parameters */}
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Classes</span>
            <span className="font-mono text-foreground">{nClasses}</span>
          </div>
          <div className="flex gap-1">
            {[2, 3, 4].map((c) => (
              <button
                key={c}
                onClick={() => setNClasses(c)}
                className={`flex-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                  nClasses === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Samples</span>
            <span className="font-mono text-foreground">{nSamples}</span>
          </div>
          <input
            type="range"
            min={50}
            max={1000}
            step={50}
            value={nSamples}
            onChange={(e) => setNSamples(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Noise</span>
            <span className="font-mono text-foreground">{noise.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={noise}
            onChange={(e) => setNoise(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={220}
          height={220}
          className="border border-border rounded"
        />
      </div>

      {loading && <div className="text-xs text-muted-foreground text-center animate-pulse">Generating...</div>}

      {/* Actions */}
      <button
        onClick={() => {
          if (preview) {
            onDatasetReady(preview.X, preview.y, `generated-${generator}`);
          }
        }}
        disabled={!preview || loading}
        className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        Use This Dataset
      </button>
    </div>
  );
}
