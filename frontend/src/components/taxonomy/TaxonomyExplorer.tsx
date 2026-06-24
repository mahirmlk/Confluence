"use client";

import React, { useState, useMemo } from "react";
import { ALGORITHMS, type AlgorithmFamily } from "@/lib/store";
import { BOUNDARY_TAXONOMY, type TaxonomyTag } from "@/lib/taxonomy";

const TAGS = Object.keys(BOUNDARY_TAXONOMY) as TaxonomyTag[];

export function TaxonomyExplorer() {
  const [selectedTags, setSelectedTags] = useState<Set<TaxonomyTag>>(new Set());
  const [selectedFamily, setSelectedFamily] = useState<AlgorithmFamily | "all">("all");

  const filteredAlgorithms = useMemo(() => {
    return ALGORITHMS.filter((a) => {
      const familyMatch = selectedFamily === "all" || a.family === selectedFamily;
      const tagMatch = selectedTags.size === 0 || selectedTags.has(a.taxonomyTag as TaxonomyTag);
      return familyMatch && tagMatch;
    });
  }, [selectedTags, selectedFamily]);

  const toggleTag = (tag: TaxonomyTag) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Boundary Taxonomy</h2>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const info = BOUNDARY_TAXONOMY[tag];
            const count = ALGORITHMS.filter((a) => a.taxonomyTag === tag).length;
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedTags.has(tag)
                    ? "border-transparent text-white"
                    : "border-border text-foreground hover:bg-accent"
                }`}
                style={selectedTags.has(tag) ? { backgroundColor: info.color } : undefined}
              >
                {info.label} ({count})
              </button>
            );
          })}
          {selectedTags.size > 0 && (
            <button
              onClick={() => setSelectedTags(new Set())}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-border text-muted-foreground hover:bg-accent"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Family Filter</label>
        <select
          value={selectedFamily}
          onChange={(e) => setSelectedFamily(e.target.value as AlgorithmFamily | "all")}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="all">All Families</option>
          <option value="classification">Classification</option>
          <option value="regression">Regression</option>
          <option value="clustering">Clustering</option>
          <option value="dim-reduction">Dim. Reduction</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAlgorithms.map((algo) => {
          const tagInfo = BOUNDARY_TAXONOMY[algo.taxonomyTag as TaxonomyTag];
          return (
            <div
              key={algo.name}
              className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: tagInfo?.color ?? "#888" }}
                />
                <span className="text-sm font-medium text-foreground">{algo.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{algo.description}</p>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ backgroundColor: tagInfo?.color ?? "#888", color: "white" }}
                >
                  {tagInfo?.label ?? algo.taxonomyTag}
                </span>
                <span className="text-[10px] text-muted-foreground">{algo.family}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
