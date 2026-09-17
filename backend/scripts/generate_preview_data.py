"""Generate the landing-page product-preview data from a REAL model run.

Replicates exactly what the Confluence visualizer does for
logistic-regression on the built-in breast-cancer dataset:

- features: mean radius + mean texture (first two columns, as in
  app/algorithms/datasets.py::_load_breast_cancer_2d)
- sample: 300 points via RandomState(42).choice (visualizer default)
- model: LogisticRegression(C=1.0, max_iter=1000, random_state=42)
  (app/algorithms/classification.py)
- boundary: fitted on the same 300 points the canvas would show
- metrics: stratified 80/20 split, same hyperparams (honest holdout)
- curve: test accuracy vs training size on a fixed holdout (real values)

Output: frontend/src/components/landing/product-preview-data.json
Coordinates are pre-mapped to the preview SVG viewBox (560x360) and the
sparkline viewBox (200x56). Re-run any time to refresh the snapshot.
"""

import json
from pathlib import Path

import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import StratifiedShuffleSplit

VIEW_W, VIEW_H, PAD = 560, 360, 24
SPARK_W, SPARK_H = 200, 56
N_POINTS = 300
FIT_DATE = "2026-09-17"


def make_model() -> LogisticRegression:
    return LogisticRegression(C=1.0, max_iter=1000, random_state=42)


def load_points(n: int = N_POINTS):
    data = load_breast_cancer()
    X = data.data[:, [0, 1]]
    y = data.target
    idx = np.random.RandomState(42).choice(len(X), n, replace=False)
    return X[idx], y[idx]


def make_mapper(X):
    x0, y0 = X[:, 0].min(), X[:, 1].min()
    x1, y1 = X[:, 0].max(), X[:, 1].max()

    def to_svg(x, y):
        sx = PAD + (x - x0) / (x1 - x0) * (VIEW_W - 2 * PAD)
        sy = PAD + (1 - (y - y0) / (y1 - y0)) * (VIEW_H - 2 * PAD)
        return [round(float(sx), 1), round(float(sy), 1)]

    return to_svg


def clip_rect_to_halfplane(w, h, a, b, c, keep_positive: bool):
    """Sutherland-Hodgman clip of the [0,w]x[0,h] rect to ax+by+c >= 0 (or <= 0)."""
    poly = [(0.0, 0.0), (float(w), 0.0), (float(w), float(h)), (0.0, float(h))]

    def inside(p):
        v = a * p[0] + b * p[1] + c
        return v >= 0 if keep_positive else v <= 0

    def intersect(p, q):
        vp, vq = a * p[0] + b * p[1] + c, a * q[0] + b * q[1] + c
        t = vp / (vp - vq)
        return (p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1]))

    out, prev, prev_in = [], poly[-1], inside(poly[-1])
    for p in poly:
        cur_in = inside(p)
        if cur_in and prev_in:
            out.append(p)
        elif cur_in:
            out.append(intersect(prev, p))
            out.append(p)
        elif prev_in:
            out.append(intersect(prev, p))
        prev, prev_in = p, cur_in
    return [[round(x, 1), round(y, 1)] for x, y in out]


def main() -> None:
    X, y = load_points()

    # Boundary model: fit on the same 300 points the canvas shows.
    model = make_model().fit(X, y)
    w, b = model.coef_[0], model.intercept_[0]

    to_svg = make_mapper(X)

    # Decision line w.x + b = 0 in SVG space: map two far-apart data points,
    # then clip the segment to the viewBox so the payload stays clean.
    x_lo, x_hi = X[:, 0].min() - 1.0, X[:, 0].max() + 1.0
    y_lo = -(w[0] * x_lo + b) / w[1]
    y_hi = -(w[0] * x_hi + b) / w[1]
    p0, p1 = to_svg(x_lo, y_lo), to_svg(x_hi, y_hi)

    def clip_segment(p, q):
        """Liang-Barsky clip of segment p->q to the viewBox rect."""
        dx, dy = q[0] - p[0], q[1] - p[1]
        t0, t1 = 0.0, 1.0
        # Each row enforces plen + t*d >= 0 for one rect edge.
        for plen, d in (
            (p[0], dx),            # x >= 0
            (VIEW_W - p[0], -dx),  # x <= VIEW_W
            (p[1], dy),            # y >= 0
            (VIEW_H - p[1], -dy),  # y <= VIEW_H
        ):
            if abs(d) < 1e-12:
                if plen < 0:
                    return None
                continue
            t = -plen / d
            if d > 0:
                t0 = max(t0, t)
            else:
                t1 = min(t1, t)
            if t0 > t1:
                return None
        return [
            [round(p[0] + t0 * dx, 1), round(p[1] + t0 * dy, 1)],
            [round(p[0] + t1 * dx, 1), round(p[1] + t1 * dy, 1)],
        ]

    boundary = clip_segment(p0, p1)
    assert boundary is not None, "decision line misses the viewBox"

    # Region fills: clip the viewBox rect against the mapped line.
    (ax, ay), (bx, by) = boundary
    la, lb, lc = ay - by, bx - ax, ax * by - bx * ay  # through (ax,ay),(bx,by)

    def centroid(poly):
        xs = [p[0] for p in poly]
        ys = [p[1] for p in poly]
        return (sum(xs) / len(xs), sum(ys) / len(ys))

    # Map the data-space prediction back: check which SVG side holds class 1
    # by testing the data centroid of each class.
    regions = {}
    for keep_positive in (True, False):
        poly = clip_rect_to_halfplane(VIEW_W, VIEW_H, la, lb, lc, keep_positive)
        cx, cy = centroid(poly)
        # Map the region centroid back to data space and ask the fitted
        # model which class owns this side of the line.
        x0, y0 = X[:, 0].min(), X[:, 1].min()
        x1, y1 = X[:, 0].max(), X[:, 1].max()
        dx = x0 + (cx - PAD) / (VIEW_W - 2 * PAD) * (x1 - x0)
        dy = y0 + (1 - (cy - PAD) / (VIEW_H - 2 * PAD)) * (y1 - y0)
        cls = int(model.predict([[dx, dy]])[0])
        regions[f"class{cls}"] = poly

    points = [[sx, sy, int(c)] for (sx, sy), c in
              zip((to_svg(x, y) for x, y in X), y)]

    # Honest holdout metrics: stratified 80/20, same hyperparams.
    sss = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(sss.split(X, y))
    eval_model = make_model().fit(X[train_idx], y[train_idx])
    pred = eval_model.predict(X[test_idx])
    accuracy = round(float(accuracy_score(y[test_idx], pred)), 2)
    f1 = round(float(f1_score(y[test_idx], pred)), 2)

    # Learning curve: test accuracy vs training size, fixed holdout.
    sizes = [30, 60, 90, 120, 150, 180, 210]
    scores = []
    for n in sizes:
        sub = StratifiedShuffleSplit(n_splits=1, train_size=n, random_state=42)
        tr, _ = next(sub.split(X[train_idx], y[train_idx]))
        m = make_model().fit(X[train_idx][tr], y[train_idx][tr])
        scores.append(float(accuracy_score(y[test_idx], m.predict(X[test_idx]))))
    lo, hi = min(scores + [0.5]), max(scores + [1.0])
    span = (hi - lo) or 1.0
    curve = [
        [round(4 + i * (192 / (len(sizes) - 1)), 1),
         round(4 + (1 - (s - lo) / span) * 44, 1)]
        for i, s in enumerate(scores)
    ]

    payload = {
        "provenance": {
            "dataset": "breast-cancer (mean radius, mean texture)",
            "n_samples": N_POINTS,
            "algorithm": "logistic-regression",
            "hyperparameters": {"C": 1.0, "max_iter": 1000},
            "evaluation": "stratified 80/20 holdout, random_state=42",
            "fitted": FIT_DATE,
            "generator": "backend/scripts/generate_preview_data.py",
        },
        "boundary": boundary,
        "regions": regions,
        "points": points,
        "metrics": {"accuracy": accuracy, "f1": f1, "n_test": int(len(test_idx))},
        "curve": {"points": curve, "train_sizes": sizes,
                  "scores": [round(s, 3) for s in scores]},
    }
    out = (Path(__file__).resolve().parents[2]
           / "frontend" / "src" / "components" / "landing"
           / "product-preview-data.json")
    out.write_text(json.dumps(payload, indent=2))
    print(f"wrote {out}")
    print(f"accuracy={accuracy} f1={f1} n_test={len(test_idx)}")
    print(f"curve scores={ [round(s,3) for s in scores] }")
    assert 0.80 <= accuracy <= 1.0, accuracy
    assert 0.80 <= f1 <= 1.0, f1


if __name__ == "__main__":
    main()
