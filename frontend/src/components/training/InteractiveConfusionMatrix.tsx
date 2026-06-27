"use client";

import React, { useState } from "react";

interface InteractiveConfusionMatrixProps {
  matrix: number[][];
  onCellClick?: (actual: number, predicted: number, count: number) => void;
}

const CELL_LABELS: Record<string, string> = {
  "0-0": "TN", "1-1": "TP", "0-1": "FP", "1-0": "FN",
};

export function InteractiveConfusionMatrix({ matrix, onCellClick }: InteractiveConfusionMatrixProps) {
  const [selected, setSelected] = useState<{ actual: number; predicted: number } | null>(null);
  const n = matrix.length;
  const maxVal = Math.max(...matrix.flat());

  const handleCellClick = (i: number, j: number) => {
    setSelected({ actual: i, predicted: j });
    onCellClick?.(i, j, matrix[i][j]);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-foreground">Interactive Confusion Matrix</h3>
      <p className="text-[10px] text-muted-foreground">Click any cell to highlight those points on the canvas.</p>

      <div className="flex justify-center">
        <table className="text-xs font-mono border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-1"></th>
              {Array.from({ length: n }, (_, i) => (
                <th key={i} className="px-3 py-1 text-muted-foreground">Pred {i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="px-2 py-1 text-muted-foreground">True {i}</td>
                {row.map((val, j) => {
                  const isSelected = selected?.actual === i && selected?.predicted === j;
                  const isDiag = i === j;
                  const intensity = maxVal > 0 ? val / maxVal : 0;
                  const label = n === 2 ? CELL_LABELS[`${i}-${j}`] : `${i},${j}`;

                  return (
                    <td
                      key={j}
                      onClick={() => handleCellClick(i, j)}
                      className={`px-3 py-2 text-center cursor-pointer transition-all border ${
                        isSelected ? "border-primary ring-2 ring-primary/30" : "border-border"
                      } ${
                        isDiag
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                      style={{ opacity: 0.4 + intensity * 0.6 }}
                    >
                      <div className="text-[9px] opacity-70">{label}</div>
                      <div className="font-bold">{val}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="text-xs text-center text-muted-foreground">
          Selected: <span className="font-semibold text-foreground">
            {n === 2 ? CELL_LABELS[`${selected.actual}-${selected.predicted}`] : `True ${selected.actual} → Pred ${selected.predicted}`}
          </span>
          <span className="ml-1">({matrix[selected.actual][selected.predicted]} samples)</span>
        </div>
      )}
    </div>
  );
}
