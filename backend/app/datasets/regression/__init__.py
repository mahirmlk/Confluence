import numpy as np
from sklearn.datasets import load_diabetes, fetch_california_housing
from ..registry import DatasetRegistry
from ..metadata import DatasetEntry


def _load_california_housing(n_samples: int = 500, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = fetch_california_housing()
    X = data.data[:, :2]
    y = data.target
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_california_housing_full(n_samples: int = 500, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = fetch_california_housing()
    X, y = data.data, data.target
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_diabetes_dataset(n_samples: int = 442, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_diabetes()
    X = data.data[:, [2, 8]]
    y = data.target
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_diabetes_full(n_samples: int = 442, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    data = load_diabetes()
    X, y = data.data, data.target
    if n_samples < len(X):
        idx = np.random.RandomState(42).choice(len(X), n_samples, replace=False)
        X, y = X[idx], y[idx]
    return X, y


def _load_bike_sharing(n_samples: int = 500, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Bike Sharing demand — synthetic version."""
    rng = np.random.RandomState(42)
    n = n_samples
    temp = rng.uniform(-5, 35, n)
    humidity = rng.uniform(0, 100, n)
    windspeed = rng.uniform(0, 50, n)
    hour = rng.choice(range(24), n)
    season = rng.choice([1, 2, 3, 4], n)

    count = (
        50
        + 3 * temp
        - 0.5 * humidity
        - 0.3 * windspeed
        + 20 * np.sin(2 * np.pi * hour / 24)
        + 30 * (season == 3).astype(float)
        + rng.normal(0, 20, n)
    )
    y = np.clip(count, 0, None)
    X = np.column_stack([temp, humidity, windspeed, hour, season])
    return X, y


def _load_insurance(n_samples: int = 500, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Insurance charges — synthetic version."""
    rng = np.random.RandomState(42)
    n = n_samples
    age = rng.normal(39, 14, n).clip(18, 64).astype(int)
    bmi = rng.normal(30.6, 6, n).clip(15, 55)
    children = rng.choice([0, 1, 2, 3, 4, 5], n)
    smoker = rng.choice([0, 1], n, p=[0.75, 0.25])
    sex = rng.choice([0, 1], n)

    charges = (
        2500
        + 250 * age
        + 300 * bmi
        + 500 * children
        + 24000 * smoker
        + 500 * sex
        + rng.normal(0, 2000, n)
    )
    y = np.clip(charges, 1000, None)
    X = np.column_stack([age, bmi, children, smoker, sex])
    return X, y


def _load_concrete(n_samples: int = 500, noise: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Concrete strength — synthetic version."""
    rng = np.random.RandomState(42)
    n = n_samples
    cement = rng.uniform(100, 500, n)
    water = rng.uniform(120, 250, n)
    coarse_agg = rng.uniform(800, 1100, n)
    fine_agg = rng.uniform(600, 900, n)
    age_days = rng.choice([1, 3, 7, 14, 28, 56, 90, 365], n)

    strength = (
        -10
        + 0.08 * cement
        - 0.03 * water
        + 0.005 * coarse_agg
        + 0.003 * fine_agg
        + 5 * np.log(age_days + 1)
        + rng.normal(0, 3, n)
    )
    y = np.clip(strength, 0, None)
    X = np.column_stack([cement, water, coarse_agg, fine_agg, age_days])
    return X, y


def register() -> None:
    datasets = [
        DatasetEntry(
            name="california-housing", display_name="California Housing",
            description="California housing prices (MedInc, HouseAge)",
            story="Predict median house value in California districts using income and house age.",
            source="sklearn", family="regression", category="housing",
            target_column="median_house_value", n_rows=20640, n_features=2, n_classes=None,
            feature_names=["median_income", "house_age"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["linear-regression", "random-forest-regressor", "gradient-boosting-regressor"],
            tags=["classic", "housing", "regression"],
            license="Public Domain", loader=_load_california_housing,
        ),
        DatasetEntry(
            name="california-housing-full", display_name="California Housing (8 features)",
            description="California housing with all 8 features",
            story="Full California housing dataset with all district features.",
            source="sklearn", family="regression", category="housing",
            target_column="median_house_value", n_rows=20640, n_features=8, n_classes=None,
            feature_names=["median_income", "house_age", "avg_rooms", "avg_bedrooms",
                          "population", "avg_occupants", "latitude", "longitude"],
            feature_types=["numeric"] * 8,
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest-regressor", "gradient-boosting-regressor", "ridge"],
            tags=["classic", "housing", "regression", "full"],
            license="Public Domain", loader=_load_california_housing_full,
        ),
        DatasetEntry(
            name="diabetes", display_name="Diabetes", description="Diabetes progression (BMI, S5)",
            story="Predict diabetes progression one year after baseline using BMI and blood serum measurements.",
            source="sklearn", family="regression", category="healthcare",
            target_column="progression", n_rows=442, n_features=2, n_classes=None,
            feature_names=["bmi", "s5"], feature_types=["numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["linear-regression", "ridge", "random-forest-regressor"],
            tags=["classic", "healthcare", "regression"],
            license="Public Domain", loader=_load_diabetes_dataset,
        ),
        DatasetEntry(
            name="diabetes-full", display_name="Diabetes (10 features)",
            description="Diabetes with all 10 features",
            story="Full diabetes dataset with all baseline measurements.",
            source="sklearn", family="regression", category="healthcare",
            target_column="progression", n_rows=442, n_features=10, n_classes=None,
            feature_names=["age", "sex", "bmi", "bp", "s1", "s2", "s3", "s4", "s5", "s6"],
            feature_types=["numeric"] * 10,
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["ridge", "lasso", "random-forest-regressor", "gradient-boosting-regressor"],
            tags=["classic", "healthcare", "regression", "full"],
            license="Public Domain", loader=_load_diabetes_full,
        ),
        DatasetEntry(
            name="bike-sharing", display_name="Bike Sharing", description="Bike rental demand prediction",
            story="Predict hourly bike rental count based on weather, time, and season.",
            source="synthetic", family="regression", category="business",
            target_column="count", n_rows=500, n_features=5, n_classes=None,
            feature_names=["temperature", "humidity", "windspeed", "hour", "season"],
            feature_types=["numeric", "numeric", "numeric", "numeric", "categorical"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest-regressor", "gradient-boosting-regressor", "ridge"],
            tags=["business", "regression", "time-series", "synthetic"],
            license="CC0", loader=_load_bike_sharing,
        ),
        DatasetEntry(
            name="insurance", display_name="Insurance", description="Insurance charges prediction",
            story="Predict medical insurance charges based on age, BMI, smoking status, and other factors.",
            source="synthetic", family="regression", category="finance",
            target_column="charges", n_rows=500, n_features=5, n_classes=None,
            feature_names=["age", "bmi", "children", "smoker", "sex"],
            feature_types=["numeric", "numeric", "numeric", "binary", "binary"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest-regressor", "gradient-boosting-regressor", "linear-regression"],
            tags=["finance", "regression", "synthetic"],
            license="CC0", loader=_load_insurance,
        ),
        DatasetEntry(
            name="concrete", display_name="Concrete", description="Concrete strength prediction",
            story="Predict concrete compressive strength from mixture components and curing age.",
            source="synthetic", family="regression", category="housing",
            target_column="strength", n_rows=500, n_features=5, n_classes=None,
            feature_names=["cement", "water", "coarse_aggregate", "fine_aggregate", "age_days"],
            feature_types=["numeric", "numeric", "numeric", "numeric", "numeric"],
            missing_values=False, difficulty="intermediate",
            recommended_algorithms=["random-forest-regressor", "gradient-boosting-regressor", "ridge"],
            tags=["housing", "regression", "engineering", "synthetic"],
            license="CC0", loader=_load_concrete,
        ),
    ]

    for entry in datasets:
        DatasetRegistry.register(entry)
