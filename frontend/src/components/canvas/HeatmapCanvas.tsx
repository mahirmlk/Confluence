"use client";

import React, { useRef, useEffect, useCallback, forwardRef } from "react";

interface VizMetadata {
  original_features: number;
  displayed_dimensions: number;
  scaled: boolean;
  pca_applied: boolean;
  explained_variance_ratio: number[] | null;
  total_variance_explained: number | null;
  class_names?: string[];
}

interface HeatmapCanvasProps {
  grid: number[][];
  contourLines?: number[][][];
  points?: { X: number[][]; y: number[] };
  gridBounds?: { x_min: number; x_max: number; y_min: number; y_max: number };
  width: number;
  height: number;
  colormap?: (value: number) => [number, number, number];
  vizMetadata?: VizMetadata | null;
  classNames?: string[];
}

const CLASS_COLORS: [number, number, number][] = [
  [59, 130, 246],
  [239, 68, 68],
  [16, 185, 129],
  [245, 158, 11],
  [139, 92, 246],
  [236, 72, 153],
  [6, 182, 212],
];

const CLASS_COLOR_HEX = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

const defaultColormap = (value: number): [number, number, number] => {
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 0.01 && rounded >= 0 && rounded < CLASS_COLORS.length) {
    return CLASS_COLORS[rounded];
  }
  const clamped = Math.max(0, Math.min(1, value));
  const r = Math.round(59 + 196 * (1 - clamped));
  const g = Math.round(130 + 125 * (1 - clamped));
  const b = Math.round(246 - 100 * (1 - clamped));
  return [r, g, b];
};

export const regressionColormap = (value: number): [number, number, number] => {
  const clamped = Math.max(0, Math.min(1, value));
  const r = Math.round(68 + 187 * clamped);
  const g = Math.round(1 + 207 * (clamped < 0.5 ? clamped * 2 : 1));
  const b = Math.round(84 + 161 * (clamped < 0.5 ? 1 : (1 - clamped) * 2));
  return [r, g, b];
};

function gridToImageData(grid: number[][], colormap: (v: number) => [number, number, number]): ImageData {
  const rows = grid.length;
  const cols = grid[0].length;
  const imageData = new ImageData(cols, rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const [r, g, b] = colormap(grid[rows - 1 - y][x]);
      const idx = (y * cols + x) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 200;
    }
  }
  return imageData;
}

// Padding for axis labels
const PAD_LEFT = 60;
const PAD_BOTTOM = 40;
const PAD_TOP = 10;
const PAD_RIGHT = 10;

export const HeatmapCanvas = forwardRef<HTMLCanvasElement, HeatmapCanvasProps>(function HeatmapCanvas(
  {
    grid,
    contourLines = [],
    points,
    gridBounds,
    width,
    height,
    colormap = defaultColormap,
    vizMetadata,
    classNames,
  },
  ref
) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalRef;
  const prevGridRef = useRef<number[][] | null>(null);
  const animRef = useRef<number | null>(null);

  const plotW = width - PAD_LEFT - PAD_RIGHT;
  const plotH = height - PAD_TOP - PAD_BOTTOM;

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, g: number[][], alpha: number) => {
    if (!g.length) return;
    const rows = g.length;
    const cols = g[0].length;
    const imageData = gridToImageData(g, colormap);
    const offscreen = document.createElement("canvas");
    offscreen.width = cols;
    offscreen.height = rows;
    offscreen.getContext("2d")!.putImageData(imageData, 0, 0);
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offscreen, PAD_LEFT, PAD_TOP, plotW, plotH);
    ctx.globalAlpha = 1;
  }, [plotW, plotH, colormap]);

  const drawOverlays = useCallback((ctx: CanvasRenderingContext2D) => {
    // Draw decision boundary contour (thicker, with shadow)
    if (contourLines.length > 0) {
      const rows = grid.length;
      const cols = grid[0]?.length ?? 0;

      // Shadow pass
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 3.5;
      ctx.lineJoin = "round";
      contourLines.forEach((contour) => {
        if (contour.length < 2) return;
        ctx.beginPath();
        contour.forEach((point, i) => {
          const px = PAD_LEFT + (point[1] / (cols - 1)) * plotW;
          const py = PAD_TOP + ((rows - 1 - point[0]) / (rows - 1)) * plotH;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      });

      // Main line pass
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      contourLines.forEach((contour) => {
        if (contour.length < 2) return;
        ctx.beginPath();
        contour.forEach((point, i) => {
          const px = PAD_LEFT + (point[1] / (cols - 1)) * plotW;
          const py = PAD_TOP + ((rows - 1 - point[0]) / (rows - 1)) * plotH;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      });
    }

    // Draw data points (larger, with white outline)
    if (points && gridBounds) {
      const { X, y } = points;
      const { x_min, x_max, y_min, y_max } = gridBounds;
      const xRange = x_max - x_min;
      const yRange = y_max - y_min;

      X.forEach((point, i) => {
        const px = PAD_LEFT + ((point[0] - x_min) / xRange) * plotW;
        const py = PAD_TOP + plotH - ((point[1] - y_min) / yRange) * plotH;
        const color = CLASS_COLOR_HEX[y[i] % CLASS_COLOR_HEX.length];

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

    // Draw axis labels
    drawAxisLabels(ctx);

    // Draw legend
    drawLegend(ctx);
  }, [grid, contourLines, points, gridBounds, plotW, plotH, vizMetadata, classNames]);

  const drawAxisLabels = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();

    // X-axis label
    let xLabel = "Feature 1";
    if (vizMetadata?.pca_applied && vizMetadata.explained_variance_ratio) {
      const pct = (vizMetadata.explained_variance_ratio[0] * 100).toFixed(1);
      xLabel = `PC1 (${pct}%)`;
    }
    ctx.font = "11px monospace";
    ctx.fillStyle = "#6b7280";
    ctx.textAlign = "center";
    ctx.fillText(xLabel, PAD_LEFT + plotW / 2, height - 6);

    // Y-axis label
    let yLabel = "Feature 2";
    if (vizMetadata?.pca_applied && vizMetadata.explained_variance_ratio) {
      const pct = (vizMetadata.explained_variance_ratio[1] * 100).toFixed(1);
      yLabel = `PC2 (${pct}%)`;
    }
    ctx.save();
    ctx.translate(14, PAD_TOP + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    // Axis tick marks
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

    // Position legend inside plot area (top-right)
    const legendX = PAD_LEFT + plotW - 130;
    let legendY = PAD_TOP + 10;

    // Background
    const itemHeight = 16;
    const legendHeight = (contourLines.length > 0 ? uniqueLabels.length + 1 : uniqueLabels.length) * itemHeight + 22;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX - 6, legendY - 4, 124, legendHeight, 4);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#1f2937";
    ctx.textAlign = "left";
    ctx.fillText("Legend", legendX, legendY + 8);
    legendY += 22;

    // Class items
    ctx.font = "10px sans-serif";
    uniqueLabels.forEach((label) => {
      const color = CLASS_COLOR_HEX[label % CLASS_COLOR_HEX.length];
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

    // Decision boundary indicator
    if (contourLines.length > 0) {
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY - 3);
      ctx.lineTo(legendX + 12, legendY - 3);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY - 3);
      ctx.lineTo(legendX + 12, legendY - 3);
      ctx.stroke();

      ctx.fillStyle = "#1f2937";
      ctx.font = "10px sans-serif";
      ctx.fillText("Boundary", legendX + 16, legendY);
    }

    ctx.restore();
  }, [points, contourLines, plotW, classNames, vizMetadata]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prevGrid = prevGridRef.current;
    prevGridRef.current = grid;

    if (prevGrid && prevGrid.length === grid.length && prevGrid[0].length === grid[0].length) {
      const duration = 300;
      const startTime = performance.now();

      if (animRef.current) cancelAnimationFrame(animRef.current);

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3);

        ctx.clearRect(0, 0, width, height);
        drawGrid(ctx, prevGrid, 1 - eased);
        drawGrid(ctx, grid, eased);
        drawOverlays(ctx);

        if (t < 1) {
          animRef.current = requestAnimationFrame(animate);
        }
      };
      animRef.current = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, width, height);
      drawGrid(ctx, grid, 1);
      drawOverlays(ctx);
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [grid, drawGrid, drawOverlays, width, height, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-border max-w-full h-auto"
      style={{ imageRendering: "auto" }}
    />
  );
});
