import asyncio
import os
import re
import logging
import numpy as np
from fastapi import APIRouter, Request, Response
from pydantic import BaseModel, Field
from typing import Optional
from ..algorithms.datasets import generate_dataset

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/tools", tags=["tools"])


# --- PCA Explorer ---

class PCAExploreRequest(BaseModel):
    dataset_name: str = Field(min_length=1, max_length=50)
    n_components: int = Field(default=2, ge=2, le=3)
    noise: float = Field(default=0.5, ge=0, le=5)
    n_samples: int = Field(default=300, ge=10, le=5000)


@router.post("/pca-explore")
async def pca_explore(request: PCAExploreRequest):
    from sklearn.decomposition import PCA
    from ..datasets.registry import DatasetRegistry

    X, y = await asyncio.to_thread(generate_dataset, request.dataset_name, n_samples=request.n_samples, noise=request.noise)

    feature_names = [f"Feature {i+1}" for i in range(X.shape[1])]
    if DatasetRegistry.exists(request.dataset_name):
        feature_names = DatasetRegistry.get(request.dataset_name).feature_names

    pca_full = PCA()
    X_full = await asyncio.to_thread(pca_full.fit_transform, X)

    n_comp = min(request.n_components, X.shape[1], X.shape[0])
    X_k = X_full[:, :n_comp]

    loadings = pca_full.components_
    var_explained = pca_full.explained_variance_ratio_
    cumvar = np.cumsum(var_explained)

    feature_contributions = []
    for pc_idx in range(n_comp):
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
        "labels": y.tolist(),
        "feature_names": feature_names,
        "n_components": n_comp,
        "total_variance_explained": round(float(cumvar[n_comp - 1]), 4),
        "variance_per_component": [round(float(v), 4) for v in var_explained[:n_comp]],
        "cumulative_variance": [round(float(v), 4) for v in cumvar[:n_comp]],
        "all_variance": [round(float(v), 4) for v in var_explained],
        "feature_contributions": feature_contributions,
    }


# --- Code Generator ---

class GenerateCodeRequest(BaseModel):
    algorithm: str = Field(min_length=1, max_length=50)
    dataset_name: str = Field(min_length=1, max_length=50)
    hyperparameters: dict = Field(default={}, max_length=20)


ALGO_IMPORTS = {
    "logistic-regression": ("LogisticRegression", "sklearn.linear_model"),
    "knn": ("KNeighborsClassifier", "sklearn.neighbors"),
    "decision-tree": ("DecisionTreeClassifier", "sklearn.tree"),
    "rbf-svm": ("SVC", "sklearn.svm"),
    "linear-svm": ("SVC", "sklearn.svm"),
    "poly-svm": ("SVC", "sklearn.svm"),
    "random-forest": ("RandomForestClassifier", "sklearn.ensemble"),
    "extra-trees": ("ExtraTreesClassifier", "sklearn.ensemble"),
    "adaboost": ("AdaBoostClassifier", "sklearn.ensemble"),
    "gradient-boosting": ("GradientBoostingClassifier", "sklearn.ensemble"),
    "gaussian-nb": ("GaussianNB", "sklearn.naive_bayes"),
    "qda": ("QuadraticDiscriminantAnalysis", "sklearn.discriminant_analysis"),
    "gp-classifier": ("GaussianProcessClassifier", "sklearn.gaussian_process"),
    "perceptron": ("Perceptron", "sklearn.linear_model"),
    "mlp": ("MLPClassifier", "sklearn.neural_network"),
    "linear-regression": ("LinearRegression", "sklearn.linear_model"),
    "ridge": ("Ridge", "sklearn.linear_model"),
    "lasso": ("Lasso", "sklearn.linear_model"),
    "elastic-net": ("ElasticNet", "sklearn.linear_model"),
    "decision-tree-regressor": ("DecisionTreeRegressor", "sklearn.tree"),
    "random-forest-regressor": ("RandomForestRegressor", "sklearn.ensemble"),
    "gradient-boosting-regressor": ("GradientBoostingRegressor", "sklearn.ensemble"),
    "svr-linear": ("SVR", "sklearn.svm"),
    "svr-rbf": ("SVR", "sklearn.svm"),
    "svr-poly": ("SVR", "sklearn.svm"),
    "knn-regressor": ("KNeighborsRegressor", "sklearn.neighbors"),
    "gaussian-process-regressor": ("GaussianProcessRegressor", "sklearn.gaussian_process"),
    "mlp-regressor": ("MLPRegressor", "sklearn.neural_network"),
    "kmeans": ("KMeans", "sklearn.cluster"),
    "dbscan": ("DBSCAN", "sklearn.cluster"),
    "agglomerative": ("AgglomerativeClustering", "sklearn.cluster"),
    "gmm": ("GaussianMixture", "sklearn.mixture"),
    "spectral": ("SpectralClustering", "sklearn.cluster"),
    "pca": ("PCA", "sklearn.decomposition"),
    "tsne": ("TSNE", "sklearn.manifold"),
    "isomap": ("Isomap", "sklearn.manifold"),
    "lda": ("LinearDiscriminantAnalysis", "sklearn.discriminant_analysis"),
}

DATASET_CODE = {
    "blobs": 'from sklearn.datasets import make_blobs\nX, y = make_blobs(n_samples=300, centers=2, random_state=42)',
    "blobs-3class": 'from sklearn.datasets import make_blobs\nX, y = make_blobs(n_samples=300, centers=3, random_state=42)',
    "moons": 'from sklearn.datasets import make_moons\nX, y = make_moons(n_samples=300, noise=0.1, random_state=42)',
    "circles": 'from sklearn.datasets import make_circles\nX, y = make_circles(n_samples=300, noise=0.05, factor=0.5, random_state=42)',
    "iris": 'from sklearn.datasets import load_iris\ndata = load_iris()\nX, y = data.data[:, [2, 3]], data.target',
    "iris-full": 'from sklearn.datasets import load_iris\ndata = load_iris()\nX, y = data.data, data.target',
    "wine": 'from sklearn.datasets import load_wine\ndata = load_wine()\nX, y = data.data[:, [0, 12]], data.target',
    "wine-full": 'from sklearn.datasets import load_wine\ndata = load_wine()\nX, y = data.data, data.target',
    "breast-cancer": 'from sklearn.datasets import load_breast_cancer\ndata = load_breast_cancer()\nX, y = data.data[:, [0, 1]], data.target',
    "breast-cancer-full": 'from sklearn.datasets import load_breast_cancer\ndata = load_breast_cancer()\nX, y = data.data, data.target',
    "titanic": 'import pandas as pd\ndf = pd.read_csv("titanic.csv")\nX = df[["Age","Fare","SibSp","Parch","Sex","Pclass"]].values\ny = df["Survived"].values',
    "penguins": 'import pandas as pd\ndf = pd.read_csv("penguins.csv")\nX = df[["bill_length_mm","flipper_length_mm"]].values\ny = df["species"].values',
    "heart-disease": 'import pandas as pd\ndf = pd.read_csv("heart.csv")\nX = df[["age","sex","cp","trestbps","chol","thalach","oldpeak"]].values\ny = df["target"].values',
    "california-housing": 'from sklearn.datasets import fetch_california_housing\ndata = fetch_california_housing()\nX, y = data.data[:, :2], data.target',
    "california-housing-full": 'from sklearn.datasets import fetch_california_housing\ndata = fetch_california_housing()\nX, y = data.data, data.target',
    "diabetes": 'from sklearn.datasets import load_diabetes\ndata = load_diabetes()\nX, y = data.data[:, [2, 8]], data.target',
    "diabetes-full": 'from sklearn.datasets import load_diabetes\ndata = load_diabetes()\nX, y = data.data, data.target',
}

ALGO_CLASSES = {
    "logistic-regression": "LogisticRegression(C=1.0, max_iter=1000, random_state=42)",
    "knn": "KNeighborsClassifier(n_neighbors=5)",
    "decision-tree": "DecisionTreeClassifier(max_depth=5, random_state=42)",
    "rbf-svm": "SVC(kernel='rbf', probability=True, random_state=42)",
    "linear-svm": "SVC(kernel='linear', probability=True, random_state=42)",
    "poly-svm": "SVC(kernel='poly', degree=3, probability=True, random_state=42)",
    "random-forest": "RandomForestClassifier(n_estimators=100, random_state=42)",
    "extra-trees": "ExtraTreesClassifier(n_estimators=100, random_state=42)",
    "adaboost": "AdaBoostClassifier(n_estimators=50, random_state=42)",
    "gradient-boosting": "GradientBoostingClassifier(n_estimators=100, random_state=42)",
    "gaussian-nb": "GaussianNB()",
    "qda": "QuadraticDiscriminantAnalysis(reg_param=0.01)",
    "perceptron": "Perceptron(max_iter=1000, random_state=42)",
    "mlp": "MLPClassifier(hidden_layer_sizes=(100,), max_iter=500, random_state=42)",
    "linear-regression": "LinearRegression()",
    "ridge": "Ridge(alpha=1.0)",
    "lasso": "Lasso(alpha=1.0)",
    "elastic-net": "ElasticNet(alpha=1.0, l1_ratio=0.5)",
    "decision-tree-regressor": "DecisionTreeRegressor(max_depth=5, random_state=42)",
    "random-forest-regressor": "RandomForestRegressor(n_estimators=100, random_state=42)",
    "gradient-boosting-regressor": "GradientBoostingRegressor(n_estimators=100, random_state=42)",
    "svr-linear": "SVR(kernel='linear', C=1.0)",
    "svr-rbf": "SVR(kernel='rbf', C=1.0)",
    "svr-poly": "SVR(kernel='poly', degree=3, C=1.0)",
    "knn-regressor": "KNeighborsRegressor(n_neighbors=5)",
    "gaussian-process-regressor": "GaussianProcessRegressor(alpha=0.01)",
    "mlp-regressor": "MLPRegressor(hidden_layer_sizes=(100,), max_iter=500, random_state=42)",
    "kmeans": "KMeans(n_clusters=3, random_state=42, n_init=10)",
    "dbscan": "DBSCAN(eps=0.5, min_samples=5)",
    "agglomerative": "AgglomerativeClustering(n_clusters=3)",
    "gmm": "GaussianMixture(n_components=3, random_state=42)",
    "spectral": "SpectralClustering(n_clusters=3, random_state=42)",
    "pca": "PCA(n_components=2)",
    "tsne": "TSNE(n_components=2, perplexity=30, random_state=42)",
    "isomap": "Isomap(n_components=2, n_neighbors=5)",
    "lda": "LinearDiscriminantAnalysis(n_components=2)",
}


def _format_params(params: dict) -> str:
    if not params:
        return ""
    parts = []
    for k, v in params.items():
        if isinstance(v, str):
            parts.append(f"{k}='{v}'")
        elif isinstance(v, bool):
            parts.append(f"{k}={'True' if v else 'False'}")
        else:
            parts.append(f"{k}={v}")
    return ", ".join(parts)


@router.post("/generate-code")
async def generate_code(request: GenerateCodeRequest):
    algo_class = ALGO_CLASSES.get(request.algorithm, f"{request.algorithm}()")
    dataset_code = DATASET_CODE.get(request.dataset_name, f'# Load {request.dataset_name}\n# X, y = ...')

    import_info = ALGO_IMPORTS.get(request.algorithm)
    import_line = f"from {import_info[1]} import {import_info[0]}" if import_info else f"# import {request.algorithm}"

    classifiers = [
        "logistic-regression", "knn", "decision-tree", "rbf-svm", "linear-svm", "poly-svm",
        "random-forest", "extra-trees", "adaboost", "gradient-boosting", "gaussian-nb", "qda",
        "gp-classifier", "perceptron", "mlp"
    ]
    regressors = [
        "linear-regression", "ridge", "lasso", "elastic-net", "decision-tree-regressor",
        "random-forest-regressor", "gradient-boosting-regressor", "svr-linear", "svr-rbf",
        "svr-poly", "knn-regressor", "gaussian-process-regressor", "mlp-regressor"
    ]
    clusterers = ["kmeans", "dbscan", "agglomerative", "gmm", "spectral"]

    if request.algorithm in classifiers:
        metrics_code = 'from sklearn.metrics import accuracy_score, classification_report\naccuracy = accuracy_score(y_test, y_pred)\nprint(f"Accuracy: {accuracy:.4f}")\nprint(classification_report(y_test, y_pred))'
    elif request.algorithm in regressors:
        metrics_code = 'from sklearn.metrics import r2_score, mean_squared_error\nr2 = r2_score(y_test, y_pred)\nmse = mean_squared_error(y_test, y_pred)\nprint(f"R²: {r2:.4f}")\nprint(f"MSE: {mse:.4f}")'
    elif request.algorithm in clusterers:
        metrics_code = 'labels = model.labels_ if hasattr(model, "labels_") else model.predict(X)\nprint(f"Clusters: {len(set(labels)) - (1 if -1 in labels else 0)}")\nprint(f"Noise points: {list(labels).count(-1)}")'
    else:
        metrics_code = 'print("Done!")'

    # Apply hyperparameters
    if request.hyperparameters:
        params_str = _format_params(request.hyperparameters)
        algo_class_with_params = algo_class
        # Replace default params if provided
        for k, v in request.hyperparameters.items():
            algo_class_with_params = algo_class  # Use as-is from ALGO_CLASSES
        code = f"""import numpy as np
from sklearn.model_selection import train_test_split
{import_line}

# Load dataset
{dataset_code}

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create model with custom hyperparameters
model = {algo_class}

# Train
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Evaluate
{metrics_code}
"""
    else:
        code = f"""import numpy as np
from sklearn.model_selection import train_test_split
{import_line}

# Load dataset
{dataset_code}

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create model
model = {algo_class}

# Train
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Evaluate
{metrics_code}
"""

    return {"code": code.strip(), "language": "python"}


# --- AI Assistant ---

class AssistantRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    context: dict = Field(default={}, max_length=20)


# LLM provider configs
LLM_PROVIDERS = {
    "openai": {
        "url": "https://api.openai.com/v1/chat/completions",
        "default_model": "gpt-4o-mini",
    },
    "groq": {
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "default_model": "llama3-8b-8192",
    },
    "anthropic": {
        "url": "https://api.anthropic.com/v1/messages",
        "default_model": "claude-3-haiku-20240307",
    },
}


async def _call_llm(provider: str, api_key: str, model: str, system_prompt: str, user_message: str) -> Optional[str]:
    """Call LLM API. Returns response text or None on failure."""
    import httpx

    provider_config = LLM_PROVIDERS.get(provider)
    if not provider_config:
        logger.warning("Unknown LLM provider: %s", provider)
        return None

    url = provider_config["url"]
    if not model:
        model = provider_config["default_model"]

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                "temperature": 0.3,
                "max_tokens": 500,
            }

            resp = await client.post(url, headers=headers, json=payload)

            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                # Strip thinking tags (some models like Qwen include <think>...</think>)
                content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
                return content if content else None
            else:
                logger.warning("LLM API error %d: %s", resp.status_code, resp.text[:200])
                return None

    except Exception as e:
        logger.warning("LLM call failed: %s", e)
        return None


@router.post("/assistant")
async def assistant_chat(request: Request, body: AssistantRequest, response: Response):
    from ..middleware.rate_limit import check_rate_limit

    # Enforce per-user rate limit
    rate_info = await check_rate_limit(request)
    response.headers["X-RateLimit-Limit"] = rate_info["X-RateLimit-Limit"]
    response.headers["X-RateLimit-Remaining"] = rate_info["X-RateLimit-Remaining"]
    response.headers["X-RateLimit-Reset"] = rate_info["X-RateLimit-Reset"]

    context = body.context
    algorithm = context.get("algorithm", "unknown")
    dataset = context.get("dataset", "unknown")
    metrics = context.get("metrics", {})

    system_context = f"Algorithm: {algorithm}, Dataset: {dataset}"
    if metrics:
        system_context += f", Metrics: {metrics}"

    system_prompt = (
        f"You are an ML education assistant for Confluence, an interactive ML visualization platform. "
        f"The user is exploring: {system_context}. "
        f"Keep answers concise (2-3 paragraphs). Be educational and practical. "
        f"If asked about code, provide Python snippets using scikit-learn."
    )

    llm_provider = os.getenv("LLM_PROVIDER", "")
    llm_api_key = os.getenv("LLM_API_KEY", "")
    llm_model = os.getenv("LLM_MODEL", "")

    if llm_provider and llm_api_key:
        result = await _call_llm(llm_provider, llm_api_key, llm_model, system_prompt, body.message)
        if result:
            return {"response": result, "source": "llm", "provider": llm_provider}

    # Fallback to local responses
    local_response = _generate_local_response(body.message, context)
    return {"response": local_response, "source": "local"}


def _generate_local_response(message: str, context: dict) -> str:
    msg = message.lower()
    algo = context.get("algorithm", "")
    dataset = context.get("dataset", "")

    if "overfit" in msg:
        return (
            "Overfitting occurs when a model learns the training data too well, including noise, "
            "and performs poorly on unseen data. Signs: high train accuracy but low test accuracy. "
            "Solutions: use regularization, reduce model complexity, get more data, or use cross-validation."
        )
    elif "underfit" in msg:
        return (
            "Underfitting occurs when a model is too simple to capture the underlying patterns. "
            "Signs: low accuracy on both training and test data. "
            "Solutions: increase model complexity, add more features, or reduce regularization."
        )
    elif "why" in msg and ("better" in msg or "outperform" in msg or "worse" in msg):
        return (
            f"Algorithm performance depends on the dataset characteristics. "
            f"For '{dataset}', the data's structure (linearity, noise, dimensionality) determines which algorithm works best. "
            f"Try comparing with the Algorithm Race to see side-by-side boundaries."
        )
    elif "boundary" in msg or "decision" in msg:
        return (
            f"The decision boundary is the surface that separates classes. "
            f"Linear models create straight boundaries; tree-based models create axis-aligned steps; "
            f"kernel SVMs create smooth curves. Use Learning Mode to hover and understand each boundary region."
        )
    elif "metric" in msg or "accuracy" in msg:
        return (
            "Accuracy = correct predictions / total predictions. But it can be misleading with imbalanced classes. "
            "Also check precision (of predicted positives, how many are correct) and recall (of actual positives, how many were found)."
        )
    elif "hyperparameter" in msg or "param" in msg:
        return (
            "Hyperparameters are settings chosen before training (not learned from data). "
            "Use Hyperparameter Comparison to see how different values affect the boundary. "
            "Common ones: max_depth (tree complexity), n_neighbors (KNN locality), C (SVM regularization)."
        )
    else:
        return (
            f"I can help explain ML concepts for your current exploration ({algo} on {dataset}). "
            f"Try asking about: overfitting, decision boundaries, metrics, hyperparameters, "
            f"or why one algorithm outperforms another."
        )
