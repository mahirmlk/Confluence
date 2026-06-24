"use client";

import React from "react";
import { useAppStore, ALGORITHMS, HYPERPARAMETER_CONFIGS, FAMILY_DATASETS, type AlgorithmFamily } from "@/lib/store";
import { HyperparameterSlider } from "./HyperparameterSlider";

const FAMILY_OPTIONS: { value: AlgorithmFamily; label: string }[] = [
  { value: "classification", label: "Classification" },
  { value: "regression", label: "Regression" },
  { value: "clustering", label: "Clustering" },
  { value: "dim-reduction", label: "Dim. Reduction" },
];

export function AlgorithmPanel() {
  const {
    family, algorithm, datasetName, hyperparameters, noise, nSamples,
    setFamily, setAlgorithm, setDatasetName, setHyperparameters, setNoise, setNSamples,
  } = useAppStore();

  const filteredAlgorithms = ALGORITHMS.filter((a) => a.family === family);
  const datasets = FAMILY_DATASETS[family];
  const configs = HYPERPARAMETER_CONFIGS[algorithm] || [];
  const algoConfig = filteredAlgorithms.find((a) => a.name === algorithm);

  const handleFamilyChange = (newFamily: AlgorithmFamily) => {
    setFamily(newFamily);
    const first = ALGORITHMS.find((a) => a.family === newFamily);
    if (first) {
      setAlgorithm(first.name);
      const defaultParams: Record<string, number> = {};
      (HYPERPARAMETER_CONFIGS[first.name] || []).forEach((c) => {
        defaultParams[c.name] = c.default;
      });
      setHyperparameters(defaultParams);
    }
    const firstDataset = FAMILY_DATASETS[newFamily][0];
    setDatasetName(firstDataset);
  };

  const handleAlgorithmChange = (newAlgo: string) => {
    setAlgorithm(newAlgo);
    const defaultParams: Record<string, number> = {};
    (HYPERPARAMETER_CONFIGS[newAlgo] || []).forEach((c) => {
      defaultParams[c.name] = c.default;
    });
    setHyperparameters(defaultParams);
  };

  const handleParamChange = (name: string, value: number) => {
    setHyperparameters({ ...hyperparameters, [name]: value });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Algorithm Family</label>
        <select
          value={family}
          onChange={(e) => handleFamilyChange(e.target.value as AlgorithmFamily)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {FAMILY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Algorithm</label>
        <select
          value={algorithm}
          onChange={(e) => handleAlgorithmChange(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {filteredAlgorithms.map((a) => (
            <option key={a.name} value={a.name}>{a.label}</option>
          ))}
        </select>
        {algoConfig && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{algoConfig.description}</p>
            {algoConfig.complexity && (
              <div className="flex gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Fit: {algoConfig.complexity.fit}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Predict: {algoConfig.complexity.predict}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Dataset</label>
        <select
          value={datasetName}
          onChange={(e) => setDatasetName(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {datasets.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Data Settings</h2>
        <HyperparameterSlider
          label="Noise"
          value={noise}
          min={0}
          max={5}
          step={0.1}
          onChange={(v) => setNoise(v)}
        />
        <HyperparameterSlider
          label="Samples"
          value={nSamples}
          min={50}
          max={2000}
          step={50}
          onChange={(v) => setNSamples(v)}
        />
      </div>

      {configs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">Hyperparameters</h2>
          {configs.map((config) => (
            <HyperparameterSlider
              key={`${algorithm}-${config.name}`}
              label={config.name}
              value={hyperparameters[config.name] ?? config.default}
              min={config.min}
              max={config.max}
              step={config.step}
              onChange={(v) => handleParamChange(config.name, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
