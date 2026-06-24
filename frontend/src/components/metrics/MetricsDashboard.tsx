"use client";

import React from "react";

interface MetricCardProps {
  label: string;
  value: number;
  format?: "percent" | "decimal" | "number";
}

export function MetricCard({ label, value, format = "decimal" }: MetricCardProps) {
  const display = format === "percent"
    ? `${(value * 100).toFixed(1)}%`
    : format === "number"
    ? value.toFixed(4)
    : value.toFixed(4);

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-mono font-semibold text-foreground">{display}</div>
    </div>
  );
}

interface MetricsDashboardProps {
  metrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    log_loss: number;
    confusion_matrix: number[][];
    roc_curve: { fpr: number[]; tpr: number[] };
  };
}

export function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  if (!metrics) return null;

  const { confusion_matrix, roc_curve } = metrics;
  const auc = roc_curve.fpr && roc_curve.tpr
    ? roc_curve.fpr.reduce((acc, fpr, i) => {
        if (i === 0) return 0;
        const dx = fpr - roc_curve.fpr[i - 1];
        const avgY = (roc_curve.tpr[i] + roc_curve.tpr[i - 1]) / 2;
        return acc + dx * avgY;
      }, 0)
    : undefined;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Metrics</h2>
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Accuracy" value={metrics.accuracy} format="percent" />
        <MetricCard label="Precision" value={metrics.precision} format="percent" />
        <MetricCard label="Recall" value={metrics.recall} format="percent" />
        <MetricCard label="F1 Score" value={metrics.f1} format="percent" />
      </div>
      {confusion_matrix.length > 0 && (
        <div className="border border-border rounded-lg p-3">
          <h3 className="text-xs font-medium text-foreground mb-2">Confusion Matrix</h3>
          <div className="flex justify-center">
            <table className="text-xs font-mono">
              <thead>
                <tr>
                  <th className="px-2 py-1"></th>
                  {confusion_matrix[0].map((_, i) => (
                    <th key={i} className="px-2 py-1 text-muted-foreground">Pred {i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusion_matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 text-muted-foreground">True {i}</td>
                    {row.map((val, j) => (
                      <td
                        key={j}
                        className={`px-3 py-1 text-center font-bold ${
                          i === j ? "text-green-500" : "text-red-400"
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {roc_curve.fpr && roc_curve.tpr && (
        <div className="border border-border rounded-lg p-3">
          <h3 className="text-xs font-medium text-foreground mb-2">
            ROC Curve {auc !== undefined && `(AUC = ${auc.toFixed(3)})`}
          </h3>
          <svg viewBox="0 0 200 200" className="w-full max-w-[200px] mx-auto">
            <line x1="20" y1="180" x2="180" y2="180" stroke="var(--border)" strokeWidth="0.5" />
            <line x1="20" y1="180" x2="20" y2="20" stroke="var(--border)" strokeWidth="0.5" />
            <line x1="20" y1="180" x2="180" y2="20" stroke="gray" strokeWidth="0.5" strokeDasharray="4" />
            <polyline
              points={roc_curve.fpr.map((f, i) => {
                const x = 20 + f * 160;
                const y = 180 - roc_curve.tpr[i] * 160;
                return `${x},${y}`;
              }).join(" ")}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          </svg>
        </div>
      )}
      <div className="text-xs text-muted-foreground text-center">
        Log Loss: {metrics.log_loss.toFixed(4)}
      </div>
    </div>
  );
}
