from typing import Any


class LearningMode:
    """Provides educational context for visual elements."""

    BOUNDARY_EXPLANATIONS = {
        "logistic-regression": (
            "Logistic Regression places the decision boundary where P(y=1) = 0.5. "
            "The boundary is a straight line defined by w·x + b = 0. "
            "Points on one side are classified as class 0, on the other as class 1."
        ),
        "knn": (
            "KNN boundaries shift based on local class density. "
            "Each point is classified by majority vote of its {k} nearest neighbors. "
            "Boundaries are jagged where classes interleave."
        ),
        "decision-tree": (
            "Decision Tree creates axis-aligned splits. "
            "Each split divides the feature space into rectangles. "
            "Deeper trees create more complex, finer-grained boundaries."
        ),
        "random-forest": (
            "Random Forest averages many decision trees, each trained on different data subsets. "
            "This smooths out the jagged edges of individual trees. "
            "The boundary is an ensemble vote of all trees."
        ),
        "gradient-boosting": (
            "Gradient Boosting builds trees sequentially, each correcting the previous one's errors. "
            "The boundary becomes increasingly refined with more estimators."
        ),
        "rbf-svm": (
            "RBF SVM maps data to infinite dimensions using the kernel trick. "
            "The boundary is shaped by support vectors — points closest to the decision surface. "
            "The gamma parameter controls boundary complexity."
        ),
        "linear-svm": (
            "Linear SVM finds the maximum-margin hyperplane — the boundary that maximizes "
            "the distance between the closest points of each class."
        ),
        "gaussian-nb": (
            "Gaussian Naive Bayes assumes each feature follows a Gaussian distribution per class. "
            "The boundary is where the posterior probabilities of both classes are equal."
        ),
        "mlp": (
            "MLP learns a non-linear boundary through layers of neurons. "
            "Each neuron applies a linear transformation followed by a non-linear activation. "
            "The boundary complexity depends on the number of hidden units."
        ),
    }

    HYPERPARAMETER_EXPLANATIONS = {
        "decision-tree": {
            "max_depth": {
                "low": "Shallow tree (depth={value}) — simple boundary, may underfit. Creates broad, general regions.",
                "high": "Deep tree (depth={value}) — complex boundary, may overfit. Creates fine-grained regions that may memorize noise.",
            },
        },
        "knn": {
            "n_neighbors": {
                "low": "Small k={value} — captures local patterns, sensitive to noise. Boundary is jagged.",
                "high": "Large k={value} — smoother boundary, may miss local structure. Higher bias, lower variance.",
            },
        },
        "logistic-regression": {
            "C": {
                "low": "Low C={value} — strong regularization, simpler boundary. May underfit.",
                "high": "High C={value} — weak regularization, fits training data more closely. May overfit.",
            },
        },
        "random-forest": {
            "n_estimators": {
                "low": "Few trees ({value}) — faster but less stable. Boundary may have artifacts.",
                "high": "Many trees ({value}) — more stable, smoother boundary. Diminishing returns beyond ~100.",
            },
        },
        "gradient-boosting": {
            "n_estimators": {
                "low": "Few rounds ({value}) — underfits, boundary is too simple.",
                "high": "Many rounds ({value}) — risk of overfitting without early stopping.",
            },
        },
        "rbf-svm": {
            "C": {
                "low": "Low C={value} — wider margin, more misclassifications allowed. Smoother boundary.",
                "high": "High C={value} — narrow margin, fewer misclassifications. More complex boundary.",
            },
        },
        "mlp": {
            "hidden_layer_sizes": {
                "low": "Few neurons ({value}) — limited capacity, may underfit complex patterns.",
                "high": "Many neurons ({value}) — high capacity, may overfit small datasets.",
            },
        },
    }

    @classmethod
    def explain_boundary(cls, algorithm: str, hyperparams: dict = None) -> str:
        return cls.BOUNDARY_EXPLANATIONS.get(algorithm, "The decision boundary separates the feature space into regions for each class.")

    @classmethod
    def explain_hyperparameter(cls, algorithm: str, param: str, value: float) -> str:
        algo_explanations = cls.HYPERPARAMETER_EXPLANATIONS.get(algorithm, {})
        param_explanation = algo_explanations.get(param, {})
        threshold = "low" if value <= 5 else "high"
        template = param_explanation.get(threshold, f"{param} = {value}")
        return template.format(value=value)

    @classmethod
    def explain_metric_context(cls, metric_name: str, value: float, algorithm: str) -> str:
        contexts = {
            "accuracy": {
                "high": "High accuracy ({value:.1%}) — the model correctly classifies most samples. Check for class imbalance — high accuracy can be misleading if one class dominates.",
                "low": "Low accuracy ({value:.1%}) — the model struggles with this dataset. Consider a different algorithm or more features.",
                "medium": "Moderate accuracy ({value:.1%}) — the model captures some patterns but misses others. Try tuning hyperparameters or using a more complex algorithm.",
            },
            "precision": {
                "high": "High precision ({value:.1%}) — when the model predicts positive, it's usually right. Few false positives.",
                "low": "Low precision ({value:.1%}) — many false positives. The model is too aggressive in predicting the positive class.",
            },
            "recall": {
                "high": "High recall ({value:.1%}) — the model catches most actual positives. Few false negatives.",
                "low": "Low recall ({value:.1%}) — the model misses many actual positives. It's too conservative.",
            },
            "f1": {
                "high": "High F1 ({value:.1%}) — good balance between precision and recall.",
                "low": "Low F1 ({value:.1%}) — poor balance. Either precision or recall (or both) need improvement.",
            },
        }
        level = "high" if value >= 0.8 else "low" if value < 0.6 else "medium"
        metric_contexts = contexts.get(metric_name, {})
        template = metric_contexts.get(level, f"{metric_name} = {value:.4f}")
        return template.format(value=value)
