"""Preprocess all raw Kaggle datasets into clean, ML-ready CSVs.

Run: python -m app.datasets.preprocess
"""
import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
RAW_DIR = DATA_DIR / "raw"
PREP_DIR = DATA_DIR / "preprocessed"


def preprocess_titanic():
    """Titanic: Age, Fare, SibSp, Parch, Sex(0/1), Pclass -> Survived"""
    df = pd.read_csv(RAW_DIR / "classification" / "titanic" / "train_and_test2.csv")
    df = df.rename(columns={"2urvived": "Survived", "sibsp": "SibSp"})
    df = df[["Age", "Fare", "SibSp", "Parch", "Sex", "Pclass", "Survived"]].copy()
    df["Age"] = df["Age"].fillna(df["Age"].median())
    df["Fare"] = df["Fare"].fillna(df["Fare"].median())
    df = df.dropna()
    df = df.astype(float)
    df.to_csv(PREP_DIR / "classification" / "titanic.csv", index=False)
    return "titanic", len(df), list(df.columns[:-1])


def preprocess_penguins():
    """Penguins: bill_length, flipper_length -> species (0/1/2)"""
    df = pd.read_csv(RAW_DIR / "classification" / "penguins" / "penguins.csv")
    df = df.drop(columns=[c for c in df.columns if c.startswith("Unnamed")])
    df = df.dropna(subset=["bill_length_mm", "flipper_length_mm", "species"])
    species_map = {"Adelie": 0, "Chinstrap": 1, "Gentoo": 2}
    df = df[df["species"].isin(species_map.keys())].copy()
    df["species"] = df["species"].map(species_map)
    df = df[["bill_length_mm", "flipper_length_mm", "species"]].astype(float)
    df.to_csv(PREP_DIR / "classification" / "penguins.csv", index=False)
    return "penguins", len(df), ["bill_length_mm", "flipper_length_mm"]


def preprocess_heart_disease():
    """Heart Disease: age, sex, cp, trestbps, chol, thalach, oldpeak -> target"""
    df = pd.read_csv(RAW_DIR / "classification" / "heart-disease" / "heart.csv")
    cols = ["age", "sex", "cp", "trestbps", "chol", "thalach", "oldpeak", "target"]
    df = df[cols].dropna().astype(float)
    df.to_csv(PREP_DIR / "classification" / "heart_disease.csv", index=False)
    return "heart_disease", len(df), cols[:-1]


def preprocess_adult_income():
    """Adult Income: age, education_num, hours_per_week, capital_gain, sex(0/1) -> income(0/1)"""
    df = pd.read_csv(RAW_DIR / "classification" / "adult-income" / "adult.csv")
    df = df.replace("?", np.nan).dropna()
    df["income_bin"] = (df["income"].str.strip().str.replace(".", "", regex=False) == ">50K").astype(int)
    df["sex_bin"] = (df["sex"].str.strip() == "Male").astype(int)
    cols = ["age", "education.num", "hours.per.week", "capital.gain", "sex_bin", "income_bin"]
    df = df[cols].copy()
    df.columns = ["age", "education_num", "hours_per_week", "capital_gain", "sex", "income"]
    df = df.apply(pd.to_numeric, errors="coerce").dropna().astype(float)
    df.to_csv(PREP_DIR / "classification" / "adult_income.csv", index=False)
    return "adult_income", len(df), ["age", "education_num", "hours_per_week", "capital_gain", "sex"]


def preprocess_mushroom():
    """Mushroom: cap_shape, cap_surface, bruises, odor, gill_size, gill_color, stalk_shape -> class(0/1)"""
    df = pd.read_csv(RAW_DIR / "classification" / "mushroom" / "mushrooms.csv")
    df["target"] = (df["class"] == "p").astype(int)
    feature_map = {
        "cap-shape": {"b": 0, "c": 1, "f": 2, "k": 3, "s": 4, "x": 5},
        "cap-surface": {"f": 0, "g": 1, "s": 2, "y": 3},
        "bruises": {"f": 0, "t": 1},
        "odor": {"a": 0, "c": 1, "f": 2, "l": 3, "m": 4, "n": 5, "p": 6, "s": 7, "y": 8},
        "gill-size": {"b": 0, "n": 1},
        "gill-color": {"b": 0, "e": 1, "g": 2, "h": 3, "k": 4, "n": 5, "o": 6, "p": 7, "r": 8, "u": 9, "w": 10, "y": 11},
        "stalk-shape": {"e": 0, "t": 1},
    }
    for col, mapping in feature_map.items():
        df[col] = df[col].map(mapping)
    feature_cols = list(feature_map.keys())
    df = df[feature_cols + ["target"]].dropna().astype(float)
    df.columns = ["cap_shape", "cap_surface", "bruises", "odor", "gill_size", "gill_color", "stalk_shape", "target"]
    df.to_csv(PREP_DIR / "classification" / "mushroom.csv", index=False)
    return "mushroom", len(df), ["cap_shape", "cap_surface", "bruises", "odor", "gill_size", "gill_color", "stalk_shape"]


def preprocess_wine_quality():
    """Wine Quality: fixed_acidity, volatile_acidity, citric_acid, residual_sugar, alcohol, pH -> quality(0/1)"""
    df = pd.read_csv(RAW_DIR / "classification" / "wine-quality" / "winequality-red.csv")
    cols = ["fixed acidity", "volatile acidity", "citric acid", "residual sugar", "alcohol", "pH", "quality"]
    df = df[cols].dropna()
    df["quality"] = (df["quality"] >= 6).astype(int)
    df.columns = ["fixed_acidity", "volatile_acidity", "citric_acid", "residual_sugar", "alcohol", "pH", "target"]
    df = df.astype(float)
    df.to_csv(PREP_DIR / "classification" / "wine_quality.csv", index=False)
    return "wine_quality", len(df), ["fixed_acidity", "volatile_acidity", "citric_acid", "residual_sugar", "alcohol", "pH"]


def preprocess_california_housing():
    """California Housing: median_income, housing_median_age, total_rooms, ocean_proximity(0-4) -> median_house_value"""
    df = pd.read_csv(RAW_DIR / "regression" / "california-housing" / "housing.csv")
    df = df.dropna()
    ocean_map = {"<1H OCEAN": 0, "INLAND": 1, "ISLAND": 2, "NEAR BAY": 3, "NEAR OCEAN": 4}
    df["ocean_proximity"] = df["ocean_proximity"].map(ocean_map)
    cols = ["median_income", "housing_median_age", "total_rooms", "ocean_proximity", "median_house_value"]
    df = df[cols].dropna().astype(float)
    df["median_house_value"] = df["median_house_value"] / 100000.0
    df.to_csv(PREP_DIR / "regression" / "california_housing.csv", index=False)
    return "california_housing", len(df), ["median_income", "housing_median_age", "total_rooms", "ocean_proximity"]


def preprocess_diabetes():
    """Pima Diabetes: Glucose, BMI, Age, Pregnancies, BloodPressure -> Outcome"""
    df = pd.read_csv(RAW_DIR / "regression" / "diabetes-kaggle" / "diabetes.csv")
    cols = ["Glucose", "BMI", "Age", "Pregnancies", "BloodPressure", "Outcome"]
    df = df[cols].dropna().astype(float)
    df.columns = ["glucose", "bmi", "age", "pregnancies", "blood_pressure", "target"]
    df.to_csv(PREP_DIR / "regression" / "diabetes.csv", index=False)
    return "diabetes", len(df), ["glucose", "bmi", "age", "pregnancies", "blood_pressure"]


def preprocess_insurance():
    """Insurance: age, bmi, children, sex(0/1), smoker(0/1), region(0-3) -> charges"""
    df = pd.read_csv(RAW_DIR / "regression" / "insurance" / "insurance.csv")
    df["sex_bin"] = (df["sex"] == "male").astype(int)
    df["smoker_bin"] = (df["smoker"] == "yes").astype(int)
    region_map = {"southwest": 0, "southeast": 1, "northwest": 2, "northeast": 3}
    df["region_enc"] = df["region"].map(region_map)
    cols = ["age", "bmi", "children", "sex_bin", "smoker_bin", "region_enc", "charges"]
    df = df[cols].dropna().astype(float)
    df.columns = ["age", "bmi", "children", "sex", "smoker", "region", "charges"]
    df.to_csv(PREP_DIR / "regression" / "insurance.csv", index=False)
    return "insurance", len(df), ["age", "bmi", "children", "sex", "smoker", "region"]


def preprocess_concrete():
    """Concrete: Cement, Water, Coarse Aggregate, Fine Aggregate, Age -> Strength"""
    df = pd.read_csv(RAW_DIR / "regression" / "concrete" / "concrete_data.csv")
    df = df.apply(pd.to_numeric, errors="coerce").dropna()
    cols = ["Cement", "Water", "Coarse Aggregate", "Fine Aggregate", "Age", "Strength"]
    df = df[cols].copy()
    df.columns = ["cement", "water", "coarse_aggregate", "fine_aggregate", "age_days", "strength"]
    df = df.astype(float)
    df.to_csv(PREP_DIR / "regression" / "concrete.csv", index=False)
    return "concrete", len(df), ["cement", "water", "coarse_aggregate", "fine_aggregate", "age_days"]


def preprocess_mall_customers():
    """Mall Customers: Annual Income, Spending Score -> cluster label"""
    df = pd.read_csv(RAW_DIR / "clustering" / "mall-customers" / "Mall_Customers.csv")
    df = df.rename(columns={"Annual Income (k$)": "Income", "Spending Score (1-100)": "Score"})
    df = df[["Income", "Score"]].dropna().astype(float)

    # Assign cluster labels based on quadrants
    income_med = df["Income"].median()
    score_med = df["Score"].median()
    df["cluster"] = 0
    df.loc[(df["Income"] <= income_med) & (df["Score"] > score_med), "cluster"] = 1
    df.loc[(df["Income"] > income_med) & (df["Score"] <= score_med), "cluster"] = 2
    df.loc[(df["Income"] > income_med) & (df["Score"] > score_med), "cluster"] = 3

    df.to_csv(PREP_DIR / "clustering" / "mall_customers.csv", index=False)
    return "mall_customers", len(df), ["Income", "Score"]


def preprocess_wholesale_customers():
    """Wholesale Customers: Fresh, Milk, Grocery, Frozen -> cluster label"""
    df = pd.read_csv(RAW_DIR / "clustering" / "wholesale-customers" / "Wholesale customers data.csv")
    df = df[["Fresh", "Milk", "Grocery", "Frozen"]].dropna().astype(float)

    # Cluster by dominant spending category
    total = df.values.sum(axis=1, keepdims=True)
    total[total == 0] = 1
    df["cluster"] = np.argmax(df.values / total, axis=1).astype(int)

    df.to_csv(PREP_DIR / "clustering" / "wholesale_customers.csv", index=False)
    return "wholesale_customers", len(df), ["Fresh", "Milk", "Grocery", "Frozen"]


def preprocess_seeds():
    """Wheat Seeds: Area, Perimeter, Compactness, Kernel Length -> Type (0/1/2)"""
    df = pd.read_csv(RAW_DIR / "clustering" / "seeds" / "seeds.csv")
    cols = ["Area", "Perimeter", "Compactness", "Kernel.Length", "Type"]
    df = df[cols].dropna()
    df["Type"] = df["Type"] - 1  # Shift from 1-3 to 0-2
    df.columns = ["area", "perimeter", "compactness", "kernel_length", "cluster"]
    df = df.astype(float)
    df.to_csv(PREP_DIR / "clustering" / "seeds.csv", index=False)
    return "seeds", len(df), ["area", "perimeter", "compactness", "kernel_length"]


ALL_PREPROCESSORS = [
    preprocess_titanic,
    preprocess_penguins,
    preprocess_heart_disease,
    preprocess_adult_income,
    preprocess_mushroom,
    preprocess_wine_quality,
    preprocess_california_housing,
    preprocess_diabetes,
    preprocess_insurance,
    preprocess_concrete,
    preprocess_mall_customers,
    preprocess_wholesale_customers,
    preprocess_seeds,
]


def run_all():
    print("=" * 60)
    print("PREPROCESSING DATASETS")
    print("=" * 60)

    for preprocess_fn in ALL_PREPROCESSORS:
        try:
            name, n_rows, features = preprocess_fn()
            print(f"  OK   {name:25s}  {n_rows:6d} rows  {len(features)} features")
        except Exception as e:
            print(f"  FAIL {preprocess_fn.__name__:25s}  {e}")

    print("=" * 60)
    print("Done. Preprocessed files saved to:")
    print(f"  {PREP_DIR}")


if __name__ == "__main__":
    run_all()
