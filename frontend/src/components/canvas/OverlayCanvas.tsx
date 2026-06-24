"use client";

import React, { useRef, useEffect } from "react";

interface OverlayCanvasProps {
  grid1: number[][];
  grid2: number[][];
  contourLines1?: number[][][];
  contourLines2?: number[][][];
  width: number;
  height: number;
}

export function OverlayCanvas({
  grid1,
  grid2,
  contourLines1 = [],
  contourLines2 = [],
  width,
  height,
}: OverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid1.length || !grid2.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rows = grid1.length;
    const cols = grid1[0].length;
    const imageData = ctx.createImageData(cols, rows);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v1 = Math.max(0, Math.min(1, grid1[y][x]));
        const v2 = Math.max(0, Math.min(1, grid2[y][x]));
        const diff = Math.abs(v1 - v2);
        const idx = (y * cols + x) * 4;

        const agree = diff < 0.1;
        if (agree) {
          const avg = (v1 + v2) / 2;
          const gray = Math.round(180 + 75 * (1 - avg));
          imageData.data[idx] = gray;
          imageData.data[idx + 1] = gray;
          imageData.data[idx + 2] = gray;
          imageData.data[idx + 3] = 150;
        } else {
          imageData.data[idx] = Math.round(59 + 196 * (1 - v1));
          imageData.data[idx + 1] = 40;
          imageData.data[idx + 2] = Math.round(59 + 196 * (1 - v2));
          imageData.data[idx + 3] = 220;
        }
      }
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = cols;
    offscreen.height = rows;
    offscreen.getContext("2d")!.putImageData(imageData, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offscreen, 0, 0, width, height);

    const drawContours = (contours: number[][][], color: string, dash: number[]) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash(dash);
      contours.forEach((contour) => {
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
      ctx.setLineDash([]);
    };

    drawContours(contourLines1, "rgba(59,130,246,0.8)", []);
    drawContours(contourLines2, "rgba(239,68,68,0.8)", [4, 4]);

  }, [grid1, grid2, contourLines1, contourLines2, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-border"
    />
  );
}
