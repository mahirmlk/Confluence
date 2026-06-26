"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";

interface ScrubberTimelineProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onStepChange: (step: number) => void;
  onPlayPause: () => void;
}

export function ScrubberTimeline({
  currentStep,
  totalSteps,
  isPlaying,
  onStepChange,
  onPlayPause,
}: ScrubberTimelineProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      <button
        onClick={onPlayPause}
        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
      >
        {isPlaying ? "||" : ">"}
      </button>
      <div className="flex-1">
        <input
          type="range"
          min={1}
          max={totalSteps}
          value={currentStep}
          onChange={(e) => onStepChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-16 text-right">
        {currentStep}/{totalSteps}
      </span>
    </div>
  );
}

interface StreamingVizProps {
  algorithm: string;
  datasetName: string;
  hyperparameters: Record<string, number>;
  resolution: number;
  noise?: number;
  nSamples?: number;
  width?: number;
  height?: number;
}

export function StreamingViz({
  algorithm,
  datasetName,
  hyperparameters,
  resolution,
  noise = 0.5,
  nSamples = 300,
  width = 600,
  height = 600,
}: StreamingVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<number[][][]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [connected, setConnected] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const drawGrid = useCallback((grid: number[][]) => {
    const canvas = canvasRef.current;
    if (!canvas || !grid.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rows = grid.length;
    const cols = grid[0].length;
    const imageData = ctx.createImageData(cols, rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = Math.max(0, Math.min(1, grid[rows - 1 - y][x]));
        const idx = (y * cols + x) * 4;
        imageData.data[idx] = Math.round(59 + 196 * (1 - v));
        imageData.data[idx + 1] = Math.round(130 + 125 * (1 - v));
        imageData.data[idx + 2] = Math.round(246 - 100 * (1 - v));
        imageData.data[idx + 3] = 220;
      }
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = cols;
    offscreen.height = rows;
    const offCtx = offscreen.getContext("2d")!;
    offCtx.putImageData(imageData, 0, 0);

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offscreen, 0, 0, width, height);
  }, [width, height]);

  const startStream = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    setStreamError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsBase = API_URL.replace(/^http/, "ws");
    const wsUrl = `${wsBase}/ws/stream`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      framesRef.current = [];
      setCurrentStep(0);
      ws.send(JSON.stringify({
        algorithm,
        hyperparameters,
        dataset_name: datasetName,
        resolution,
        noise,
        n_samples: nSamples,
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "frame") {
        framesRef.current.push(msg.grid);
        setTotalSteps(msg.total_steps);
        setCurrentStep(msg.step);
        drawGrid(msg.grid);
      } else if (msg.type === "done") {
        setConnected(false);
        setIsPlaying(false);
      } else if (msg.type === "error") {
        setStreamError(msg.message);
        setConnected(false);
      }
    };

    ws.onclose = () => setConnected(false);
  }, [algorithm, hyperparameters, datasetName, resolution, noise, nSamples, drawGrid]);

  useEffect(() => {
    if (isPlaying && framesRef.current.length > 0) {
      let frameIdx = 0;
      const play = () => {
        if (frameIdx < framesRef.current.length) {
          drawGrid(framesRef.current[frameIdx]);
          setCurrentStep(frameIdx + 1);
          frameIdx++;
          animFrameRef.current = requestAnimationFrame(() => setTimeout(play, 80));
        } else {
          setIsPlaying(false);
        }
      };
      play();
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, drawGrid]);

  useEffect(() => {
    return () => { wsRef.current?.close(); };
  }, []);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    if (framesRef.current[step - 1]) {
      drawGrid(framesRef.current[step - 1]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={startStream}
          disabled={connected}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {connected ? "Streaming..." : "Start Training Animation"}
        </button>
        <span className="text-xs text-muted-foreground">
          {connected ? `Frame ${currentStep}/${totalSteps}` : "Ready"}
        </span>
      </div>
      {streamError && (
        <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
          {streamError}
        </div>
      )}
      <div className="text-[10px] text-muted-foreground">
        Supported: AdaBoost, Gradient Boosting, Random Forest, SGD, Decision Tree, MLP
      </div>
      <canvas ref={canvasRef} width={width} height={height} className="rounded-lg border border-border" />
      {totalSteps > 0 && (
        <ScrubberTimeline
          currentStep={currentStep}
          totalSteps={totalSteps}
          isPlaying={isPlaying}
          onStepChange={handleStepChange}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        />
      )}
    </div>
  );
}
