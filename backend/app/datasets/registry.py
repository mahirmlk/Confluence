from __future__ import annotations
import logging
from typing import Optional
from .metadata import DatasetEntry

logger = logging.getLogger(__name__)


class DatasetRegistry:
    _datasets: dict[str, DatasetEntry] = {}

    @classmethod
    def register(cls, entry: DatasetEntry) -> None:
        if entry.name in cls._datasets:
            logger.warning("Overwriting dataset '%s'", entry.name)
        cls._datasets[entry.name] = entry
        logger.debug("Registered dataset: %s (%s)", entry.name, entry.family)

    @classmethod
    def get(cls, name: str) -> DatasetEntry:
        if name not in cls._datasets:
            available = list(cls._datasets.keys())
            raise ValueError(f"Unknown dataset: '{name}'. Available: {available}")
        return cls._datasets[name]

    @classmethod
    def list_all(cls) -> list[DatasetEntry]:
        return list(cls._datasets.values())

    @classmethod
    def list_by_family(cls, family: str) -> list[DatasetEntry]:
        return [d for d in cls._datasets.values() if d.family == family]

    @classmethod
    def list_by_category(cls, category: str) -> list[DatasetEntry]:
        return [d for d in cls._datasets.values() if d.category == category]

    @classmethod
    def list_by_source(cls, source: str) -> list[DatasetEntry]:
        return [d for d in cls._datasets.values() if d.source == source]

    @classmethod
    def search(cls, query: str) -> list[DatasetEntry]:
        q = query.lower()
        return [
            d for d in cls._datasets.values()
            if q in d.name.lower()
            or q in d.display_name.lower()
            or q in d.description.lower()
            or any(q in tag.lower() for tag in d.tags)
        ]

    @classmethod
    def names(cls) -> list[str]:
        return list(cls._datasets.keys())

    @classmethod
    def exists(cls, name: str) -> bool:
        return name in cls._datasets

    @classmethod
    def clear(cls) -> None:
        cls._datasets.clear()
