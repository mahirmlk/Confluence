<div align="center">

<br />

<img src="docs/images/banner.svg" alt="Confluence: Explore. Experiment. Understand Machine Learning." width="100%" />

<br />

Confluence is a hands-on way to learn machine learning. Pick an algorithm and a dataset, move the sliders, and watch the decision boundary change in front of you. Everything runs on real scikit-learn, so what you see is what the model actually does.

38 algorithms across classification, regression, clustering, and dimensionality reduction. 25 datasets (13 real-world ones from Kaggle, 12 synthetic). Training animations, explanations for individual predictions, and side-by-side comparison.

<br />

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![scikit--learn](https://img.shields.io/badge/scikit--learn-1.6-F7931E?logo=scikit-learn)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

<br />

[Getting Started](#getting-started) · [Features](#features) · [Architecture](#architecture) · [API Reference](#api-reference) · [Algorithm Catalog](#algorithm-catalog) · [Contributing](CONTRIBUTING.md)

<br />

<img src="docs/images/hero.png" alt="Confluence: ML Algorithm Visualizer" width="100%" />

<br />

---

</div>

## Table of contents

- [Why Confluence?](#why-confluence)
- [Features](#features)
- [Algorithm encyclopedia](#algorithm-encyclopedia)
- [Getting started](#getting-started)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Algorithm catalog](#algorithm-catalog)
- [Dataset catalog](#dataset-catalog)
- [API reference](#api-reference)
- [Configuration](#configuration)
- [Verification & testing](#verification--testing)
- [Tech stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

---

## Why Confluence?

Most ML visualization tools fall into one of two traps:

| Trap | Example | Problem |
|------|---------|---------|
| **Toy and shallow** | TensorFlow Playground, CodePen demos | Client-side-only math, covers 3-4 algorithms, no regression/clustering/dim-reduction |
| **Static and academic** | scikit-learn gallery, Distill.pub | Good math, zero interactivity, fixed datasets, no hyperparameter exploration |

Confluence sits in the middle. It is one place to try things yourself, backed by real scikit-learn computation, covering all four algorithm families. You can compare models side by side, animate training step by step, and dig into why a boundary looks the way it does.

### Core differentiators

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. Boundary Taxonomy          Algorithms tagged by geometric shape     │
│  2. Four Families, One UI      Classification · Regression · Cluster    │
│  3. Real Computation           Actual scikit-learn, not toy math        │
│  4. Training Playground        Watch models learn step-by-step          │
│  5. Explain Every Prediction   Decision paths, feature contributions    │
│  6. Algorithm Race             Run multiple algorithms simultaneously   │
│  7. 25 Datasets                 Iris, Titanic, Housing, and more         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Features

### Visualization engine
- Decision boundaries render as Canvas2D heatmaps with crisp contour overlays
- Hyperparameter sliders update in real time, with debounced recompute (resolution 1-200)
- Probability gradients, so you see confidence, not just class labels
- 3D mode through Three.js/react-three-fiber for GP uncertainty surfaces and embedding projections
- PCA projection for high-dimensional datasets (>2 features) with explained variance labels
- Feature scaling through StandardScaler for scale-sensitive algorithms (SVM, KNN, Logistic Regression, MLP)
- Axis labels showing PC1/PC2 with variance percentages for PCA datasets
- Legend with real dataset class names (e.g., Survived/Did Not Survive, Adelie/Chinstrap/Gentoo)
- Larger points with white outlines and subtle transparency
- Decision boundary contrast: a shadow pass plus a white line, so boundaries stay visible in every region

### Dataset gallery (25 datasets)
- Synthetic: blobs, moons, spirals, XOR, checkerboard, linearly separable
- Real-world (Kaggle): Titanic, Penguins, Heart Disease, Adult Income, Mushroom, Wine Quality, California Housing, Diabetes, Insurance, Concrete, Mall Customers, Wholesale Customers, Seeds
- sklearn built-in: Iris, Wine, Breast Cancer, Digits, Diabetes, California Housing
- Categorized selector with source toggle (Synthetic / Real World) and category filters
- Dataset info panel with story, stats, features, and recommended algorithms
- Data Generator Studio: generate spirals, XOR, gaussian, moons, circles, or draw custom datasets

### Training playground
- Animated training: watch logistic regression learn through gradient descent, MLP weight updates, decision tree depth growth, KNN k-sweep, boosting rounds
- Loss curve and accuracy history in real time, next to the decision boundary
- Playback controls: play, pause, step forward and back, scrubber timeline

### Explain every prediction
- Click any point to see its prediction, probability, and full explanation
- Decision path for tree-based models (split feature, threshold, Gini at each node)
- Feature contributions for linear models (weight × value per feature)
- Feature importance for ensemble models
- Nearest neighbors for KNN models

### Learning mode
- Toggle ON to get context-aware explanations when clicking the canvas
- Boundary explanations: why the boundary is shaped this way
- Hyperparameter effects: what changing C, max_depth, n_neighbors actually does

### Metric explanations
- Click any metric (accuracy, precision, recall, F1) to see formula, calculation, interpretation
- Per-class breakdown showing where the model succeeds and fails
- Confusion matrix breakdown with TP/TN/FP/FN labels

### Algorithm comparison
- Hyperparameter comparison: 4 configs side by side (e.g., max_depth 2, 5, 10, 20) with overfit detection
- Algorithm Race: run multiple algorithms at the same time over WebSocket, with a real-time leaderboard
- Benchmark Suite: cross-algorithm, cross-dataset accuracy heatmap and speed ranking
- Side-by-side mode puts 2-4 algorithms on the same dataset with synchronized zoom/pan

### Interactive visualizations
- Interactive Confusion Matrix: click TP/TN/FP/FN to highlight those points on the canvas
- Interactive ROC Curve: hover to see threshold, FPR, TPR at any point
- Interactive PR Curve: hover to see threshold, precision, recall
- Wrong Prediction Explorer: shows expected class, predicted class, probability, decision path, nearest correct neighbors

### PCA explorer
- Projection canvas showing data in PC1 vs PC2 space
- Scree plot with variance per component
- Feature loadings showing which features contribute to each principal component
- Cumulative variance explained

### Code generator
- Auto-generates Python code matching your current algorithm, dataset, and hyperparameters
- Copy to clipboard or download as .py file
- Updates automatically when you change configuration

### Step-by-step tree builder
- Animated tree construction: watch splits grow depth by depth
- Tree visualization showing nodes, thresholds, Gini values, class counts
- Synced with the decision boundary, so you see how each split changes it

### ML roadmap
- 7 learning categories: Statistics, Linear Algebra, Optimization, Feature Engineering, Evaluation, Model Selection, Deployment
- Each topic links to relevant Confluence features for hands-on practice
- External resources for deeper learning

### Other tools
- Cross-validation with per-fold boundary visualization
- Coefficient inspector for linear/tree models
- Learning curves showing train vs. validation performance
- Sensitivity heatmaps for hyperparameter interaction analysis
- Boundary taxonomy explorer: filter algorithms by geometric boundary type
- Algorithm encyclopedia: 38 algorithms with complexity, intuition, and SVG diagrams

---

## Algorithm encyclopedia

There is a full encyclopedia built in: all 38 algorithms in one browsable reference, organized by family.

<img src="docs/images/algorithms-page.png" alt="Confluence Algorithm Encyclopedia: browse, search, and learn every algorithm" width="100%" />

### What the encyclopedia offers

| Feature | Description |
|---------|-------------|
| 38 algorithm cards | Every algorithm across classification, regression, clustering, and dimensionality reduction, each with a one-line intuition, complexity notes, and boundary taxonomy tag |
| Organized by family | Algorithms are grouped into four families with clear visual separation: Classification, Regression, Clustering, and Dimensionality Reduction |
| Boundary taxonomy tags | Each algorithm is tagged by the geometric shape of its decision boundary: Linear, Tree-Based, Instance-Based, Margin/Kernel, Probabilistic, Neural, Boosting, and more |
| Search & filter | Instantly search algorithms by name or filter by family to find the right tool for your dataset |
| Complexity reference | Every card shows Big-O complexity for both fit and predict operations, helping you reason about scalability |
| SVG diagrams | Visual diagrams illustrate the intuition behind each algorithm's decision-making process |
| Interactive launch | Click any algorithm card to jump directly into the visualizer with that algorithm pre-selected |

---

## Getting started

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.11+ | `python --version` |
| Node.js | 20+ | `node --version` |
| Redis | 7+ (optional) | `redis-cli ping` |

### Quick start (local development)

```bash
# 1. Clone
git clone <repo-url>
cd Confluence

# 2. Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click Launch Visualizer, then pick an algorithm and a dataset.

### Docker Compose (recommended for full stack)

```bash
docker compose up --build
```

This starts three services:
- `frontend`: Next.js on port 3000
- `backend`: FastAPI on port 8000
- `redis`: Redis on port 6379

### Verify installation

```bash
make typecheck     # Frontend TypeScript
make lint          # Frontend ESLint
make test-backend  # Backend pytest (60 tests)
```

### CI pipeline

GitHub Actions runs on every push:
- Frontend job: `npm ci`, then lint, typecheck, build
- Backend job: `pip install`, then import validation

---

## Architecture

### System overview

```mermaid
graph TB
    subgraph CLIENT["Browser"]
        direction TB
        STATE["Zustand Store"]
        QUERY["TanStack Query"]
        CANVAS["Canvas2D Renderer"]
        THREE["Three.js 3D"]
        HTTP["Axios Client"]
    end

    subgraph API["REST + WebSocket Layer"]
        direction TB
        CLASS["Classification Routes"]
        REG["Regression Routes"]
        CLUST["Clustering Routes"]
        DIM["Dim Reduction Routes"]
        DATA["Dataset Routes"]
        EXPLAIN["Explain Routes"]
        TRAIN["Training Routes"]
        COMPARE["Compare Routes"]
        TOOLS["Tools Routes"]
        WS["WebSocket Streams"]
    end

    subgraph CORE["Core Engine"]
        direction TB
        GRID["Grid Engine"]
        ALGO["Algorithm Factory"]
        METRIC["Metrics Engine"]
        EXPLAINER["Explainers"]
        REGISTRY["Dataset Registry"]
        CACHE["Redis Cache"]
    end

    subgraph ML["scikit-learn"]
        direction TB
        SKLearn["Model Training"]
        PREDICT["Prediction"]
        CROSS["Cross Validation"]
    end

    STATE --> HTTP
    QUERY --> HTTP
    CANVAS --> HTTP
    THREE --> HTTP

    HTTP -->|"REST JSON"| CLASS
    HTTP -->|"REST JSON"| REG
    HTTP -->|"REST JSON"| CLUST
    HTTP -->|"REST JSON"| DIM
    HTTP -->|"REST JSON"| DATA
    HTTP -->|"REST JSON"| EXPLAIN
    HTTP -->|"REST JSON"| TRAIN
    HTTP -->|"REST JSON"| COMPARE
    HTTP -->|"REST JSON"| TOOLS
    HTTP -->|"WebSocket"| WS

    CLASS --> GRID
    REG --> GRID
    CLUST --> GRID
    DIM --> GRID
    DATA --> REGISTRY
    EXPLAIN --> EXPLAINER
    TRAIN --> ALGO
    COMPARE --> ALGO
    TOOLS --> ALGO

    GRID --> ALGO
    ALGO --> SKLearn
    ALGO --> PREDICT
    ALGO --> CROSS
    GRID --> METRIC
    GRID --> CACHE
```

---

## Project structure

```
Confluence/
├── backend/
│   ├── app/
│   │   ├── main.py                         # FastAPI app, CORS, exception handlers
│   │   ├── cache.py                        # Redis caching layer (async)
│   │   ├── grid.py                         # Meshgrid generation + contour extraction
│   │   ├── algorithms/
│   │   │   ├── classification.py           # 15 classification algorithms
│   │   │   ├── regression.py               # 13 regression algorithms
│   │   │   ├── clustering.py               # 5 clustering algorithms
│   │   │   ├── dim_reduction.py            # 5 dimensionality reduction algorithms
│   │   │   ├── datasets.py                 # Synthetic dataset generators + registry bridge
│   │   │   ├── metrics.py                  # Metrics, CV, learning curves, sensitivity
│   │   │   ├── explainers/                 # Prediction, learning, metric explainers
│   │   │   └── generators/                 # Data generator studio
│   │   ├── datasets/
│   │   │   ├── registry.py                 # Central dataset registry
│   │   │   ├── metadata.py                 # DatasetEntry dataclass
│   │   │   ├── loaders.py                  # Register all datasets
│   │   │   ├── classification/             # 14 classification dataset loaders
│   │   │   ├── regression/                 # 7 regression dataset loaders
│   │   │   └── clustering/                 # 3 clustering dataset loaders
│   │   ├── models/
│   │   │   └── schemas.py                  # Pydantic request/response models
│   │   └── routers/
│   │       ├── classification.py           # Classification endpoints
│   │       ├── regression.py               # Regression endpoints
│   │       ├── clustering.py               # Clustering endpoints
│   │       ├── dim_reduction.py            # Dim-reduction endpoints
│   │       ├── datasets.py                 # CSV upload, custom points, v2 dataset API
│   │       ├── explain.py                  # Prediction & metric explanations
│   │       ├── training.py                 # Training playground & wrong predictions
│   │       ├── compare.py                  # Hyperparameter comparison, race, benchmark
│   │       ├── tools.py                    # PCA explorer, code gen
│   │       ├── streaming.py                # WebSocket training animation + tree builder
│   │       └── health.py                   # Health check
│   ├── tests/                              # 60 tests (pytest + httpx)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Landing page
│   │   │   ├── app/page.tsx                # Main visualizer
│   │   │   ├── algorithms/page.tsx         # Algorithm encyclopedia
│   │   │   └── resources/page.tsx          # ML Roadmap
│   │   ├── components/
│   │   │   ├── canvas/                     # Canvas2D renderers (7 files)
│   │   │   ├── comparison/                 # Side-by-side, hyperparam, race, benchmark
│   │   │   ├── controls/                   # Algorithm panel, dataset selector, sliders
│   │   │   ├── explain/                    # Prediction explainer, tree builder, learning mode
│   │   │   ├── training/                   # Training playground, confusion matrix, ROC/PR
│   │   │   ├── tools/                      # PCA explorer, code gen
│   │   │   ├── metrics/                    # 9 metric visualization components
│   │   │   ├── streaming/                  # WebSocket training viz
│   │   │   ├── taxonomy/                   # Boundary taxonomy explorer
│   │   │   ├── three/                      # 3D scene (Three.js)
│   │   │   ├── landing/                    # Landing page animations
│   │   │   ├── layout/                     # Navbar, footer
│   │   │   └── ui/                         # URL state, theme toggle
│   │   └── lib/
│   │       ├── api/client.ts               # Axios API client + typed functions
│   │       ├── api/types.ts                # Auto-generated OpenAPI types
│   │       ├── store/index.ts              # Zustand store (38 algorithms, 24 datasets)
│   │       └── taxonomy/index.ts           # Boundary taxonomy definitions
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── docs/
│   ├── deployment.md                       # Full deployment guide
│   ├── API.md                              # API reference
│   ├── ARCHITECTURE.md                     # System architecture
│   └── DEVELOPMENT.md                      # Developer guide
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── new_algorithm.md                # Algorithm request template
│   │   ├── new_dataset.md                  # Dataset request template
│   │   └── feature_request.md              # Feature request template
│   └── PULL_REQUEST_TEMPLATE.md            # PR template with checklist
│
├── docker-compose.yml                      # 3-service orchestration
├── Makefile                                # Build commands
├── CONTRIBUTING.md                         # Contribution guidelines with templates
├── .env.example                            # Environment variable template
├── .nvmrc                                  # Node.js 20
└── .python-version                         # Python 3.11
```

---

## Algorithm catalog

### Classification (15 algorithms)

| Algorithm | Key | Boundary Type | Complexity (Fit) | Complexity (Predict) |
|-----------|-----|---------------|------------------|---------------------|
| Logistic Regression | `logistic-regression` | Linear | O(n·d) | O(d) |
| K-Nearest Neighbors | `knn` | Instance-Based | O(1) | O(n·d) |
| Decision Tree | `decision-tree` | Tree-Based | O(n·d·log n) | O(log n) |
| SVM (RBF) | `rbf-svm` | Margin / Kernel | O(n²·d) | O(sv·d) |
| SVM (Linear) | `linear-svm` | Linear | O(n·d) | O(d) |
| SVM (Polynomial) | `poly-svm` | Margin / Kernel | O(n²·d) | O(sv·d) |
| Random Forest | `random-forest` | Tree-Based | O(k·n·d·log n) | O(k·log n) |
| Extra Trees | `extra-trees` | Tree-Based | O(k·n·d·log n) | O(k·log n) |
| AdaBoost | `adaboost` | Boosting | O(T·n·d) | O(T) |
| Gradient Boosting | `gradient-boosting` | Boosting | O(T·n·d·log n) | O(T·log n) |
| Gaussian Naive Bayes | `gaussian-nb` | Probabilistic | O(n·d) | O(d) |
| QDA | `qda` | Probabilistic | O(n·d²) | O(d²) |
| Gaussian Process | `gp-classifier` | Probabilistic | O(n³) | O(n²) |
| Perceptron | `perceptron` | Linear | O(n·d·i) | O(d) |
| MLP Classifier | `mlp` | Neural | O(n·d·h·i) | O(d·h) |

### Regression (13 algorithms)

| Algorithm | Key | Boundary Type | Complexity (Fit) |
|-----------|-----|---------------|------------------|
| Linear Regression | `linear-regression` | Linear | O(n·d²) |
| Ridge | `ridge` | Linear | O(n·d²) |
| Lasso | `lasso` | Linear | O(n·d·i) |
| Elastic Net | `elastic-net` | Linear | O(n·d·i) |
| Decision Tree Regressor | `decision-tree-regressor` | Tree-Based | O(n·d·log n) |
| Random Forest Regressor | `random-forest-regressor` | Tree-Based | O(k·n·d·log n) |
| Gradient Boosting Regressor | `gradient-boosting-regressor` | Boosting | O(T·n·d·log n) |
| SVR (Linear) | `svr-linear` | Margin / Kernel | O(n²·d) |
| SVR (RBF) | `svr-rbf` | Margin / Kernel | O(n²·d) |
| SVR (Polynomial) | `svr-poly` | Margin / Kernel | O(n²·d) |
| KNN Regressor | `knn-regressor` | Instance-Based | O(1) |
| Gaussian Process | `gaussian-process-regressor` | Probabilistic | O(n³) |
| MLP Regressor | `mlp-regressor` | Neural | O(n·d·h·i) |

### Clustering (5 algorithms)

| Algorithm | Key | Category |
|-----------|-----|----------|
| K-Means | `kmeans` | Centroid-Based |
| DBSCAN | `dbscan` | Density-Based |
| Agglomerative | `agglomerative` | Hierarchical |
| Gaussian Mixture | `gmm` | Distribution-Based |
| Spectral | `spectral` | Graph-Based |

### Dimensionality Reduction (5 algorithms)

| Algorithm | Key | Category |
|-----------|-----|----------|
| PCA | `pca` | Linear |
| t-SNE | `tsne` | Manifold |
| UMAP | `umap` | Manifold |
| Isomap | `isomap` | Manifold |
| LDA | `lda` | Linear |

---

## Dataset catalog

### Synthetic (9)

| Dataset | Description | Classes | Best For |
|---------|-------------|---------|----------|
| `blobs` | Gaussian blobs | 2 | Linear classifiers |
| `blobs-3class` | Gaussian blobs | 3 | Multi-class |
| `blobs-4class` | Gaussian blobs | 4 | Multi-class |
| `moons` | Interleaving half circles | 2 | Nonlinear boundaries |
| `circles` | Concentric circles | 2 | Kernel methods |
| `spirals` | Spiral patterns | 2 | Complex nonlinear |
| `xor` | XOR distribution | 2 | Tree/kernel methods |
| `linearly-separable` | Linearly separable | 2 | Baseline linear |
| `checkerboard` | Checkerboard pattern | 2 | Piecewise boundaries |

### Classification, real-world (11)

| Dataset | Features | Classes | Category | Source |
|---------|----------|---------|----------|--------|
| `iris` | petal length, petal width | 3 | General | sklearn |
| `iris-full` | 4 features | 3 | General | sklearn |
| `wine` | alcohol, proline | 3 | General | sklearn |
| `wine-full` | 13 features | 3 | General | sklearn |
| `breast-cancer` | radius, texture | 2 | Healthcare | sklearn |
| `breast-cancer-full` | 30 features | 2 | Healthcare | sklearn |
| `digits-2d` | PCA-projected | 10 | General | sklearn |
| `digits-full` | 64 pixel features | 10 | General | sklearn |
| `titanic` | age, fare, sex, class | 2 | General | Kaggle |
| `penguins` | bill length, flipper | 3 | General | Kaggle |
| `heart-disease` | age, chol, HR | 2 | Healthcare | Kaggle |

### Classification, extended (3)

| Dataset | Features | Classes | Category | Source |
|---------|----------|---------|----------|--------|
| `adult-income` | age, education, hours | 2 | Finance | Kaggle |
| `mushroom` | cap, gill, stem | 2 | General | Kaggle |
| `wine-quality` | acidity, alcohol | 2 | General | Kaggle |

### Regression (8)

| Dataset | Features | Category | Source |
|---------|----------|----------|--------|
| `california-housing` | income, age | Housing | sklearn |
| `california-housing-full` | 8 features | Housing | sklearn |
| `california-housing-kaggle` | 4 features | Kaggle | Kaggle |
| `diabetes` | BMI, S5 | Healthcare | sklearn |
| `diabetes-full` | 10 features | Healthcare | sklearn |
| `diabetes-kaggle` | glucose, BMI, age | Healthcare | Kaggle |
| `insurance` | age, BMI, smoker | Finance | Kaggle |
| `concrete` | cement, water, age | Housing | Kaggle |

### Clustering (3)

| Dataset | Features | Clusters | Category | Source |
|---------|----------|----------|----------|--------|
| `mall-customers` | income, spending | 4 | Business | Kaggle |
| `wholesale-customers` | fresh, milk, grocery | 4 | Business | Kaggle |
| `seeds` | area, perimeter, compactness | 3 | General | Kaggle |

### Regression-Specific (1)

| Dataset | Description |
|---------|-------------|
| `sine` | sin(x) · cos(y) surface |

### Data Generators (7)

| Generator | Description |
|-----------|-------------|
| `spiral` | Interleaving spiral arms |
| `xor` | XOR pattern distribution |
| `gaussian` | Gaussian blob clusters |
| `moons` | Interleaving half circles |
| `circles` | Concentric circles |
| `linearly-separable` | Linearly separable |
| `swiss-roll` | Rolled manifold |

### Custom data

- CSV upload: drag and drop any CSV, map columns to features/target
- Custom points: click on canvas to place points with class labels
- Data Generator Studio: generate datasets with configurable parameters

---

## API reference

### Base URL

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:8000` |
| Docker | `http://backend:8000` |
| Production | `https://your-api-domain.com` |

### Endpoints

#### Health

```
GET /health
→ { "status": "ok", "version": "0.1.0" }
```

#### Classification (8 endpoints)

```
POST /api/classification/predict          → PredictionResponse
POST /api/classification/metrics          → ClassificationMetrics
POST /api/classification/cross-validation → CrossValidationResponse
POST /api/classification/coefficients     → CoefficientResponse
POST /api/classification/learning-curve   → LearningCurveResponse
POST /api/classification/sensitivity      → SensitivityResponse
POST /api/classification/decision-path    → DecisionPathResponse
GET  /api/classification/datasets         → DatasetListResponse
```

#### Regression (5 endpoints)

```
POST /api/regression/predict              → RegressionResponse
POST /api/regression/metrics              → RegressionMetricsResponse
POST /api/regression/learning-curve       → LearningCurveResponse
POST /api/regression/cross-validation     → CrossValidationResponse
GET  /api/regression/datasets             → DatasetListResponse
```

#### Clustering (3 endpoints)

```
POST /api/clustering/predict              → ClusteringResponse
POST /api/clustering/elbow                → ClusteringElbowResponse
GET  /api/clustering/datasets             → DatasetListResponse
```

#### Dimensionality Reduction (2 endpoints)

```
POST /api/dim-reduction/reduce            → DimReductionResponse
GET  /api/dim-reduction/algorithms        → AlgorithmListResponse
```

#### Datasets (4 endpoints)

```
POST /api/datasets/upload                 → UploadResponse
POST /api/datasets/map-columns            → ColumnMappingResponse
POST /api/datasets/custom                 → CustomPointsResponse
POST /api/datasets/recommend              → RecommendResponse
```

#### Datasets V2 (4 endpoints)

```
GET  /api/datasets/v2/datasets            → DatasetListV2Response
GET  /api/datasets/v2/datasets/{name}     → DatasetDetailV2Response
GET  /api/datasets/v2/categories          → CategoryListResponse
POST /api/datasets/v2/generate            → GeneratorResponse
```

#### Explain (3 endpoints)

```
POST /api/explain/prediction              → ExplainPredictionResponse
POST /api/explain/metric                  → ExplainMetricResponse
POST /api/explain/learning-tip            → LearningTipResponse
```

#### Training (1 endpoint + 2 WebSockets)

```
POST /api/training/wrong-predictions      → WrongPredictionsResponse
WS   /ws/training-playground              → Training frames with loss/weights
WS   /ws/tree-build                       → Tree construction steps
```

#### Compare (2 endpoints + 1 WebSocket)

```
POST /api/compare/hyperparameter-comparison → HyperparamComparisonResponse
POST /api/compare/benchmark               → BenchmarkResponse
WS   /ws/compare/race                     → Algorithm race frames
```

#### Tools (3 endpoints)

```
POST /api/tools/pca-explore               → PCAResponse
POST /api/tools/generate-code             → CodeResponse
```

#### Streaming (1 WebSocket)

```
WS   /ws/stream                           → Training animation frames
```

### Interactive API docs

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## Configuration

### Environment variables

| Variable | Service | Required | Default | Description |
|----------|---------|----------|---------|-------------|
| `CORS_ORIGINS` | Backend | Yes | `http://localhost:3000` | Comma-separated allowed origins |
| `REDIS_URL` | Backend | No | `redis://localhost:6379` | Redis URL (gracefully degrades) |
| `LOG_LEVEL` | Backend | No | `INFO` | Logging level |
| `NEXT_PUBLIC_API_URL` | Frontend | Yes | `http://localhost:8000` | Backend API URL |
| `NEXT_PUBLIC_WS_URL` | Frontend | No | `ws://localhost:8000` | WebSocket URL |

### Copy environment template

```bash
cp .env.example .env
```

---

## Verification & testing

### Commands

```bash
make typecheck      # Frontend TypeScript type checking
make lint           # Frontend ESLint
make test-backend   # Backend pytest (60 tests)
make install        # Install all dependencies
```

### CI pipeline

GitHub Actions runs on every push:
- Frontend job: `npm ci`, then lint, typecheck, build
- Backend job: `pip install`, then import validation

---

## Tech stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | Routing, SSR/CSR, deploy target |
| **Language** | TypeScript 5 | Frontend type safety |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **Components** | Radix UI | Accessible primitives (Tabs, Slider, Dialog, Tooltip) |
| **Animation** | Framer Motion | Boundary morphs, panel transitions |
| **3D** | Three.js + react-three-fiber | GP surfaces, 3D projections |
| **Client State** | Zustand 5 | Algorithm/hyperparameter state |
| **Data Fetching** | TanStack Query 5 | Caching, dedup, request lifecycle |
| **HTTP Client** | Axios | API communication |
| **Backend** | FastAPI 0.115 | Prediction, metrics, streaming endpoints |
| **ML** | scikit-learn 1.6 | Real model fitting and prediction |
| **Numerics** | numpy 2.2, scipy 1.15 | Grid evaluation, contour extraction |
| **Contours** | scikit-image 0.25 | Contour extraction via `find_contours` |
| **Caching** | Redis 7 (optional) | Memoized prediction grids |
| **Validation** | Pydantic 2.10 | Request/response contracts |
| **Type Safety** | openapi-typescript | Auto-generated FE/BE type contracts |
| **Containers** | Docker Compose | Local dev + production parity |
| **Testing** | pytest + httpx | Backend test suite |

---

## Performance & caching

### Redis caching

Prediction grids are cached with a deterministic key based on:
- Algorithm name
- Hyperparameters (sorted)
- Dataset name
- Grid resolution

Cache TTL: 1 hour (configurable). Redis is optional: the app works without it, with caching disabled.

### Async ML execution

All CPU-bound ML operations run through `asyncio.to_thread()`, so the event loop never blocks on model fitting.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, code quality standards, and templates for adding new algorithms, datasets, and visualizations.

### Community templates

- [New algorithm request](.github/ISSUE_TEMPLATE/new_algorithm.md): suggest a new algorithm
- [New dataset request](.github/ISSUE_TEMPLATE/new_dataset.md): suggest a new dataset
- [Feature request](.github/ISSUE_TEMPLATE/feature_request.md): suggest a feature

---

## License

MIT

---

<div align="center">

**[Getting Started](#getting-started)** · **[Features](#features)** · **[Architecture](#architecture)** · **[API Reference](#api-reference)** · **[Contributing](CONTRIBUTING.md)**

</div>
