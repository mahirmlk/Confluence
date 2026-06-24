# Changelog

All notable changes to Confluence are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Algorithm Encyclopedia page with 38 algorithm cards, search, and family filtering
- Algorithm recommendation engine based on dataset characteristics
- CSV upload with column mapping and auto-detection
- Custom point placement on canvas
- Side-by-side comparison mode (2-4 algorithms)
- Boundary taxonomy explorer with geometric tag filtering
- WebSocket training animation for staged algorithms
- Cross-validation visualization with per-fold boundaries
- Learning curves for classification and regression
- Sensitivity heatmaps for hyperparameter analysis
- Decision path viewer for tree-based models
- Coefficient inspector for linear and tree models
- 3D mode via Three.js/react-three-fiber
- Redis caching layer with TTL-based eviction
- Auto-generated TypeScript types from OpenAPI schema
- CI pipeline (GitHub Actions) with lint, typecheck, build, and pytest
- Docker Compose orchestration (frontend, backend, redis)
- Landing page with animated hero section

### Changed
- Migrated from Pages Router to App Router
- Upgraded to Next.js 15, React 19, Tailwind CSS 4
- Upgraded to FastAPI 0.115, scikit-learn 1.6, Pydantic 2.10

### Fixed
- Event loop blocking on ML endpoints (now uses `asyncio.to_thread`)
- Redis connection race condition on lazy initialization
- WebSocket error handler secondary exception on broken socket
- DBSCAN refit inconsistency (now uses KNN-based grid prediction)

---

## [0.1.0] - 2026-06-20

### Added
- Initial release
- 15 classification algorithms
- 13 regression algorithms
- 5 clustering algorithms
- 5 dimensionality reduction algorithms
- 12 built-in datasets (synthetic + real-world)
- Decision boundary heatmap rendering
- Contour line extraction via scikit-image
- Hyperparameter sliders with debounced recompute
- Confusion matrix, ROC/AUC, log loss
- R-squared, MSE, MAE, residual plots
- Silhouette score, Davies-Bouldin index
- K-fold cross-validation
- WebSocket streaming for boosting, tree growth, gradient descent, MLP
- Shareable state via URL query parameters
- Dark/light theme toggle
