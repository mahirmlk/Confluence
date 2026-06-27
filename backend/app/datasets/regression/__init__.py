import numpy as np
from sklearn.datasets import load_diabetes, fetch_california_housing
from ..registry import DatasetRegistry
from ..metadata import DatasetEntry
from ..loader_utils import load_preprocessed


# ── sklearn loaders ──

def _load_california_housing(n_samples=500, noise=0.0):
    data = fetch_california_housing(); X, y = data.data[:, :2], data.target
    if n_samples < len(X): idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False); X, y = X[idx], y[idx]
    return X, y

def _load_california_housing_full(n_samples=500, noise=0.0):
    data = fetch_california_housing(); X, y = data.data, data.target
    if n_samples < len(X): idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False); X, y = X[idx], y[idx]
    return X, y

def _load_diabetes_sklearn(n_samples=442, noise=0.0):
    data = load_diabetes(); X, y = data.data[:, [2, 8]], data.target
    if n_samples < len(X): idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False); X, y = X[idx], y[idx]
    return X, y

def _load_diabetes_full(n_samples=442, noise=0.0):
    data = load_diabetes(); X, y = data.data, data.target
    if n_samples < len(X): idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False); X, y = X[idx], y[idx]
    return X, y


# ── Kaggle preprocessed loaders ──

def _load_california_housing_kaggle(n_samples=5000, noise=0.0):
    return load_preprocessed("regression/california_housing.csv",
        ["median_income", "housing_median_age", "total_rooms", "ocean_proximity"], "median_house_value", n_samples, noise)

def _load_diabetes_kaggle(n_samples=768, noise=0.0):
    return load_preprocessed("regression/diabetes.csv",
        ["glucose", "bmi", "age", "pregnancies", "blood_pressure"], "target", n_samples, noise)

def _load_insurance(n_samples=1338, noise=0.0):
    return load_preprocessed("regression/insurance.csv",
        ["age", "bmi", "children", "sex", "smoker", "region"], "charges", n_samples, noise)

def _load_concrete(n_samples=1030, noise=0.0):
    return load_preprocessed("regression/concrete.csv",
        ["cement", "water", "coarse_aggregate", "fine_aggregate", "age_days"], "strength", n_samples, noise)


def register():
    datasets = [
        DatasetEntry(name="california-housing", display_name="California Housing", description="Housing (MedInc, HouseAge)",
            story="Predict median house value using income and house age.", source="sklearn",
            family="regression", category="housing", target_column="median_house_value", n_rows=20640, n_features=2, n_classes=None,
            feature_names=["median_income", "house_age"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["linear-regression", "random-forest-regressor", "gradient-boosting-regressor"],
            tags=["classic", "housing", "regression"], license="Public Domain", loader=_load_california_housing),
        DatasetEntry(name="california-housing-full", display_name="California Housing (8 features)", description="Housing with all 8 features",
            story="Full California housing dataset.", source="sklearn",
            family="regression", category="housing", target_column="median_house_value", n_rows=20640, n_features=8, n_classes=None,
            feature_names=["median_income", "house_age", "avg_rooms", "avg_bedrooms", "population", "avg_occupants", "latitude", "longitude"],
            feature_types=["numeric"] * 8, missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest-regressor", "gradient-boosting-regressor", "ridge"],
            tags=["classic", "housing", "regression", "full"], license="Public Domain", loader=_load_california_housing_full),
        DatasetEntry(name="california-housing-kaggle", display_name="California Housing (Kaggle)", description="Housing with 4 features (Kaggle)",
            story="Predict median house value using income, age, rooms, and ocean proximity.", source="kaggle",
            family="regression", category="housing", target_column="median_house_value", n_rows=20433, n_features=4, n_classes=None,
            feature_names=["median_income", "housing_median_age", "total_rooms", "ocean_proximity"],
            feature_types=["numeric", "numeric", "numeric", "categorical"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest-regressor", "gradient-boosting-regressor", "ridge"],
            tags=["housing", "regression", "kaggle"], license="CC0", loader=_load_california_housing_kaggle),
        DatasetEntry(name="diabetes", display_name="Diabetes", description="Diabetes progression (BMI, S5)",
            story="Predict diabetes progression using BMI and blood serum.", source="sklearn",
            family="regression", category="healthcare", target_column="progression", n_rows=442, n_features=2, n_classes=None,
            feature_names=["bmi", "s5"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["linear-regression", "ridge", "random-forest-regressor"],
            tags=["classic", "healthcare", "regression"], license="Public Domain", loader=_load_diabetes_sklearn),
        DatasetEntry(name="diabetes-full", display_name="Diabetes (10 features)", description="Diabetes with all 10 features",
            story="Full diabetes dataset.", source="sklearn",
            family="regression", category="healthcare", target_column="progression", n_rows=442, n_features=10, n_classes=None,
            feature_names=["age", "sex", "bmi", "bp", "s1", "s2", "s3", "s4", "s5", "s6"],
            feature_types=["numeric"] * 10, missing_values=False, difficulty="intermediate",
            recommended_algorithms=["ridge", "lasso", "random-forest-regressor", "gradient-boosting-regressor"],
            tags=["classic", "healthcare", "regression", "full"], license="Public Domain", loader=_load_diabetes_full),
        DatasetEntry(name="diabetes-kaggle", display_name="Pima Diabetes (Kaggle)", description="Pima Diabetes (Kaggle, preprocessed)",
            story="Predict diabetes outcome from glucose, BMI, age.", source="kaggle",
            family="regression", category="healthcare", target_column="Outcome", n_rows=768, n_features=5, n_classes=None,
            feature_names=["glucose", "bmi", "age", "pregnancies", "blood_pressure"],
            feature_types=["numeric", "numeric", "numeric", "numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest-regressor", "gradient-boosting-regressor", "ridge"],
            tags=["healthcare", "regression", "kaggle"], license="CC0", loader=_load_diabetes_kaggle),
        DatasetEntry(name="insurance", display_name="Insurance (Kaggle)", description="Insurance charges (Kaggle, preprocessed)",
            story="Predict medical insurance charges from age, BMI, smoking status.", source="kaggle",
            family="regression", category="finance", target_column="charges", n_rows=1338, n_features=6, n_classes=None,
            feature_names=["age", "bmi", "children", "sex", "smoker", "region"],
            feature_types=["numeric", "numeric", "numeric", "binary", "binary", "categorical"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest-regressor", "gradient-boosting-regressor", "linear-regression"],
            tags=["finance", "regression", "kaggle"], license="CC0", loader=_load_insurance),
        DatasetEntry(name="concrete", display_name="Concrete (Kaggle)", description="Concrete strength (Kaggle, preprocessed)",
            story="Predict concrete compressive strength from mixture components.", source="kaggle",
            family="regression", category="housing", target_column="strength", n_rows=1030, n_features=5, n_classes=None,
            feature_names=["cement", "water", "coarse_aggregate", "fine_aggregate", "age_days"],
            feature_types=["numeric", "numeric", "numeric", "numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest-regressor", "gradient-boosting-regressor", "ridge"],
            tags=["housing", "regression", "engineering", "kaggle"], license="CC0", loader=_load_concrete),
    ]
    for entry in datasets:
        DatasetRegistry.register(entry)
