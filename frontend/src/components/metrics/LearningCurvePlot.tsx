"use client";

import React from "react";

interface LearningCurvePlotProps {
  trainSizes: number[];
  trainScores: number[];
  validationScores: number[];
}

export function LearningCurvePlot({ trainSizes, trainScores, validationScores }: LearningCurvePlotProps) {
  const size = 240;
  const padding = 40;
  const plotW = size - padding * 2;
  const plotH = size - padding * 2;

  const allScores = [...trainScores, ...validationScores];
  const sMin = Math.min(...allScores) - 0.05;
  const sMax = Math.max(...allScores) + 0.05;
  const sRange = sMax - sMin || 1;

  const xStep = plotW / (trainSizes.length - 1 || 1);

  const trainPoints = trainScores.map((v, i) => ({
    x: padding + i * xStep,
    y: padding + plotH - ((v - sMin) / sRange) * plotH,
  }));

  const valPoints = validationScores.map((v, i) => ({
    x: padding + i * xStep,
    y: padding + plotH - ((v - sMin) / sRange) * plotH,
  }));

  const trainPath = trainPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const valPath = valPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-foreground">Learning Curve</h3>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px] mx-auto">
        <line x1={padding} y1={padding + plotH} x2={padding + plotW} y2={padding + plotH} stroke="var(--border)" strokeWidth="0.5" />
        <line x1={padding} y1={padding} x2={padding} y2={padding + plotH} stroke="var(--border)" strokeWidth="0.5" />

        <path d={trainPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
        {trainPoints.map((p, i) => (
          <circle key={`t-${i}`} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
        ))}

        <path d={valPath} fill="none" stroke="#ef4444" strokeWidth="2" />
        {valPoints.map((p, i) => (
          <circle key={`v-${i}`} cx={p.x} cy={p.y} r="3" fill="#ef4444" />
        ))}

        {trainSizes.map((s, i) => {
          const show = i === 0 || i === trainSizes.length - 1 || i % 2 === 0;
          if (!show) return null;
          return (
            <text key={s} x={padding + i * xStep} y={size - 5} textAnchor="middle" fontSize="7" fill="var(--muted-foreground)">
              {s}
            </text>
          );
        })}

        <text x={size / 2} y={size - 0} textAnchor="middle" fontSize="8" fill="var(--muted-foreground)">Training Size</text>
      </svg>
      <div className="flex justify-center gap-4 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-[#3b82f6] inline-block" /> Train
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-[#ef4444] inline-block" /> Validation
        </span>
      </div>
    </div>
  );
}
