"use client";

import React, { useRef, useEffect, useCallback, forwardRef } from "react";

interface HeatmapCanvasProps {
  grid: number[][];
  contourLines?: number[][][];
  points?: { X: number[][]; y: number[] };
  gridBounds?: { x_min: number; x_max: number; y_min: number; y_max: number };
  width: number;
  height: number;
  colormap?: (value: number) => [number, number, number];
}

const defaultColormap = (value: number): [number, number, number] => {
  const clamped = Math.max(0, Math.min(1, value));
  const r = Math.round(59 + 196 * (1 - clamped));
  const g = Math.round(130 + 125 * (1 - clamped));
  const b = Math.round(246 - 100 * (1 - clamped));
  return [r, g, b];
};

function gridToImageData(grid: number[][], colormap: (v: number) => [number, number, number]): ImageData {
  const rows = grid.length;
  const cols = grid[0].length;
  const imageData = new ImageData(cols, rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const [r, g, b] = colormap(grid[y][x]);
      const idx = (y * cols + x) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 200;
    }
  }
  return imageData;
}

export const HeatmapCanvas = forwardRef<HTMLCanvasElement, HeatmapCanvasProps>(function HeatmapCanvas(
  {
    grid,
    contourLines = [],
    points,
    gridBounds,
    width,
    height,
    colormap = defaultColormap,
  },
  ref
) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalRef;
  const prevGridRef = useRef<number[][] | null>(null);
  const animRef = useRef<number | null>(null);

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
    ctx.drawImage(offscreen, 0, 0, width, height);
    ctx.globalAlpha = 1;
  }, [width, height, colormap]);

  const drawOverlays = useCallback((ctx: CanvasRenderingContext2D) => {
    if (contourLines.length > 0) {
      const rows = grid.length;
      const cols = grid[0]?.length ?? 0;
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1.5;
      contourLines.forEach((contour) => {
        if (contour.length < 2) return;
        ctx.beginPath();
        contour.forEach((point, i) => {
          const px = (point[1] / (cols - 1)) * width;
          const py = (point[0] / (rows - 1)) * height;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      });
    }

    if (points && gridBounds) {
      const { X, y } = points;
      const { x_min, x_max, y_min, y_max } = gridBounds;
      const xRange = x_max - x_min;
      const yRange = y_max - y_min;
      const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

      X.forEach((point, i) => {
        const px = ((point[0] - x_min) / xRange) * width;
        const py = height - ((point[1] - y_min) / yRange) * height;
        const color = colors[y[i] % colors.length];
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
    }
  }, [grid, contourLines, points, gridBounds, width, height]);

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
  }, [grid, drawGrid, drawOverlays, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-border"
      style={{ imageRendering: "auto" }}
    />
  );
});
