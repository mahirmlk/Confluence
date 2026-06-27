import numpy as np
from sklearn.datasets import (
    load_iris, load_wine, load_breast_cancer, load_digits,
    fetch_openml
)
from ..registry import DatasetRegistry
from ..metadata import DatasetEntry


def _load_iris(n_samples: int = 150, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_iris()
    X, y = data.data[:, [2, 3]], data.target
    if noise > 0:
        rng = np.random.RandomState(42)
        X = X + rng.randn(*X.shape) * noise * 0.5
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_iris_full(n_samples: int = 150, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_iris()
    X, y = data.data, data.target
    if noise > 0:
        rng = np.random.RandomState(42)
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.3
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_wine(n_samples: int = 178, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_wine()
    X, y = data.data[:, [0, 12]], data.target
    if noise > 0:
        rng = np.random.RandomState(42)
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.3
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_wine_full(n_samples: int = 178, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_wine()
    X, y = data.data, data.target
    if noise > 0:
        rng = np.random.RandomState(42)
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.3
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_breast_cancer(n_samples: int = 569, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_breast_cancer()
    X, y = data.data[:, [0, 1]], data.target
    if noise > 0:
        rng = np.random.RandomState(42)
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.3
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_breast_cancer_full(n_samples: int = 569, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_breast_cancer()
    X, y = data.data, data.target
    if noise > 0:
        rng = np.random.RandomState(42)
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.3
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_digits_2d(n_samples: int = 1797, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_digits()
    from sklearn.decomposition import PCA
    pca = PCA(n_components=2, random_state=42)
    X = pca.fit_transform(data.data)
    y = data.target
    if noise > 0:
        rng = np.random.RandomState(42)
        X = X + rng.randn(*X.shape) * noise * 0.5
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_digits_full(n_samples: int = 1797, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_digits()
    X, y = data.data, data.target
    if noise > 0:
        rng = np.random.RandomState(42)
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.3
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_titanic(n_samples: int = 891, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Titanic dataset — preprocessed from OpenML."""
    try:
        titanic = fetch_openml("titanic", version=1, as_frame=True, parser="auto")
        df = titanic.frame
    except Exception:
        return _generate_titanic_synthetic(n_samples)

    df = df.dropna(subset=["survived"])
    df["survived"] = df["survived"].astype(int)

    numeric_cols = ["age", "fare", "sibsp", "parch"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())

    features = []
    feature_names = []
    if "age" in df.columns:
        features.append(df["age"].values)
        feature_names.append("age")
    if "fare" in df.columns:
        features.append(df["fare"].values)
        feature_names.append("fare")
    if "sibsp" in df.columns:
        features.append(df["sibsp"].values)
        feature_names.append("sibsp")
    if "parch" in df.columns:
        features.append(df["parch"].values)
        feature_names.append("parch")

    if "sex" in df.columns:
        features.append((df["sex"] == "male").astype(float).values)
        feature_names.append("sex_male")

    if "pclass" in df.columns:
        features.append(df["pclass"].values.astype(float))
        feature_names.append("pclass")

    X = np.column_stack(features)
    y = df["survived"].values

    mask = ~np.isnan(X).any(axis=1)
    X, y = X[mask], y[mask]

    if noise > 0:
        rng = np.random.RandomState(42)
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.1
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _generate_titanic_synthetic(n_samples: int = 300) -> tuple[np.ndarray, np.ndarray]:
    """Fallback synthetic Titanic-like data."""
    rng = np.random.RandomState(42)
    n = n_samples
    age = rng.normal(30, 14, n).clip(1, 80)
    fare = rng.exponential(30, n).clip(0, 500)
    sibsp = rng.poisson(0.5, n).clip(0, 8)
    parch = rng.poisson(0.4, n).clip(0, 6)
    sex_male = rng.choice([0, 1], n)
    pclass = rng.choice([1, 2, 3], n, p=[0.24, 0.21, 0.55])

    survival_logit = (
        -2.5
        + 2.0 * (1 - sex_male)
        + 0.8 * (pclass == 1).astype(float)
        - 0.5 * (pclass == 3).astype(float)
        + 0.01 * fare
        - 0.02 * age
    )
    prob = 1 / (1 + np.exp(-survival_logit))
    y = (rng.random(n) < prob).astype(int)
    X = np.column_stack([age, fare, sibsp, parch, sex_male, pclass])
    return X, y


def _load_penguins(n_samples: int = 344, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Penguins dataset — synthetic version with 3 species."""
    rng = np.random.RandomState(42)
    n_per_class = n_samples // 3

    bill_l = np.concatenate([
        rng.normal(38.8, 2.7, n_per_class),
        rng.normal(48.8, 3.3, n_per_class),
        rng.normal(47.5, 3.1, n_per_class),
    ])
    flipper_l = np.concatenate([
        rng.normal(190, 6, n_per_class),
        rng.normal(196, 6, n_per_class),
        rng.normal(217, 6, n_per_class),
    ])
    y = np.concatenate([np.zeros(n_per_class), np.ones(n_per_class), np.full(n_per_class, 2)]).astype(int)
    X = np.column_stack([bill_l, flipper_l])

    if noise > 0:
        X = X + rng.randn(*X.shape) * noise * 0.5
    return X, y


def _load_heart_disease(n_samples: int = 303, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Heart Disease dataset — synthetic version."""
    rng = np.random.RandomState(42)
    n = n_samples

    age = rng.normal(54, 9, n).clip(29, 77)
    chol = rng.normal(246, 52, n).clip(126, 564)
    thalach = rng.normal(149, 23, n).clip(71, 202)
    oldpeak = rng.exponential(1, n).clip(0, 6.2)
    sex = rng.choice([0, 1], n, p=[0.32, 0.68])

    risk_logit = (
        -3.0
        + 0.04 * age
        + 0.003 * chol
        - 0.02 * thalach
        + 0.5 * oldpeak
        + 0.8 * sex
    )
    prob = 1 / (1 + np.exp(-risk_logit))
    y = (rng.random(n) < prob).astype(int)
    X = np.column_stack([age, chol, thalach, oldpeak, sex])

    if noise > 0:
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.1
    return X, y


def _load_adult_income(n_samples: int = 500, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Adult Income dataset — synthetic version."""
    rng = np.random.RandomState(42)
    n = n_samples

    age = rng.normal(38, 13, n).clip(17, 90)
    education_num = rng.normal(10, 2.5, n).clip(1, 16).astype(int)
    hours_per_week = rng.normal(40, 12, n).clip(1, 99)
    capital_gain = rng.exponential(100, n).clip(0, 100000)
    sex = rng.choice([0, 1], n, p=[0.33, 0.67])

    income_logit = (
        -5.0
        + 0.03 * age
        + 0.3 * education_num
        + 0.02 * hours_per_week
        + 0.0001 * capital_gain
        + 0.4 * sex
    )
    prob = 1 / (1 + np.exp(-income_logit))
    y = (rng.random(n) < prob).astype(int)
    X = np.column_stack([age, education_num, hours_per_week, capital_gain, sex])

    if noise > 0:
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.1
    return X, y


def _load_mushroom(n_samples: int = 500, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Mushroom dataset — synthetic version (edible vs poisonous)."""
    rng = np.random.RandomState(42)
    n = n_samples

    cap_diameter = rng.normal(6, 3, n).clip(0.5, 25)
    cap_shape = rng.choice([0, 1, 2, 3, 4, 5], n)
    gill_color = rng.choice([0, 1, 2, 3, 4, 5, 6, 7], n)
    stem_height = rng.normal(6, 3, n).clip(0, 20)
    stem_width = rng.normal(12, 5, n).clip(1, 35)
    habitat = rng.choice([0, 1, 2, 3, 4, 5, 6], n)

    poison_logit = (
        -2.0
        + 0.15 * cap_diameter
        + 0.3 * (gill_color < 3).astype(float)
        - 0.1 * stem_width
        + 0.2 * (habitat == 0).astype(float)
    )
    prob = 1 / (1 + np.exp(-poison_logit))
    y = (rng.random(n) < prob).astype(int)
    X = np.column_stack([cap_diameter, cap_shape, gill_color, stem_height, stem_width, habitat])

    if noise > 0:
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.1
    return X, y


def _load_wine_quality(n_samples: int = 500, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Wine Quality dataset — synthetic version."""
    rng = np.random.RandomState(42)
    n = n_samples

    fixed_acidity = rng.normal(7, 1.5, n).clip(3, 16)
    volatile_acidity = rng.normal(0.5, 0.2, n).clip(0.08, 1.6)
    citric_acid = rng.normal(0.3, 0.15, n).clip(0, 1.6)
    residual_sugar = rng.exponential(2, n).clip(0.5, 16)
    alcohol = rng.normal(10.4, 1.1, n).clip(8, 15)
    ph = rng.normal(3.3, 0.15, n).clip(2.7, 4.0)

    quality_score = (
        -5
        + 0.5 * alcohol
        - 2.0 * volatile_acidity
        + 0.5 * citric_acid
        - 0.1 * residual_sugar
        + 0.3 * fixed_acidity
    )
    quality_prob = 1 / (1 + np.exp(-quality_score))
    y = (rng.random(n) < quality_prob).astype(int)
    X = np.column_stack([fixed_acidity, volatile_acidity, citric_acid, residual_sugar, alcohol, ph])

    if noise > 0:
        X = X + rng.randn(*X.shape) * noise * X.std(axis=0) * 0.1
    return X, y


def register() -> None:
    """Register all classification datasets."""
    datasets = [
        DatasetEntry(
            name="iris", display_name="Iris", description="Fisher's Iris (petal length/width, 3 classes)",
            story="Classic dataset: classify iris flowers into 3 species using petal measurements.",
            source="sklearn", family="classification", category="general",
            target_column="species", n_rows=150, n_features=2, n_classes=3,
            feature_names=["petal_length", "petal_width"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["logistic-regression", "knn", "decision-tree", "random-forest"],
            tags=["classic", "small", "multi-class"], license="Public Domain",
            loader=_load_iris,
        ),
        DatasetEntry(
            name="iris-full", display_name="Iris (4 features)", description="Fisher's Iris with all 4 features",
            story="Full Iris dataset with sepal and petal measurements.",
            source="sklearn", family="classification", category="general",
            target_column="species", n_rows=150, n_features=4, n_classes=3,
            feature_names=["sepal_length", "sepal_width", "petal_length", "petal_width"],
            feature_types=["numeric", "numeric", "numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["logistic-regression", "knn", "random-forest", "gradient-boosting"],
            tags=["classic", "small", "multi-class", "full"], license="Public Domain",
            loader=_load_iris_full,
        ),
        DatasetEntry(
            name="wine", display_name="Wine", description="Wine dataset (alcohol/proline, 3 classes)",
            story="Classify wines into 3 cultivars using chemical analysis.",
            source="sklearn", family="classification", category="general",
            target_column="cultivar", n_rows=178, n_features=2, n_classes=3,
            feature_names=["alcohol", "proline"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["logistic-regression", "knn", "decision-tree", "random-forest"],
            tags=["classic", "small", "multi-class"], license="Public Domain",
            loader=_load_wine,
        ),
        DatasetEntry(
            name="wine-full", display_name="Wine (13 features)", description="Wine dataset with all 13 features",
            story="Full Wine dataset with all chemical analysis features.",
            source="sklearn", family="classification", category="general",
            target_column="cultivar", n_rows=178, n_features=13, n_classes=3,
            feature_names=["alcohol", "malic_acid", "ash", "alcalinity", "magnesium",
                          "total_phenols", "flavanoids", "nonflavanoids", "proanthocyanins",
                          "color_intensity", "hue", "od280_od315", "proline"],
            feature_types=["numeric"] * 13,
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest", "gradient-boosting", "rbf-svm"],
            tags=["classic", "small", "multi-class", "full"], license="Public Domain",
            loader=_load_wine_full,
        ),
        DatasetEntry(
            name="breast-cancer", display_name="Breast Cancer", description="Breast Cancer (radius/texture, 2 classes)",
            story="Classify tumors as benign or malignant using cell nucleus features.",
            source="sklearn", family="classification", category="healthcare",
            target_column="diagnosis", n_rows=569, n_features=2, n_classes=2,
            feature_names=["radius", "texture"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["logistic-regression", "random-forest", "rbf-svm", "gradient-boosting"],
            tags=["classic", "binary", "healthcare"], license="Public Domain",
            loader=_load_breast_cancer,
        ),
        DatasetEntry(
            name="breast-cancer-full", display_name="Breast Cancer (30 features)",
            description="Breast Cancer with all 30 features",
            story="Full Breast Cancer dataset with all cell nucleus measurements.",
            source="sklearn", family="classification", category="healthcare",
            target_column="diagnosis", n_rows=569, n_features=30, n_classes=2,
            feature_names=["mean_radius", "mean_texture", "mean_perimeter", "mean_area",
                          "mean_smoothness", "mean_compactness", "mean_concavity",
                          "mean_concave_points", "mean_symmetry", "mean_fractal_dimension"],
            feature_types=["numeric"] * 30,
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest", "gradient-boosting", "rbf-svm", "mlp"],
            tags=["classic", "binary", "healthcare", "full", "high-dimensional"],
            license="Public Domain", loader=_load_breast_cancer_full,
        ),
        DatasetEntry(
            name="digits-2d", display_name="Digits (2D)", description="Handwritten digits projected to 2D",
            story="8x8 pixel handwritten digits (0-9) projected to 2D via PCA.",
            source="sklearn", family="classification", category="general",
            target_column="digit", n_rows=1797, n_features=2, n_classes=10,
            feature_names=["PC1", "PC2"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["knn", "random-forest", "gradient-boosting", "mlp"],
            tags=["classic", "multi-class", "image", "high-dimensional"],
            license="Public Domain", loader=_load_digits_2d,
        ),
        DatasetEntry(
            name="digits-full", display_name="Digits (64 features)",
            description="Handwritten digits with all 64 pixel features",
            story="Full 8x8 pixel handwritten digits dataset.",
            source="sklearn", family="classification", category="general",
            target_column="digit", n_rows=1797, n_features=64, n_classes=10,
            feature_names=[f"pixel_{i}" for i in range(64)],
            feature_types=["numeric"] * 64,
            missing_values=False, difficulty="advanced",
            recommended_algorithms=["random-forest", "gradient-boosting", "mlp", "rbf-svm"],
            tags=["classic", "multi-class", "image", "high-dimensional", "full"],
            license="Public Domain", loader=_load_digits_full,
        ),
        DatasetEntry(
            name="titanic", display_name="Titanic", description="Titanic survival prediction",
            story="Predict whether a passenger survived the Titanic disaster using passenger attributes like age, sex, fare, and class.",
            source="synthetic", family="classification", category="general",
            target_column="survived", n_rows=891, n_features=6, n_classes=2,
            feature_names=["age", "fare", "sibsp", "parch", "sex_male", "pclass"],
            feature_types=["numeric", "numeric", "numeric", "numeric", "binary", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest", "gradient-boosting", "logistic-regression"],
            tags=["classic", "binary", "tabular", "feature-engineering"],
            license="Public Domain", loader=_load_titanic,
        ),
        DatasetEntry(
            name="penguins", display_name="Penguins", description="Palmer Penguins (3 species)",
            story="Classify penguins into 3 species (Adelie, Chinstrap, Gentoo) using bill and flipper measurements.",
            source="synthetic", family="classification", category="general",
            target_column="species", n_rows=342, n_features=2, n_classes=3,
            feature_names=["bill_length", "flipper_length"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["logistic-regression", "knn", "decision-tree", "random-forest"],
            tags=["classic", "multi-class", "small"],
            license="CC0", loader=_load_penguins,
        ),
        DatasetEntry(
            name="heart-disease", display_name="Heart Disease", description="Heart Disease prediction",
            story="Predict the presence of heart disease based on clinical features like age, cholesterol, and blood pressure.",
            source="synthetic", family="classification", category="healthcare",
            target_column="disease", n_rows=303, n_features=5, n_classes=2,
            feature_names=["age", "cholesterol", "max_heart_rate", "st_depression", "sex"],
            feature_types=["numeric", "numeric", "numeric", "numeric", "binary"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["logistic-regression", "random-forest", "gradient-boosting", "rbf-svm"],
            tags=["healthcare", "binary", "clinical"],
            license="Public Domain", loader=_load_heart_disease,
        ),
        DatasetEntry(
            name="adult-income", display_name="Adult Income", description="Income prediction (>50K)",
            story="Predict whether a person earns more than $50K/year based on demographic and work features.",
            source="synthetic", family="classification", category="finance",
            target_column="income", n_rows=500, n_features=5, n_classes=2,
            feature_names=["age", "education_num", "hours_per_week", "capital_gain", "sex"],
            feature_types=["numeric", "numeric", "numeric", "numeric", "binary"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest", "gradient-boosting", "logistic-regression"],
            tags=["finance", "binary", "tabular", "socioeconomic"],
            license="Public Domain", loader=_load_adult_income,
        ),
        DatasetEntry(
            name="mushroom", display_name="Mushroom", description="Mushroom edibility (edible vs poisonous)",
            story="Classify mushrooms as edible or poisonous based on physical characteristics.",
            source="synthetic", family="classification", category="general",
            target_column="edible", n_rows=500, n_features=6, n_classes=2,
            feature_names=["cap_diameter", "cap_shape", "gill_color", "stem_height", "stem_width", "habitat"],
            feature_types=["numeric", "categorical", "categorical", "numeric", "numeric", "categorical"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["decision-tree", "random-forest", "gradient-boosting"],
            tags=["binary", "tabular", "categorical"],
            license="Public Domain", loader=_load_mushroom,
        ),
        DatasetEntry(
            name="wine-quality", display_name="Wine Quality", description="Wine quality (good vs bad)",
            story="Classify wines as good or bad quality based on chemical properties.",
            source="synthetic", family="classification", category="general",
            target_column="quality", n_rows=500, n_features=6, n_classes=2,
            feature_names=["fixed_acidity", "volatile_acidity", "citric_acid", "residual_sugar", "alcohol", "ph"],
            feature_types=["numeric", "numeric", "numeric", "numeric", "numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest", "gradient-boosting", "logistic-regression"],
            tags=["binary", "tabular", "chemistry"],
            license="Public Domain", loader=_load_wine_quality,
        ),
    ]

    for entry in datasets:
        DatasetRegistry.register(entry)
