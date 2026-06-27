"use client";

import React from "react";
import type { ExplainPredictionResponse } from "@/lib/api/client";

interface PredictionExplainerProps {
  result: ExplainPredictionResponse;
}

export function PredictionExplainer({ result }: PredictionExplainerProps) {
  const { prediction, probabilities, explanation } = result;
  const modelType = explanation.model_type;

  return (
    <div className="space-y-4 text-xs">
      {/* Prediction Header */}
      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 rounded bg-primary/10 text-primary font-semibold text-sm">
          Class {prediction}
        </div>
        {probabilities.length > 0 && (
          <div className="text-muted-foreground">
            Confidence: <span className="font-mono font-semibold text-foreground">{(probabilities[prediction] * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Class Probabilities */}
      {probabilities.length > 0 && (
        <div className="space-y-1">
          <div className="text-muted-foreground">Class Probabilities:</div>
          {probabilities.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-12 text-muted-foreground">Class {i}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${i === prediction ? "bg-primary" : "bg-muted-foreground/30"}`}
                  style={{ width: `${p * 100}%` }}
                />
              </div>
              <span className="font-mono w-12 text-right">{(p * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Tree Decision Path */}
      {modelType === "tree" && explanation.path && (
        <div className="space-y-1">
          <div className="text-muted-foreground">Decision Path:</div>
          <div className="border border-border rounded-lg p-2 space-y-1 font-mono">
            <div className="text-muted-foreground">Root</div>
            {(explanation.path as Array<Record<string, unknown>>).map((step, i) => (
              <div key={i}>
                {step.type === "split" ? (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">{"  ".repeat(i)}↓</span>
                    <span className="text-foreground">
                      {String(step.feature)} {step.direction === "left" ? "≤" : ">"} {Number(step.threshold).toFixed(3)}
                    </span>
                    <span className="text-muted-foreground ml-2">(gini: {Number(step.gini).toFixed(3)})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">{"  ".repeat(i)}↓</span>
                    <span className="text-primary font-semibold">Leaf → Class {String(step.prediction)}</span>
                    <span className="text-muted-foreground ml-2">({(Number(step.confidence) * 100).toFixed(0)}%)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linear Feature Contributions */}
      {modelType === "linear" && explanation.contributions && (
        <div className="space-y-1">
          <div className="text-muted-foreground">Feature Contributions:</div>
          {(explanation.contributions as Array<Record<string, unknown>>).map((c, i) => {
            const contrib = Number(c.contribution);
            const maxContrib = Math.max(
              ...(explanation.contributions as Array<Record<string, unknown>>).map((x) => Math.abs(Number(x.contribution)))
            );
            const barWidth = maxContrib > 0 ? (Math.abs(contrib) / maxContrib) * 100 : 0;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-20 truncate text-muted-foreground">{String(c.feature)}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${contrib >= 0 ? "bg-blue-500" : "bg-red-500"}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="font-mono w-14 text-right">{contrib >= 0 ? "+" : ""}{contrib.toFixed(3)}</span>
              </div>
            );
          })}
          <div className="text-muted-foreground mt-1">
            Raw score: <span className="font-mono">{Number(explanation.intercept).toFixed(3)}</span> (intercept)
          </div>
        </div>
      )}

      {/* Ensemble Feature Importance */}
      {modelType === "ensemble" && explanation.feature_importance && (
        <div className="space-y-1">
          <div className="text-muted-foreground">Top Features:</div>
          {(explanation.feature_importance as Array<Record<string, unknown>>).map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-20 truncate text-muted-foreground">{String(f.feature)}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Number(f.importance) * 100}%` }} />
              </div>
              <span className="font-mono w-12 text-right">{Number(f.importance).toFixed(3)}</span>
            </div>
          ))}
          {Boolean(explanation.tree_agreement) && (
            <div className="text-muted-foreground mt-2">
              Tree votes: {JSON.stringify(explanation.tree_agreement)}
            </div>
          )}
        </div>
      )}

      {/* KNN Nearest Neighbors */}
      {modelType === "knn" && explanation.neighbors && (
        <div className="space-y-1">
          <div className="text-muted-foreground">Nearest Neighbors (k={String(explanation.k)}):</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {(explanation.neighbors as Array<Record<string, unknown>>).map((n, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1 rounded bg-muted/50">
                <span className="text-muted-foreground">#{i + 1}</span>
                <span className="font-mono">Label: {String(n.label)}</span>
                <span className="text-muted-foreground ml-auto">dist: {Number(n.distance).toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
