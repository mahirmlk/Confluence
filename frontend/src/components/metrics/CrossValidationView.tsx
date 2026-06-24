"use client";

import React, { useRef, useEffect } from "react";

interface FoldResult {
  fold: number;
  accuracy: number;
  grid: number[][];
  contour_lines: number[][][];
  grid_bounds: { x_min: number; x_max: number; y_min: number; y_max: number };
}

interface CrossValidationViewProps {
  folds: FoldResult[];
  meanAccuracy: number;
  stdAccuracy: number;
}

function FoldCanvas({ grid, contourLines }: { grid: number[][]; contourLines: number[][][] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 120;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rows = grid.length;
    const cols = grid[0].length;
    const imageData = ctx.createImageData(cols, rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = Math.max(0, Math.min(1, grid[y][x]));
        const idx = (y * cols + x) * 4;
        imageData.data[idx] = Math.round(59 + 196 * (1 - v));
        imageData.data[idx + 1] = Math.round(130 + 125 * (1 - v));
        imageData.data[idx + 2] = Math.round(246 - 100 * (1 - v));
        imageData.data[idx + 3] = 200;
      }
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = cols;
    offscreen.height = rows;
    offscreen.getContext("2d")!.putImageData(imageData, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offscreen, 0, 0, size, size);

    if (contourLines.length > 0) {
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1;
      contourLines.forEach((contour) => {
        if (contour.length < 2) return;
        ctx.beginPath();
        contour.forEach((point, i) => {
          const px = (point[1] / (cols - 1)) * size;
          const py = (point[0] / (rows - 1)) * size;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      });
    }
  }, [grid, contourLines]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded border border-border" />;
}

export function CrossValidationView({ folds, meanAccuracy, stdAccuracy }: CrossValidationViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Cross-Validation</h2>
        <div className="text-xs font-mono text-muted-foreground">
          {meanAccuracy.toFixed(3)} ± {stdAccuracy.toFixed(3)}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {folds.map((fold) => (
          <div key={fold.fold} className="flex flex-col items-center gap-1">
            <FoldCanvas grid={fold.grid} contourLines={fold.contour_lines} />
            <span className="text-[10px] font-mono text-muted-foreground">
              Fold {fold.fold}: {(fold.accuracy * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
