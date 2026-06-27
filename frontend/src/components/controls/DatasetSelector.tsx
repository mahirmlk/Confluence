"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppStore, FAMILY_DATASETS } from "@/lib/store";
import { listDatasetsV2, type DatasetMetaV2 } from "@/lib/api/client";

type DatasetSource = "synthetic" | "real-world";

interface DatasetSelectorProps {
  onDatasetInfo?: (dataset: DatasetMetaV2 | null) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  healthcare: "Healthcare",
  finance: "Finance",
  housing: "Housing",
  business: "Business",
};

export function DatasetSelector({ onDatasetInfo }: DatasetSelectorProps) {
  const { family, datasetName, setDatasetName } = useAppStore();
  const [source, setSource] = useState<DatasetSource>("synthetic");
  const [realDatasets, setRealDatasets] = useState<DatasetMetaV2[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const syntheticDatasets = FAMILY_DATASETS[family];

  useEffect(() => {
    if (source === "real-world") {
      setLoading(true);
      listDatasetsV2({ family })
        .then((res) => {
          setRealDatasets(res.datasets.filter((d) => d.source !== "synthetic" || d.name === "titanic" || d.name === "penguins" || d.name === "heart-disease" || d.name === "adult-income" || d.name === "mushroom" || d.name === "wine-quality" || d.name === "bike-sharing" || d.name === "insurance" || d.name === "concrete" || d.name === "mall-customers" || d.name === "wholesale-customers" || d.name === "seeds"));
        })
        .catch(() => setRealDatasets([]))
        .finally(() => setLoading(false));
    }
  }, [source, family]);

  const categories = useMemo(() => {
    const cats: Record<string, DatasetMetaV2[]> = {};
    for (const ds of realDatasets) {
      if (!cats[ds.category]) cats[ds.category] = [];
      cats[ds.category].push(ds);
    }
    return cats;
  }, [realDatasets]);

  const filteredRealDatasets = useMemo(() => {
    if (!selectedCategory) return realDatasets;
    return realDatasets.filter((d) => d.category === selectedCategory);
  }, [realDatasets, selectedCategory]);

  const handleSelect = (name: string) => {
    setDatasetName(name);
    if (source === "real-world") {
      const ds = realDatasets.find((d) => d.name === name);
      onDatasetInfo?.(ds ?? null);
    } else {
      onDatasetInfo?.(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Source Toggle */}
      <div className="flex rounded-md border border-border overflow-hidden">
        {(["synthetic", "real-world"] as DatasetSource[]).map((s) => (
          <button
            key={s}
            onClick={() => {
              setSource(s);
              setSelectedCategory(null);
              if (s === "synthetic") {
                setDatasetName(FAMILY_DATASETS[family][0]);
              }
            }}
            className={`flex-1 px-2 py-1 text-[10px] font-medium transition-colors ${
              source === s ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
            }`}
          >
            {s === "synthetic" ? "Synthetic" : "Real World"}
          </button>
        ))}
      </div>

      {/* Synthetic Datasets */}
      {source === "synthetic" && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Dataset</label>
          <select
            value={datasetName}
            onChange={(e) => handleSelect(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            {syntheticDatasets.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      {/* Real World Datasets */}
      {source === "real-world" && (
        <div className="space-y-2">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                !selectedCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              All
            </button>
            {Object.keys(categories).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          {/* Dataset List */}
          {loading ? (
            <div className="text-xs text-muted-foreground animate-pulse">Loading datasets...</div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filteredRealDatasets.map((ds) => (
                <button
                  key={ds.name}
                  onClick={() => handleSelect(ds.name)}
                  className={`w-full text-left rounded-md border p-2 transition-colors ${
                    datasetName === ds.name
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{ds.display_name}</span>
                    <div className="flex gap-1">
                      {ds.n_classes && (
                        <span className="text-[9px] px-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {ds.n_classes}cls
                        </span>
                      )}
                      <span className="text-[9px] px-1 rounded bg-muted text-muted-foreground">
                        {ds.n_features}d
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{ds.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
