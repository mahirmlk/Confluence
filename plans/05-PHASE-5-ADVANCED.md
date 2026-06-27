# Phase 5: Advanced — PCA Explorer, Code Generator, AI Assistant

## Goal
Add deep-dive tools for dimensionality reduction, code export for reproducibility, and an AI assistant for contextual learning. These are the "wow" features that make Confluence a complete ML education platform.

**Dependencies:** Phases 1-4

---

## 5A: PCA Explorer (Backend + Frontend)

### Concept
A dedicated, rich visualization for PCA and dimensionality reduction that shows the full pipeline: original data → projection → eigenvectors → variance explained.

### Backend

**File:** `backend/app/algorithms/pca_explorer.py` (new)

```python
class PCAExplorer:
    """Rich PCA analysis with full decomposition details."""

    @staticmethod
    def full_pca_analysis(X: np.ndarray, y: np.ndarray, feature_names: list[str], n_components: int = 2) -> dict:
        from sklearn.decomposition import PCA

        # Full PCA (all components)
        pca_full = PCA()
        X_full = pca_full.fit_transform(X)

        # Selected components PCA
        pca_k = PCA(n_components=n_components)
        X_k = pca_k.fit_transform(X_k)

        # Eigenvectors (loadings)
        loadings = pca_full.components_  # (n_components, n_features)

        # Variance explained
        var_explained = pca_full.explained_variance_ratio_
        cumvar = np.cumsum(var_explained)

        # Feature contributions to each PC
        feature_contributions = []
        for pc_idx in range(n_components):
            contributions = []
            for feat_idx, feat_name in enumerate(feature_names):
                contributions.append({
                    "feature": feat_name,
                    "loading": round(float(loadings[pc_idx, feat_idx]), 4),
                    "abs_loading": round(float(abs(loadings[pc_idx, feat_idx])), 4),
                })
            contributions.sort(key=lambda x: x["abs_loading"], reverse=True)
            feature_contributions.append({
                "pc": pc_idx + 1,
                "variance_explained": round(float(var_explained[pc_idx]), 4),
                "contributions": contributions,
            })

        return {
            "embedding": X_k.tolist(),
            "original_data": X.tolist(),
            "labels": y.tolist(),
            "feature_names": feature_names,
            "n_components": n_components,
            "total_variance_explained": round(float(cumvar[n_components - 1]), 4),
            "variance_per_component": [round(float(v), 4) for v in var_explained],
            "cumulative_variance": [round(float(v), 4) for v in cumvar],
            "eigenvectors": loadings[:n_components].tolist(),
            "feature_contributions": feature_contributions,
            "singular_values": pca_full.singular_values_.tolist(),
        }

    @staticmethod
    def reconstruct_from_components(X_transformed: np.ndarray, pca_model, n_components: int) -> np.ndarray:
        """Reconstruct data using only top n_components."""
        X_reduced = X_transformed[:, :n_components]
        return pca_model.inverse_transform(X_reduced)
```

### New Endpoint

```python
@router.post("/api/v2/pca-explore")
async def pca_explore(request: PCAExploreRequest):
    """Full PCA analysis with decomposition details."""
    X, y = generate_dataset(request.dataset_name, ...)
    feature_names = get_feature_names(request.dataset_name)
    result = PCAExplorer.full_pca_analysis(X, y, feature_names, request.n_components)
    return result
```

### Frontend: PCA Explorer

**File:** `frontend/src/components/pca/PCAExplorer.tsx` (new)

```
┌─────────────────────────────────────────────────────────┐
│ PCA Explorer                                              │
│                                                          │
│ Dataset: [Iris ▼]  Components: [2 ▼]                     │
│                                                          │
│ ┌─────────────────────┐  ┌─────────────────────────┐    │
│ │  Original Data      │  │  PCA Projection         │    │
│ │  (first 2 features) │  │  (PC1 vs PC2)           │    │
│ │                     │  │                         │    │
│ │  [scatter plot]     │  │  [scatter plot with     │    │
│ │                     │  │   colored classes]       │    │
│ │                     │  │                         │    │
│ └─────────────────────┘  └─────────────────────────┘    │
│                                                          │
│ ┌─────────────────────┐  ┌─────────────────────────┐    │
│ │  Variance Explained │  │  Eigenvectors (Loadings)│    │
│ │                     │  │                         │    │
│ │  PC1: 72.9% ███████ │  │  PC1:                   │    │
│ │  PC2: 22.8% ███     │  │    petal_length: +0.85  │    │
│ │  PC3: 3.7%  █       │  │    petal_width:  +0.78  │    │
│ │  PC4: 0.5%          │  │    sepal_length: +0.35  │    │
│ │                     │  │    sepal_width:  -0.12  │    │
│ │  Cumulative:        │  │                         │    │
│ │  2 components: 95.7%│  │  PC2:                   │    │
│ │                     │  │    sepal_width:  +0.72  │    │
│ └─────────────────────┘  └─────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Scree Plot (Variance per Component)                  │  │
│ │                                                      │  │
│ │ 72.9% ┌───┐                                          │  │
│ │       │   │                                          │  │
│ │ 22.8% │   │ ┌───┐                                    │  │
│ │       │   │ │   │                                    │  │
│ │  3.7% │   │ │   │ ┌───┐                              │  │
│ │  0.5% │   │ │   │ │   │ ┌───┐                        │  │
│ │       └───┘ └───┘ └───┘ └───┘                        │  │
│ │        PC1   PC2   PC3   PC4                         │  │
│ └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Sub-Components

**File:** `frontend/src/components/pca/VarianceChart.tsx` (new)
- Bar chart of variance per component
- Cumulative line overlay
- Color-coded by importance

**File:** `frontend/src/components/pca/LoadingsTable.tsx` (new)
- Table of feature loadings per PC
- Sortable by absolute loading
- Color-coded: positive (blue), negative (red)

**File:** `frontend/src/components/pca/ProjectionCanvas.tsx` (new)
- 2D/3D scatter of PCA projection
- Color by class
- Click point to see original features

---

## 5B: Code Generator (Backend + Frontend)

### Concept
After building a model with the UI, export equivalent Python code that reproduces the exact configuration. Huge educational value — users learn the code by visual experimentation.

### Backend

**File:** `backend/app/algorithms/code_generator.py` (new)

```python
class CodeGenerator:
    """Generate Python code matching the current UI configuration."""

    @staticmethod
    def generate_classification_code(algorithm: str, params: dict, dataset_name: str, hyperparams: dict) -> str:
        algo_imports = {
            "logistic-regression": "from sklearn.linear_model import LogisticRegression",
            "knn": "from sklearn.neighbors import KNeighborsClassifier",
            "decision-tree": "from sklearn.tree import DecisionTreeClassifier",
            "rbf-svm": "from sklearn.svm import SVC",
            "linear-svm": "from sklearn.svm import SVC",
            "random-forest": "from sklearn.ensemble import RandomForestClassifier",
            "gradient-boosting": "from sklearn.ensemble import GradientBoostingClassifier",
            "mlp": "from sklearn.neural_network import MLPClassifier",
            # ... more
        }

        dataset_code = {
            "blobs": "from sklearn.datasets import make_blobs\nX, y = make_blobs(n_samples=300, centers=2, random_state=42)",
            "moons": "from sklearn.datasets import make_moons\nX, y = make_moons(n_samples=300, noise=0.1, random_state=42)",
            "iris": "from sklearn.datasets import load_iris\ndata = load_iris()\nX, y = data.data[:, [2, 3]], data.target",
            # ... more
        }

        algo_class = CodeGenerator._get_algo_class(algorithm)
        param_str = CodeGenerator._format_params(hyperparams)

        code = f'''import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
{algo_imports.get(algorithm, f"# {algorithm}")}

# Load dataset
{dataset_code.get(dataset_name, f"# Load {dataset_name}")}

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create model
model = {algo_class}({param_str})

# Train
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Evaluate
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {{accuracy:.4f}}")
print(classification_report(y_test, y_pred))
'''
        return code

    @staticmethod
    def _get_algo_class(algorithm: str) -> str:
        classes = {
            "logistic-regression": "LogisticRegression",
            "knn": "KNeighborsClassifier",
            "decision-tree": "DecisionTreeClassifier",
            "rbf-svm": "SVC(kernel='rbf', probability=True)",
            "random-forest": "RandomForestClassifier",
            "gradient-boosting": "GradientBoostingClassifier",
            "mlp": "MLPClassifier",
        }
        return classes.get(algorithm, algorithm)

    @staticmethod
    def _format_params(params: dict) -> str:
        if not params:
            return ""
        parts = []
        for k, v in params.items():
            if isinstance(v, str):
                parts.append(f"{k}='{v}'")
            else:
                parts.append(f"{k}={v}")
        return ", ".join(parts)
```

### New Endpoint

```python
@router.post("/api/v2/generate-code")
async def generate_code(request: GenerateCodeRequest):
    """Generate Python code matching current UI configuration."""
    code = CodeGenerator.generate_classification_code(
        request.algorithm, {}, request.dataset_name, request.hyperparameters
    )
    return {"code": code, "language": "python"}
```

### Frontend: Code Generator Panel

**File:** `frontend/src/components/code/CodeGenerator.tsx` (new)

```
┌─────────────────────────────────────┐
│ Code Generator                       │
│                                      │
│ Current Configuration:               │
│ Algorithm: Decision Tree             │
│ Dataset: Moons                       │
│ max_depth: 5                         │
│                                      │
│ [Copy] [Download .py] [Open in Colab]│
│                                      │
│ ┌─────────────────────────────────┐  │
│ │ import numpy as np              │  │
│ │ from sklearn.tree import        │  │
│ │   DecisionTreeClassifier        │  │
│ │ from sklearn.datasets import    │  │
│ │   make_moons                    │  │
│ │ from sklearn.model_selection    │  │
│ │   import train_test_split       │  │
│ │                                 │  │
│ │ X, y = make_moons(             │  │
│ │   n_samples=300, noise=0.1,    │  │
│ │   random_state=42              │  │
│ │ )                               │  │
│ │                                 │  │
│ │ X_train, X_test, y_train, ...  │  │
│ │                                 │  │
│ │ model = DecisionTreeClassifier( │  │
│ │   max_depth=5, random_state=42  │  │
│ │ )                               │  │
│ │                                 │  │
│ │ model.fit(X_train, y_train)    │  │
│ │ y_pred = model.predict(X_test) │  │
│ │                                 │  │
│ │ print(f"Accuracy:              │  │
│ │   {accuracy_score(y_test,      │  │
│ │     y_pred):.4f}")              │  │
│ └─────────────────────────────────┘  │
│                                      │
│ Syntax Highlighted Python            │
└─────────────────────────────────────┘
```

### Features
- Auto-updates when algorithm/hyperparameters change
- Copy to clipboard
- Download as .py file
- "Open in Google Colab" link (pre-filled notebook)
- Syntax highlighting with highlight.js or Prism
- Includes visualization code (decision boundary plot)

---

## 5C: AI Assistant (Backend + Frontend)

### Concept
An in-app AI assistant that can answer questions about the current visualization, explain why algorithms behave differently, and provide contextual learning.

### Backend

**File:** `backend/app/routers/assistant.py` (new)

```python
@router.post("/api/v2/assistant/chat")
async def assistant_chat(request: AssistantRequest):
    """AI assistant for contextual ML explanations."""
    # Gather context from current state
    context = build_context(request.context)

    # Build prompt
    system_prompt = """You are an ML education assistant for Confluence, an interactive ML visualization platform.
    The user is currently exploring algorithms and datasets. Answer questions about:
    - Why an algorithm behaves a certain way
    - How to interpret visualizations
    - What hyperparameters do
    - Algorithm comparisons
    - Best practices

    Keep answers concise (3-5 paragraphs max) and educational.
    Reference the specific visualization the user is looking at."""

    # Call LLM (configurable: OpenAI, Anthropic, local)
    response = await call_llm(
        system=system_prompt,
        user=request.message,
        context=context,
    )

    return {"response": response, "context_used": context}


def build_context(state: dict) -> str:
    """Build context string from current app state."""
    parts = []
    if "algorithm" in state:
        parts.append(f"Current algorithm: {state['algorithm']}")
    if "dataset" in state:
        parts.append(f"Current dataset: {state['dataset']}")
    if "hyperparameters" in state:
        parts.append(f"Hyperparameters: {state['hyperparameters']}")
    if "metrics" in state:
        parts.append(f"Current metrics: accuracy={state['metrics'].get('accuracy', 'N/A')}")
    if "question_type" in state:
        parts.append(f"User is asking about: {state['question_type']}")
    return "\n".join(parts)
```

### Configuration

```python
# backend/app/llm_config.py
import os

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")  # "openai", "anthropic", "local"
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

async def call_llm(system: str, user: str, context: str) -> str:
    """Call configured LLM provider."""
    if LLM_PROVIDER == "openai":
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {LLM_API_KEY}"},
                json={
                    "model": LLM_MODEL,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {user}"},
                    ],
                },
            )
            return resp.json()["choices"][0]["message"]["content"]
    # ... other providers
```

### Frontend: AI Assistant Chat

**File:** `frontend/src/components/assistant/AIAssistant.tsx` (new)

```
┌─────────────────────────────────────┐
│ AI Assistant                         │
│                                      │
│ ┌─────────────────────────────────┐  │
│ │ 💬 Chat History                 │  │
│ │                                 │  │
│ │ User: Why did Random Forest     │  │
│ │ outperform Logistic Regression  │  │
│ │ on the moons dataset?           │  │
│ │                                 │  │
│ │ AI: Great question! Looking at  │  │
│ │ your current visualization:     │  │
│ │                                 │  │
│ │ The moons dataset has a         │  │
│ │ non-linear decision boundary    │  │
│ │ (two interleaving half-circles).│  │
│ │                                 │  │
│ │ Logistic Regression can only    │  │
│ │ learn linear boundaries, so it  │  │
│ │ misclassifies points near the   │  │
│ │ intersection. You can see the   │  │
│ │ straight line cutting through   │  │
│ │ both moons.                     │  │
│ │                                 │  │
│ │ Random Forest uses multiple     │  │
│ │ decision trees, each capturing  │  │
│ │ different parts of the curved   │  │
│ │ boundary. The ensemble vote     │  │
│ │ creates a smooth, non-linear    │  │
│ │ boundary that follows the moon  │  │
│ │ shapes.                         │  │
│ │                                 │  │
│ │ Try adjusting the RF's          │  │
│ │ n_estimators to see how more    │  │
│ │ trees improve the boundary.     │  │
│ └─────────────────────────────────┘  │
│                                      │
│ ┌─────────────────────────────────┐  │
│ │ Ask a question...        [Send] │  │
│ └─────────────────────────────────┘  │
│                                      │
│ Quick Questions:                     │
│ [Why this boundary?] [Compare algos] │
│ [What does this metric mean?]        │
└─────────────────────────────────────┘
```

### Features
- Context-aware: knows current algorithm, dataset, hyperparameters, metrics
- Quick question buttons for common queries
- Chat history within session
- "Explain this boundary" — sends current visualization context
- "Why did X outperform Y?" — compares current algorithms
- Streaming responses for long answers
- Graceful fallback if LLM API is unavailable

### Quick Questions
```typescript
const QUICK_QUESTIONS = [
  "Why is the decision boundary shaped like this?",
  "Why did {bestAlgorithm} outperform {worstAlgorithm}?",
  "What does {selectedMetric} mean?",
  "How can I improve the accuracy?",
  "What happens if I change {selectedParam}?",
  "Is this model overfitting or underfitting?",
  "Which algorithm should I try next?",
];
```

---

## Phase 5 Verification

- [ ] PCA Explorer shows original data and projection side by side
- [ ] Variance explained chart is accurate
- [ ] Eigenvector loadings table is correct
- [ ] Scree plot renders correctly
- [ ] Code generator produces valid Python for all algorithms
- [ ] Code updates when configuration changes
- [ ] Copy/download code works
- [ ] AI assistant responds with context-aware answers
- [ ] Quick questions work
- [ ] Chat history persists during session
- [ ] Graceful fallback when LLM API unavailable
- [ ] All existing features still work
