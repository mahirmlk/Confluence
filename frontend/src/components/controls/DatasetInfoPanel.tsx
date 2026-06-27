"use client";

import React from "react";
import type { DatasetMetaV2 } from "@/lib/api/client";

interface DatasetInfoPanelProps {
  dataset: DatasetMetaV2;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function DatasetInfoPanel({ dataset }: DatasetInfoPanelProps) {
  return (
    <div className="space-y-3 text-xs">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-foreground">{dataset.display_name}</h3>
        <p className="text-muted-foreground mt-1 leading-relaxed">{dataset.story}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border border-border p-2">
          <div className="text-muted-foreground">Rows</div>
          <div className="font-mono font-semibold text-foreground">{dataset.n_rows.toLocaleString()}</div>
        </div>
        <div className="rounded border border-border p-2">
          <div className="text-muted-foreground">Features</div>
          <div className="font-mono font-semibold text-foreground">{dataset.n_features}</div>
        </div>
        {dataset.n_classes && (
          <div className="rounded border border-border p-2">
            <div className="text-muted-foreground">Classes</div>
            <div className="font-mono font-semibold text-foreground">{dataset.n_classes}</div>
          </div>
        )}
        <div className="rounded border border-border p-2">
          <div className="text-muted-foreground">Source</div>
          <div className="font-medium text-foreground capitalize">{dataset.source}</div>
        </div>
      </div>

      {/* Difficulty */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Difficulty:</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_COLORS[dataset.difficulty] || ""}`}>
          {dataset.difficulty}
        </span>
      </div>

      {/* Features */}
      <div>
        <div className="text-muted-foreground mb-1">Features:</div>
        <div className="flex flex-wrap gap-1">
          {dataset.feature_names.map((f, i) => (
            <span key={f} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">
              {f}
              <span className="ml-0.5 opacity-50">{dataset.feature_types[i]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Missing Values */}
      {dataset.missing_values && (
        <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
          <span>Contains missing values</span>
        </div>
      )}

      {/* Recommended Algorithms */}
      <div>
        <div className="text-muted-foreground mb-1">Recommended Algorithms:</div>
        <div className="flex flex-wrap gap-1">
          {dataset.recommended_algorithms.map((a) => (
            <span key={a} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {dataset.tags.map((tag) => (
          <span key={tag} className="px-1.5 py-0.5 rounded border border-border text-muted-foreground text-[9px]">
            {tag}
          </span>
        ))}
      </div>

      {/* License */}
      {dataset.license && (
        <div className="text-muted-foreground">
          License: <span className="text-foreground">{dataset.license}</span>
        </div>
      )}
    </div>
  );
}
