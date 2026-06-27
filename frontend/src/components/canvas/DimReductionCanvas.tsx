"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface DimReductionCanvasProps {
  embedding: number[][];
  points?: { X: number[][]; y: number[] };
  width: number;
  height: number;
  info?: Record<string, unknown> & { class_names?: string[] };
}

const CLASS_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

const PAD_LEFT = 60;
const PAD_BOTTOM = 40;
const PAD_TOP = 10;
const PAD_RIGHT = 10;

export function DimReductionCanvas({
  embedding,
  points,
  width,
  height,
  info,
}: DimReductionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plotW = width - PAD_LEFT - PAD_RIGHT;
  const plotH = height - PAD_TOP - PAD_BOTTOM;

  const drawLegend = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!points) return;
    const uniqueLabels = [...new Set(points.y)].sort((a, b) => a - b);
    if (uniqueLabels.length === 0) return;

    const classNamesList = (info?.class_names as string[]) ?? [];

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
    ctx.fillText("Classes", legendX, legendY + 8);
    legendY += 22;

    ctx.font = "10px sans-serif";
    uniqueLabels.forEach((label) => {
      const color = CLASS_COLORS[label % CLASS_COLORS.length];
      const name = classNamesList[label] ?? `Class ${label}`;

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
  }, [points, plotW, info]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !embedding.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(PAD_LEFT, PAD_TOP, plotW, plotH);

    const xs = embedding.map((p) => p[0]);
    const ys = embedding.map((p) => p[1]);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    // Axis lines
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD_LEFT, PAD_TOP);
    ctx.lineTo(PAD_LEFT, PAD_TOP + plotH);
    ctx.lineTo(PAD_LEFT + plotW, PAD_TOP + plotH);
    ctx.stroke();

    // Points with improved visibility
    embedding.forEach((point, i) => {
      const px = PAD_LEFT + ((point[0] - xMin) / xRange) * plotW;
      const py = PAD_TOP + plotH - ((point[1] - yMin) / yRange) * plotH;
      const label = points?.y[i] ?? 0;
      const color = CLASS_COLORS[label % CLASS_COLORS.length];

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

    // Axis labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Component 1", PAD_LEFT + plotW / 2, height - 6);

    ctx.save();
    ctx.translate(14, PAD_TOP + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Component 2", 0, 0);
    ctx.restore();

    // Variance info
    if (info?.explained_variance) {
      const variance = info.explained_variance as number[];
      ctx.fillStyle = "#374151";
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.fillText(
        `Var: ${variance.map((v) => `${(v * 100).toFixed(1)}%`).join(", ")}`,
        PAD_LEFT + 4, PAD_TOP + 14
      );
    }

    drawLegend(ctx);
  }, [embedding, points, width, height, info, plotW, plotH, drawLegend]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-border"
    />
  );
}
