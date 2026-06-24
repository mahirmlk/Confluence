"use client";

import React, { useRef, useEffect } from "react";

interface ROCCurveProps {
  fpr: number[];
  tpr: number[];
  auc?: number;
}

export function ROCCurve({ fpr, tpr, auc }: ROCCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fpr.length || !tpr.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 250;
    const height = 250;
    const padding = 40;
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = "var(--background)";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "var(--border)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + plotH);
    ctx.lineTo(padding + plotW, padding + plotH);
    ctx.stroke();

    ctx.strokeStyle = "rgba(100,100,100,0.3)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, padding + plotH);
    ctx.lineTo(padding + plotW, padding);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < fpr.length; i++) {
      const x = padding + fpr[i] * plotW;
      const y = padding + plotH - tpr[i] * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = "var(--muted-foreground)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FPR", padding + plotW / 2, height - 5);
    ctx.save();
    ctx.translate(12, padding + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("TPR", 0, 0);
    ctx.restore();

    if (auc !== undefined) {
      ctx.fillStyle = "var(--foreground)";
      ctx.font = "12px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`AUC: ${auc.toFixed(3)}`, width - 10, 20);
    }
  }, [fpr, tpr, auc]);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-medium text-foreground mb-2">ROC Curve</h3>
      <canvas ref={canvasRef} className="border border-border rounded" />
    </div>
  );
}
