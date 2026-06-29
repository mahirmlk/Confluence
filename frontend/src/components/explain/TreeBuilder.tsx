"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { TreeVisualization } from "./TreeVisualization";
import { WS_URL } from "@/lib/config";

interface TreeStep {
  type: string;
  depth: number;
  max_depth: number;
  tree: Record<string, unknown>;
  grid: number[][];
  grid_bounds: { x_min: number; x_max: number; y_min: number; y_max: number };
  metrics: { train_accuracy: number; n_leaves: number; n_nodes: number };
}

interface TreeBuilderProps {
  datasetName: string;
  hyperparameters: Record<string, number>;
  noise: number;
  nSamples: number;
}

export function TreeBuilder({ datasetName, hyperparameters, noise, nSamples }: TreeBuilderProps) {
  const [steps, setSteps] = useState<TreeStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `${WS_URL}/ws/tree-build`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      ws.send(JSON.stringify({
        dataset_name: datasetName,
        hyperparameters,
        max_depth: 5,
        noise,
        n_samples: nSamples,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "step") {
        setSteps((prev) => [...prev, data]);
      } else if (data.type === "done") {
        setConnected(false);
      } else if (data.type === "error") {
        setError(data.message);
        setConnected(false);
      }
    };

    ws.onerror = () => {
      setError("Connection failed");
      setConnected(false);
    };

    ws.onclose = () => setConnected(false);
  }, [datasetName, hyperparameters, noise, nSamples]);

  const startBuild = () => {
    setSteps([]);
    setCurrentStep(0);
    connect();
  };

  const stepForward = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const stepBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const togglePlay = () => {
    if (playing) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      playTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            if (playTimerRef.current) clearInterval(playTimerRef.current);
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
  };

  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Draw grid on canvas
  useEffect(() => {
    if (!canvasRef.current || steps.length === 0) return;
    const step = steps[currentStep];
    if (!step) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const { grid } = step;
    const rows = grid.length;
    const cols = grid[0]?.length || 0;

    const imageData = ctx.createImageData(cols, rows);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const val = grid[i][j];
        const idx = (i * cols + j) * 4;
        if (val > 0.5) {
          imageData.data[idx] = 59;
          imageData.data[idx + 1] = 130;
          imageData.data[idx + 2] = 246;
          imageData.data[idx + 3] = Math.round((val - 0.5) * 200 + 55);
        } else {
          imageData.data[idx] = 239;
          imageData.data[idx + 1] = 68;
          imageData.data[idx + 2] = 68;
          imageData.data[idx + 3] = Math.round((0.5 - val) * 200 + 55);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    ctx.drawImage(canvas, 0, 0, cols, rows, 0, 0, w, h);
  }, [steps, currentStep]);

  const stepData = steps[currentStep];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Step-by-Step Tree Builder</h3>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={startBuild}
          disabled={connected}
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {connected ? "Building..." : "Build Tree"}
        </button>
        {steps.length > 0 && (
          <>
            <button onClick={stepBack} disabled={currentStep === 0} className="px-2 py-1 rounded border border-border text-xs disabled:opacity-50">◀</button>
            <button onClick={togglePlay} className="px-2 py-1 rounded border border-border text-xs">{playing ? "⏸" : "▶"}</button>
            <button onClick={stepForward} disabled={currentStep >= steps.length - 1} className="px-2 py-1 rounded border border-border text-xs disabled:opacity-50">▶</button>
            <span className="text-xs text-muted-foreground font-mono">
              Depth {stepData?.depth || 0}/{stepData?.max_depth || 0}
            </span>
          </>
        )}
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      {stepData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tree Diagram */}
          <div className="border border-border rounded-lg p-3">
            <div className="text-[10px] text-muted-foreground mb-2">Tree Structure</div>
            <TreeVisualization tree={stepData.tree as Record<string, unknown>} />
          </div>

          {/* Decision Boundary */}
          <div className="border border-border rounded-lg p-3">
            <div className="text-[10px] text-muted-foreground mb-2">Decision Boundary</div>
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              className="w-full aspect-square rounded"
            />
          </div>
        </div>
      )}

      {/* Metrics */}
      {stepData && (
        <div className="flex gap-4 text-xs">
          <div className="px-2 py-1 rounded bg-muted">
            <span className="text-muted-foreground">Accuracy: </span>
            <span className="font-mono font-semibold">{(stepData.metrics.train_accuracy * 100).toFixed(1)}%</span>
          </div>
          <div className="px-2 py-1 rounded bg-muted">
            <span className="text-muted-foreground">Leaves: </span>
            <span className="font-mono font-semibold">{stepData.metrics.n_leaves}</span>
          </div>
          <div className="px-2 py-1 rounded bg-muted">
            <span className="text-muted-foreground">Nodes: </span>
            <span className="font-mono font-semibold">{stepData.metrics.n_nodes}</span>
          </div>
        </div>
      )}
    </div>
  );
}
