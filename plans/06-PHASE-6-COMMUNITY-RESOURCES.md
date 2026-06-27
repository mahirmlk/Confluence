# Phase 6: Community & Resources — ML Roadmap, Community Contributions

## Goal
Build a structured learning roadmap beyond algorithms and create a contribution framework to grow the project as an open-source ML education platform.

**Dependencies:** Phases 1-5 (content builds on all features)

---

## 6A: ML Roadmap (Frontend + Content)

### Concept
A structured learning path that goes beyond algorithms: Statistics, Linear Algebra, Optimization, Feature Engineering, Evaluation, Model Selection, Deployment.

### Frontend: Roadmap Page

**File:** `frontend/src/app/resources/page.tsx` (new)

```
┌─────────────────────────────────────────────────────────┐
│ ML Roadmap                                                │
│                                                          │
│ A structured learning path from fundamentals to          │
│ production ML.                                            │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ 1. Statistics & Probability                         │  │
│ │    ├── Descriptive Statistics                       │  │
│ │    ├── Probability Distributions                    │  │
│ │    ├── Hypothesis Testing                           │  │
│ │    ├── Bayesian Thinking                            │  │
│ │    └── [Explore in Confluence →]                    │  │
│ │                                                     │  │
│ │ 2. Linear Algebra                                   │  │
│ │    ├── Vectors & Matrices                           │  │
│ │    ├── Eigenvalues & Eigenvectors                   │  │
│ │    ├── PCA (see PCA Explorer →)                     │  │
│ │    └── Matrix Decompositions                        │  │
│ │                                                     │  │
│ │ 3. Optimization                                     │  │
│ │    ├── Gradient Descent (see Training Playground →) │  │
│ │    ├── Loss Functions                               │  │
│ │    ├── Regularization                               │  │
│ │    └── Convex Optimization                          │  │
│ │                                                     │  │
│ │ 4. Feature Engineering                              │  │
│ │    ├── Scaling & Normalization                      │  │
│ │    ├── Encoding Categoricals                        │  │
│ │    ├── Feature Selection                            │  │
│ │    └── Dimensionality Reduction (PCA Explorer →)    │  │
│ │                                                     │  │
│ │ 5. Evaluation                                       │  │
│ │    ├── Classification Metrics (Explain Metrics →)   │  │
│ │    ├── Regression Metrics                           │  │
│ │    ├── Cross-Validation                             │  │
│ │    └── Bias-Variance Tradeoff                       │  │
│ │                                                     │  │
│ │ 6. Model Selection                                  │  │
│ │    ├── Algorithm Comparison (Algorithm Race →)      │  │
│ │    ├── Hyperparameter Tuning (Comparison →)         │  │
│ │    ├── Ensemble Methods                             │  │
│ │    └── AutoML Concepts                              │  │
│ │                                                     │  │
│ │ 7. Deployment                                       │  │
│ │    ├── Model Serialization                          │  │
│ │    ├── API Design                                   │  │
│ │    ├── Monitoring & Drift                           │  │
│ │    └── MLOps Basics                                 │  │
│ └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Frontend: Topic Detail Pages

Each topic links to relevant Confluence features and external resources.

**File:** `frontend/src/app/resources/[topic]/page.tsx` (new)

```
┌─────────────────────────────────────────────────────────┐
│ Gradient Descent                                          │
│                                                          │
│ Category: Optimization                                    │
│ Difficulty: Intermediate                                  │
│                                                          │
│ What is Gradient Descent?                                 │
│ Gradient descent is an optimization algorithm that        │
│ iteratively adjusts model parameters to minimize a loss   │
│ function. At each step, it computes the gradient of the   │
│ loss with respect to the parameters and moves in the      │
│ direction of steepest descent.                            │
│                                                          │
│ Try it in Confluence:                                     │
│ [Open Training Playground with Logistic Regression →]     │
│ [Watch gradient descent on the moons dataset →]           │
│                                                          │
│ Key Concepts:                                             │
│ • Learning Rate: Controls step size                       │
│ • Convergence: When updates become negligibly small       │
│ • Local vs Global Minima                                  │
│ • Stochastic vs Batch vs Mini-batch                       │
│                                                          │
│ Related Algorithms:                                       │
│ • Logistic Regression (uses gradient descent)             │
│ • Neural Networks (backpropagation = gradient descent)    │
│ • SVM (quadratic optimization)                            │
│                                                          │
│ External Resources:                                       │
│ • 3Blue1Brown: Gradient Descent                           │
│ • Stanford CS229: Optimization                            │
│ • Deep Learning Book: Chapter 4                           │
└─────────────────────────────────────────────────────────┘
```

### Content Structure

```typescript
interface RoadmapTopic {
  id: string;
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  keyConcepts: string[];
  confluenceLinks: { label: string; href: string }[];
  relatedAlgorithms: string[];
  externalResources: { title: string; url: string }[];
  prerequisites: string[];
}
```

### Integration
- Main navigation: "Resources" link in navbar
- Each algorithm encyclopedia page links to relevant roadmap topics
- Training playground links to "Optimization" topic
- PCA Explorer links to "Linear Algebra" topic
- Metrics panels link to "Evaluation" topic

---

## 6B: Community Contributions (Docs + Templates)

### Contribution Templates

**File:** `CONTRIBUTING.md` (update existing)

Expand with specific templates for:

#### Adding a New Algorithm
```markdown
## Adding a New Algorithm

### Backend
1. Create algorithm wrapper in `backend/app/algorithms/`
2. Add to appropriate ALGORITHMS dict
3. Add hyperparameter config
4. Add tests

### Frontend
1. Add algorithm config to `store/index.ts` ALGORITHMS array
2. Add hyperparameter config to HYPERPARAMETER_CONFIGS
3. Update FAMILY_DATASETS if needed
4. Add to algorithm encyclopedia page

### Template
```python
# backend/app/algorithms/new_algorithm.py
from sklearn.xxx import XxxClassifier

NEW_ALGORITHM = {
    "new-algorithm": lambda params: XxxClassifier(
        param1=params.get("param1", default),
        random_state=42,
    ),
}
```
```

#### Adding a New Dataset
```markdown
## Adding a New Dataset

### Option 1: sklearn built-in
1. Add loader to `backend/app/datasets/`
2. Register in registry
3. Add metadata

### Option 2: CSV dataset
1. Add CSV to `backend/app/datasets/data/`
2. Create loader with preprocessing
3. Register in registry
4. Add metadata and story
```

#### Adding a New Visualization
```markdown
## Adding a New Visualization

1. Create component in `frontend/src/components/`
2. Add API endpoint if needed
3. Wire into main app page
4. Add tests
```

### Plugin Architecture

Design a plugin-like system for community contributions:

```python
# backend/app/plugins/__init__.py
class AlgorithmPlugin:
    """Base class for algorithm plugins."""
    name: str
    family: str
    description: str

    def create_model(self, params: dict) -> object: ...
    def get_hyperparameters(self) -> list[dict]: ...
    def get_description(self) -> str: ...

class DatasetPlugin:
    """Base class for dataset plugins."""
    name: str
    family: str
    description: str

    def load(self) -> tuple[np.ndarray, np.ndarray]: ...
    def get_metadata(self) -> dict: ...
```

### Community Templates

**File:** `.github/ISSUE_TEMPLATE/new_algorithm.md`
```markdown
---
name: New Algorithm Request
about: Suggest a new algorithm for Confluence
title: '[Algorithm] '
labels: enhancement
---

**Algorithm Name:** 
**Family:** (classification / regression / clustering / dim-reduction)
**sklearn class:** 
**Description:** 
**Why add this?** 
**Educational value:** 
```

**File:** `.github/ISSUE_TEMPLATE/new_dataset.md`
```markdown
---
name: New Dataset Request
about: Suggest a new dataset for Confluence
title: '[Dataset] '
labels: enhancement
---

**Dataset Name:** 
**Source:** 
**Task:** (classification / regression / clustering)
**Size:** (rows × columns)
**License:** 
**Description:** 
```

**File:** `.github/PULL_REQUEST_TEMPLATE.md`
```markdown
## Description
What does this PR add?

## Type
- [ ] New algorithm
- [ ] New dataset
- [ ] New visualization
- [ ] Bug fix
- [ ] Documentation

## Checklist
- [ ] Backend tests pass
- [ ] Frontend typecheck passes
- [ ] Frontend lint passes
- [ ] Documentation updated
- [ ] No breaking changes
```

### Plugin Loading

```python
# backend/app/plugins/loader.py
import importlib
import os

def load_plugins():
    """Load algorithm/dataset plugins from plugins directory."""
    plugin_dir = os.path.join(os.path.dirname(__file__), "community")
    if not os.path.exists(plugin_dir):
        return

    for filename in os.listdir(plugin_dir):
        if filename.endswith(".py") and not filename.startswith("_"):
            module = importlib.import_module(f".community.{filename[:-1]}", package="app.plugins")
            # Register any AlgorithmPlugin or DatasetPlugin subclasses
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                if isinstance(attr, type) and issubclass(attr, AlgorithmPlugin) and attr is not AlgorithmPlugin:
                    register_algorithm_plugin(attr())
                if isinstance(attr, type) and issubclass(attr, DatasetPlugin) and attr is not DatasetPlugin:
                    register_dataset_plugin(attr())
```

### Community Showcase

**File:** `frontend/src/app/community/page.tsx` (new)

```
┌─────────────────────────────────────────────────────────┐
│ Community Contributions                                   │
│                                                          │
│ Algorithms contributed by the community.                  │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ XGBoost Classifier                                   │  │
│ │ Contributed by: @username                            │  │
│ │ Family: Classification (Boosting)                    │  │
│ │ Description: Extreme Gradient Boosting               │  │
│ │ [Try it →] [View code →]                            │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Titanic Dataset                                      │  │
│ │ Contributed by: @username                            │  │
│ │ Task: Binary Classification                          │  │
│ │ Description: Predict survival on the Titanic         │  │
│ │ [Explore →] [View preprocessing →]                   │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                          │
│ Want to contribute?                                       │
│ [Read the Guide →] [Submit a PR →]                       │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 6 Verification

- [ ] Roadmap page renders all 7 categories
- [ ] Each topic links to relevant Confluence features
- [ ] Topic detail pages show content and links
- [ ] Navigation includes "Resources" link
- [ ] CONTRIBUTING.md updated with templates
- [ ] GitHub issue templates created
- [ ] PR template created
- [ ] Plugin architecture documented
- [ ] Community showcase page created
- [ ] All existing features still work
