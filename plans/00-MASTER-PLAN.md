# Confluence — Master Implementation Plan

## Vision

Transform Confluence from a synthetic ML visualization tool into a complete interactive ML learning platform with real-world datasets, training animations, prediction explanations, algorithm comparisons, and educational content.

## Current Architecture

```
backend/                          frontend/
├── app/                          ├── src/
│   ├── main.py (FastAPI)         │   ├── app/
│   ├── algorithms/               │   │   ├── page.tsx (landing)
│   │   ├── classification.py     │   │   ├── app/page.tsx (main)
│   │   ├── regression.py         │   │   └── algorithms/page.tsx
│   │   ├── clustering.py         │   ├── components/
│   │   ├── dim_reduction.py      │   │   ├── canvas/
│   │   ├── datasets.py           │   │   ├── metrics/
│   │   └── metrics.py            │   │   ├── controls/
│   ├── routers/                  │   │   ├── comparison/
│   │   ├── classification.py     │   │   ├── streaming/
│   │   ├── regression.py         │   │   └── ...
│   │   ├── clustering.py         │   ├── lib/
│   │   ├── dim_reduction.py      │   │   ├── store/index.ts (Zustand)
│   │   ├── streaming.py          │   │   └── api/client.ts
│   │   └── datasets.py           │   └── ...
│   └── models/schemas.py         └── package.json
└── requirements.txt
```

**Key facts:**
- 15 classification algorithms, 12 regression, 5 clustering, 5 dim-reduction
- 12 datasets (9 synthetic + 3 real: iris, wine, breast-cancer)
- WebSocket streaming for training animation (6 algorithms)
- Redis caching for grid predictions
- Zustand for state, React Query for data fetching
- Canvas-based rendering (HeatmapCanvas, ClusteringCanvas, etc.)
- Existing: cross-validation, coefficients, learning curves, decision paths, confusion matrix, ROC curve

## Phase Overview

| Phase | Features | Effort | Dependencies |
|-------|----------|--------|--------------|
| **1: Foundation** | Real Dataset Gallery, Data Generator Studio, Dataset System | 3-4 weeks | None |
| **2: Core Education** | Explain Every Prediction, Learning Mode, Step-by-Step Tree Builder, Explain Every Metric | 3-4 weeks | Phase 1 |
| **3: Training & Visualization** | Training Playground, Interactive Confusion Matrix, Interactive ROC/PR Curves, Explain Wrong Predictions | 4-5 weeks | Phase 1 |
| **4: Comparison & Analysis** | Hyperparameter Comparison, Algorithm Race, Benchmark Suite | 3-4 weeks | Phase 1 |
| **5: Advanced** | PCA Explorer, Code Generator, AI Assistant | 4-5 weeks | Phases 1-4 |
| **6: Community & Resources** | ML Roadmap, Community Contributions | 2-3 weeks | Phases 1-5 |

**Total estimated effort: 19-25 weeks**

## Cross-Cutting Concerns

### API Design Principles
- All new endpoints under `/api/v2/` to avoid breaking existing `/api/` contracts
- Standard response envelope: `{ data, meta, error }`
- Pagination for dataset lists: `{ items, total, page, pageSize }`
- WebSocket endpoints for real-time features (training, race)

### Security
- Validate all dataset inputs (CSV schema, size limits, forbidden patterns)
- No code execution from uploaded content
- Rate limiting on new endpoints (reuse existing middleware)
- Sanitize all metadata before frontend rendering
- Restrict file paths to approved directories

### Performance
- Cache processed datasets (LRU + TTL)
- Lazy-load large datasets (>1MB)
- WebSocket for streaming (not polling)
- Background tasks for benchmark suite
- Keep API responses under 10MB

### Testing Strategy
- Unit tests for every new algorithm wrapper
- Integration tests for every new endpoint
- Frontend component tests for critical paths
- End-to-end smoke tests for each phase

### Frontend Conventions
- Match existing Zustand store pattern
- Match existing canvas rendering approach
- Match existing component structure (controls/, metrics/, etc.)
- Tailwind CSS, no custom CSS modules
- Radix UI primitives for new interactive elements

## File Change Summary Per Phase

### Phase 1 (Foundation)
**Backend:** 15-20 new files (datasets, importers, preprocessing, metadata)
**Frontend:** 8-12 new files (dataset selector, info panel, data generator studio)

### Phase 2 (Core Education)
**Backend:** 5-8 new files (training steps API, prediction explanation, metric explanation)
**Frontend:** 10-15 new files (animated visualizers, explanation panels, tree builder)

### Phase 3 (Training & Visualization)
**Backend:** 3-5 new files (extended streaming, confusion matrix drill-down)
**Frontend:** 8-12 new files (training playground, interactive matrices, ROC/PR)

### Phase 4 (Comparison & Analysis)
**Backend:** 3-5 new files (race endpoint, benchmark runner)
**Frontend:** 6-10 new files (race dashboard, benchmark leaderboard, hyperparam comparison)

### Phase 5 (Advanced)
**Backend:** 5-8 new files (PCA detailed API, code generation, AI assistant endpoint)
**Frontend:** 8-12 new files (PCA explorer, code viewer, chat interface)

### Phase 6 (Community & Resources)
**Backend:** 2-3 new files (roadmap data, contribution templates)
**Frontend:** 4-6 new files (roadmap page, contribution guide)

## Implementation Order

```
Phase 1 ──┬── 1A: Dataset System Architecture (backend)
           ├── 1B: Real Dataset Gallery (backend + frontend)
           └── 1C: Data Generator Studio (backend + frontend)

Phase 2 ──┬── 2A: Explain Every Prediction (backend + frontend)
           ├── 2B: Learning Mode (backend + frontend)
           ├── 2C: Step-by-Step Tree Builder (backend + frontend)
           └── 2D: Explain Every Metric (backend + frontend)

Phase 3 ──┬── 3A: Training Playground (backend + frontend)
           ├── 3B: Interactive Confusion Matrix (frontend)
           ├── 3C: Interactive ROC & PR Curves (frontend)
           └── 3D: Explain Wrong Predictions (backend + frontend)

Phase 4 ──┬── 4A: Hyperparameter Comparison (frontend)
           ├── 4B: Algorithm Race (backend + frontend)
           └── 4C: Benchmark Suite (backend + frontend)

Phase 5 ──┬── 5A: PCA Explorer (backend + frontend)
           ├── 5B: Code Generator (backend + frontend)
           └── 5C: AI Assistant (backend + frontend)

Phase 6 ──┬── 6A: ML Roadmap (frontend + content)
           └── 6B: Community Contributions (docs + templates)
```

## Verification Checklist

After each phase:
- [ ] `make typecheck` passes
- [ ] `make lint` passes
- [ ] `make test-backend` passes
- [ ] All new endpoints return correct schemas
- [ ] All new UI components render without errors
- [ ] Mobile layout remains functional
- [ ] No regressions in existing features
- [ ] API types regenerated (`npm run generate-types`)

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large dataset loading blocks UI | Lazy loading + loading states + background fetch |
| Training animation performance | WebSocket streaming + frame throttling + canvas optimization |
| Breaking existing API | Versioned endpoints (`/api/v2/`) + backward compatibility |
| Memory pressure from many datasets | LRU cache + eviction policy + size limits |
| Complex UI state management | Zustand slices + React Query for server state |
