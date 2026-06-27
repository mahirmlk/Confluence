"use client";

import React, { useState, useRef, useEffect } from "react";

interface InteractiveROCCurveProps {
  fpr: number[];
  tpr: number[];
  thresholds?: number[];
  onThresholdHover?: (index: number, threshold: number) => void;
}

export function InteractiveROCCurve({ fpr, tpr, thresholds, onThresholdHover }: InteractiveROCCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const auc = fpr.reduce((acc, f, i) => {
    if (i === 0) return 0;
    const dx = f - fpr[i - 1];
    const avgY = (tpr[i] + tpr[i - 1]) / 2;
    return acc + dx * avgY;
  }, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fpr.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pad = 40;
    const plotW = w - pad * 2;
    const plotH = h - pad * 2;

    ctx.fillStyle = "var(--background, #fff)";
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const x = pad + (i / 4) * plotW;
      const y = pad + (i / 4) * plotH;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, pad + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + plotW, y); ctx.stroke();
    }

    // Diagonal
    ctx.strokeStyle = "rgba(100,100,100,0.2)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pad, pad + plotH); ctx.lineTo(pad + plotW, pad); ctx.stroke();
    ctx.setLineDash([]);

    // ROC curve
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < fpr.length; i++) {
      const x = pad + fpr[i] * plotW;
      const y = pad + plotH - tpr[i] * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Hover point
    if (hoverIndex !== null && hoverIndex < fpr.length) {
      const hx = pad + fpr[hoverIndex] * plotW;
      const hy = pad + plotH - tpr[hoverIndex] * plotH;
      ctx.fillStyle = "#ef4444";
      ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI * 2); ctx.fill();

      // Vertical line
      ctx.strokeStyle = "rgba(239,68,68,0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(hx, pad); ctx.lineTo(hx, pad + plotH); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Axes labels
    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FPR (False Positive Rate)", pad + plotW / 2, h - 5);
    ctx.save();
    ctx.translate(12, pad + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("TPR (True Positive Rate)", 0, 0);
    ctx.restore();

    // AUC
    ctx.fillStyle = "#0f172a";
    ctx.font = "12px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`AUC = ${auc.toFixed(3)}`, w - pad, pad + 15);
  }, [fpr, tpr, hoverIndex, auc]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const pad = 40;
    const plotW = canvas.width - pad * 2;
    const ratio = (px - pad) / plotW;
    const idx = Math.round(ratio * (fpr.length - 1));
    if (idx >= 0 && idx < fpr.length) {
      setHoverIndex(idx);
      onThresholdHover?.(idx, thresholds?.[idx] ?? 0);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-foreground">ROC Curve</h3>
      <canvas
        ref={canvasRef}
        width={300}
        height={250}
        className="w-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      />
      {hoverIndex !== null && hoverIndex < fpr.length && (
        <div className="flex gap-4 text-xs justify-center">
          <span className="text-muted-foreground">Threshold: <span className="font-mono">{thresholds?.[hoverIndex]?.toFixed(3) ?? "N/A"}</span></span>
          <span className="text-muted-foreground">FPR: <span className="font-mono">{fpr[hoverIndex].toFixed(3)}</span></span>
          <span className="text-muted-foreground">TPR: <span className="font-mono">{tpr[hoverIndex].toFixed(3)}</span></span>
        </div>
      )}
    </div>
  );
}

interface InteractivePRCurveProps {
  precision: number[];
  recall: number[];
  thresholds?: number[];
}

export function InteractivePRCurve({ precision, recall, thresholds }: InteractivePRCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !precision.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pad = 40;
    const plotW = w - pad * 2;
    const plotH = h - pad * 2;

    ctx.fillStyle = "var(--background, #fff)";
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const x = pad + (i / 4) * plotW;
      const y = pad + (i / 4) * plotH;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, pad + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + plotW, y); ctx.stroke();
    }

    // PR curve
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < precision.length; i++) {
      const x = pad + recall[i] * plotW;
      const y = pad + plotH - precision[i] * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Hover
    if (hoverIndex !== null && hoverIndex < precision.length) {
      const hx = pad + recall[hoverIndex] * plotW;
      const hy = pad + plotH - precision[hoverIndex] * plotH;
      ctx.fillStyle = "#ef4444";
      ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI * 2); ctx.fill();
    }

    // Labels
    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Recall", pad + plotW / 2, h - 5);
    ctx.save();
    ctx.translate(12, pad + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Precision", 0, 0);
    ctx.restore();
  }, [precision, recall, hoverIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const pad = 40;
    const plotW = canvas.width - pad * 2;
    const ratio = (px - pad) / plotW;
    const idx = Math.round(ratio * (precision.length - 1));
    if (idx >= 0 && idx < precision.length) setHoverIndex(idx);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-foreground">Precision-Recall Curve</h3>
      <canvas
        ref={canvasRef}
        width={300}
        height={250}
        className="w-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      />
      {hoverIndex !== null && hoverIndex < precision.length && (
        <div className="flex gap-4 text-xs justify-center">
          <span className="text-muted-foreground">Threshold: <span className="font-mono">{thresholds?.[hoverIndex]?.toFixed(3) ?? "N/A"}</span></span>
          <span className="text-muted-foreground">Precision: <span className="font-mono">{precision[hoverIndex].toFixed(3)}</span></span>
          <span className="text-muted-foreground">Recall: <span className="font-mono">{recall[hoverIndex].toFixed(3)}</span></span>
        </div>
      )}
    </div>
  );
}
