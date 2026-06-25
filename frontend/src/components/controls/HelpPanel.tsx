"use client";

import React, { useState } from "react";
import { ALGORITHMS, HYPERPARAMETER_CONFIGS, type AlgorithmFamily } from "@/lib/store";

type HelpSection = "quickstart" | "data" | "visualizations" | "analysis" | "algorithms" | "examples";

const SECTIONS: { id: HelpSection; label: string }[] = [
  { id: "quickstart", label: "Quick Start" },
  { id: "data", label: "Understanding Data" },
  { id: "visualizations", label: "Reading Visuals" },
  { id: "analysis", label: "Analysis Tools" },
  { id: "algorithms", label: "Algorithm Guide" },
  { id: "examples", label: "Examples" },
];

const FAMILY_COLORS: Record<AlgorithmFamily, string> = {
  classification: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  regression: "bg-green-500/10 text-green-600 dark:text-green-400",
  clustering: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "dim-reduction": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

function QuickStartGuide() {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">How to Use This Tool</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Confluence lets you train and visualize machine learning algorithms interactively. You pick an algorithm, a dataset, and hyperparameters — the tool trains the model in real-time and shows you the results as an interactive visualization.
        </p>
      </div>

      <ol className="space-y-4 text-xs text-muted-foreground">
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">1</span>
          <div>
            <strong className="text-foreground block mb-1">Choose an Algorithm Family (Left Panel)</strong>
            <p>Select from four families. Each family solves a different type of ML problem:</p>
            <ul className="mt-2 space-y-1.5 ml-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                <span><strong className="text-foreground">Classification</strong> — Predicts which category a data point belongs to (e.g., spam vs. not spam). The visualization shows colored regions for each class.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                <span><strong className="text-foreground">Regression</strong> — Predicts a continuous number (e.g., house price). The visualization shows a color gradient representing predicted values.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1 flex-shrink-0" />
                <span><strong className="text-foreground">Clustering</strong> — Groups similar data points together without labels. The visualization shows colored clusters.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 mt-1 flex-shrink-0" />
                <span><strong className="text-foreground">Dim. Reduction</strong> — Compresses high-dimensional data into 2D for visualization. Shows a scatter plot of the projected data.</span>
              </li>
            </ul>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">2</span>
          <div>
            <strong className="text-foreground block mb-1">Select a Specific Algorithm</strong>
            <p>Each algorithm has different strengths. The description below the dropdown explains what it does. The complexity tags show how training and prediction scale with data size.</p>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">3</span>
          <div>
            <strong className="text-foreground block mb-1">Pick a Dataset</strong>
            <p>Datasets are how the algorithm learns. Choose from:</p>
            <ul className="mt-2 space-y-1 ml-2">
              <li><strong className="text-foreground">Synthetic</strong> (blobs, moons, circles, spirals, xor) — Generated data with known patterns. Best for learning how algorithms work.</li>
              <li><strong className="text-foreground">Real-world</strong> (iris, wine, breast-cancer) — Actual datasets from ML benchmarks. Shows how algorithms handle messy, real data.</li>
            </ul>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">4</span>
          <div>
            <strong className="text-foreground block mb-1">Adjust Settings & Run</strong>
            <p>Use the sliders to control:</p>
            <ul className="mt-2 space-y-1 ml-2">
              <li><strong className="text-foreground">Noise</strong> — How much random overlap between classes. 0 = clean separation, higher = more overlap.</li>
              <li><strong className="text-foreground">Samples</strong> — How many data points to generate. More = smoother boundaries but slower.</li>
              <li><strong className="text-foreground">Hyperparameters</strong> — Algorithm-specific settings (e.g., number of neighbors for KNN, tree depth for Decision Tree).</li>
            </ul>
            <p className="mt-2">Click <strong className="text-foreground">Run</strong> or wait for auto-update (300ms debounce).</p>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">5</span>
          <div>
            <strong className="text-foreground block mb-1">Analyze Results</strong>
            <p>Use the toolbar buttons to dig deeper:</p>
            <ul className="mt-2 space-y-1 ml-2">
              <li><strong className="text-foreground">Metrics</strong> — See accuracy, precision, recall, F1, R, MSE scores.</li>
              <li><strong className="text-foreground">CV</strong> — Cross-validation to check model stability.</li>
              <li><strong className="text-foreground">Learning Curve</strong> — Diagnose underfitting vs. overfitting.</li>
              <li><strong className="text-foreground">3D</strong> — View regression/classification surfaces in 3D.</li>
            </ul>
          </div>
        </li>
      </ol>

      <div className="p-3 rounded-md bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Use the <strong className="text-foreground">Compare</strong> tab to see multiple algorithms side-by-side on the same data. Use the <strong className="text-foreground">Stream</strong> tab to watch algorithms learn step-by-step.
        </p>
      </div>
    </div>
  );
}

function DataGuide() {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Understanding Data & Datasets</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Data is the foundation of every visualization. Understanding what the data looks like and how it flows through the system helps you interpret the results correctly.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2">What is a Dataset?</h5>
          <p className="text-xs text-muted-foreground mb-2">
            A dataset is a collection of <strong className="text-foreground">data points</strong>. Each point has:
          </p>
          <ul className="space-y-1.5 text-xs text-muted-foreground ml-2">
            <li><strong className="text-foreground">Features (X)</strong> — The input measurements. In this tool, each point has 2 features (x, y coordinates) so we can visualize it on a 2D canvas.</li>
            <li><strong className="text-foreground">Label/Value (y)</strong> — The output. For classification, this is a class label (0, 1, 2...). For regression, this is a continuous number.</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            The algorithm learns the relationship between features and labels from the training data, then predicts labels for new, unseen points.
          </p>
        </div>

        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2">Synthetic Datasets Explained</h5>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground flex-shrink-0">blobs</span>
              <span>Gaussian clusters of points. Each cluster is one class. Good for testing if an algorithm can find linear or nonlinear boundaries between groups.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground flex-shrink-0">moons</span>
              <span>Two interleaving half-moons. Classic test for nonlinear classifiers. Linear models fail here; SVM with RBF kernel excels.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground flex-shrink-0">circles</span>
              <span>Concentric circles (one inside the other). Tests if an algorithm can learn radial boundaries. Decision trees create rectangular approximations.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground flex-shrink-0">spirals</span>
              <span>Intertwined spiral arms. Very challenging — tests an algorithm&apos;s ability to learn complex, non-convex boundaries.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground flex-shrink-0">xor</span>
              <span>XOR pattern — points in diagonal quadrants share a class. Tests if an algorithm can learn non-linearly separable patterns.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground flex-shrink-0">checkerboard</span>
              <span>Alternating colored squares. Very complex pattern. Only highly flexible models (deep trees, neural nets) can approximate this.</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2">Real-World Datasets</h5>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground flex-shrink-0">iris</span>
              <span>150 flowers, 3 species (setosa, versicolor, virginica). Features: sepal/petal length/width. 2D projection shows feature pairs.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground flex-shrink-0">wine</span>
              <span>178 wines, 3 cultivars. 13 chemical features (alcohol, malic acid, etc.). Good for testing multi-class classification.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground flex-shrink-0">breast-cancer</span>
              <span>569 tumors, 2 classes (malignant/benign). 30 features from cell images. Binary classification with real-world noise.</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2">Data Source Options</h5>
          <ul className="space-y-2 text-xs text-muted-foreground ml-2">
            <li>
              <strong className="text-foreground">Synthetic</strong> — Algorithm-generated data. Adjust noise and sample count with sliders. Best for exploring how algorithms work.
            </li>
            <li>
              <strong className="text-foreground">CSV Upload</strong> — Upload your own CSV file. First two columns are used as features, last column as labels. The tool automatically detects numeric columns.
            </li>
            <li>
              <strong className="text-foreground">Paste</strong> — Type or paste tabular data directly. Useful for quick testing with custom values.
            </li>
            <li>
              <strong className="text-foreground">Draw</strong> — Click on the canvas to place data points. Choose class labels and build your own dataset visually. Great for intuition building.
            </li>
          </ul>
        </div>

        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2">How Data Flows Through the System</h5>
          <ol className="space-y-1.5 text-xs text-muted-foreground ml-2 list-decimal">
            <li>You select a dataset (or create one via CSV/Paste/Draw)</li>
            <li>The frontend sends the dataset + algorithm + hyperparameters to the backend</li>
            <li>The backend trains a scikit-learn model on the data</li>
            <li>The model predicts values across a dense grid covering the feature space</li>
            <li>Grid predictions are colored and rendered as a heatmap on the canvas</li>
            <li>Original data points are overlaid on top of the heatmap</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function VisualizationGuide() {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Reading the Visualizations</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Each visualization type encodes different information. Understanding what you see is key to interpreting algorithm behavior.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Classification Heatmaps
          </h5>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><strong className="text-foreground">What you see:</strong> A colored background with data points on top.</p>
            <ul className="space-y-1.5 ml-2">
              <li><strong className="text-foreground">Background colors</strong> = decision regions. Each color represents a class. The algorithm would classify any new point in that region as that class.</li>
              <li><strong className="text-foreground">Contour lines</strong> = probability boundaries. The number on each line shows the probability threshold. Lines close together = steep decision transition (the model is very confident near the boundary). Lines far apart = gradual transition (model is uncertain).</li>
              <li><strong className="text-foreground">Dots</strong> = training data points, colored by their true class label.</li>
            </ul>
            <div className="mt-3 p-2 rounded bg-muted/50">
              <p className="font-semibold text-foreground text-[11px] mb-1">What to look for:</p>
              <ul className="space-y-1 ml-2 text-[11px]">
                <li><strong>Smooth, wide boundaries</strong> = model generalizes well (SVM, GP, Logistic Regression)</li>
                <li><strong>Jagged, tight boundaries</strong> = model may be overfitting (Decision Tree with high depth)</li>
                <li><strong>Misclassified points</strong> = dots sitting in the wrong color region</li>
                <li><strong>Ambiguous zones</strong> = areas where contour lines are dense (model is uncertain)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            Regression Heatmaps
          </h5>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><strong className="text-foreground">What you see:</strong> A color gradient showing predicted values across the feature space.</p>
            <ul className="space-y-1.5 ml-2">
              <li><strong className="text-foreground">Color gradient</strong> = predicted values. Blue/purple = low values, red/yellow = high values. The gradient shows the model&apos;s prediction function.</li>
              <li><strong className="text-foreground">Dots</strong> = actual training data points. The model should pass through or near them.</li>
              <li><strong className="text-foreground">Smoothness</strong> = how the model interpolates between data points. Linear models create smooth gradients; tree models create blocky, step-like gradients.</li>
            </ul>
            <div className="mt-3 p-2 rounded bg-muted/50">
              <p className="font-semibold text-foreground text-[11px] mb-1">What to look for:</p>
              <ul className="space-y-1 ml-2 text-[11px]">
                <li><strong>Wiggly surface</strong> = overfitting (model follows noise in training data)</li>
                <li><strong>Too smooth</strong> = underfitting (model can&apos;t capture the pattern)</li>
                <li><strong>Click 3D</strong> to see the prediction surface as a height map — useful for understanding how the model extrapolates</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            Clustering Visualizations
          </h5>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><strong className="text-foreground">What you see:</strong> Colored regions showing which cluster each point belongs to.</p>
            <ul className="space-y-1.5 ml-2">
              <li><strong className="text-foreground">Colored regions</strong> = cluster assignments. Each distinct color = one cluster.</li>
              <li><strong className="text-foreground">Dots</strong> = data points, colored by their assigned cluster.</li>
              <li><strong className="text-foreground">Boundaries</strong> = where one cluster ends and another begins.</li>
            </ul>
            <div className="mt-3 p-2 rounded bg-muted/50">
              <p className="font-semibold text-foreground text-[11px] mb-1">Algorithm-specific things to notice:</p>
              <ul className="space-y-1 ml-2 text-[11px]">
                <li><strong>K-Means:</strong> Creates Voronoi-like cells (straight-line boundaries). Adjust k to see clusters merge/split.</li>
                <li><strong>DBSCAN:</strong> Finds arbitrary shapes (curved boundaries). Gray points = noise (not assigned to any cluster). Try different eps values.</li>
                <li><strong>GMM:</strong> Creates elliptical clusters. Can produce overlapping regions (soft clustering).</li>
                <li><strong>Agglomerative:</strong> Hierarchical — try different linkage methods to see how clusters grow.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            Dimensionality Reduction
          </h5>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><strong className="text-foreground">What you see:</strong> A 2D scatter plot of high-dimensional data projected down.</p>
            <ul className="space-y-1.5 ml-2">
              <li><strong className="text-foreground">Each dot</strong> = one data point from the original dataset.</li>
              <li><strong className="text-foreground">Colors</strong> = original class labels. Good projections keep same-colored points together.</li>
              <li><strong className="text-foreground">Distance</strong> = approximate similarity. Points close together in the projection are similar in the original high-dimensional space.</li>
            </ul>
            <div className="mt-3 p-2 rounded bg-muted/50">
              <p className="font-semibold text-foreground text-[11px] mb-1">Method comparison:</p>
              <ul className="space-y-1 ml-2 text-[11px]">
                <li><strong>PCA:</strong> Linear projection. Fast. Preserves global structure (overall spread). Good first choice.</li>
                <li><strong>t-SNE:</strong> Nonlinear. Preserves local structure (nearby points stay nearby). Creates tight clusters. Perplexity controls cluster size.</li>
                <li><strong>UMAP:</strong> Nonlinear. Faster than t-SNE. Better at preserving global structure. n_neighbors controls local vs. global balance.</li>
                <li><strong>Isomap:</strong> Nonlinear. Uses geodesic distances. Good for data on curved manifolds.</li>
                <li><strong>LDA:</strong> Supervised linear projection. Maximizes class separation. Only works with labeled data.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisToolsGuide() {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Analysis Tools</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Beyond the main visualization, several analysis tools help you understand model quality, diagnose problems, and compare algorithms quantitatively.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2">Metrics Dashboard</h5>
          <p className="text-xs text-muted-foreground mb-2">Click <strong className="text-foreground">Metrics</strong> in the toolbar to see quantitative performance scores.</p>
          <div className="space-y-2">
            <div className="p-2 rounded bg-muted/30">
              <p className="text-[11px] font-semibold text-foreground mb-1">Classification Metrics</p>
              <ul className="space-y-1 text-[11px] text-muted-foreground">
                <li><strong className="text-foreground">Accuracy:</strong> % of all predictions that are correct. Simple but misleading on imbalanced data (e.g., 95% accuracy means nothing if 95% of data is one class).</li>
                <li><strong className="text-foreground">Precision:</strong> Of all points the model labeled as class X, what % actually are class X? High precision = few false positives.</li>
                <li><strong className="text-foreground">Recall:</strong> Of all actual class X points, what % did the model find? High recall = few false negatives.</li>
                <li><strong className="text-foreground">F1 Score:</strong> Harmonic mean of precision and recall. Balances both concerns. Best single metric for imbalanced data.</li>
              </ul>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <p className="text-[11px] font-semibold text-foreground mb-1">Regression Metrics</p>
              <ul className="space-y-1 text-[11px] text-muted-foreground">
                <li><strong className="text-foreground">R Score:</strong> How much variance the model explains. 1.0 = perfect, 0.0 = as good as predicting the mean, negative = worse than the mean.</li>
                <li><strong className="text-foreground">MSE:</strong> Average squared difference between predicted and actual values. Penalizes large errors heavily.</li>
                <li><strong className="text-foreground">MAE:</strong> Average absolute difference. More robust to outliers than MSE.</li>
              </ul>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <p className="text-[11px] font-semibold text-foreground mb-1">Clustering Metrics</p>
              <ul className="space-y-1 text-[11px] text-muted-foreground">
                <li><strong className="text-foreground">Silhouette Score:</strong> Measures how similar a point is to its own cluster vs. other clusters. Range: -1 to 1. Higher = better defined clusters. Below 0.5 = weak structure.</li>
                <li><strong className="text-foreground">Davies-Bouldin:</strong> Ratio of within-cluster to between-cluster distance. Lower = better. Good for comparing different k values.</li>
                <li><strong className="text-foreground">Inertia:</strong> Sum of squared distances to nearest centroid. Lower = tighter clusters. Used in elbow method.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2">Cross-Validation (CV)</h5>
          <p className="text-xs text-muted-foreground mb-2">
            Cross-validation tests how well the model generalizes to unseen data. It splits the dataset into 5 folds, trains on 4, tests on 1, and repeats 5 times.
          </p>
          <div className="p-2 rounded bg-muted/30">
            <p className="text-[11px] font-semibold text-foreground mb-1">How to interpret the CV plot:</p>
            <ul className="space-y-1 text-[11px] text-muted-foreground">
              <li><strong className="text-foreground">Each bar</strong> = one fold&apos;s accuracy score.</li>
              <li><strong className="text-foreground">Mean line</strong> = average accuracy across all folds.</li>
              <li><strong className="text-foreground">Low variance</strong> (bars similar height) = model is stable, reliable.</li>
              <li><strong className="text-foreground">High variance</strong> (bars very different) = model is sensitive to data changes, may overfit.</li>
              <li><strong className="text-foreground">One very low bar</strong> = that fold had hard examples the model couldn&apos;t learn.</li>
            </ul>
          </div>
        </div>

        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2">Learning Curve</h5>
          <p className="text-xs text-muted-foreground mb-2">
            Shows how model performance changes as you add more training data. Two lines: training score and validation score.
          </p>
          <div className="p-2 rounded bg-muted/30">
            <p className="text-[11px] font-semibold text-foreground mb-1">Diagnosing model problems:</p>
            <ul className="space-y-1 text-[11px] text-muted-foreground">
              <li><strong className="text-foreground">Both lines converge to a high value</strong> = Good fit. The model has enough data and capacity.</li>
              <li><strong className="text-foreground">Training score high, validation score low (large gap)</strong> = Overfitting. The model memorizes training data but doesn&apos;t generalize. Fix: get more data, reduce model complexity, or add regularization.</li>
              <li><strong className="text-foreground">Both lines are low</strong> = Underfitting. The model is too simple to capture the pattern. Fix: use a more complex algorithm or add features.</li>
              <li><strong className="text-foreground">Lines still converging upward</strong> = The model would benefit from more data. The gap is closing.</li>
            </ul>
          </div>
        </div>

        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2">Coefficients (Linear Models)</h5>
          <p className="text-xs text-muted-foreground mb-2">
            Available for Logistic Regression, Ridge, Lasso, Elastic Net, Linear SVM, and Linear Regression. Shows the weight each feature gets.
          </p>
          <div className="p-2 rounded bg-muted/30">
            <ul className="space-y-1 text-[11px] text-muted-foreground">
              <li><strong className="text-foreground">Positive coefficient</strong> = increasing this feature pushes the prediction higher (or toward the positive class).</li>
              <li><strong className="text-foreground">Negative coefficient</strong> = increasing this feature pushes the prediction lower.</li>
              <li><strong className="text-foreground">Larger magnitude</strong> = stronger influence on the prediction.</li>
              <li><strong className="text-foreground">Near-zero coefficient</strong> = feature is irrelevant. Lasso forces many coefficients to exactly zero (feature selection).</li>
            </ul>
          </div>
        </div>

        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2">Decision Path (Tree Models)</h5>
          <p className="text-xs text-muted-foreground">
            Switch to <strong className="text-foreground">Draw</strong> mode and click on the canvas to trace how a Decision Tree or Random Forest classifies that specific point. Shows each split decision from root to leaf: which feature was split, at what value, and which direction the point went.
          </p>
        </div>

        <div className="p-3 rounded-md border border-border">
          <h5 className="text-xs font-semibold text-foreground mb-2">Elbow Plot (Clustering)</h5>
          <p className="text-xs text-muted-foreground mb-2">
            Only for K-Means. Plots inertia (within-cluster sum of squares) for k = 2 to 10.
          </p>
          <div className="p-2 rounded bg-muted/30">
            <ul className="space-y-1 text-[11px] text-muted-foreground">
              <li><strong className="text-foreground">The &quot;elbow&quot;</strong> = the k where inertia stops dropping sharply. This is often the optimal number of clusters.</li>
              <li><strong className="text-foreground">No clear elbow</strong> = the data doesn&apos;t have a natural cluster structure, or you need a different algorithm.</li>
              <li><strong className="text-foreground">Silhouette overlay</strong> = shows cluster quality at each k. Peak silhouette = best k.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlgorithmGuide() {
  const [selectedFamily, setSelectedFamily] = useState<AlgorithmFamily>("classification");
  const familyAlgorithms = ALGORITHMS.filter((a) => a.family === selectedFamily);

  const familyDescriptions: Record<AlgorithmFamily, string> = {
    classification: "Classification algorithms predict a discrete class label. They learn a decision boundary that separates classes in the feature space.",
    regression: "Regression algorithms predict a continuous value. They learn a function that maps features to a numeric output.",
    clustering: "Clustering algorithms find natural groupings in data without labels. They assign each point to a cluster based on similarity.",
    "dim-reduction": "Dimensionality reduction algorithms project high-dimensional data into fewer dimensions (here, 2D) while preserving important structure.",
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">Algorithm Guide</h4>
      <p className="text-xs text-muted-foreground">{familyDescriptions[selectedFamily]}</p>

      <div className="flex gap-1 flex-wrap">
        {(["classification", "regression", "clustering", "dim-reduction"] as AlgorithmFamily[]).map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFamily(f)}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              selectedFamily === f ? FAMILY_COLORS[f] : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {f === "dim-reduction" ? "Dim Reduction" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {familyAlgorithms.map((algo) => {
          const configs = HYPERPARAMETER_CONFIGS[algo.name] || [];
          return (
            <div key={algo.name} className="p-2.5 rounded-md border border-border hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">{algo.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{algo.taxonomyTag}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{algo.description}</p>
              {configs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {configs.map((c) => (
                    <span key={c.name} className="text-[9px] font-mono px-1 py-0.5 rounded bg-muted text-muted-foreground">
                      {c.name}: {c.min}–{c.max} (default: {c.default})
                    </span>
                  ))}
                </div>
              )}
              {algo.complexity && (
                <div className="flex gap-2 mt-1.5">
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-muted text-muted-foreground">Fit: {algo.complexity.fit}</span>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-muted text-muted-foreground">Predict: {algo.complexity.predict}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-md bg-muted/50 border border-border">
        <p className="text-[11px] text-muted-foreground">
          <strong className="text-foreground">Taxonomy Tags:</strong> Algorithms are grouped by their decision boundary geometry. Similar tags produce similar boundary shapes. For example, all &quot;tree-based&quot; algorithms create axis-aligned rectangular regions, while &quot;margin-kernel&quot; algorithms (SVM) create smooth curved boundaries.
        </p>
      </div>
    </div>
  );
}

function ExamplesGuide() {
  const [activeExample, setActiveExample] = useState<number>(0);
  const [exampleCategory, setExampleCategory] = useState<string>("all");

  const examples = [
    // --- BEGINNER ---
    {
      title: "Linear vs. Nonlinear Boundaries",
      category: "beginner",
      setup: "Dataset: moons | Compare: Logistic Regression vs. RBF SVM",
      steps: [
        "Go to the Compare tab and select Logistic Regression and RBF SVM",
        "Set dataset to moons, noise to 0.3",
        "Run and observe: Logistic Regression draws a straight line through the moons — it can&apos;t separate them perfectly",
        "RBF SVM draws a curved boundary that follows the moon shapes",
        "Increase noise to 1.0 — notice how SVM&apos;s boundary becomes smoother (better generalization)",
      ],
      takeaway: "Linear models assume data is separable by a straight line. When that assumption is wrong, you need nonlinear models like SVM with RBF kernel.",
    },
    {
      title: "Your First Visualization",
      category: "beginner",
      setup: "Dataset: blobs | Algorithm: Logistic Regression",
      steps: [
        "Make sure Classification is selected as the family in the left panel",
        "Select Logistic Regression as the algorithm",
        "Select blobs as the dataset",
        "Keep default settings (noise 0.5, samples 300) and click Run",
        "Observe the colored background — each color is a class region",
        "The contour lines show probability levels — closer lines mean sharper boundaries",
        "Now change the dataset to moons and click Run again — notice the boundary curves",
      ],
      takeaway: "Start with simple setups to understand the basics. The colored background shows where the model would classify new points. Contour lines show confidence levels.",
    },
    {
      title: "Understanding Noise & Sample Size",
      category: "beginner",
      setup: "Dataset: blobs | Algorithm: KNN | Noise & Samples sliders",
      steps: [
        "Select KNN with blobs dataset, default settings",
        "Run — notice the clean, well-separated clusters with a clear boundary",
        "Increase Noise to 3.0 and Run — the classes now overlap heavily, boundary becomes ambiguous",
        "Reset noise to 0.5, increase Samples to 1500 and Run — the boundary becomes smoother with more data",
        "Decrease Samples to 50 and Run — the boundary becomes jagged and unreliable with less data",
      ],
      takeaway: "Noise controls how much classes overlap. More samples give the model more information, producing smoother and more reliable boundaries.",
    },
    {
      title: "Reading the Regression Heatmap",
      category: "beginner",
      setup: "Family: Regression | Algorithm: Ridge | Dataset: sine",
      steps: [
        "Switch to the Regression family and select Ridge",
        "Set dataset to sine and click Run",
        "The color gradient shows predicted values — blue/purple = low, red/yellow = high",
        "Dots are actual training data points — the model tries to pass near them",
        "Click the 3D button to see the prediction surface as a height map",
        "Switch to Linear Regression — notice how the straight line can&apos;t capture the sine wave",
        "Switch back to Ridge — the model still can&apos;t capture it because it&apos;s linear too",
      ],
      takeaway: "Regression heatmaps show predicted values as colors. The model should follow the training data points. Linear models can&apos;t capture nonlinear patterns.",
    },

    // --- INTERMEDIATE ---
    {
      title: "Overfitting with Decision Trees",
      category: "intermediate",
      setup: "Dataset: blobs | Algorithm: Decision Tree | Vary: max_depth",
      steps: [
        "Select Decision Tree, set dataset to blobs, noise to 0.3",
        "Set max_depth to 1 — the boundary is a single straight line (underfitting)",
        "Increase to max_depth 3 — boundary gets more complex, captures the pattern better",
        "Increase to max_depth 15 — boundary becomes jagged, wrapping around individual points",
        "Check Metrics — training accuracy is 100% but the boundary looks unnatural",
        "Switch to Random Forest (100 estimators) — notice how the boundary smooths out",
      ],
      takeaway: "Decision Trees can memorize training data by growing deep enough. Random Forests fix this by averaging many trees (bagging).",
    },
    {
      title: "K-Means: Choosing the Right K",
      category: "intermediate",
      setup: "Dataset: blobs (3-class) | Algorithm: K-Means | Use Elbow Plot",
      steps: [
        "Select K-Means with blobs-3class dataset",
        "Click Elbow in the toolbar to see inertia vs. k",
        "Look for the &quot;elbow&quot; — the k where the curve bends. For 3-class blobs, this should be k=3",
        "Set n_clusters to 2 — notice how two of the real clusters get merged",
        "Set n_clusters to 5 — notice how one real cluster gets split unnecessarily",
        "Check the Silhouette score — it should peak near k=3",
      ],
      takeaway: "The elbow plot and silhouette score help you find the natural number of clusters in the data.",
    },
    {
      title: "DBSCAN: Finding Arbitrary Shapes",
      category: "intermediate",
      setup: "Dataset: moons | Algorithm: DBSCAN | Vary: eps",
      steps: [
        "Select DBSCAN with moons dataset",
        "Set eps to 0.3, min_samples to 5",
        "Run — DBSCAN correctly finds the two moon shapes with curved boundaries",
        "Notice gray points — these are noise (not assigned to any cluster)",
        "Increase eps to 2.0 — the clusters merge into one (too much neighborhood)",
        "Decrease eps to 0.1 — too many small clusters and noise points",
        "Compare with K-Means on the same dataset — K-Means creates straight-line boundaries that cut through the moons",
      ],
      takeaway: "DBSCAN finds clusters of any shape but is sensitive to the eps parameter. K-Means assumes spherical clusters.",
    },
    {
      title: "Regularization: Ridge vs. Lasso",
      category: "intermediate",
      setup: "Dataset: sine | Compare: Linear Regression vs. Ridge vs. Lasso",
      steps: [
        "Go to Compare tab, select Linear Regression, Ridge, and Lasso",
        "Set dataset to sine (nonlinear data)",
        "Run — all three create straight lines because they&apos;re linear models",
        "Switch to Ridge, increase alpha to 10 — the line becomes flatter (less extreme coefficients)",
        "Switch to Lasso, increase alpha — some coefficients go to exactly zero (feature selection)",
        "Check the Coefficients view to see how coefficients shrink with regularization",
      ],
      takeaway: "Regularization prevents overfitting by penalizing large coefficients. Ridge shrinks them, Lasso can eliminate features entirely.",
    },
    {
      title: "Comparing Ensemble Methods",
      category: "intermediate",
      setup: "Dataset: spirals | Compare: Random Forest vs. AdaBoost vs. Gradient Boosting",
      steps: [
        "Go to Compare tab, select Random Forest, AdaBoost, and Gradient Boosting",
        "Set dataset to spirals (a challenging nonlinear pattern)",
        "Set n_estimators to 50 for all three and Run",
        "Random Forest: boundary is bagged (averaged) — smoother but may miss fine details",
        "AdaBoost: boundary focuses on hard-to-classify regions — more detailed near tricky areas",
        "Gradient Boosting: similar to AdaBoost but optimized differently — look for subtle differences",
        "Increase n_estimators to 200 for all — notice how each boundary becomes more refined",
      ],
      takeaway: "Ensembles combine multiple weak learners. Random Forest uses bagging (parallel), AdaBoost and Gradient Boosting use boosting (sequential, focusing on mistakes).",
    },
    {
      title: "Understanding SVM Kernels",
      category: "intermediate",
      setup: "Dataset: moons | Compare: Linear SVM vs. Poly SVM vs. RBF SVM",
      steps: [
        "Go to Compare tab, select all three SVM variants",
        "Set dataset to moons, C=1.0, Run",
        "Linear SVM: draws a straight line — poor fit for moons",
        "Polynomial SVM: draws a curved line — better but depends on degree",
        "RBF SVM: draws a smooth curved boundary — best fit for moons",
        "Increase C to 100 for all — boundaries get tighter around training points (less regularization)",
        "Decrease C to 0.01 — boundaries become very smooth (more regularization, may underfit)",
      ],
      takeaway: "The kernel determines the boundary shape. Linear = straight line, Polynomial = curved (degree controls complexity), RBF = smooth flexible curves. C controls the regularization trade-off.",
    },
    {
      title: "Gaussian Process: Uncertainty Visualization",
      category: "intermediate",
      setup: "Family: Regression | Algorithm: Gaussian Process | Dataset: sine",
      steps: [
        "Switch to Regression family, select Gaussian Process",
        "Set dataset to sine, noise 0.1, click Run",
        "The heatmap shows the mean prediction — the GP&apos;s best guess",
        "Click 3D to see the uncertainty surface — the height shows prediction confidence",
        "Notice wider uncertainty bands far from training data points — the GP is honest about what it doesn&apos;t know",
        "Increase alpha (noise) to 0.5 — uncertainty bands widen everywhere",
        "Compare with Ridge regression in 3D — Ridge has no uncertainty estimate",
      ],
      takeaway: "Gaussian Processes uniquely provide uncertainty estimates. They are confident near training data and uncertain far away. This makes them ideal for safety-critical applications.",
    },
    {
      title: "KNN: Effect of K (Neighbors)",
      category: "intermediate",
      setup: "Dataset: moons | Algorithm: KNN | Vary: n_neighbors",
      steps: [
        "Select KNN, set dataset to moons",
        "Set n_neighbors to 1 — boundary wraps tightly around every point (overfitting)",
        "Increase to 5 — boundary smooths out, captures the moon shape well",
        "Increase to 15 — boundary becomes smoother but starts losing detail",
        "Increase to 50 — boundary is very smooth, almost linear (underfitting)",
        "Check the Learning Curve — 1-NN has a huge gap between train and val scores",
      ],
      takeaway: "K controls the bias-variance trade-off in KNN. Small K = low bias, high variance (overfitting). Large K = high bias, low variance (underfitting).",
    },

    // --- ADVANCED ---
    {
      title: "Dimensionality Reduction: PCA vs. t-SNE vs. UMAP",
      category: "advanced",
      setup: "Dataset: wine | Compare: PCA vs. t-SNE vs. UMAP",
      steps: [
        "Go to Compare tab, select PCA, t-SNE, and UMAP",
        "Set dataset to wine (3 classes, 13 features)",
        "Run — PCA creates a linear projection, t-SNE and UMAP create nonlinear ones",
        "Notice t-SNE creates tighter, better-separated clusters",
        "In t-SNE, increase perplexity to 50 — clusters spread out more",
        "In UMAP, increase n_neighbors to 50 — preserves more global structure",
        "PCA is faster and deterministic; t-SNE/UMAP are better at revealing local structure",
      ],
      takeaway: "PCA is good for quick exploration. t-SNE/UMAP are better for visualizing cluster structure. UMAP is faster and preserves more global structure than t-SNE.",
    },
    {
      title: "GMM Soft Clustering vs. K-Means Hard Clustering",
      category: "advanced",
      setup: "Dataset: blobs | Compare: K-Means vs. GMM",
      steps: [
        "Go to Compare tab, select K-Means and GMM",
        "Set dataset to blobs, n_clusters to 3, Run",
        "K-Means: each point belongs to exactly one cluster (hard assignment). Boundaries are straight lines (Voronoi cells).",
        "GMM: each point has a probability of belonging to each cluster (soft assignment). Boundaries can be elliptical.",
        "Switch to moons dataset — notice GMM&apos;s elliptical clusters don&apos;t fit the crescent shapes well",
        "Switch to circles — both struggle, but GMM at least shows uncertainty near boundaries",
      ],
      takeaway: "K-Means assigns each point to one cluster. GMM provides probabilities. GMM assumes clusters are Gaussian (elliptical), which works well for blob-shaped data but not arbitrary shapes.",
    },
    {
      title: "Neural Network: Hidden Layer Sizes",
      category: "advanced",
      setup: "Dataset: moons | Algorithm: MLP Classifier | Vary: hidden_layer_sizes",
      steps: [
        "Select MLP Classifier, set dataset to moons",
        "Set hidden_layer_sizes to 2 — very small network, boundary is almost linear",
        "Increase to 10 — boundary can now capture the moon curves",
        "Increase to 50 — boundary is smooth and fits well",
        "Increase to 200 — boundary may start overfitting (wrapping around individual points)",
        "Switch to spirals dataset — MLP with 50 units can learn the complex spiral pattern",
        "Compare with RBF SVM — SVM often gets similar results with less tuning",
      ],
      takeaway: "More hidden units = more capacity to learn complex patterns. But too many = overfitting. The right size depends on the dataset complexity.",
    },
    {
      title: "Streaming: Watching Algorithms Learn",
      category: "advanced",
      setup: "Tab: Stream | Algorithms: AdaBoost, Gradient Boosting, Decision Tree",
      steps: [
        "Switch to the Stream tab in the sidebar",
        "Select AdaBoost and click Run — watch how it adds weak learners sequentially, focusing on misclassified points",
        "Switch to Gradient Boosting — similar sequential process but optimized for gradient descent",
        "Switch to Decision Tree — watch the tree grow splits one at a time",
        "Notice how AdaBoost puts more weight on points near the boundary (hard examples)",
        "Compare the final result with the Explore tab — should look the same after streaming completes",
      ],
      takeaway: "Streaming shows the training process step by step. Boosting algorithms focus on hard examples. Trees greedily add splits. This builds intuition about why algorithms produce certain boundaries.",
    },
    {
      title: "Drawing Custom Data",
      category: "advanced",
      setup: "Data Source: Draw | Any algorithm",
      steps: [
        "Click the Draw button in the toolbar (data source selector)",
        "Click on the canvas to place data points — left click for class 0, right click for class 1",
        "Place at least 4 points total",
        "Click Use This Dataset to submit your custom data",
        "Select any algorithm and Run — see how it classifies your hand-drawn points",
        "Try creating patterns: a cluster in one corner, scattered points elsewhere",
        "Compare how Decision Tree (rectangular boundaries) vs. RBF SVM (smooth curves) handle your data",
      ],
      takeaway: "Drawing your own data helps build intuition. You can create specific patterns to test how algorithms handle edge cases, imbalanced classes, or unusual distributions.",
    },
    {
      title: "Elbow Method & Silhouette for Cluster Selection",
      category: "advanced",
      setup: "Dataset: blobs-4class | Algorithm: K-Means | Tools: Elbow Plot",
      steps: [
        "Select K-Means with blobs-4class dataset",
        "Click Elbow in the toolbar",
        "The plot shows inertia (within-cluster variance) for k=2 to 10",
        "Look for the &quot;elbow&quot; — where the curve bends from steep to flat. Should be near k=4.",
        "The silhouette line shows cluster quality — peak near k=4 confirms the optimal k",
        "Set k=3 — one real cluster gets merged with another, silhouette drops",
        "Set k=5 — one real cluster splits, creating an artificial boundary, silhouette drops",
      ],
      takeaway: "The elbow method and silhouette score are complementary. The elbow shows diminishing returns in variance reduction. The silhouette directly measures cluster quality.",
    },
    {
      title: "Test-Time: Uploading Your Own CSV",
      category: "advanced",
      setup: "Data Source: CSV | Any algorithm",
      steps: [
        "Click CSV in the data source selector",
        "Upload a CSV file — the first two numeric columns become features (x, y), the last column becomes labels",
        "The tool automatically detects column types and uses numeric columns only",
        "Select an algorithm and Run — see how it handles your real-world data",
        "Compare multiple algorithms on your data using the Compare tab",
        "Use Metrics and Learning Curve to evaluate which algorithm works best",
      ],
      takeaway: "Uploading your own data lets you test algorithms on real problems. Use the comparison and analysis tools to find the best algorithm for your specific dataset.",
    },
    {
      title: "Boundary Shapes: Taxonomy Explorer",
      category: "advanced",
      setup: "Tab: Taxonomy | Filter by boundary type",
      steps: [
        "Switch to the Taxonomy tab in the sidebar",
        "You see all algorithms grouped by their boundary geometry type",
        "Click on tree-based — shows all tree algorithms (Decision Tree, Random Forest, Extra Trees)",
        "Click on linear — shows all linear models (Logistic Regression, Linear SVM, Perceptron)",
        "Click on instance-based — shows KNN (boundaries follow data point locations)",
        "Click on margin-kernel — shows SVM variants (smooth curved boundaries)",
        "Each group produces visually similar boundary shapes — use this to predict what an algorithm will look like before running it",
      ],
      takeaway: "The taxonomy organizes algorithms by the shape of their decision boundaries. This helps you choose algorithms based on the kind of boundary you expect your data to need.",
    },
    {
      title: "Sharing Your Visualization",
      category: "beginner",
      setup: "Any configuration | Share & Export buttons",
      steps: [
        "Set up any visualization (algorithm, dataset, hyperparameters)",
        "Click the Share button in the sidebar — a URL is copied to your clipboard",
        "Open the URL in a new tab — the exact same configuration loads automatically",
        "Click Export to download the canvas as an image",
        "Export also saves metrics as JSON if you have them open",
        "Use these features to share interesting findings with others or save them for documentation",
      ],
      takeaway: "Share URLs encode your entire configuration (algorithm, dataset, hyperparameters). Export saves visual results. Both are useful for collaboration and documentation.",
    },
  ];

  const categories = [
    { id: "all", label: "All" },
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
  ];

  const filteredExamples = exampleCategory === "all" ? examples : examples.filter((e) => e.category === exampleCategory);

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">Step-by-Step Examples</h4>
      <p className="text-xs text-muted-foreground mb-3">
        Follow these guided examples to build intuition about how different algorithms and settings affect the visualization.
      </p>

      <div className="flex gap-1 flex-wrap mb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setExampleCategory(cat.id); setActiveExample(0); }}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              exampleCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 flex-wrap">
        {filteredExamples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setActiveExample(i)}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              activeExample === i
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {ex.title.length > 25 ? ex.title.substring(0, 25) + "..." : ex.title}
          </button>
        ))}
      </div>

      {filteredExamples[activeExample] && (
        <div className="p-3 rounded-md border border-border">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="text-xs font-semibold text-foreground">{filteredExamples[activeExample].title}</h5>
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
              filteredExamples[activeExample].category === "beginner" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
              filteredExamples[activeExample].category === "intermediate" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
              "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}>
              {filteredExamples[activeExample].category}
            </span>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mb-3 px-2 py-1 rounded bg-muted inline-block">
            {filteredExamples[activeExample].setup}
          </p>

          <ol className="space-y-2 text-xs text-muted-foreground mb-4">
            {filteredExamples[activeExample].steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="p-2 rounded bg-primary/5 border border-primary/20">
            <p className="text-xs text-foreground">
              <strong>Key Takeaway:</strong> {filteredExamples[activeExample].takeaway}
            </p>
          </div>
        </div>
      )}

      <div className="p-3 rounded-md bg-muted/50 border border-border">
        <p className="text-[11px] text-muted-foreground">
          <strong className="text-foreground">Try your own experiments:</strong> Change one setting at a time and observe the effect. Start with the default, then vary one hyperparameter across its full range. This builds intuition faster than changing multiple things at once.
        </p>
      </div>
    </div>
  );
}

export function HelpPanel() {
  const [activeSection, setActiveSection] = useState<HelpSection>("quickstart");

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">Help & Guide</h3>
      </div>

      <div className="flex gap-1 flex-wrap">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              activeSection === s.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {activeSection === "quickstart" && <QuickStartGuide />}
        {activeSection === "data" && <DataGuide />}
        {activeSection === "visualizations" && <VisualizationGuide />}
        {activeSection === "analysis" && <AnalysisToolsGuide />}
        {activeSection === "algorithms" && <AlgorithmGuide />}
        {activeSection === "examples" && <ExamplesGuide />}
      </div>
    </div>
  );
}
