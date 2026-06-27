from __future__ import annotations
from dataclasses import dataclass, field
from typing import Callable, Optional
import numpy as np


@dataclass
class DatasetEntry:
    name: str
    display_name: str
    description: str
    story: str
    source: str
    family: str
    category: str
    target_column: Optional[str]
    n_rows: int
    n_features: int
    n_classes: Optional[int]
    feature_names: list[str]
    feature_types: list[str]
    missing_values: bool
    difficulty: str
    recommended_algorithms: list[str]
    tags: list[str]
    license: Optional[str]
    loader: Callable[..., tuple[np.ndarray, np.ndarray]]
    preprocessing: Optional[Callable] = None
