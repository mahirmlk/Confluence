import numpy as np
from skimage.measure import find_contours


def generate_meshgrid(x_range: tuple[float, float], y_range: tuple[float, float], resolution: int) -> tuple[np.ndarray, np.ndarray]:
    x = np.linspace(x_range[0], x_range[1], resolution)
    y = np.linspace(y_range[0], y_range[1], resolution)
    xx, yy = np.meshgrid(x, y)
    return xx, yy


def extract_contours(grid: np.ndarray, threshold: float = 0.5) -> list[list[list[float]]]:
    contours = find_contours(grid, level=threshold)
    result = []
    for contour in contours:
        result.append(contour.tolist())
    return result


def compute_grid_bounds(X: np.ndarray, padding: float = 1.0) -> tuple[float, float, float, float]:
    x_min, x_max = X[:, 0].min() - padding, X[:, 0].max() + padding
    y_min, y_max = X[:, 1].min() - padding, X[:, 1].max() + padding
    return x_min, x_max, y_min, y_max
