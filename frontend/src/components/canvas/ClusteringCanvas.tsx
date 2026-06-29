"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface VizMetadata {
  original_features: number;
  displayed_dimensions: number;
  scaled: boolean;
  pca_applied: boolean;
  explained_variance_ratio: number[] | null;
  total_variance_explained: number | null;
  class_names?: string[];
}

interface ClusteringCanvasProps {
  labelGrid: number[][];
  points?: { X: number[][]; y: number[] };
  gridBounds?: { x_min: number; x_max: number; y_min: number; y_max: number };
  width: number;
  height: number;
  vizMetadata?: VizMetadata | null;
}

const CLUSTER_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#a855f7",
];

const PAD_LEFT = 60;
const PAD_BOTTOM = 40;
const PAD_TOP = 10;
const PAD_RIGHT = 10;

export function ClusteringCanvas({
  labelGrid,
  points,
  gridBounds,
  width,
  height,
  vizMetadata,
}: ClusteringCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plotW = width - PAD_LEFT - PAD_RIGHT;
  const plotH = height - PAD_TOP - PAD_BOTTOM;

  const drawAxisLabels = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();

    let xLabel = "Feature 1";
    if (vizMetadata?.pca_applied && vizMetadata.explained_variance_ratio) {
      xLabel = `PC1 (${(vizMetadata.explained_variance_ratio[0] * 100).toFixed(1)}%)`;
    }
    ctx.font = "11px monospace";
    ctx.fillStyle = "#6b7280";
    ctx.textAlign = "center";
    ctx.fillText(xLabel, PAD_LEFT + plotW / 2, height - 6);

    let yLabel = "Feature 2";
    if (vizMetadata?.pca_applied && vizMetadata.explained_variance_ratio) {
      yLabel = `PC2 (${(vizMetadata.explained_variance_ratio[1] * 100).toFixed(1)}%)`;
    }
    ctx.save();
    ctx.translate(14, PAD_TOP + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD_LEFT, PAD_TOP);
    ctx.lineTo(PAD_LEFT, PAD_TOP + plotH);
    ctx.lineTo(PAD_LEFT + plotW, PAD_TOP + plotH);
    ctx.stroke();

    ctx.restore();
  }, [vizMetadata, plotW, plotH, height]);

  const drawLegend = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!points) return;
    const uniqueLabels = [...new Set(points.y)].sort((a, b) => a - b);
    if (uniqueLabels.length === 0) return;

    const classNamesList = vizMetadata?.class_names ?? [];

    ctx.save();

    const legendX = PAD_LEFT + plotW - 130;
    let legendY = PAD_TOP + 10;

    // Background
    const itemHeight = 16;
    const legendHeight = uniqueLabels.length * itemHeight + 22;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX - 6, legendY - 4, 124, legendHeight, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#1f2937";
    ctx.textAlign = "left";
    ctx.fillText("Clusters", legendX, legendY + 8);
    legendY += 22;

    ctx.font = "10px sans-serif";
    uniqueLabels.forEach((label) => {
      const color = CLUSTER_COLORS[label % CLUSTER_COLORS.length];
      const name = classNamesList[label] ?? `Cluster ${label}`;

      ctx.beginPath();
      ctx.arc(legendX + 6, legendY - 3, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#1f2937";
      ctx.fillText(name, legendX + 16, legendY);
      legendY += itemHeight;
    });

    ctx.restore();
  }, [points, plotW, vizMetadata]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !labelGrid.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(PAD_LEFT, PAD_TOP, plotW, plotH);

    const rows = labelGrid.length;
    const cols = labelGrid[0].length;

    const imageData = ctx.createImageData(cols, rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const label = labelGrid[rows - 1 - y][x];
        const idx = (y * cols + x) * 4;

        if (label < 0) {
          imageData.data[idx] = 249;
          imageData.data[idx + 1] = 250;
          imageData.data[idx + 2] = 251;
          imageData.data[idx + 3] = 200;
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
    ctx.drawImage(offscreen, PAD_LEFT, PAD_TOP, plotW, plotH);

    // Draw points
    if (points && gridBounds) {
      const { X, y } = points;
      const { x_min, x_max, y_min, y_max } = gridBounds;
      const xRange = x_max - x_min;
      const yRange = y_max - y_min;

      X.forEach((point, i) => {
        const px = PAD_LEFT + ((point[0] - x_min) / xRange) * plotW;
        const py = PAD_TOP + plotH - ((point[1] - y_min) / yRange) * plotH;
        const color = CLUSTER_COLORS[y[i] % CLUSTER_COLORS.length] || "#888";

        // White outline
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();

        // Point fill
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    }

    drawAxisLabels(ctx);
    drawLegend(ctx);
  }, [labelGrid, points, gridBounds, width, height, plotW, plotH, drawAxisLabels, drawLegend]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-border max-w-full h-auto"
    />
  );
}
