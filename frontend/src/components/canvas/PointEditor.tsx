"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";

interface Point {
  x: number;
  y: number;
  label: number;
}

interface PointEditorProps {
  width: number;
  height: number;
  nClasses: number;
  points: Point[];
  onPointsChange: (points: Point[]) => void;
  gridBounds?: { x_min: number; x_max: number; y_min: number; y_max: number };
}

const CLASS_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

export function PointEditor({
  width,
  height,
  nClasses,
  points,
  onPointsChange,
  gridBounds = { x_min: -5, x_max: 5, y_min: -5, y_max: 5 },
}: PointEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeClass, setActiveClass] = useState(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "rgba(0,0,0,0.02)";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(128,128,128,0.15)";
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const { x_min, x_max, y_min, y_max } = gridBounds;
    const xRange = x_max - x_min;
    const yRange = y_max - y_min;

    points.forEach((pt) => {
      const px = ((pt.x - x_min) / xRange) * width;
      const py = height - ((pt.y - y_min) / yRange) * height;
      const color = CLASS_COLORS[pt.label % CLASS_COLORS.length];

      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [width, height, points, gridBounds]);

  useEffect(() => { draw(); }, [draw]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const { x_min, x_max, y_min, y_max } = gridBounds;
    const xRange = x_max - x_min;
    const yRange = y_max - y_min;

    const dataX = (px / width) * xRange + x_min;
    const dataY = ((height - py) / height) * yRange + y_min;

    if (e.button === 2) {
      e.preventDefault();
      const threshold = Math.max(xRange, yRange) * 0.03;
      const closest = points.reduce<{ idx: number; dist: number } | null>((best, pt, idx) => {
        const dist = Math.hypot(pt.x - dataX, pt.y - dataY);
        if (dist < threshold && (!best || dist < best.dist)) return { idx, dist };
        return best;
      }, null);
      if (closest) onPointsChange(points.filter((_, i) => i !== closest.idx));
    } else {
      onPointsChange([...points, { x: dataX, y: dataY, label: activeClass }]);
    }
  }, [points, activeClass, gridBounds, width, height, onPointsChange]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const { x_min, x_max, y_min, y_max } = gridBounds;
    const xRange = x_max - x_min;
    const yRange = y_max - y_min;
    const dataX = (px / width) * xRange + x_min;
    const dataY = ((height - py) / height) * yRange + y_min;

    const threshold = Math.max(xRange, yRange) * 0.03;
    const closest = points.reduce<{ idx: number; dist: number } | null>((best, pt, idx) => {
      const dist = Math.hypot(pt.x - dataX, pt.y - dataY);
      if (dist < threshold && (!best || dist < best.dist)) return { idx, dist };
      return best;
    }, null);
    if (closest) onPointsChange(points.filter((_, i) => i !== closest.idx));
  }, [points, gridBounds, width, height, onPointsChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-foreground">Class:</span>
        <div className="flex gap-1">
          {Array.from({ length: nClasses }, (_, i) => (
            <button
              key={i}
              onClick={() => setActiveClass(i)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                activeClass === i ? "border-foreground scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: CLASS_COLORS[i % CLASS_COLORS.length] }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {points.length} points
        </span>
        {points.length > 0 && (
          <button
            onClick={() => onPointsChange([])}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Clear
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg border border-border cursor-crosshair"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
      <div className="text-[10px] text-muted-foreground text-center">
        Left-click to add points, right-click to remove
      </div>
    </div>
  );
}
