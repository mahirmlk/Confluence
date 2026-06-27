from .registry import DatasetRegistry
from .metadata import DatasetEntry
from . import classification, regression, clustering


def register_all_datasets() -> None:
    """Register every built-in dataset with the registry."""
    classification.register()
    regression.register()
    clustering.register()
