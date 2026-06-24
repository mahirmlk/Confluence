"use client";

import React, { useRef, useEffect } from "react";

interface ClusteringCanvasProps {
  labelGrid: number[][];
  points?: { X: number[][]; y: number[] };
  gridBounds?: { x_min: number; x_max: number; y_min: number; y_max: number };
  width: number;
  height: number;
}

const CLUSTER_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#a855f7",
];

export function ClusteringCanvas({
  labelGrid,
  points,
  gridBounds,
  width,
  height,
}: ClusteringCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !labelGrid.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const rows = labelGrid.length;
    const cols = labelGrid[0].length;

    const imageData = ctx.createImageData(cols, rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const label = labelGrid[y][x];
        const idx = (y * cols + x) * 4;

        if (label < 0) {
          imageData.data[idx] = 40;
          imageData.data[idx + 1] = 40;
          imageData.data[idx + 2] = 40;
          imageData.data[idx + 3] = 150;
        } else {
          const color = CLUSTER_COLORS[label % CLUSTER_COLORS.length];
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          imageData.data[idx] = r;
          imageData.data[idx + 1] = g;
          imageData.data[idx + 2] = b;
          imageData.data[idx + 3] = 180;
        }
      }
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = cols;
    offscreen.height = rows;
    const offCtx = offscreen.getContext("2d")!;
    offCtx.putImageData(imageData, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offscreen, 0, 0, width, height);

    if (points && gridBounds) {
      const { X, y } = points;
      const { x_min, x_max, y_min, y_max } = gridBounds;
      const xRange = x_max - x_min;
      const yRange = y_max - y_min;

      X.forEach((point, i) => {
        const px = ((point[0] - x_min) / xRange) * width;
        const py = height - ((point[1] - y_min) / yRange) * height;
        const color = CLUSTER_COLORS[y[i] % CLUSTER_COLORS.length] || "#888";

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
    }
  }, [labelGrid, points, gridBounds, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-border"
    />
  );
}
