"""Sanitize user-supplied hyperparameters before model construction.

Every value arriving in a ``hyperparameters`` dict comes from the network.
Without bounds, a single request can ask for e.g. ``n_estimators=10**9``
and exhaust CPU/RAM. These caps sit far above every legitimate UI range
(the visualizer sends at most n_estimators=200, max_depth=20, ...), so
real usage is never affected — only abusive values are clamped.

Non-finite floats (NaN/inf, which JSON cannot even express but Python
clients can smuggle through other paths) fall back to the key being
dropped so each factory's own default applies.
"""

import math

_INT_CAPS: dict[str, tuple[int, int]] = {
    "n_estimators": (1, 500),
    "max_depth": (1, 50),
    "n_neighbors": (1, 200),
    "hidden_layer_sizes": (1, 500),
    "degree": (2, 6),
    "min_samples": (1, 200),
    "n_clusters": (2, 50),
    "n_components": (2, 10),
    "perplexity": (1, 200),
    "max_iter": (1, 10000),
    "n_init": (1, 50),
}

_FLOAT_CAPS: dict[str, tuple[float, float]] = {
    "C": (1e-6, 1e4),
    "alpha": (0.0, 1e4),
    "l1_ratio": (0.0, 1.0),
    "reg_param": (0.0, 1.0),
    "var_smoothing": (0.0, 1.0),
    "length_scale": (1e-3, 1e3),
    "eps": (1e-3, 100.0),
    "noise": (0.0, 5.0),
}


def sanitize_params(params: dict) -> dict:
    """Return a copy of params with explosive values clamped to safe ranges."""
    if not isinstance(params, dict):
        return {}
    clean: dict = {}
    for key, value in list(params.items())[:25]:
        if key in _INT_CAPS:
            lo, hi = _INT_CAPS[key]
            clean[key] = min(max(int(value), lo), hi)
        elif key in _FLOAT_CAPS:
            lo, hi = _FLOAT_CAPS[key]
            number = float(value)
            if not math.isfinite(number):
                continue
            clean[key] = min(max(number, lo), hi)
        else:
            clean[key] = value
    return clean
