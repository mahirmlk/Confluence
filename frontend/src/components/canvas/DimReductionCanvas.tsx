"use client";

import React, { useRef, useEffect } from "react";

interface DimReductionCanvasProps {
  embedding: number[][];
  points?: { X: number[][]; y: number[] };
  width: number;
  height: number;
  info?: Record<string, unknown>;
}

const CLASS_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export function DimReductionCanvas({
  embedding,
  points,
  width,
  height,
  info,
}: DimReductionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !embedding.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    const xs = embedding.map((p) => p[0]);
    const ys = embedding.map((p) => p[1]);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    ctx.fillStyle = "var(--background)";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "var(--border)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(padding, padding, plotW, plotH);

    embedding.forEach((point, i) => {
      const px = padding + ((point[0] - xMin) / xRange) * plotW;
      const py = padding + plotH - ((point[1] - yMin) / yRange) * plotH;
      const label = points?.y[i] ?? 0;
      const color = CLASS_COLORS[label % CLASS_COLORS.length];

      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    ctx.fillStyle = "var(--muted-foreground)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Component 1", width / 2, height - 8);
    ctx.save();
    ctx.translate(12, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Component 2", 0, 0);
    ctx.restore();

    if (info?.explained_variance) {
      const variance = info.explained_variance as number[];
      ctx.fillStyle = "var(--foreground)";
      ctx.font = "11px monospace";
      ctx.textAlign = "right";
      ctx.fillText(
        variance.map((v) => `${(v * 100).toFixed(1)}%`).join(", "),
        width - 10, 20
      );
    }
  }, [embedding, points, width, height, info]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-border"
    />
  );
}
