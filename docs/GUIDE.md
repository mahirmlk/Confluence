# User Guide

A hands-on walkthrough of Confluence's features.

## Table of Contents

- [Quick Overview](#quick-overview)
- [Exploring Algorithms](#exploring-algorithms)
- [Using the Visualizer](#using-the-visualizer)
- [Working with Datasets](#working-with-datasets)
- [Hyperparameter Tuning](#hyperparameter-tuning)
- [Viewing Metrics](#viewing-metrics)
- [Comparing Algorithms](#comparing-algorithms)
- [Streaming Training Animation](#streaming-training-animation)
- [3D Mode](#3d-mode)
- [Sharing Your Work](#sharing-your-work)

---

## Quick Overview

Confluence has three main sections:

| Section | URL | Purpose |
|---------|-----|---------|
| **Landing Page** | `/` | Introduction, features, launch button |
| **Visualizer** | `/app` | Interactive algorithm exploration |
| **Encyclopedia** | `/algorithms` | Algorithm reference and learning |

---

## Exploring Algorithms

### The Encyclopedia (`/algorithms`)

The Algorithm Encyclopedia is your starting point for learning. It contains 38 algorithms organized by family:

- **Classification** — predict which category a point belongs to
- **Regression** — predict a continuous value
- **Clustering** — discover natural groups in data
- **Dimensionality Reduction** — project high-dimensional data to 2D/3D

Each algorithm card shows:
- One-line intuition
- Boundary taxonomy tag (linear, tree-based, margin/kernel, etc.)
- Big-O complexity for fit and predict
- A link to open it in the visualizer

### Search and Filter

Use the search bar to find algorithms by name (e.g., "SVM", "neural", "clustering"). Filter by family using the category buttons.

---

## Using the Visualizer

### Step 1: Choose a Family

Select one of four algorithm families from the sidebar:
- **Classification** — decision boundaries
- **Regression** — prediction surfaces
- **Clustering** — cluster label grids
- **Dim. Reduction** — embedding scatter plots

### Step 2: Pick an Algorithm

Browse the algorithm list in the sidebar. Each shows its name, taxonomy tag, and a brief description.

### Step 3: Select a Dataset

Choose from the dataset dropdown. Options include:
- **Synthetic** — blobs, moons, circles, spirals, XOR, checkerboard
- **Real-world** — Iris, Wine, Breast Cancer
- **Regression** — sine wave surface

### Step 4: Click Run

The visualizer renders the decision boundary (or prediction surface, cluster grid, or embedding) in real time.

---

## Working with Datasets

### Built-in Datasets

All synthetic and real-world datasets are generated on-the-fly. Adjust:
- **Noise** slider — adds Gaussian jitter to data points
- **Samples** slider — controls the number of data points generated

### CSV Upload

1. Click **Upload** in the sidebar
2. Drag-and-drop or select a CSV file
3. Map columns to features (X) and target (y)
4. The dataset is normalized and available for exploration

**Constraints:**
- Max 10MB file size
- Max 10,000 rows
- Must have header row + at least 2 columns
- Numeric columns are auto-detected

### Custom Points

1. Enable **Point Editor** mode
2. Click on the canvas to place points
3. Assign class labels (0, 1, 2, ...)
4. Run any algorithm on your custom dataset

### Algorithm Recommendations

Click **Recommend** to get algorithm suggestions based on your dataset's characteristics:
- Small datasets → KNN, Naive Bayes, Logistic Regression
- Medium datasets → Random Forest, SVM, Gradient Boosting
- Large datasets → Gradient Boosting, Random Forest
- Imbalanced classes → Random Forest
- High dimensions → Random Forest

---

## Hyperparameter Tuning

Every algorithm has configurable hyperparameters shown as sliders:

| Algorithm | Parameters |
|-----------|-----------|
| Logistic Regression | C (regularization) |
| KNN | n_neighbors |
| Decision Tree | max_depth |
| SVM | C (regularization) |
| Random Forest | n_estimators |
| AdaBoost | n_estimators |
| Gradient Boosting | n_estimators |
| Gaussian NB | var_smoothing |
| MLP | hidden_layer_sizes |
| Ridge / Lasso | alpha |
| Elastic Net | alpha, l1_ratio |
| K-Means | n_clusters |
| DBSCAN | eps, min_samples |
| t-SNE | perplexity |
| UMAP | n_neighbors |

Adjust sliders and click **Run** to recompute the boundary.

---

## Viewing Metrics

### Classification Metrics

After running a classification algorithm, click **Metrics** to see:

- **Accuracy** — overall correct predictions
- **Precision** — true positives / (true positives + false positives)
- **Recall** — true positives / (true positives + false negatives)
- **F1** — harmonic mean of precision and recall
- **Confusion Matrix** — heatmap of predicted vs. actual classes
- **ROC Curve** — receiver operating characteristic with AUC

### Regression Metrics

- **R-squared** — proportion of variance explained
- **MSE** — mean squared error
- **RMSE** — root mean squared error
- **MAE** — mean absolute error
- **Residuals** — plot of prediction errors

### Clustering Metrics

- **Silhouette Score** — cluster cohesion vs. separation [-1, 1]
- **Davies-Bouldin Index** — average similarity between clusters (lower = better)
- **Inertia** — sum of squared distances to centroids (K-Means only)

### Cross-Validation

Run k-fold cross-validation to see how stable the boundary is across different train/test splits. Each fold shows its own boundary visualization.

### Learning Curves

See how training and validation performance change with dataset size. Useful for diagnosing:
- **Overfitting** — train high, validation low
- **Underfitting** — both low
- **Good fit** — both high and converging

---

## Comparing Algorithms

### Side-by-Side Mode

1. Enable **Compare** mode
2. Select 2-4 algorithms
3. All run on the same dataset simultaneously
4. Boundaries are rendered in synchronized panels

### Diff Mode

Compare where two algorithms disagree by overlaying their boundaries.

---

## Streaming Training Animation

For staged algorithms (AdaBoost, Gradient Boosting, Random Forest, SGD, Decision Tree, MLP):

1. Open the **Streaming** panel
2. Configure the algorithm and parameters
3. Click **Stream** to watch the boundary evolve frame-by-frame

### What You See

| Algorithm | What Streams |
|-----------|-------------|
| AdaBoost | Boosting rounds — each weak learner added sequentially |
| Gradient Boosting | Gradient descent in function space |
| Random Forest | Trees added one by one |
| SGD | Gradient descent iterations |
| Decision Tree | Depth increases — splits added layer by layer |
| MLP | Training epochs — weights updated iteratively |

Use the scrubber timeline to pause, rewind, or jump to any frame.

---

## 3D Mode

Enable **3D** mode to render:
- Gaussian Process regression uncertainty surfaces
- Three-feature classification volumes
- Dimensionality reduction embeddings in 3D

Controls:
- **Mouse drag** — rotate
- **Scroll wheel** — zoom
- **Right-click drag** — pan

---

## Sharing Your Work

### URL State

The current state (algorithm, dataset, hyperparameters) is encoded in the URL query string:

```
/app?family=classification&algorithm=random-forest&dataset=moons&n_estimators=100
```

Copy and share this URL to let others see exactly what you're exploring.

### Export

- **PNG** — save the current canvas as an image
- **JSON** — export metrics and configuration data
