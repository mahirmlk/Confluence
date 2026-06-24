---
name: algorithm-diagram
description: Creates SVG diagrams for algorithm cards in the Algorithm Encyclopedia. Generates clean, minimal SVG illustrations that convey the intuition behind each ML algorithm's decision-making process.
---

# Algorithm Diagram

Create SVG diagrams for the Algorithm Encyclopedia.

## Context

Each algorithm in the Encyclopedia (`/algorithms`) has an optional SVG diagram that visually explains its intuition. These are rendered in `frontend/src/components/algorithms/diagrams.tsx`.

## Design Principles

1. **Minimal** — no unnecessary detail, convey one core idea
2. **Consistent** — same color palette, stroke width, and style across all diagrams
3. **Scalable** — SVG must look good at 120px–300px width
4. **Accessible** — high contrast, clear shapes

## Color Palette

```typescript
const COLORS = {
  blue: "#3b82f6",      // Primary — boundaries, decision lines
  red: "#ef4444",       // Class 1 / positive
  green: "#10b981",     // Class 0 / negative
  purple: "#8b5cf6",    // Support vectors, centroids
  orange: "#f97316",    // Highlights, arrows
  gray: "#9ca3af",      // Background, grid lines
  dark: "#1f2937",      // Text, axes
};
```

## Diagram Templates

### Linear Boundary (Logistic Regression, Linear SVM, Perceptron)

```svg
<svg viewBox="0 0 200 150">
  <!-- Data points -->
  <circle cx="40" cy="60" r="4" fill="#10b981" />
  <circle cx="60" cy="80" r="4" fill="#10b981" />
  <circle cx="50" cy="50" r="4" fill="#10b981" />
  <circle cx="140" cy="70" r="4" fill="#ef4444" />
  <circle cx="160" cy="90" r="4" fill="#ef4444" />
  <circle cx="150" cy="50" r="4" fill="#ef4444" />
  <!-- Decision boundary -->
  <line x1="100" y1="20" x2="100" y2="130" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5,3" />
  <!-- Margin lines (SVM only) -->
  <line x1="80" y1="20" x2="80" y2="130" stroke="#3b82f6" stroke-width="1" opacity="0.4" />
  <line x1="120" y1="20" x2="120" y2="130" stroke="#3b82f6" stroke-width="1" opacity="0.4" />
</svg>
```

### Tree-Based (Decision Tree, Random Forest)

```svg
<svg viewBox="0 0 200 150">
  <!-- Tree structure -->
  <rect x="80" y="10" width="40" height="20" rx="3" fill="#3b82f6" />
  <text x="100" y="24" text-anchor="middle" fill="white" font-size="8">x1 ≤ 0.5</text>
  <!-- Branches -->
  <line x1="90" y1="30" x2="50" y2="55" stroke="#3b82f6" />
  <line x1="110" y1="30" x2="150" y2="55" stroke="#3b82f6" />
  <!-- Leaf nodes -->
  <rect x="30" y="55" width="40" height="20" rx="3" fill="#10b981" />
  <rect x="130" y="55" width="40" height="20" rx="3" fill="#ef4444" />
  <!-- Region labels -->
  <text x="50" y="69" text-anchor="middle" fill="white" font-size="7">Class 0</text>
  <text x="150" y="69" text-anchor="middle" fill="white" font-size="7">Class 1</text>
</svg>
```

### Instance-Based (KNN)

```svg
<svg viewBox="0 0 200 150">
  <!-- Data points -->
  <circle cx="40" cy="60" r="4" fill="#10b981" />
  <circle cx="60" cy="80" r="4" fill="#10b981" />
  <circle cx="140" cy="70" r="4" fill="#ef4444" />
  <circle cx="160" cy="90" r="4" fill="#ef4444" />
  <!-- Query point -->
  <circle cx="100" cy="75" r="5" fill="#f97316" stroke="#1f2937" stroke-width="1.5" />
  <!-- K nearest neighbors circle -->
  <circle cx="100" cy="75" r="35" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="4,3" />
  <!-- Lines to neighbors -->
  <line x1="100" y1="75" x2="60" y2="80" stroke="#8b5cf6" stroke-width="1" />
  <line x1="100" y1="75" x2="140" y2="70" stroke="#8b5cf6" stroke-width="1" />
</svg>
```

### Kernel / Margin (SVM RBF, Polynomial)

```svg
<svg viewBox="0 0 200 150">
  <!-- Nonlinear boundary -->
  <path d="M 30,75 Q 70,30 100,75 Q 130,120 170,75" fill="none" stroke="#3b82f6" stroke-width="2" />
  <!-- Data points -->
  <circle cx="50" cy="50" r="4" fill="#10b981" />
  <circle cx="70" cy="60" r="4" fill="#10b981" />
  <circle cx="130" cy="90" r="4" fill="#ef4444" />
  <circle cx="150" cy="80" r="4" fill="#ef4444" />
  <!-- Support vectors -->
  <circle cx="70" cy="60" r="7" fill="none" stroke="#8b5cf6" stroke-width="1.5" />
  <circle cx="130" cy="90" r="7" fill="none" stroke="#8b5cf6" stroke-width="1.5" />
</svg>
```

### Ensemble / Boosting (AdaBoost, Gradient Boosting, Random Forest)

```svg
<svg viewBox="0 0 200 150">
  <!-- Weak learners -->
  <rect x="10" y="55" width="35" height="40" rx="3" fill="#3b82f6" opacity="0.5" />
  <rect x="55" y="55" width="35" height="40" rx="3" fill="#3b82f6" opacity="0.7" />
  <rect x="100" y="55" width="35" height="40" rx="3" fill="#3b82f6" opacity="0.9" />
  <!-- Arrow -->
  <line x1="140" y1="75" x2="160" y2="75" stroke="#f97316" stroke-width="2" marker-end="url(#arrow)" />
  <!-- Combined result -->
  <rect x="162" y="55" width="30" height="40" rx="3" fill="#3b82f6" />
  <!-- Labels -->
  <text x="27" y="78" text-anchor="middle" fill="white" font-size="7">h₁</text>
  <text x="72" y="78" text-anchor="middle" fill="white" font-size="7">h₂</text>
  <text x="117" y="78" text-anchor="middle" fill="white" font-size="7">h₃</text>
  <text x="177" y="78" text-anchor="middle" fill="white" font-size="7">H</text>
</svg>
```

## How to Add

1. Open `frontend/src/components/algorithms/diagrams.tsx`
2. Find the `DIAGRAMS` object
3. Add a new entry with the algorithm name as key
4. Return an SVG element following the templates above
5. Keep viewBox at `0 0 200 150` for consistency
