import numpy as np


class MetricExplainer:
    """Breaks down metrics into understandable components."""

    @staticmethod
    def explain_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
        correct = int(np.sum(y_true == y_pred))
        total = len(y_true)
        per_class = []
        classes = sorted(set(y_true.tolist()))
        for c in classes:
            mask = y_true == c
            class_total = int(np.sum(mask))
            class_correct = int(np.sum((y_true == c) & (y_pred == c)))
            per_class.append({
                "class": int(c),
                "total": class_total,
                "correct": class_correct,
                "accuracy": round(class_correct / class_total, 4) if class_total > 0 else 0,
            })
        return {
            "value": round(correct / total, 4),
            "formula": "correct / total",
            "calculation": f"{correct} / {total}",
            "explanation": f"Out of {total} predictions, {correct} were correct.",
            "breakdown_by_class": per_class,
        }

    @staticmethod
    def explain_precision(y_true: np.ndarray, y_pred: np.ndarray, class_label: int = 1) -> dict:
        tp = int(np.sum((y_pred == class_label) & (y_true == class_label)))
        fp = int(np.sum((y_pred == class_label) & (y_true != class_label)))
        denom = tp + fp
        return {
            "value": round(tp / denom, 4) if denom > 0 else 0,
            "formula": "TP / (TP + FP)",
            "calculation": f"{tp} / ({tp} + {fp})",
            "explanation": f"Of the {denom} samples predicted as class {class_label}, {tp} were actually class {class_label}.",
            "tp": tp, "fp": fp,
        }

    @staticmethod
    def explain_recall(y_true: np.ndarray, y_pred: np.ndarray, class_label: int = 1) -> dict:
        tp = int(np.sum((y_pred == class_label) & (y_true == class_label)))
        fn = int(np.sum((y_pred != class_label) & (y_true == class_label)))
        denom = tp + fn
        return {
            "value": round(tp / denom, 4) if denom > 0 else 0,
            "formula": "TP / (TP + FN)",
            "calculation": f"{tp} / ({tp} + {fn})",
            "explanation": f"Of the {denom} actual class {class_label} samples, {tp} were correctly identified.",
            "tp": tp, "fn": fn,
        }

    @staticmethod
    def explain_f1(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
        p = MetricExplainer.explain_precision(y_true, y_pred)
        r = MetricExplainer.explain_recall(y_true, y_pred)
        pv, rv = p["value"], r["value"]
        f1 = 2 * pv * rv / (pv + rv) if (pv + rv) > 0 else 0
        return {
            "value": round(f1, 4),
            "formula": "2 * (precision * recall) / (precision + recall)",
            "calculation": f"2 * ({pv:.4f} * {rv:.4f}) / ({pv:.4f} + {rv:.4f})",
            "explanation": "Harmonic mean of precision and recall. Balances both metrics — low if either is low.",
            "precision": p, "recall": r,
        }

    @staticmethod
    def explain_confusion_matrix(cm: list[list[int]]) -> dict:
        n = len(cm)
        total = sum(sum(row) for row in cm)
        details = []
        for i in range(n):
            for j in range(n):
                if n == 2:
                    if i == j == 1:
                        label = "TP"
                    elif i == j == 0:
                        label = "TN"
                    elif j == 1:
                        label = "FP"
                    else:
                        label = "FN"
                else:
                    label = f"true={i},pred={j}"
                details.append({
                    "actual": i, "predicted": j,
                    "count": cm[i][j],
                    "percentage": round(cm[i][j] / total * 100, 1) if total > 0 else 0,
                    "label": label,
                })
        return {"details": details, "total": total}

    @staticmethod
    def explain_r2(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
        ss_res = float(np.sum((y_true - y_pred) ** 2))
        ss_tot = float(np.sum((y_true - np.mean(y_true)) ** 2))
        r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0
        return {
            "value": round(r2, 4),
            "formula": "1 - SS_res / SS_tot",
            "calculation": f"1 - {ss_res:.2f} / {ss_tot:.2f}",
            "explanation": f"The model explains {r2 * 100:.1f}% of the variance in the target. "
                          f"{'Good fit.' if r2 > 0.7 else 'Moderate fit.' if r2 > 0.4 else 'Poor fit — consider a different model.'}",
            "ss_res": round(ss_res, 2), "ss_tot": round(ss_tot, 2),
        }

    @staticmethod
    def explain_mse(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
        errors = y_true - y_pred
        mse = float(np.mean(errors ** 2))
        rmse = float(np.sqrt(mse))
        mae = float(np.mean(np.abs(errors)))
        return {
            "value": round(mse, 4),
            "formula": "mean((y_true - y_pred)^2)",
            "explanation": f"Average squared error: {mse:.4f}. RMSE: {rmse:.4f}. MAE: {mae:.4f}. "
                          f"{'Low error — good predictions.' if mse < 1 else 'Moderate error.' if mse < 10 else 'High error — model struggles.'}",
            "rmse": round(rmse, 4), "mae": round(mae, 4),
        }

    @classmethod
    def explain(cls, metric_name: str, y_true: np.ndarray = None, y_pred: np.ndarray = None,
                cm: list[list[int]] = None, **kwargs) -> dict:
        if metric_name == "accuracy" and y_true is not None and y_pred is not None:
            return cls.explain_accuracy(y_true, y_pred)
        elif metric_name == "precision" and y_true is not None and y_pred is not None:
            return cls.explain_precision(y_true, y_pred, kwargs.get("class_label", 1))
        elif metric_name == "recall" and y_true is not None and y_pred is not None:
            return cls.explain_recall(y_true, y_pred, kwargs.get("class_label", 1))
        elif metric_name == "f1" and y_true is not None and y_pred is not None:
            return cls.explain_f1(y_true, y_pred)
        elif metric_name == "confusion_matrix" and cm is not None:
            return cls.explain_confusion_matrix(cm)
        elif metric_name == "r2" and y_true is not None and y_pred is not None:
            return cls.explain_r2(y_true, y_pred)
        elif metric_name == "mse" and y_true is not None and y_pred is not None:
            return cls.explain_mse(y_true, y_pred)
        else:
            return {"error": f"Cannot explain '{metric_name}' — missing required data."}
