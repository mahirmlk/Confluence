"use client";

import React from "react";

interface DecisionPathViewProps {
  path: string[];
  prediction: number;
  modelType: string;
}

export function DecisionPathView({ path, prediction, modelType }: DecisionPathViewProps) {
  if (path.length === 0) {
    return (
      <div className="text-xs text-muted-foreground p-3">
        Decision path not available for this algorithm
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-foreground">Decision Path</h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
          {modelType}
        </span>
      </div>
      <div className="space-y-1">
        {path.map((step, i) => {
          const isLeaf = i === path.length - 1;
          const isRight = step.includes("→ right");
          const isLeft = step.includes("→ left");

          return (
            <div key={i} className="flex items-start gap-2">
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${isLeaf ? "bg-primary" : "bg-muted-foreground"}`} />
                {i < path.length - 1 && <div className="w-px h-4 bg-border" />}
              </div>
              <span className={`text-[10px] font-mono ${isLeaf ? "text-primary font-semibold" : isRight ? "text-blue-500" : isLeft ? "text-orange-400" : "text-muted-foreground"}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">Prediction:</span>
        <span className="text-sm font-mono font-semibold text-foreground">Class {prediction}</span>
      </div>
    </div>
  );
}
