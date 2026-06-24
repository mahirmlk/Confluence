import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel
from sklearn.neural_network import MLPRegressor
import warnings
from contextlib import contextmanager

@contextmanager
def _suppress_user_warnings():
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", category=UserWarning)
        yield

REGRESSION_ALGORITHMS = {
    "linear-regression": lambda params: LinearRegression(),
    "ridge": lambda params: Ridge(alpha=params.get("alpha", 1.0)),
    "lasso": lambda params: Lasso(alpha=params.get("alpha", 1.0), max_iter=5000),
    "elastic-net": lambda params: ElasticNet(alpha=params.get("alpha", 1.0), l1_ratio=params.get("l1_ratio", 0.5), max_iter=5000),
    "decision-tree-regressor": lambda params: DecisionTreeRegressor(max_depth=int(params.get("max_depth", 5)), random_state=42),
    "random-forest-regressor": lambda params: RandomForestRegressor(n_estimators=int(params.get("n_estimators", 100)), random_state=42),
    "gradient-boosting-regressor": lambda params: GradientBoostingRegressor(n_estimators=int(params.get("n_estimators", 100)), random_state=42),
    "svr-linear": lambda params: SVR(C=params.get("C", 1.0), kernel="linear"),
    "svr-rbf": lambda params: SVR(C=params.get("C", 1.0), kernel="rbf"),
    "svr-poly": lambda params: SVR(C=params.get("C", 1.0), kernel="poly", degree=int(params.get("degree", 3))),
    "knn-regressor": lambda params: KNeighborsRegressor(n_neighbors=int(params.get("n_neighbors", 5))),
    "gaussian-process-regressor": lambda params: GaussianProcessRegressor(
        kernel=ConstantKernel(1.0) * RBF(1.0), alpha=params.get("alpha", 1e-3), random_state=42
    ),
    "mlp-regressor": lambda params: MLPRegressor(
        hidden_layer_sizes=(int(params.get("hidden_layer_sizes", 100)),), max_iter=500, random_state=42
    ),
}


def fit_and_predict_grid_regression(
    algorithm_name: str,
    params: dict,
    X_train: np.ndarray,
    y_train: np.ndarray,
    xx: np.ndarray,
    yy: np.ndarray,
) -> tuple[np.ndarray, np.ndarray | None]:
    if algorithm_name not in REGRESSION_ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_name}")

    model = REGRESSION_ALGORITHMS[algorithm_name](params)
    model.fit(X_train, y_train)

    grid_points = np.column_stack([xx.ravel(), yy.ravel()])
    predictions = model.predict(grid_points)
    pred_grid = predictions.reshape(xx.shape)

    std_grid = None
    if hasattr(model, "predict") and algorithm_name == "gaussian-process-regressor":
        _, std = model.predict(grid_points, return_std=True)
        std_grid = std.reshape(xx.shape)

    return pred_grid, std_grid
