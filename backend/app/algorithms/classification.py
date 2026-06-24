from sklearn.linear_model import LogisticRegression, Perceptron
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, AdaBoostClassifier, GradientBoostingClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.discriminant_analysis import QuadraticDiscriminantAnalysis
from sklearn.gaussian_process import GaussianProcessClassifier
from sklearn.gaussian_process.kernels import RBF
from sklearn.neural_network import MLPClassifier
from sklearn.calibration import CalibratedClassifierCV
import numpy as np


CLASSIFICATION_ALGORITHMS = {
    "logistic-regression": lambda params: LogisticRegression(
        C=params.get("C", 1.0), max_iter=1000, random_state=42
    ),
    "knn": lambda params: KNeighborsClassifier(
        n_neighbors=int(params.get("n_neighbors", 5))
    ),
    "decision-tree": lambda params: DecisionTreeClassifier(
        max_depth=int(params.get("max_depth", 5)), random_state=42
    ),
    "rbf-svm": lambda params: SVC(
        C=params.get("C", 1.0), kernel="rbf", probability=True, random_state=42
    ),
    "linear-svm": lambda params: SVC(
        C=params.get("C", 1.0), kernel="linear", probability=True, random_state=42
    ),
    "poly-svm": lambda params: SVC(
        C=params.get("C", 1.0), kernel="poly", probability=True, random_state=42
    ),
    "random-forest": lambda params: RandomForestClassifier(
        n_estimators=int(params.get("n_estimators", 100)), random_state=42
    ),
    "extra-trees": lambda params: ExtraTreesClassifier(
        n_estimators=int(params.get("n_estimators", 100)), random_state=42
    ),
    "adaboost": lambda params: AdaBoostClassifier(
        n_estimators=int(params.get("n_estimators", 50)), random_state=42
    ),
    "gradient-boosting": lambda params: GradientBoostingClassifier(
        n_estimators=int(params.get("n_estimators", 100)), random_state=42
    ),
    "gaussian-nb": lambda params: GaussianNB(
        var_smoothing=params.get("var_smoothing", 1e-9)
    ),
    "qda": lambda params: QuadraticDiscriminantAnalysis(
        reg_param=params.get("reg_param", 0.01)
    ),
    "gp-classifier": lambda params: GaussianProcessClassifier(
        kernel=RBF(params.get("length_scale", 1.0)),
        random_state=42, max_iter_predict=200
    ),
    "perceptron": lambda params: CalibratedClassifierCV(
        Perceptron(alpha=params.get("alpha", 0.0001), max_iter=1000, random_state=42),
        cv=3
    ),
    "mlp": lambda params: MLPClassifier(
        hidden_layer_sizes=(int(params.get("hidden_layer_sizes", 100)),),
        max_iter=500, random_state=42
    ),
}


def fit_and_predict_grid(
    algorithm_name: str,
    params: dict,
    X_train: np.ndarray,
    y_train: np.ndarray,
    xx: np.ndarray,
    yy: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    if algorithm_name not in CLASSIFICATION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    model = CLASSIFICATION_ALGORITHMS[algorithm_name](params)
    model.fit(X_train, y_train)

    grid_points = np.column_stack([xx.ravel(), yy.ravel()])
    probabilities = model.predict_proba(grid_points)

    if probabilities.shape[1] == 2:
        prob_grid = probabilities[:, 1].reshape(xx.shape)
    else:
        prob_grid = probabilities.max(axis=1).reshape(xx.shape)

    return prob_grid, model
