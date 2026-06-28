"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { API_URL } from "@/lib/config";

interface RecommendPanelProps {
  onAlgorithmSelect: (name: string) => void;
}

interface Recommendation {
  name: string;
  label: string;
  confidence: number;
  reason: string;
}

const DEFAULT_RECOMMENDATIONS: Recommendation[] = [
  { name: "random-forest", label: "Random Forest", confidence: 0.9, reason: "Strong general-purpose algorithm for most datasets" },
  { name: "gradient-boosting", label: "Gradient Boosting", confidence: 0.85, reason: "Excellent on structured/tabular data" },
  { name: "logistic-regression", label: "Logistic Regression", confidence: 0.8, reason: "Fast, interpretable baseline" },
];

export function RecommendPanel({ onAlgorithmSelect }: RecommendPanelProps) {
  const { datasetName, noise, nSamples } = useAppStore();
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>(DEFAULT_RECOMMENDATIONS);
  const [loading, setLoading] = React.useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/datasets/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset_name: datasetName, n_samples: nSamples, noise }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations);
      }
    } catch { /* use defaults */ }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-foreground">Recommended</h3>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          {loading ? "Analyzing..." : "Refresh"}
        </button>
      </div>
      <div className="space-y-2">
        {recommendations.map((rec) => (
          <button
            key={rec.name}
            onClick={() => onAlgorithmSelect(rec.name)}
            className="w-full text-left rounded-lg border border-border bg-card p-2.5 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground">{rec.label}</span>
              <span className="text-[10px] font-mono text-primary">{(rec.confidence * 100).toFixed(0)}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{rec.reason}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
