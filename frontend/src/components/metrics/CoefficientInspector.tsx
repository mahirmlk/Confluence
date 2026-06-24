"use client";

import React from "react";

interface CoefficientInspectorProps {
  coefficients: number[];
  intercept: number;
  featureNames: string[];
  modelType: string;
}

export function CoefficientInspector({ coefficients, intercept, featureNames, modelType }: CoefficientInspectorProps) {
  if (coefficients.length === 0) {
    return (
      <div className="text-xs text-muted-foreground p-3">
        Coefficients not available for this algorithm
      </div>
    );
  }

  const maxAbs = Math.max(...coefficients.map(Math.abs), 0.001);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-foreground">
          {modelType === "linear" ? "Model Coefficients" : "Feature Importance"}
        </h3>
        {modelType === "linear" && (
          <span className="text-[10px] font-mono text-muted-foreground">
            intercept: {intercept.toFixed(3)}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {coefficients.map((coef, i) => {
          const name = featureNames[i] || `Feature ${i + 1}`;
          const pct = (Math.abs(coef) / maxAbs) * 100;
          const isPositive = coef >= 0;

          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground w-20 truncate">{name}</span>
              <div className="flex-1 h-4 bg-muted/30 rounded-sm overflow-hidden relative">
                {modelType === "linear" ? (
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border" />
                ) : null}
                <div
                  className={`absolute top-0 bottom-0 rounded-sm ${
                    modelType === "tree" ? "bg-primary" : isPositive ? "bg-blue-500" : "bg-red-400"
                  }`}
                  style={
                    modelType === "tree"
                      ? { left: 0, width: `${pct}%` }
                      : isPositive
                      ? { left: "50%", width: `${pct / 2}%` }
                      : { right: "50%", width: `${pct / 2}%` }
                  }
                />
              </div>
              <span className="text-[10px] font-mono text-foreground w-14 text-right">
                {modelType === "tree" ? `${(coef * 100).toFixed(1)}%` : coef.toFixed(3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
