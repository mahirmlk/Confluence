"use client";

import React, { useState } from "react";
import { getLearningTip } from "@/lib/api/client";

interface LearningModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function LearningModeToggle({ enabled, onToggle }: LearningModeToggleProps) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`px-2.5 py-1 text-[10px] font-medium transition-colors rounded-md border ${
        enabled
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border text-foreground hover:bg-accent"
      }`}
    >
      {enabled ? "Learning: ON" : "Learning: OFF"}
    </button>
  );
}

interface LearningTooltipProps {
  algorithm: string;
  hyperparameters: Record<string, number>;
  position: { x: number; y: number };
  element: string;
}

export function LearningTooltip({ algorithm, hyperparameters, position, element }: LearningTooltipProps) {
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLearningTip({ algorithm, element, hyperparameters })
      .then((res) => {
        if (!cancelled) setTip(res.tip);
      })
      .catch(() => {
        if (!cancelled) setTip(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [algorithm, element, hyperparameters]);

  if (!tip && !loading) return null;

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{ left: position.x + 10, top: position.y - 10 }}
    >
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[10px] font-semibold text-foreground uppercase tracking-wide">
            {element === "boundary" ? "Decision Boundary" : "Info"}
          </span>
        </div>
        {loading ? (
          <div className="text-[10px] text-muted-foreground animate-pulse">Loading...</div>
        ) : (
          <p className="text-[11px] text-muted-foreground leading-relaxed">{tip}</p>
        )}
      </div>
    </div>
  );
}

function ExplanationContent({ explanation }: { explanation: Record<string, unknown> }) {
  const exp = explanation as Record<string, string | number | boolean | null | undefined>;
  const breakdown = explanation.breakdown_by_class as Array<Record<string, unknown>> | undefined;
  const details = explanation.details as Array<Record<string, unknown>> | undefined;

  return (
    <div className="space-y-3 text-xs">
      {exp.formula && (
        <div>
          <div className="text-muted-foreground mb-1">Formula:</div>
          <div className="font-mono text-foreground bg-muted px-3 py-2 rounded">{String(exp.formula)}</div>
        </div>
      )}
      {exp.calculation && (
        <div>
          <div className="text-muted-foreground mb-1">Calculation:</div>
          <div className="font-mono text-foreground bg-muted px-3 py-2 rounded">{String(exp.calculation)}</div>
        </div>
      )}
      {exp.explanation && (
        <div>
          <div className="text-muted-foreground mb-1">What this means:</div>
          <p className="text-foreground leading-relaxed">{String(exp.explanation)}</p>
        </div>
      )}
      {breakdown && Array.isArray(breakdown) && (
        <div>
          <div className="text-muted-foreground mb-1">Breakdown by class:</div>
          <div className="space-y-1">
            {breakdown.map((c, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1 rounded bg-muted/50">
                <span className="text-muted-foreground">Class {String(c.class)}</span>
                <span className="font-mono ml-auto">{Number(c.correct)}/{Number(c.total)}</span>
                <span className="font-mono w-14 text-right">{(Number(c.accuracy) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {details && Array.isArray(details) && (
        <div>
          <div className="text-muted-foreground mb-1">Confusion Matrix:</div>
          <div className="grid grid-cols-2 gap-1">
            {details.map((d, i) => (
              <div
                key={i}
                className={`px-2 py-1.5 rounded text-center ${
                  d.label === "TP" || d.label === "TN"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                <div className="text-[10px] font-semibold">{String(d.label)}</div>
                <div className="font-mono">{String(d.count)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricExplainerModalProps {
  metric: string;
  value: number;
  algorithm: string;
  datasetName: string;
  hyperparameters: Record<string, number>;
  onClose: () => void;
}

export function MetricExplainerModal({ metric, algorithm, datasetName, hyperparameters, onClose }: MetricExplainerModalProps) {
  const [explanation, setExplanation] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    import("@/lib/api/client").then(({ explainMetric }) => {
      explainMetric({ metric, algorithm, dataset_name: datasetName, hyperparameters })
        .then((res) => setExplanation(res.explanation))
        .catch(() => setExplanation(null))
        .finally(() => setLoading(false));
    });
  }, [metric, algorithm, datasetName, hyperparameters]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground capitalize">{metric} Explained</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse py-8 text-center">Computing explanation...</div>
        ) : explanation ? (
          <ExplanationContent explanation={explanation} />
        ) : (
          <div className="text-sm text-muted-foreground py-8 text-center">Could not load explanation.</div>
        )}
      </div>
    </div>
  );
}
