"use client";

import React from "react";

interface ClusteringMetricsDashboardProps {
  metrics: {
    silhouette?: number;
    davies_bouldin?: number;
    calinski_harabasz?: number;
    inertia?: number;
  };
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-mono font-semibold text-foreground">{value.toFixed(4)}</div>
    </div>
  );
}

export function ClusteringMetricsDashboard({ metrics }: ClusteringMetricsDashboardProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Clustering Metrics</h2>
      <div className="grid grid-cols-2 gap-2">
        {metrics.silhouette !== undefined && <MetricCard label="Silhouette" value={metrics.silhouette} />}
        {metrics.davies_bouldin !== undefined && <MetricCard label="Davies-Bouldin" value={metrics.davies_bouldin} />}
        {metrics.calinski_harabasz !== undefined && <MetricCard label="Calinski-Harabasz" value={metrics.calinski_harabasz} />}
        {metrics.inertia !== undefined && <MetricCard label="Inertia" value={metrics.inertia} />}
      </div>
    </div>
  );
}

interface ElbowPlotProps {
  kValues: number[];
  inertias: number[];
  silhouettes: number[];
}

export function ElbowPlot({ kValues, inertias, silhouettes }: ElbowPlotProps) {
  const size = 240;
  const padding = 40;
  const plotW = size - padding * 2;
  const plotH = size - padding * 2;

  const iMin = Math.min(...inertias);
  const iMax = Math.max(...inertias);
  const iRange = iMax - iMin || 1;

  const sMin = Math.min(...silhouettes);
  const sMax = Math.max(...silhouettes);
  const sRange = sMax - sMin || 1;

  const xStep = plotW / (kValues.length - 1 || 1);

  const inertiaPoints = inertias.map((v, i) => ({
    x: padding + i * xStep,
    y: padding + plotH - ((v - iMin) / iRange) * plotH,
  }));

  const silhouettePoints = silhouettes.map((v, i) => ({
    x: padding + i * xStep,
    y: padding + plotH - ((v - sMin) / sRange) * plotH,
  }));

  const inertiaPath = inertiaPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const silhouettePath = silhouettePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-foreground">Elbow Analysis</h3>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px] mx-auto">
        <line x1={padding} y1={padding + plotH} x2={padding + plotW} y2={padding + plotH} stroke="var(--border)" strokeWidth="0.5" />
        <line x1={padding} y1={padding} x2={padding} y2={padding + plotH} stroke="var(--border)" strokeWidth="0.5" />

        <path d={inertiaPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
        {inertiaPoints.map((p, i) => (
          <circle key={`i-${i}`} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
        ))}

        <path d={silhouettePath} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
        {silhouettePoints.map((p, i) => (
          <circle key={`s-${i}`} cx={p.x} cy={p.y} r="3" fill="#10b981" />
        ))}

        {kValues.map((k, i) => (
          <text key={k} x={padding + i * xStep} y={size - 5} textAnchor="middle" fontSize="8" fill="var(--muted-foreground)">{k}</text>
        ))}

        <text x={size / 2} y={size - 0} textAnchor="middle" fontSize="8" fill="var(--muted-foreground)">k</text>
      </svg>
      <div className="flex justify-center gap-4 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-[#3b82f6] inline-block" /> Inertia
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-[#10b981] inline-block border-dashed" style={{ borderTop: "1px dashed #10b981", height: 0 }} /> Silhouette
        </span>
      </div>
    </div>
  );
}
