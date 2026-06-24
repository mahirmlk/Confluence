"use client";

import React from "react";

interface MetricCardProps {
  label: string;
  value: number;
  format?: "percent" | "decimal" | "number";
}

function MetricCard({ label, value, format = "decimal" }: MetricCardProps) {
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

interface RegressionMetricsDashboardProps {
  metrics: {
    r2: number;
    mse: number;
    rmse: number;
    mae: number;
    residuals: number[];
    predicted: number[];
    actual: number[];
  };
}

export function RegressionMetricsDashboard({ metrics }: RegressionMetricsDashboardProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Regression Metrics</h2>
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="R²" value={metrics.r2} format="decimal" />
        <MetricCard label="MSE" value={metrics.mse} format="number" />
        <MetricCard label="RMSE" value={metrics.rmse} format="number" />
        <MetricCard label="MAE" value={metrics.mae} format="number" />
      </div>

      {metrics.predicted.length > 0 && (
        <div className="border border-border rounded-lg p-3">
          <h3 className="text-xs font-medium text-foreground mb-2">Predicted vs Actual</h3>
          <PredictedVsActualPlot predicted={metrics.predicted} actual={metrics.actual} />
        </div>
      )}

      {metrics.residuals.length > 0 && (
        <div className="border border-border rounded-lg p-3">
          <h3 className="text-xs font-medium text-foreground mb-2">Residual Plot</h3>
          <ResidualPlot predicted={metrics.predicted} residuals={metrics.residuals} />
        </div>
      )}
    </div>
  );
}

function PredictedVsActualPlot({ predicted, actual }: { predicted: number[]; actual: number[] }) {
  const size = 200;
  const padding = 30;
  const plotSize = size - padding * 2;

  const allVals = [...predicted, ...actual];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;

  const points = predicted.map((p, i) => ({
    x: padding + ((p - min) / range) * plotSize,
    y: padding + plotSize - ((actual[i] - min) / range) * plotSize,
  }));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[200px] mx-auto">
      <line x1={padding} y1={padding + plotSize} x2={padding + plotSize} y2={padding} stroke="var(--border)" strokeWidth="0.5" />
      <line x1={padding} y1={padding + plotSize} x2={padding + plotSize} y2={padding + plotSize} stroke="var(--border)" strokeWidth="0.5" />
      <line x1={padding} y1={padding} x2={padding} y2={padding + plotSize} stroke="var(--border)" strokeWidth="0.5" />
      {points.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r="2" fill="#3b82f6" opacity="0.6" />
      ))}
      <line
        x1={padding} y1={padding + plotSize} x2={padding + plotSize} y2={padding}
        stroke="#ef4444" strokeWidth="1" strokeDasharray="4"
      />
      <text x={size / 2} y={size - 2} textAnchor="middle" fontSize="8" fill="var(--muted-foreground)">Predicted</text>
      <text x={4} y={size / 2} textAnchor="middle" fontSize="8" fill="var(--muted-foreground)" transform={`rotate(-90, 4, ${size / 2})`}>Actual</text>
    </svg>
  );
}

function ResidualPlot({ predicted, residuals }: { predicted: number[]; residuals: number[] }) {
  const size = 200;
  const padding = 30;
  const plotSize = size - padding * 2;

  const xMin = Math.min(...predicted);
  const xMax = Math.max(...predicted);
  const xRange = xMax - xMin || 1;
  const rMin = Math.min(...residuals);
  const rMax = Math.max(...residuals);
  const rRange = Math.max(Math.abs(rMin), Math.abs(rMax)) || 1;

  const points = predicted.map((p, i) => ({
    x: padding + ((p - xMin) / xRange) * plotSize,
    y: padding + plotSize / 2 - (residuals[i] / rRange) * (plotSize / 2),
  }));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[200px] mx-auto">
      <line x1={padding} y1={padding + plotSize / 2} x2={padding + plotSize} y2={padding + plotSize / 2} stroke="var(--border)" strokeWidth="0.5" />
      <line x1={padding} y1={padding} x2={padding} y2={padding + plotSize} stroke="var(--border)" strokeWidth="0.5" />
      {points.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r="2" fill="#8b5cf6" opacity="0.6" />
      ))}
      <text x={size / 2} y={size - 2} textAnchor="middle" fontSize="8" fill="var(--muted-foreground)">Predicted</text>
      <text x={4} y={size / 2} textAnchor="middle" fontSize="8" fill="var(--muted-foreground)" transform={`rotate(-90, 4, ${size / 2})`}>Residual</text>
    </svg>
  );
}
