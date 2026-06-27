import numpy as np
from sklearn.datasets import load_iris, load_wine, load_breast_cancer, load_digits
from ..registry import DatasetRegistry
from ..metadata import DatasetEntry
from ..loader_utils import load_preprocessed


# ── sklearn loaders (stay as-is) ──

def _load_iris(n_samples=150, noise=0.0):
    data = load_iris(); X, y = data.data[:, [2, 3]], data.target
    if noise > 0: X = X + np.random.RandomState(42).randn(*X.shape) * noise * 0.5
    if n_samples < len(X): idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False); X, y = X[idx], y[idx]
    return X, y

def _load_iris_full(n_samples=150, noise=0.0):
    data = load_iris(); X, y = data.data, data.target
    if noise > 0: X = X + np.random.RandomState(42).randn(*X.shape) * noise * X.std(0) * 0.3
    if n_samples < len(X): idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False); X, y = X[idx], y[idx]
    return X, y

def _load_wine(n_samples=178, noise=0.0):
    data = load_wine(); X, y = data.data[:, [0, 12]], data.target
    if noise > 0: X = X + np.random.RandomState(42).randn(*X.shape) * noise * X.std(0) * 0.3
    if n_samples < len(X): idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False); X, y = X[idx], y[idx]
    return X, y

def _load_wine_full(n_samples=178, noise=0.0):
    data = load_wine(); X, y = data.data, data.target
    if noise > 0: X = X + np.random.RandomState(42).randn(*X.shape) * noise * X.std(0) * 0.3
    if n_samples < len(X): idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False); X, y = X[idx], y[idx]
    return X, y

def _load_breast_cancer(n_samples=569, noise=0.0):
    data = load_breast_cancer(); X, y = data.data[:, [0, 1]], data.target
    if noise > 0: X = X + np.random.RandomState(42).randn(*X.shape) * noise * X.std(0) * 0.3
    if n_samples < len(X): idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False); X, y = X[idx], y[idx]
    return X, y

def _load_breast_cancer_full(n_samples=569, noise=0.0):
    data = load_breast_cancer(); X, y = data.data, data.target
    if noise > 0: X = X + np.random.RandomState(42).randn(*X.shape) * noise * X.std(0) * 0.3
    if n_samples < len(X): idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False); X, y = X[idx], y[idx]
    return X, y

def _load_digits_2d(n_samples=1797, noise=0.0):
    from sklearn.decomposition import PCA
    data = load_digits(); X = PCA(n_components=2, random_state=42).fit_transform(data.data); y = data.target
    if noise > 0: X = X + np.random.RandomState(42).randn(*X.shape) * noise * 0.5
    if n_samples < len(X): idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False); X, y = X[idx], y[idx]
    return X, y

def _load_digits_full(n_samples=1797, noise=0.0):
    data = load_digits(); X, y = data.data, data.target
    if noise > 0: X = X + np.random.RandomState(42).randn(*X.shape) * noise * X.std(0) * 0.3
    if n_samples < len(X): idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False); X, y = X[idx], y[idx]
    return X, y


# ── Kaggle preprocessed loaders ──

def _load_titanic(n_samples=1309, noise=0.0):
    return load_preprocessed("classification/titanic.csv",
        ["Age", "Fare", "SibSp", "Parch", "Sex", "Pclass"], "Survived", n_samples, noise)

def _load_penguins(n_samples=342, noise=0.0):
    return load_preprocessed("classification/penguins.csv",
        ["bill_length_mm", "flipper_length_mm"], "species", n_samples, noise)

def _load_heart_disease(n_samples=1025, noise=0.0):
    return load_preprocessed("classification/heart_disease.csv",
        ["age", "sex", "cp", "trestbps", "chol", "thalach", "oldpeak"], "target", n_samples, noise)

def _load_adult_income(n_samples=5000, noise=0.0):
    return load_preprocessed("classification/adult_income.csv",
        ["age", "education_num", "hours_per_week", "capital_gain", "sex"], "income", n_samples, noise)

def _load_mushroom(n_samples=5000, noise=0.0):
    return load_preprocessed("classification/mushroom.csv",
        ["cap_shape", "cap_surface", "bruises", "odor", "gill_size", "gill_color", "stalk_shape"], "target", n_samples, noise)

def _load_wine_quality(n_samples=1599, noise=0.0):
    return load_preprocessed("classification/wine_quality.csv",
        ["fixed_acidity", "volatile_acidity", "citric_acid", "residual_sugar", "alcohol", "pH"], "target", n_samples, noise)


def register():
    datasets = [
        DatasetEntry(name="iris", display_name="Iris", description="Fisher's Iris (petal, 2D)",
            story="Classify iris flowers into 3 species using petal measurements.", source="sklearn",
            family="classification", category="general", target_column="species", n_rows=150, n_features=2, n_classes=3,
            feature_names=["petal_length", "petal_width"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["logistic-regression", "knn", "decision-tree", "random-forest"],
            tags=["classic", "small", "multi-class"], license="Public Domain", loader=_load_iris),
        DatasetEntry(name="iris-full", display_name="Iris (4 features)", description="Fisher's Iris with all 4 features",
            story="Full Iris dataset with sepal and petal measurements.", source="sklearn",
            family="classification", category="general", target_column="species", n_rows=150, n_features=4, n_classes=3,
            feature_names=["sepal_length", "sepal_width", "petal_length", "petal_width"],
            feature_types=["numeric", "numeric", "numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["logistic-regression", "knn", "random-forest", "gradient-boosting"],
            tags=["classic", "small", "multi-class", "full"], license="Public Domain", loader=_load_iris_full),
        DatasetEntry(name="wine", display_name="Wine", description="Wine (alcohol/proline, 3 classes)",
            story="Classify wines into 3 cultivars using chemical analysis.", source="sklearn",
            family="classification", category="general", target_column="cultivar", n_rows=178, n_features=2, n_classes=3,
            feature_names=["alcohol", "proline"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["logistic-regression", "knn", "decision-tree", "random-forest"],
            tags=["classic", "small", "multi-class"], license="Public Domain", loader=_load_wine),
        DatasetEntry(name="wine-full", display_name="Wine (13 features)", description="Wine with all 13 features",
            story="Full Wine dataset with all chemical analysis features.", source="sklearn",
            family="classification", category="general", target_column="cultivar", n_rows=178, n_features=13, n_classes=3,
            feature_names=["alcohol", "malic_acid", "ash", "alcalinity", "magnesium", "total_phenols", "flavanoids",
                          "nonflavanoids", "proanthocyanins", "color_intensity", "hue", "od280_od315", "proline"],
            feature_types=["numeric"] * 13, missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest", "gradient-boosting", "rbf-svm"],
            tags=["classic", "small", "multi-class", "full"], license="Public Domain", loader=_load_wine_full),
        DatasetEntry(name="breast-cancer", display_name="Breast Cancer", description="Breast Cancer (radius/texture)",
            story="Classify tumors as benign or malignant.", source="sklearn",
            family="classification", category="healthcare", target_column="diagnosis", n_rows=569, n_features=2, n_classes=2,
            feature_names=["radius", "texture"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["logistic-regression", "random-forest", "rbf-svm", "gradient-boosting"],
            tags=["classic", "binary", "healthcare"], license="Public Domain", loader=_load_breast_cancer),
        DatasetEntry(name="breast-cancer-full", display_name="Breast Cancer (30 features)",
            description="Breast Cancer with all 30 features", story="Full Breast Cancer dataset.",
            source="sklearn", family="classification", category="healthcare", target_column="diagnosis",
            n_rows=569, n_features=30, n_classes=2,
            feature_names=["mean_radius", "mean_texture", "mean_perimeter", "mean_area", "mean_smoothness",
                          "mean_compactness", "mean_concavity", "mean_concave_points", "mean_symmetry", "mean_fractal_dimension"],
            feature_types=["numeric"] * 30, missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest", "gradient-boosting", "rbf-svm", "mlp"],
            tags=["classic", "binary", "healthcare", "full", "high-dimensional"],
            license="Public Domain", loader=_load_breast_cancer_full),
        DatasetEntry(name="digits-2d", display_name="Digits (2D)", description="Handwritten digits projected to 2D",
            story="8x8 pixel handwritten digits projected to 2D via PCA.", source="sklearn",
            family="classification", category="general", target_column="digit", n_rows=1797, n_features=2, n_classes=10,
            feature_names=["PC1", "PC2"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["knn", "random-forest", "gradient-boosting", "mlp"],
            tags=["classic", "multi-class", "image"], license="Public Domain", loader=_load_digits_2d),
        DatasetEntry(name="digits-full", display_name="Digits (64 features)", description="Handwritten digits with all 64 pixels",
            story="Full 8x8 pixel handwritten digits dataset.", source="sklearn",
            family="classification", category="general", target_column="digit", n_rows=1797, n_features=64, n_classes=10,
            feature_names=[f"pixel_{i}" for i in range(64)], feature_types=["numeric"] * 64,
            missing_values=False, difficulty="advanced",
            recommended_algorithms=["random-forest", "gradient-boosting", "mlp", "rbf-svm"],
            tags=["classic", "multi-class", "image", "full"], license="Public Domain", loader=_load_digits_full),
        # ── Kaggle preprocessed ──
        DatasetEntry(name="titanic", display_name="Titanic", description="Titanic survival (Kaggle, preprocessed)",
            story="Predict survival using age, fare, sex, class, and family info.", source="kaggle",
            family="classification", category="general", target_column="survived", n_rows=1309, n_features=6, n_classes=2,
            feature_names=["age", "fare", "sibsp", "parch", "sex", "pclass"],
            feature_types=["numeric", "numeric", "numeric", "numeric", "binary", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest", "gradient-boosting", "logistic-regression"],
            tags=["classic", "binary", "tabular", "kaggle"], license="DbCL-1.0", loader=_load_titanic),
        DatasetEntry(name="penguins", display_name="Penguins", description="Palmer Penguins (Kaggle, preprocessed)",
            story="Classify penguins into 3 species using bill and flipper measurements.", source="kaggle",
            family="classification", category="general", target_column="species", n_rows=342, n_features=2, n_classes=3,
            feature_names=["bill_length_mm", "flipper_length_mm"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="beginner",
            recommended_algorithms=["logistic-regression", "knn", "decision-tree", "random-forest"],
            tags=["classic", "multi-class", "small", "kaggle"], license="CC0", loader=_load_penguins),
        DatasetEntry(name="heart-disease", display_name="Heart Disease", description="Heart Disease (Kaggle/UCI, preprocessed)",
            story="Predict heart disease from clinical features.", source="kaggle",
            family="classification", category="healthcare", target_column="target", n_rows=1025, n_features=7, n_classes=2,
            feature_names=["age", "sex", "chest_pain", "resting_bp", "cholesterol", "max_hr", "st_depression"],
            feature_types=["numeric", "binary", "categorical", "numeric", "numeric", "numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["logistic-regression", "random-forest", "gradient-boosting", "rbf-svm"],
            tags=["healthcare", "binary", "kaggle"], license="CC0", loader=_load_heart_disease),
        DatasetEntry(name="adult-income", display_name="Adult Income", description="Census income (Kaggle/UCI, preprocessed)",
            story="Predict whether income exceeds $50K/year.", source="kaggle",
            family="classification", category="finance", target_column="income", n_rows=30162, n_features=5, n_classes=2,
            feature_names=["age", "education_num", "hours_per_week", "capital_gain", "sex"],
            feature_types=["numeric", "numeric", "numeric", "numeric", "binary"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest", "gradient-boosting", "logistic-regression"],
            tags=["finance", "binary", "tabular", "kaggle"], license="CC0", loader=_load_adult_income),
        DatasetEntry(name="mushroom", display_name="Mushroom", description="Mushroom edibility (Kaggle/UCI, preprocessed)",
            story="Classify mushrooms as edible or poisonous.", source="kaggle",
            family="classification", category="general", target_column="class", n_rows=8124, n_features=7, n_classes=2,
            feature_names=["cap_shape", "cap_surface", "bruises", "odor", "gill_size", "gill_color", "stalk_shape"],
            feature_types=["categorical", "categorical", "binary", "categorical", "binary", "categorical", "binary"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["decision-tree", "random-forest", "gradient-boosting"],
            tags=["binary", "tabular", "categorical", "kaggle"], license="CC0", loader=_load_mushroom),
        DatasetEntry(name="wine-quality", display_name="Wine Quality", description="Red wine quality (Kaggle, preprocessed)",
            story="Classify wines as good or bad quality based on chemical properties.", source="kaggle",
            family="classification", category="general", target_column="quality", n_rows=1599, n_features=6, n_classes=2,
            feature_names=["fixed_acidity", "volatile_acidity", "citric_acid", "residual_sugar", "alcohol", "pH"],
            feature_types=["numeric", "numeric", "numeric", "numeric", "numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest", "gradient-boosting", "logistic-regression"],
            tags=["binary", "tabular", "chemistry", "kaggle"], license="CC0", loader=_load_wine_quality),
    ]
    for entry in datasets:
        DatasetRegistry.register(entry)
