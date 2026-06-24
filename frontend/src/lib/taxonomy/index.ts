export const BOUNDARY_TAXONOMY = {
  linear: { label: "Linear", color: "#3b82f6", description: "Straight line or hyperplane boundaries" },
  "instance-based": { label: "Instance-Based", color: "#10b981", description: "Boundaries based on local point neighborhoods" },
  "tree-based": { label: "Tree-Based", color: "#f59e0b", description: "Axis-aligned piecewise boundaries" },
  "margin-kernel": { label: "Margin / Kernel", color: "#8b5cf6", description: "Maximum margin or kernel-mapped boundaries" },
  probabilistic: { label: "Probabilistic", color: "#ef4444", description: "Soft probability gradient boundaries" },
  neural: { label: "Neural", color: "#ec4899", description: "Nonlinear boundaries from neural networks" },
  boosting: { label: "Boosting", color: "#f97316", description: "Sequential ensemble boundaries" },
  "centroid-based": { label: "Centroid-Based", color: "#06b6d4", description: "Voronoi tessellation around centroids" },
  "density-based": { label: "Density-Based", color: "#84cc16", description: "Irregular shapes from density contours" },
  hierarchical: { label: "Hierarchical", color: "#14b8a6", description: "Bottom-up hierarchical clustering boundaries" },
  "distribution-based": { label: "Distribution-Based", color: "#f43f5e", description: "Probabilistic mixture model boundaries" },
  "graph-based": { label: "Graph-Based", color: "#a78bfa", description: "Graph Laplacian spectral boundaries" },
  manifold: { label: "Manifold", color: "#a855f7", description: "Nonlinear manifold embeddings" },
} as const;

export type TaxonomyTag = keyof typeof BOUNDARY_TAXONOMY;
