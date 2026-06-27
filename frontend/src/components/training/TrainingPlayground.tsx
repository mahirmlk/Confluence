"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface TrainingPlaygroundProps {
  algorithm: string;
  datasetName: string;
  hyperparameters: Record<string, number>;
  noise: number;
  nSamples: number;
}

interface Frame {
  type: string;
  grid?: number[][];
  grid_bounds?: { x_min: number; x_max: number; y_min: number; y_max: number };
  loss?: number;
  loss_history?: number[];
  train_accuracy?: number;
  weights?: Record<string, unknown>;
  epoch?: number;
  total_epochs?: number;
  depth?: number;
  max_depth?: number;
  k?: number;
  max_k?: number;
  n_trees?: number;
  total_trees?: number;
  n_leaves?: number;
  n_nodes?: number;
  accuracy_history?: number[];
}

export function TrainingPlayground({ algorithm, datasetName, hyperparameters, noise, nSamples }: TrainingPlaygroundProps) {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lossCanvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000") + "/ws/training-playground";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      ws.send(JSON.stringify({
        algorithm, dataset_name: datasetName, hyperparameters,
        resolution: 80, noise, n_samples: nSamples,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "frame") {
        setFrames((prev) => [...prev, data]);
      } else if (data.type === "done") {
        setConnected(false);
      } else if (data.type === "error") {
        setError(data.message);
        setConnected(false);
      }
    };

    ws.onerror = () => { setError("Connection failed"); setConnected(false); };
    ws.onclose = () => setConnected(false);
  }, [algorithm, datasetName, hyperparameters, noise, nSamples]);

  const startTraining = () => {
    setFrames([]);
    setCurrentFrame(0);
    connect();
  };

  const togglePlay = () => {
    if (playing) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      playTimerRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= frames.length - 1) {
            if (playTimerRef.current) clearInterval(playTimerRef.current);
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Draw grid
  useEffect(() => {
    const frame = frames[currentFrame];
    if (!frame?.grid || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grid = frame.grid;
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    canvas.width = cols;
    canvas.height = rows;

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
  }, [frames, currentFrame]);

  // Draw loss curve
  useEffect(() => {
    const frame = frames[currentFrame];
    const history = frame?.loss_history || frame?.accuracy_history;
    if (!history || history.length < 2 || !lossCanvasRef.current) return;
    const canvas = lossCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pad = 30;

    ctx.fillStyle = "var(--background, #fff)";
    ctx.fillRect(0, 0, w, h);

    const minVal = Math.min(...history);
    const maxVal = Math.max(...history);
    const range = maxVal - minVal || 1;

    // Grid lines
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad + (i / 4) * (h - pad * 2);
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(w - pad, y);
      ctx.stroke();
    }

    // Line
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const x = pad + (i / (history.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (history[i] - minVal) / range) * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current point
    const cx = pad + (currentFrame / (history.length - 1)) * (w - pad * 2);
    const cy = pad + (1 - (history[currentFrame] - minVal) / range) * (h - pad * 2);
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = "#64748b";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(maxVal.toFixed(3), pad - 4, pad + 4);
    ctx.fillText(minVal.toFixed(3), pad - 4, h - pad + 4);
  }, [frames, currentFrame]);

  const frame = frames[currentFrame];
  const progress = frame ? (
    frame.epoch ? `${frame.epoch}/${frame.total_epochs}` :
    frame.depth ? `${frame.depth}/${frame.max_depth}` :
    frame.k ? `k=${frame.k}/${frame.max_k}` :
    frame.n_trees ? `${frame.n_trees}/${frame.total_trees}` :
    `${currentFrame + 1}/${frames.length}`
  ) : "";

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Training Playground</h3>

      <div className="flex items-center gap-2">
        <button onClick={startTraining} disabled={connected}
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {connected ? "Training..." : "Start Training"}
        </button>
        {frames.length > 0 && (
          <>
            <button onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))} className="px-2 py-1 rounded border border-border text-xs">◀</button>
            <button onClick={togglePlay} className="px-2 py-1 rounded border border-border text-xs">{playing ? "⏸" : "▶"}</button>
            <button onClick={() => setCurrentFrame(Math.min(frames.length - 1, currentFrame + 1))} className="px-2 py-1 rounded border border-border text-xs">▶</button>
            <input type="range" min={0} max={frames.length - 1} value={currentFrame}
              onChange={(e) => setCurrentFrame(Number(e.target.value))} className="flex-1" />
            <span className="text-xs font-mono text-muted-foreground">{progress}</span>
          </>
        )}
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      {frame && (
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-2">
            <div className="text-[10px] text-muted-foreground mb-1">Decision Boundary</div>
            <canvas ref={canvasRef} className="w-full aspect-square rounded" style={{ imageRendering: "pixelated" }} />
          </div>
          <div className="border border-border rounded-lg p-2">
            <div className="text-[10px] text-muted-foreground mb-1">{frame.loss_history ? "Loss Curve" : "Accuracy History"}</div>
            <canvas ref={lossCanvasRef} width={250} height={150} className="w-full" />
          </div>
        </div>
      )}

      {frame && (
        <div className="flex flex-wrap gap-3 text-xs">
          {frame.train_accuracy !== undefined && (
            <div className="px-2 py-1 rounded bg-muted">
              <span className="text-muted-foreground">Accuracy: </span>
              <span className="font-mono font-semibold">{(frame.train_accuracy * 100).toFixed(1)}%</span>
            </div>
          )}
          {frame.loss !== undefined && (
            <div className="px-2 py-1 rounded bg-muted">
              <span className="text-muted-foreground">Loss: </span>
              <span className="font-mono font-semibold">{frame.loss.toFixed(4)}</span>
            </div>
          )}
          {frame.n_leaves !== undefined && (
            <div className="px-2 py-1 rounded bg-muted">
              <span className="text-muted-foreground">Leaves: </span>
              <span className="font-mono font-semibold">{frame.n_leaves}</span>
            </div>
          )}
          {(() => {
            const coef = frame.weights?.coef;
            return Array.isArray(coef) ? (
              <div className="px-2 py-1 rounded bg-muted">
                <span className="text-muted-foreground">Weights: </span>
                <span className="font-mono">[{(coef as number[]).map((w: number) => w.toFixed(2)).join(", ")}]</span>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}
