"use client";

import React, { useRef, useEffect } from "react";

interface ConfusionMatrixProps {
  matrix: number[][];
}

export function ConfusionMatrix({ matrix }: ConfusionMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !matrix.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const n = matrix.length;
    const cellSize = 60;
    const padding = 50;
    const totalSize = n * cellSize + padding * 2;

    canvas.width = totalSize;
    canvas.height = totalSize;

    ctx.fillStyle = "var(--background)";
    ctx.fillRect(0, 0, totalSize, totalSize);

    const maxVal = Math.max(...matrix.flat());

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = padding + j * cellSize;
        const y = padding + i * cellSize;
        const val = matrix[i][j];
        const intensity = maxVal > 0 ? val / maxVal : 0;

        ctx.fillStyle = i === j
          ? `rgba(34, 197, 94, ${0.15 + intensity * 0.7})`
          : `rgba(239, 68, 68, ${0.1 + intensity * 0.6})`;
        ctx.fillRect(x, y, cellSize, cellSize);

        ctx.strokeStyle = "var(--border)";
        ctx.strokeRect(x, y, cellSize, cellSize);

        ctx.fillStyle = intensity > 0.5 ? "#fff" : "var(--foreground)";
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(val), x + cellSize / 2, y + cellSize / 2);
      }
    }

    ctx.fillStyle = "var(--muted-foreground)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    for (let i = 0; i < n; i++) {
      ctx.fillText(`Pred ${i}`, padding + i * cellSize + cellSize / 2, padding - 20);
      ctx.save();
      ctx.translate(padding - 20, padding + i * cellSize + cellSize / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`True ${i}`, 0, 0);
      ctx.restore();
    }
  }, [matrix]);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-medium text-foreground mb-2">Confusion Matrix</h3>
      <canvas ref={canvasRef} className="border border-border rounded" />
    </div>
  );
}
