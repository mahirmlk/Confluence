"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  LinearBoundaryDiagram,
  KNNDiagram,
  DecisionTreeDiagram,
  SVMMarginDiagram,
  RandomForestDiagram,
  BoostingDiagram,
  GaussianNBDiagram,
  NeuralNetDiagram,
  KMeansDiagram,
  DBSCANDiagram,
  GMMDiagram,
  SpectralDiagram,
  AgglomerativeDiagram,
  PCADiagram,
  ManifoldDiagram,
  KernelTrickDiagram,
  RegularizationDiagram,
  GaussianProcessDiagram,
  IsomapDiagram,
  ElasticNetDiagram,
} from "@/components/algorithms/diagrams";

interface AlgorithmEntry {
  name: string;
  label: string;
  tag: string;
  tagColor: string;
  diagram: React.FC;
  theory: string[];
  example: string;
  formula: string;
  strengths: string[];
  limitations: string[];
}

const CLASSIFICATION: AlgorithmEntry[] = [
  {
    name: "logistic-regression",
    label: "Logistic Regression",
    tag: "Linear",
    tagColor: "#3b82f6",
    diagram: LinearBoundaryDiagram,
    theory: [
      "Despite its name, Logistic Regression is a classification algorithm. It models the probability that an input belongs to a particular class by passing a linear combination of features through the sigmoid function σ(z) = 1/(1+e⁻ᶻ).",
      "The model learns weights w and bias b by maximizing the log-likelihood of the training data, which is equivalent to minimizing the binary cross-entropy loss. The decision boundary is a hyperplane where P(y=1|x) = 0.5.",
      "Because the sigmoid squashes outputs to [0,1], the model naturally produces probabilistic predictions. The gradient of the loss is proportional to the prediction error, making optimization via gradient descent straightforward.",
    ],
    example: "Email spam detection: Given features like word frequency ('free', 'meeting'), sender domain, and time sent, the model outputs P(spam) = 0.87. If the threshold is 0.5, this email is classified as spam. The weights tell you that the word 'free' increases spam odds 3x, while being in your contacts decreases them 5x.",
    formula: "P(y=1|x) = σ(w·x + b) = 1 / (1 + e^(−(w·x+b)))",
    strengths: ["Outputs calibrated probabilities", "No tuning hyperparameters (except regularization C)", "Coefficients are interpretable"],
    limitations: ["Only learns linear decision boundaries", "Sensitive to correlated features", "Struggles with complex non-linear patterns"],
  },
  {
    name: "knn",
    label: "K-Nearest Neighbors",
    tag: "Instance-Based",
    tagColor: "#10b981",
    diagram: KNNDiagram,
    theory: [
      "KNN is the simplest non-parametric classifier: it stores the entire training set and classifies new points by majority vote of their k nearest neighbors, typically measured by Euclidean distance.",
      "No training occurs — the model IS the data. At prediction time, it computes distances to all training points, sorts them, and takes the top-k. The decision boundary is entirely determined by the local geometry of the data.",
      "The choice of k controls the bias-variance tradeoff: small k gives complex, noisy boundaries (high variance); large k smooths boundaries (high bias). Distance weighting can mitigate the effect of imbalanced class densities.",
    ],
    example: "Movie recommendation: Netflix finds your 5 most similar users (by watch history). If 4 of them loved 'Inception' and 1 didn't, the model recommends it to you with 80% confidence. The 'distance' is computed from genre preferences, watch time, and ratings.",
    formula: "ŷ = argmax_c Σᵢ∈N_k(x) 𝟙[yᵢ = c]   where N_k(x) = k nearest points",
    strengths: ["Naturally handles multi-class problems", "No training phase — adapts to new data instantly", "Non-linear boundaries with zero assumptions"],
    limitations: ["Slow prediction (O(n·d) per query)", "Curse of dimensionality degrades distance metric", "Sensitive to irrelevant features and scaling"],
  },
  {
    name: "decision-tree",
    label: "Decision Tree",
    tag: "Tree-Based",
    tagColor: "#f59e0b",
    diagram: DecisionTreeDiagram,
    theory: [
      "Decision Trees recursively partition the feature space using axis-aligned splits. At each node, the algorithm selects the feature and threshold that maximizes information gain (or minimizes Gini impurity).",
      "The process is greedy: at each step, it picks the locally best split without backtracking. This continues until a stopping criterion is met — maximum depth, minimum samples per leaf, or pure leaves.",
      "The resulting model is a set of if-then rules that can be traversed in O(depth) time. Each leaf outputs the majority class of its training examples. The piecewise-constant boundaries are axis-aligned, creating a stair-step pattern.",
    ],
    example: "Bank loan approval: The tree asks: 'Income > $50K?' → Yes → 'Debt < $10K?' → Yes → 'Credit score > 700?' → Yes → Approve. You can show this exact path to a loan officer and they'll understand why the decision was made.",
    formula: "Gain = I(parent) − Σ (|Sⱼ|/|S|) · I(Sⱼ)   where I = Gini or Entropy",
    strengths: ["Highly interpretable — easy to visualize and explain", "Handles mixed feature types (numeric + categorical)", "No feature scaling required", "Fast prediction"],
    limitations: ["Prone to overfitting without pruning", "Unstable — small data changes yield different trees", "Axis-aligned splits miss diagonal patterns", "Greedy optimization is not globally optimal"],
  },
  {
    name: "rbf-svm",
    label: "SVM (RBF Kernel)",
    tag: "Margin / Kernel",
    tagColor: "#8b5cf6",
    diagram: KernelTrickDiagram,
    theory: [
      "The RBF (Radial Basis Function) kernel maps inputs into an infinite-dimensional feature space where data that is not linearly separable becomes separable. The kernel computes K(x,x') = exp(−γ‖x−x'‖²) without explicitly performing the mapping.",
      "In this implicit high-dimensional space, SVM finds the maximum-margin hyperplane. Points near the decision boundary become support vectors. The γ parameter controls the width of the RBF: large γ creates tight, complex boundaries; small γ creates smooth, broad ones.",
      "Combined with the C parameter (regularization), the RBF SVM can model highly non-linear decision boundaries while still optimizing a convex objective, guaranteeing a global optimum.",
    ],
    example: "Medical diagnosis: Classifying tumors as benign or malignant based on 30 features (radius, texture, perimeter). The RBF kernel lifts data into higher dimensions where a linear separator exists, capturing non-linear relationships like 'small radius + high texture = malignant'.",
    formula: "K(x,x') = exp(−γ‖x − x'‖²)   decision: f(x) = Σ αᵢyᵢK(xᵢ,x) + b",
    strengths: ["Models highly non-linear boundaries", "Kernel trick avoids explicit high-dim mapping", "Global optimum (convex optimization)"],
    limitations: ["Slow on large datasets (O(n²) to O(n³) training)", "Sensitive to feature scaling", "γ and C require careful tuning", "Not interpretable"],
  },
  {
    name: "linear-svm",
    label: "SVM (Linear)",
    tag: "Linear",
    tagColor: "#3b82f6",
    diagram: SVMMarginDiagram,
    theory: [
      "Linear SVM finds the hyperplane that separates classes with maximum margin — the largest possible distance between the hyperplane and the nearest training points from each class.",
      "Only the support vectors (points on or within the margin) affect the decision boundary. All other points can be moved freely without changing the model. This makes SVM robust to outliers far from the boundary.",
      "The primal formulation minimizes ‖w‖² + C·Σξᵢ subject to yᵢ(w·xᵢ+b) ≥ 1−ξᵢ. The dual formulation introduces Lagrange multipliers αᵢ, leading to the kernelizable form.",
    ],
    example: "Document classification: Separating news articles into 'sports' vs 'politics' using word counts. The margin maximization ensures the classifier is confident — articles clearly about sports stay far from the boundary, while borderline articles (sports politics) become support vectors.",
    formula: "min ‖w‖² + C·Σξᵢ  s.t. yᵢ(w·xᵢ + b) ≥ 1 − ξᵢ, ξᵢ ≥ 0",
    strengths: ["Maximum margin gives strong generalization", "Sparse model — only support vectors matter", "Works well in high dimensions"],
    limitations: ["Only linear boundaries", "Sensitive to feature scaling", "C parameter requires tuning"],
  },
  {
    name: "poly-svm",
    label: "SVM (Polynomial)",
    tag: "Margin / Kernel",
    tagColor: "#8b5cf6",
    diagram: KernelTrickDiagram,
    theory: [
      "The polynomial kernel K(x,x') = (γ·x·x' + r)^d maps features into a d-dimensional polynomial space. This allows SVM to learn polynomial decision boundaries of degree d.",
      "For d=2, the kernel captures all pairwise feature interactions. Higher degrees model more complex interactions but risk overfitting. The parameter r (coef0) controls the influence of high-order terms.",
      "Like the RBF kernel, the polynomial kernel computes inner products in the transformed space without explicitly mapping, making computation tractable even for high-degree polynomials.",
    ],
    example: "Image classification: Recognizing handwritten digits (0-9) from pixel intensities. A degree-2 polynomial kernel captures interactions like 'vertical stroke in top-left AND horizontal stroke in middle = likely 7', without manually engineering these features.",
    formula: "K(x,x') = (γ·x·x' + r)^d",
    strengths: ["Captures feature interactions", "Degree controls complexity explicitly", "Works well when true boundary is polynomial"],
    limitations: ["Number of features grows combinatorially with d", "Sensitive to scaling and kernel parameters", "Can overfit with high degree"],
  },
  {
    name: "random-forest",
    label: "Random Forest",
    tag: "Tree-Based",
    tagColor: "#f59e0b",
    diagram: RandomForestDiagram,
    theory: [
      "Random Forest builds many decision trees on bootstrapped samples (bagging) and random subsets of features at each split. This decorrelates the trees, reducing variance without increasing bias.",
      "Each tree votes on the class; the majority vote wins. Because each tree sees different data and features, individual errors average out. The out-of-bag (OOB) samples provide a built-in validation estimate.",
      "Feature importance is measured by how much each feature decreases impurity across all trees, or by permutation importance on OOB data.",
    ],
    example: "Credit risk scoring: 500 trees each trained on different customer samples and feature subsets. Tree 1 might split on income first, Tree 2 on credit score, Tree 3 on debt-to-income ratio. The ensemble vote is more stable than any single tree — a borderline applicant gets a fair assessment from multiple angles.",
    formula: "ŷ = mode{T₁(x), T₂(x), ..., T_B(x)}   each Tᵢ trained on bootstrap + random feature subset",
    strengths: ["Resistant to overfitting", "Handles high-dimensional data", "Built-in feature importance", "Minimal hyperparameter tuning"],
    limitations: ["Less interpretable than a single tree", "Memory-intensive with many trees", "Can overfit on very noisy data"],
  },
  {
    name: "adaboost",
    label: "AdaBoost",
    tag: "Boosting",
    tagColor: "#f97316",
    diagram: BoostingDiagram,
    theory: [
      "AdaBoost trains weak learners sequentially. After each round, it increases the weights of misclassified samples and decreases weights of correctly classified ones, forcing the next learner to focus on hard examples.",
      "Each learner's contribution is weighted by its accuracy. The final prediction is a weighted vote. The algorithm can be shown to minimize an exponential loss function.",
      "AdaBoost is theoretically elegant — it performs a stage-wise additive modeling approach that greedily minimizes the loss, and has strong generalization bounds from VC theory.",
    ],
    example: "Face detection: First classifier catches obvious faces but misses side profiles. Second classifier (trained on weighted errors) focuses on profiles. Third catches partial occlusions. The final ensemble detects faces from any angle, even with sunglasses or hats.",
    formula: "F(x) = Σₜ αₜ · hₜ(x)   where αₜ = ½·ln((1−εₜ)/εₜ)",
    strengths: ["Simple and effective", "Hard to overfit (theoretically)", "No need to tune learning rate (auto-adapts)"],
    limitations: ["Sensitive to noisy data and outliers", "Can overfit with too many rounds", "Sequential training is slow to parallelize"],
  },
  {
    name: "gradient-boosting",
    label: "Gradient Boosting",
    tag: "Boosting",
    tagColor: "#f97316",
    diagram: BoostingDiagram,
    theory: [
      "Gradient Boosting generalizes boosting by fitting each new learner to the negative gradient of the loss function with respect to the current ensemble's predictions. This is equivalent to functional gradient descent.",
      "At each step, the algorithm computes pseudo-residuals rᵢ = −∂L(yᵢ,F(xᵢ))/∂F(xᵢ), then fits a regression tree to these residuals. The learning rate η scales each tree's contribution.",
      "This framework supports any differentiable loss function — log-loss for classification, squared error for regression, and many more — making it extremely versatile.",
    ],
    example: "Click-through rate prediction: Round 1 predicts baseline CTR. Round 2 learns gaming ads perform better at night. Round 3 discovers video ads outperform static images. After 500 rounds, the ensemble captures intricate patterns no single model could find.",
    formula: "Fₘ(x) = Fₘ₋₁(x) + η · hₘ(x)   where hₘ fits −∂L/∂F at Fₘ₋₁",
    strengths: ["State-of-the-art on tabular data", "Supports custom loss functions", "Handles missing values natively", "Strong theoretical foundation"],
    limitations: ["Prone to overfitting without early stopping", "Sequential training is slow", "Many hyperparameters to tune (depth, lr, subsample)"],
  },
  {
    name: "gaussian-nb",
    label: "Gaussian Naive Bayes",
    tag: "Probabilistic",
    tagColor: "#ef4444",
    diagram: GaussianNBDiagram,
    theory: [
      "Naive Bayes applies Bayes' theorem with the 'naive' assumption that features are conditionally independent given the class. For Gaussian NB, each feature's class-conditional distribution is modeled as a Gaussian.",
      "At prediction time, it computes P(y|x) ∝ P(y)·Π P(xⱼ|y) for each class and picks the maximum. Despite the independence assumption rarely holding exactly, the classifier often performs well because the ranking of posteriors is preserved.",
      "Training is O(n·d): just compute the mean and variance of each feature per class. The model is essentially a lookup table of Gaussian parameters.",
    ],
    example: "Sentiment analysis: A movie review contains 'amazing' and 'boring'. P(positive) ∝ 0.5 × 0.8 × 0.05 = 0.02. P(negative) ∝ 0.5 × 0.1 × 0.7 = 0.035. Negative wins — 'boring' outweighs 'amazing' in this context. Training is just counting word frequencies per class.",
    formula: "P(y|x) ∝ P(y) · Πⱼ P(xⱼ|y)   where P(xⱼ|y) = N(μⱼᵧ, σ²ⱼᵧ)",
    strengths: ["Extremely fast training and prediction", "Works well with small datasets", "Handles high-dimensional sparse data", "No hyperparameters to tune"],
    limitations: ["Independence assumption is often violated", "Probability estimates are poorly calibrated", "Cannot learn feature interactions"],
  },
  {
    name: "mlp",
    label: "MLP Classifier",
    tag: "Neural",
    tagColor: "#ec4899",
    diagram: NeuralNetDiagram,
    theory: [
      "A Multi-Layer Perceptron is a shallow neural network with one or more hidden layers. Each layer applies a linear transformation Wx+b followed by a nonlinear activation (typically ReLU).",
      "The network learns hierarchical feature representations: early layers capture simple patterns, later layers combine them into complex decision boundaries. Training uses backpropagation to compute gradients through the chain rule.",
      "With sufficient hidden units, an MLP with one hidden layer can approximate any continuous function (universal approximation theorem). In practice, 1-2 hidden layers with ReLU activation work well for most tabular data.",
    ],
    example: "Handwritten digit recognition: Input layer receives 784 pixels (28×28). Hidden layer 1 learns edges and curves. Hidden layer 2 combines them into loops and strokes. Output layer maps to digits 0-9. The network learns to recognize a '7' as 'horizontal line + vertical line + angle', without being told these features.",
    formula: "output = W₃ · ReLU(W₂ · ReLU(W₁ · x + b₁) + b₂) + b₃",
    strengths: ["Universal approximation capability", "Learns non-linear boundaries", "Flexible architecture"],
    limitations: ["Requires feature scaling", "Many hyperparameters (layers, units, lr, epochs)", "Black box — not interpretable", "Needs more data than simpler models"],
  },
];

const REGRESSION: AlgorithmEntry[] = [
  {
    name: "linear-regression",
    label: "Linear Regression",
    tag: "Linear",
    tagColor: "#3b82f6",
    diagram: LinearBoundaryDiagram,
    theory: [
      "Linear Regression fits a hyperplane y = w·x + b that minimizes the mean squared error (MSE) between predictions and actual values. The closed-form solution is w = (XᵀX)⁻¹Xᵀy.",
      "This is the foundation of statistical modeling. The OLS estimator is unbiased and, under Gaussian noise assumptions, is the best linear unbiased estimator (BLUE) by the Gauss-Markov theorem.",
      "The model assumes a linear relationship between features and target. Residual analysis reveals violations — non-linearity, heteroscedasticity, or autocorrelation.",
    ],
    example: "House price prediction: Features: sqft (2000), bedrooms (3), age (10 years). Model learns: price = 150×sqft + 20K×bedrooms - 1K×age + 50K. Prediction: 150×2000 + 20000×3 - 1000×10 + 50000 = $400K. Each coefficient is interpretable: 'each extra bedroom adds $20K'.",
    formula: "min ‖y − Xw‖²   solution: w* = (XᵀX)⁻¹Xᵀy",
    strengths: ["Closed-form solution (no iteration needed)", "Highly interpretable coefficients", "Statistical inference (confidence intervals, p-values)"],
    limitations: ["Assumes linear relationship", "Sensitive to outliers", "Multicollinearity destabilizes estimates"],
  },
  {
    name: "ridge",
    label: "Ridge Regression",
    tag: "Linear",
    tagColor: "#3b82f6",
    diagram: RegularizationDiagram,
    theory: [
      "Ridge adds an L2 penalty λ‖w‖² to the MSE loss, shrinking coefficients toward zero but never setting them exactly to zero. This reduces variance at the cost of introducing small bias.",
      "Geometrically, the L2 constraint is a circle in coefficient space. The MSE loss forms elliptical contours. The solution is where the smallest ellipse touches the circle — typically a point where all coefficients are reduced but nonzero.",
      "Ridge is especially useful when features are correlated (multicollinearity) — it distributes weight across correlated features rather than picking one arbitrarily.",
    ],
    example: "Predicting salary from correlated features (years of experience, job level, age). Without Ridge, the model might assign all weight to 'job level' and zero to 'experience'. Ridge distributes weight: experience=0.4, level=0.35, age=0.25 — a more stable, generalizable model.",
    formula: "min ‖y − Xw‖² + λ‖w‖²   solution: w* = (XᵀX + λI)⁻¹Xᵀy",
    strengths: ["Reduces overfitting", "Handles multicollinearity", "All features retained (no feature selection)"],
    limitations: ["Coefficients never become exactly zero", "Does not perform feature selection", "λ requires cross-validation"],
  },
  {
    name: "lasso",
    label: "Lasso Regression",
    tag: "Linear",
    tagColor: "#3b82f6",
    diagram: RegularizationDiagram,
    theory: [
      "Lasso adds an L1 penalty λ‖w‖₁ to the loss, which shrinks some coefficients exactly to zero, performing automatic feature selection. The L1 penalty's diamond-shaped constraint has corners on the axes.",
      "Geometrically, the elliptical loss contours are more likely to touch a diamond corner (where one coefficient is zero) than a smooth circle's edge. This is why Lasso produces sparse solutions.",
      "The number of non-zero coefficients is bounded by min(n, p). Lasso is ideal for high-dimensional data where only a few features are truly relevant.",
    ],
    example: "Gene expression analysis: 20,000 genes but only 50 matter for disease prediction. Lasso sets 19,950 coefficients to exactly zero, identifying the 50 relevant genes. The model becomes: disease = 0.3×Gene_A + 0.2×Gene_B + ... (only 50 terms).",
    formula: "min ‖y − Xw‖² + λ‖w‖₁",
    strengths: ["Automatic feature selection (sparse models)", "Handles high-dimensional data", "Interpretable — only relevant features kept"],
    limitations: ["Selects at most n features (with p > n)", "Unstable with correlated features (picks one arbitrarily)", "No closed-form solution"],
  },
  {
    name: "elastic-net",
    label: "Elastic Net",
    tag: "Linear",
    tagColor: "#3b82f6",
    diagram: ElasticNetDiagram,
    theory: [
      "Elastic Net combines L1 and L2 penalties: λ₁‖w‖₁ + λ₂‖w‖². The mixing ratio l1_ratio controls the blend. This gets Lasso's sparsity while keeping Ridge's stability with correlated features.",
      "When features are correlated, Lasso picks one arbitrarily and sets others to zero. Elastic Net tends to select groups of correlated features together, which is more realistic.",
      "The penalty shape is between a diamond (pure L1) and circle (pure L2), creating a rounded diamond that touches axes less aggressively.",
    ],
    example: "Predicting house price from correlated features: sqft, bedrooms, and bathrooms are all correlated. Lasso might keep only sqfit. Elastic Net keeps all three but shrinks them together, recognizing they measure 'house size' as a group.",
    formula: "min ‖y − Xw‖² + λ₁‖w‖₁ + λ₂‖w‖²",
    strengths: ["Combines L1 sparsity with L2 stability", "Handles correlated features better than Lasso", "Flexible through l1_ratio tuning"],
    limitations: ["Two regularization parameters to tune", "Computationally more expensive than Lasso or Ridge alone"],
  },
  {
    name: "decision-tree-regressor",
    label: "Decision Tree Regressor",
    tag: "Tree-Based",
    tagColor: "#f59e0b",
    diagram: DecisionTreeDiagram,
    theory: [
      "Decision Tree Regressor partitions the feature space and assigns the mean target value of training samples in each leaf. The splitting criterion minimizes MSE (or MAE) within each partition.",
      "Like the classification tree, splits are axis-aligned and chosen greedily. The prediction for any input is the average of all training targets that fall into the same leaf region.",
      "The resulting function is piecewise constant — a step function over the feature space. Pruning controls the complexity to prevent overfitting.",
    ],
    example: "Real estate pricing: The tree splits on location → 'downtown?' then sqft → '1500-2000?' then age → '< 10 years?'. Each leaf stores the average price of training houses in that region. A new house gets the average price of its leaf neighborhood.",
    formula: "ŷ = (1/|leaf|) Σᵢ∈leaf yᵢ   split: min Σⱼ Σᵢ∈Sⱼ (yᵢ − ȳⱼ)²",
    strengths: ["Interpretable", "No feature scaling needed", "Captures non-linear relationships"],
    limitations: ["Prone to overfitting", "Piecewise constant — discontinuous predictions", "Unstable with small data changes"],
  },
  {
    name: "random-forest-regressor",
    label: "Random Forest Regressor",
    tag: "Tree-Based",
    tagColor: "#f59e0b",
    diagram: RandomForestDiagram,
    theory: [
      "Random Forest Regressor averages the predictions of many bootstrapped, feature-randomized decision trees. Each tree predicts a constant in each leaf; the forest averages these to produce a smoother prediction.",
      "The ensemble variance reduction comes from averaging uncorrelated trees. While individual trees overfit, the average is robust. Feature randomization ensures diversity.",
      "OOB error provides a free validation estimate. Feature importance can be computed by permutation or impurity decrease.",
    ],
    example: "Energy consumption forecasting: 200 trees each trained on different subsets of weather, time, and building data. Tree 1 might predict high usage based on temperature. Tree 2 focuses on time-of-day patterns. The average prediction smooths out individual tree errors.",
    formula: "ŷ = (1/B) Σₜ₌₁ᴮ Tₜ(x)   each Tₜ on bootstrap + random features",
    strengths: ["Robust to overfitting", "Handles high-dimensional data", "Minimal tuning required"],
    limitations: ["Less interpretable than single tree", "Memory-intensive", "Can overfit on very noisy data"],
  },
  {
    name: "gradient-boosting-regressor",
    label: "Gradient Boosting Regressor (GBR)",
    tag: "Boosting",
    tagColor: "#f97316",
    diagram: BoostingDiagram,
    theory: [
      "GBR fits a sequence of regression trees, each correcting the residual errors of the previous ensemble. At each step, it computes the negative gradient of the squared error loss (which equals the residual) and fits a tree to it.",
      "The learning rate η shrinks each tree's contribution, trading training speed for generalization. Subsampling (stochastic gradient boosting) adds randomness to reduce overfitting.",
      "GBR is one of the most powerful algorithms for structured/tabular data. It consistently wins Kaggle competitions and is the default choice for regression tasks on tabular datasets.",
    ],
    example: "Kaggle house price competition: First tree predicts $200K for all houses. Second tree learns residuals: houses with pools are undervalued by $30K. Third tree corrects: houses near schools are undervalued by $15K. After 1000 trees, predictions are within $5K of actual prices.",
    formula: "Fₘ(x) = Fₘ₋₁(x) + η · hₘ(x)   where hₘ fits residuals yᵢ − Fₘ₋₁(xᵢ)",
    strengths: ["State-of-the-art on tabular data", "Handles missing values", "Robust to outliers with appropriate loss"],
    limitations: ["Prone to overfitting without early stopping", "Many hyperparameters", "Sequential training"],
  },
  {
    name: "svr-linear",
    label: "SVR (Linear Kernel)",
    tag: "Margin / Kernel",
    tagColor: "#8b5cf6",
    diagram: SVMMarginDiagram,
    theory: [
      "Support Vector Regression fits a function within an ε-tube around the data. Points inside the tube have zero loss; only points outside contribute to the loss. This makes SVR robust to small noise.",
      "Linear SVR finds a linear function f(x) = w·x + b that minimizes ‖w‖² + C·Σξᵢ, where ξᵢ are slack variables for points outside the ε-tube.",
      "The ε-insensitive loss makes SVR sparse — only support vectors (points on or outside the tube boundary) define the model.",
    ],
    example: "Stock price prediction: The model learns a linear trend within ±$2 of actual prices. Most days fall inside the tube (zero loss). Only extreme market moves (crashes, rallies) become support vectors that adjust the line. The prediction is robust to daily noise.",
    formula: "min ½‖w‖² + C·Σ(ξᵢ + ξᵢ*)   s.t. |yᵢ − w·xᵢ − b| ≤ ε + ξᵢ",
    strengths: ["Robust to outliers (ε-insensitive loss)", "Sparse model", "Works well in high dimensions"],
    limitations: ["Only linear fit (with linear kernel)", "C and ε require tuning", "Not scalable to very large datasets"],
  },
  {
    name: "svr-rbf",
    label: "SVR (RBF Kernel)",
    tag: "Margin / Kernel",
    tagColor: "#8b5cf6",
    diagram: KernelTrickDiagram,
    theory: [
      "RBF SVR uses the kernel trick to fit a non-linear function within an ε-tube. The RBF kernel maps data to infinite dimensions where the ε-tube constraint becomes linear.",
      "The γ parameter controls the smoothness of the fitted function: large γ creates wiggly fits; small γ creates smooth fits. Combined with C and ε, three parameters control the bias-variance tradeoff.",
      "Like classification SVM, only support vectors define the function, making prediction sparse in terms of training data usage.",
    ],
    example: "Temperature forecasting: The relationship between hour-of-day and temperature is non-linear (cold morning → warm afternoon → cold night). RBF SVR fits a smooth curve that captures this pattern, with the ε-tube ignoring minor fluctuations.",
    formula: "f(x) = Σ(αᵢ − αᵢ*)·K(xᵢ,x) + b   where K = exp(−γ‖x−x'‖²)",
    strengths: ["Models complex non-linear relationships", "Robust to outliers", "Sparse support vectors"],
    limitations: ["Three parameters to tune (C, ε, γ)", "Slow on large datasets", "Not interpretable"],
  },
  {
    name: "knn-regressor",
    label: "KNN Regressor",
    tag: "Instance-Based",
    tagColor: "#10b981",
    diagram: KNNDiagram,
    theory: [
      "KNN Regressor predicts the target as the average of the k nearest training samples. No training occurs — the model stores the data and computes distances at prediction time.",
      "The prediction surface is piecewise constant in each Voronoi cell. Increasing k smooths the surface. Distance weighting (giving closer neighbors more influence) improves performance.",
      "KNN regression is a non-parametric method that adapts to any function shape, given enough data. Its performance depends critically on the distance metric and the choice of k.",
    ],
    example: "Used car pricing: To predict the price of a 2018 Honda Civic with 50K miles, find the 5 most similar cars in the database (same make, similar year, similar mileage). Average their selling prices: $18K, $17.5K, $19K, $18.5K, $17K → prediction: $18K.",
    formula: "ŷ = (1/k) Σᵢ∈N_k(x) yᵢ",
    strengths: ["No training phase", "Naturally non-linear", "Simple to implement"],
    limitations: ["Slow prediction", "Curse of dimensionality", "Sensitive to feature scaling and irrelevant features"],
  },
  {
    name: "gaussian-process-regressor",
    label: "Gaussian Process Regression",
    tag: "Probabilistic",
    tagColor: "#ef4444",
    diagram: GaussianProcessDiagram,
    theory: [
      "A Gaussian Process defines a distribution over functions. Given training data, it produces a posterior distribution over functions consistent with the data, providing both predictions and uncertainty estimates.",
      "The kernel function k(x,x') defines the prior covariance between any two points. Smooth kernels (like RBF) assume nearby points have similar values. The posterior mean is the best prediction; the posterior variance quantifies uncertainty.",
      "GP regression is exact for small datasets (n < 1000) but scales as O(n³) due to matrix inversion, limiting its use to small problems or requiring sparse approximations.",
    ],
    example: "Bayesian optimization: Tuning a hyperparameter (learning rate). GP predicts performance at lr=0.01 with mean=0.85, σ=0.02 (confident). At lr=0.1, mean=0.7, σ=0.15 (uncertain). The optimizer explores the uncertain region, finding the optimum faster than grid search.",
    formula: "f*|X,y,x* ~ N(μ*, σ*²)   μ* = K(x*,X)[K(X,X)+σ²I]⁻¹y",
    strengths: ["Principled uncertainty quantification", "Works well with small data", "Flexible — any kernel encodes different assumptions"],
    limitations: ["O(n³) training — doesn't scale", "Kernel choice requires expertise", "Not suitable for large datasets"],
  },
  {
    name: "mlp-regressor",
    label: "MLP Regressor",
    tag: "Neural",
    tagColor: "#ec4899",
    diagram: NeuralNetDiagram,
    theory: [
      "MLP Regressor uses the same architecture as the classifier but with a linear output layer and squared error loss. It learns a continuous mapping from features to target values.",
      "The hidden layers learn hierarchical representations. With enough units and data, it can approximate any continuous function. ReLU activations in hidden layers enable learning non-linear patterns.",
      "Training uses backpropagation with MSE loss. Regularization through dropout, early stopping, or weight decay prevents overfitting.",
    ],
    example: "Energy load forecasting: Input: temperature, humidity, hour, day-of-week, holiday flag. The MLP learns non-linear interactions like 'high temperature + afternoon + weekday = peak AC usage'. A 2-layer network with 64 units captures patterns that linear models miss.",
    formula: "ŷ = W₃ · ReLU(W₂ · ReLU(W₁ · x + b₁) + b₂) + b₃   loss = ‖y − ŷ‖²",
    strengths: ["Universal approximation", "Learns complex non-linear mappings", "Flexible architecture"],
    limitations: ["Requires feature scaling", "Many hyperparameters", "Black box", "Needs substantial data"],
  },
];

const CLUSTERING: AlgorithmEntry[] = [
  {
    name: "kmeans",
    label: "K-Means",
    tag: "Centroid-Based",
    tagColor: "#06b6d4",
    diagram: KMeansDiagram,
    theory: [
      "K-Means partitions n data points into k clusters by iteratively assigning points to the nearest centroid and recomputing centroids as the mean of assigned points. This alternation monotonically decreases the total within-cluster sum of squares.",
      "The algorithm converges to a local optimum (not guaranteed global). K-Means++ initialization places initial centroids far apart, significantly improving convergence quality.",
      "The resulting clusters form a Voronoi tessellation — each point belongs to the cluster whose centroid is closest. This means boundaries are always linear (axis-aligned if features are scaled).",
    ],
    example: "Customer segmentation: 10,000 customers with purchase frequency and average order value. K-Means with k=4 reveals: (1) High freq + high value = loyal, (2) Low freq + high value = big spenders, (3) High freq + low value = bargain hunters, (4) Low freq + low value = at-risk.",
    formula: "J = Σₖ Σᵢ∈Cₖ ‖xᵢ − μₖ‖²   iterate: assign → update centroids",
    strengths: ["Simple and fast (O(n·k·d) per iteration)", "Scales to large datasets", "Produces compact, spherical clusters"],
    limitations: ["Must specify k in advance", "Assumes spherical clusters of similar size", "Sensitive to initialization", "Struggles with non-convex cluster shapes"],
  },
  {
    name: "dbscan",
    label: "DBSCAN",
    tag: "Density-Based",
    tagColor: "#84cc16",
    diagram: DBSCANDiagram,
    theory: [
      "DBSCAN groups points that are closely packed (high-density regions) and marks points in low-density regions as noise. It needs no specification of k — clusters emerge from the density structure.",
      "Two parameters define density: ε (neighborhood radius) and min_samples (minimum points to form a dense region). A point is a core point if it has ≥ min_samples within its ε-neighborhood. Border points are within ε of a core point but don't have enough neighbors.",
      "DBSCAN can find arbitrarily shaped clusters and automatically identifies noise. However, it struggles with varying densities — a single ε cannot capture clusters of different densities simultaneously.",
    ],
    example: "GPS trajectory clustering: Group taxi trips by route pattern. DBSCAN finds common routes (dense corridors on highways) and marks rare trips (outliers to new destinations) as noise — no need to specify how many routes exist beforehand.",
    formula: "core: |N_ε(x)| ≥ min_samples   cluster: connected core points + their borders",
    strengths: ["No need to specify k", "Finds arbitrary-shaped clusters", "Identifies noise points", "Parameterized by density, not geometry"],
    limitations: ["Struggles with varying densities", "ε and min_samples require tuning", "High-dimensional data degrades density estimation"],
  },
  {
    name: "agglomerative",
    label: "Agglomerative Clustering",
    tag: "Hierarchical",
    tagColor: "#a855f7",
    diagram: AgglomerativeDiagram,
    theory: [
      "Agglomerative clustering starts with each point as its own cluster and repeatedly merges the closest pair. The linkage criterion defines 'closest': single (min distance), complete (max distance), average, or Ward (min variance increase).",
      "The merge history forms a dendrogram — a tree that can be cut at different levels to yield different numbers of clusters. This hierarchical structure reveals the data's natural grouping at multiple scales.",
      "Ward's method (default in scikit-learn) merges clusters that minimize the total within-cluster variance increase, producing compact, equally-sized clusters.",
    ],
    example: "Gene families: Start with each gene as its own cluster. Merge the most similar pair (e.g., two hemoglobin variants). Continue merging until all genes are in one cluster. Cut the dendrogram at height 0.5 to get 12 gene families — revealing evolutionary relationships.",
    formula: "d(A,B) = linkage(A,B)   merge: argmin_{A,B} d(A,B)",
    strengths: ["Produces hierarchical structure (dendrogram)", "No need to specify k upfront (cut dendrogram)", "Deterministic — no initialization variance"],
    limitations: ["O(n³) time and O(n²) memory", "Sensitive to linkage choice", "Does not scale to large datasets", "Greedy merges can be suboptimal"],
  },
  {
    name: "gmm",
    label: "Gaussian Mixture Model",
    tag: "Distribution-Based",
    tagColor: "#ef4444",
    diagram: GMMDiagram,
    theory: [
      "GMM models the data as a mixture of k Gaussian distributions, each with its own mean and covariance. Unlike K-Means (which hard-assigns), GMM gives soft probabilistic cluster assignments.",
      "Training uses the Expectation-Maximization (EM) algorithm: E-step computes posterior probabilities of each point belonging to each Gaussian; M-step updates means, covariances, and mixing weights.",
      "GMM can model elliptical clusters of different sizes and orientations. The number of components k can be selected via BIC or AIC, which penalize model complexity.",
    ],
    example: "Anomaly detection in network traffic: Model normal traffic as 3 Gaussians (morning peak, afternoon steady, night low). A new connection with P(normal) < 0.01 is flagged as potential intrusion — soft assignments catch borderline cases that hard clustering misses.",
    formula: "p(x) = Σₖ πₖ · N(x|μₖ, Σₖ)   EM: E-step → M-step → repeat",
    strengths: ["Soft cluster assignments (probabilities)", "Models elliptical clusters", "Principled model selection (BIC/AIC)", "Generative model — can sample new points"],
    limitations: ["Assumes Gaussian distributions", "Sensitive to initialization", "Can converge to local optima", "Struggles with very non-Gaussian shapes"],
  },
  {
    name: "spectral",
    label: "Spectral Clustering",
    tag: "Graph-Based",
    tagColor: "#a855f7",
    diagram: SpectralDiagram,
    theory: [
      "Spectral clustering builds a similarity graph from the data, then clusters based on the graph structure. It computes eigenvectors of the graph Laplacian L = D − A and uses the bottom eigenvectors as a low-dimensional embedding.",
      "In this embedding, clusters that were not linearly separable in the original space become separable by K-Means. The key insight: the Fiedler vector (second-smallest eigenvector) of the Laplacian encodes the optimal graph cut.",
      "Spectral clustering excels on non-convex shapes (moons, rings) where K-Means fails. The similarity graph (typically k-NN or ε-neighborhood) defines what 'nearby' means.",
    ],
    example: "Image segmentation: Pixels are nodes in a graph, edges connect similar-colored neighbors. Spectral clustering cuts the graph to separate the foreground (cat) from background (grass) — even when the cat has an irregular shape that K-Means would split incorrectly.",
    formula: "L = D − A   embed: bottom k eigenvectors of L → K-Means in embedding",
    strengths: ["Handles non-convex cluster shapes", "Flexible similarity metrics", "Based on solid graph theory"],
    limitations: ["O(n³) eigendecomposition", "Sensitive to similarity graph construction", "Must choose k and graph parameters"],
  },
];

const DIM_REDUCTION: AlgorithmEntry[] = [
  {
    name: "pca",
    label: "PCA",
    tag: "Linear",
    tagColor: "#3b82f6",
    diagram: PCADiagram,
    theory: [
      "PCA finds orthogonal directions (principal components) that maximize variance in the data. The first component captures the most variance, the second captures the most remaining variance orthogonal to the first, and so on.",
      "Computationally, PCA computes the eigendecomposition of the covariance matrix or the SVD of the data matrix. The eigenvectors are the principal components; the eigenvalues indicate the variance explained.",
      "By projecting onto the top-k components, PCA reduces dimensionality while preserving maximum variance. The fraction of variance retained is Σλᵢ / Σλⱼ for the selected components.",
    ],
    example: "Face recognition (Eigenfaces): 1000 face images, each 100×100 = 10,000 pixels. PCA reduces to 100 principal components (eigenfaces). Each face is now a 100-number vector instead of 10,000. Recognition becomes comparing 100-number vectors — 100x faster with minimal accuracy loss.",
    formula: "Cov(X) = XᵀX/n   PCA: eigenvectors of Cov(X)   projection: X · Vₖ",
    strengths: ["Optimal linear dimensionality reduction", "Fast — SVD is O(min(n²p, np²))", "Removes noise by discarding low-variance components", "Unsupervised — no labels needed"],
    limitations: ["Only captures linear structure", "Principal components are not always interpretable", "Sensitive to feature scaling"],
  },
  {
    name: "tsne",
    label: "t-SNE",
    tag: "Manifold",
    tagColor: "#a855f7",
    diagram: ManifoldDiagram,
    theory: [
      "t-SNE (t-distributed Stochastic Neighbor Embedding) models pairwise similarities between points as probability distributions. In high dimensions, it uses Gaussians; in low dimensions, it uses Student-t distributions (heavier tails).",
      "It minimizes the KL divergence between the high-dimensional and low-dimensional similarity distributions using gradient descent. The heavier tails of the t-distribution in low-D prevent crowding.",
      "t-SNE excels at revealing local cluster structure in 2D. However, distances between clusters are not meaningful — only local neighborhoods are preserved. Perplexity controls the effective number of neighbors.",
    ],
    example: "MNIST visualization: 70,000 handwritten digits (784 dimensions). t-SNE projects to 2D, revealing 10 clear clusters — one per digit. Digits 4 and 9 overlap slightly (similar shapes). The visualization helps understand what the model 'sees' and where it might confuse digits.",
    formula: "p_{j|i} = N(xᵢ,xⱼ)/Σₖ≠ᵢ N(xᵢ,xₖ)   q_{ij} = (1+‖yᵢ−yⱼ‖²)⁻¹ / Σ   min KL(p ‖ q)",
    strengths: ["Reveals local cluster structure beautifully", "Handles non-linear manifolds", "Popular for visualization"],
    limitations: ["Non-convex — different runs give different results", "Global distances are not preserved", "Slow on large datasets (O(n²))", "Perplexity tuning affects output significantly"],
  },
  {
    name: "umap",
    label: "UMAP",
    tag: "Manifold",
    tagColor: "#a855f7",
    diagram: ManifoldDiagram,
    theory: [
      "UMAP (Uniform Manifold Approximation and Projection) is based on Riemannian geometry and algebraic topology. It constructs a fuzzy simplicial set (topological representation) of the high-dimensional data.",
      "It optimizes a low-dimensional embedding to have a similar topological structure. The loss function is cross-entropy between high-D and low-D fuzzy set memberships, similar to t-SNE but with different mathematical foundations.",
      "UMAP is faster than t-SNE and better preserves global structure. It scales linearly with n using approximate nearest neighbors. The n_neighbors parameter controls the balance between local and global structure.",
    ],
    example: "Single-cell RNA sequencing: 50,000 cells, 20,000 genes. UMAP in 2D reveals cell types (T-cells, B-cells, monocytes) as distinct clusters, with stem cells in the center and differentiated cells at the edges — preserving the developmental trajectory.",
    formula: "min Σ [wᵢⱼ log(wᵢⱼ/vᵢⱼ) + (1−wᵢⱼ) log((1−wᵢⱼ)/(1−vᵢⱼ))]",
    strengths: ["Faster than t-SNE", "Better global structure preservation", "Scalable to large datasets", "Supports transform on new data"],
    limitations: ["Still a heuristic — no guarantee on what's preserved", "Less mature than t-SNE theoretically", "n_neighbors and min_dist require tuning"],
  },
  {
    name: "isomap",
    label: "Isomap",
    tag: "Manifold",
    tagColor: "#a855f7",
    diagram: IsomapDiagram,
    theory: [
      "Isomap preserves geodesic distances (distances along the manifold surface) rather than Euclidean distances. It constructs a k-NN graph, computes shortest paths (approximating geodesics), then applies multidimensional scaling.",
      "The key insight: Euclidean distances are wrong for curved manifolds. Two points on a Swiss roll may be close in Euclidean space but far apart along the surface. Isomap measures the true along-the-surface distance.",
      "For the Swiss roll and similar manifolds, Isomap produces a faithful 2D unfolding. However, it is sensitive to noise, short-circuit edges (k too large), and holes in the manifold.",
    ],
    example: "Robot sensor data: A robot arm moves in 3D joint angles, but the actual motion is along a 2D curve (elbow + shoulder). Isomap unfolds this 3D data into 2D, revealing the true degrees of freedom — the arm can only move forward/back and up/down, not arbitrarily in 3D.",
    formula: "D_geodesic ≈ shortest_path(k-NN graph)   embed: MDS on D_geodesic",
    strengths: ["Preserves global geodesic structure", "Principled — based on manifold theory", "Reveals true data geometry"],
    limitations: ["O(n³) shortest path computation", "Sensitive to noise and short-circuit edges", "Struggles with holes in the manifold", "Not suitable for very large datasets"],
  },
];

const ALL_ALGORITHMS: AlgorithmEntry[] = [...CLASSIFICATION, ...REGRESSION, ...CLUSTERING, ...DIM_REDUCTION];

function SearchBar({ onSelect }: { onSelect: (name: string) => void }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_ALGORITHMS.filter(
      (algo) =>
        algo.name.toLowerCase().includes(q) ||
        algo.label.toLowerCase().includes(q) ||
        algo.tag.toLowerCase().includes(q) ||
        algo.theory.some((t) => t.toLowerCase().includes(q)) ||
        algo.example.toLowerCase().includes(q) ||
        algo.formula.toLowerCase().includes(q) ||
        algo.strengths.some((s) => s.toLowerCase().includes(q)) ||
        algo.limitations.some((l) => l.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [query]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search algorithms (e.g. SVM, clustering, neural...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => setIsOpen(query.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
        />
      </div>
      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-none shadow-lg z-50 max-h-80 overflow-y-auto">
          {filtered.map((algo) => (
            <button
              key={algo.name}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(algo.name);
                setQuery("");
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-none border"
                  style={{
                    color: algo.tagColor,
                    borderColor: algo.tagColor + "40",
                    backgroundColor: algo.tagColor + "10",
                  }}
                >
                  {algo.tag}
                </span>
                <span className="text-sm font-semibold text-foreground">{algo.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{algo.theory[0]}</p>
            </button>
          ))}
        </div>
      )}
      {isOpen && query.trim() && filtered.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-none shadow-lg z-50 px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">No algorithms found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}

function AlgorithmCard({ algo, id }: { algo: AlgorithmEntry; id?: string }) {
  const DiagramComponent = algo.diagram;
  return (
      <div id={id} className="border border-border bg-card rounded-none mb-12 scroll-mt-24">
      {/* Header */}
      <div className="px-4 md:px-8 py-4 md:py-6 border-b border-border flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <h3 className="text-xl md:text-2xl font-bold font-montserrat text-foreground">{algo.label}</h3>
        <span
          className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider rounded-none border"
          style={{
            color: algo.tagColor,
            borderColor: algo.tagColor + "40",
            backgroundColor: algo.tagColor + "10",
          }}
        >
          {algo.tag}
        </span>
      </div>

      {/* Diagram */}
      <div className="px-4 md:px-8 py-6 md:py-8 bg-[#EBF0FA] border-b border-border">
        <div className="max-w-xl mx-auto">
          <DiagramComponent />
        </div>
      </div>

        {/* Theory */}
        <div className="px-4 md:px-8 py-6 md:py-8">
          <h4 className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground mb-4">
            Theory
          </h4>
          <div className="space-y-4">
            {algo.theory.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-card-foreground/80">
                {p}
              </p>
            ))}
          </div>

          {/* Example */}
          <div className="mt-6 px-4 md:px-5 py-3 md:py-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-none">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-2">
              Real-World Example
            </span>
            <p className="text-sm text-card-foreground/80 leading-relaxed">{algo.example}</p>
          </div>

        {/* Formula */}
        <div className="mt-6 px-4 md:px-5 py-3 md:py-4 bg-accent/50 border border-border rounded-none">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground block mb-2">
            Key Formula
          </span>
          <code className="text-sm font-mono text-foreground break-all">{algo.formula}</code>
        </div>

        {/* Strengths / Limitations */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-green-600 mb-3">
              Strengths
            </h5>
            <ul className="space-y-1.5">
              {algo.strengths.map((s, i) => (
                <li key={i} className="text-xs text-card-foreground/70 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-500 mb-3">
              Limitations
            </h5>
            <ul className="space-y-1.5">
              {algo.limitations.map((l, i) => (
                <li key={i} className="text-xs text-card-foreground/70 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">−</span>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function FamilySection({
  title,
  subtitle,
  algorithms,
  id,
}: {
  title: string;
  subtitle: string;
  algorithms: AlgorithmEntry[];
  id: string;
}) {
  return (
    <section id={id} className="py-12 md:py-16 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-bold font-montserrat text-foreground mb-3">{title}</h2>
          <p className="text-muted-foreground leading-relaxed">{subtitle}</p>
        </div>
        {algorithms.map((algo) => (
          <AlgorithmCard key={algo.name} algo={algo} id={`algo-${algo.name}`} />
        ))}
      </div>
    </section>
  );
}

const FAMILIES = [
  { name: "Classification", count: 11, color: "#255EBA" },
  { name: "Regression", count: 12, color: "#4C73B9" },
  { name: "Clustering", count: 5, color: "#7B9FD4" },
  { name: "Dim. Reduction", count: 4, color: "#A8BFE8" },
];

export default function AlgorithmsPage() {
  const scrollToAlgorithm = (name: string) => {
    const el = document.getElementById(`algo-${name}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 md:pt-28 pb-12 md:pb-16 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none border border-border bg-card text-xs text-muted-foreground mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            31 algorithms from scratch
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight mb-4 font-montserrat">
            Machine Learning Algorithms
            <br />
            <span className="text-muted-foreground">from First Principles</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every algorithm explained with theory, math, and visual intuition.
            Understand what each model optimizes, how it learns, and where it works.
          </p>

          {/* Search Bar */}
          <div className="mt-8">
            <SearchBar onSelect={scrollToAlgorithm} />
          </div>

          {/* Family overview cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {FAMILIES.map((f) => (
              <a
                key={f.name}
                href={`#${f.name.toLowerCase().replace(/[^a-z]/g, "-")}`}
                className="border border-border bg-card p-5 text-left hover:border-foreground/30 transition-colors rounded-none"
              >
                <div className="text-2xl font-bold font-montserrat text-foreground">{f.count}</div>
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
                  {f.name}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Classification */}
      <FamilySection
        id="classification"
        title="Classification"
        subtitle="Algorithms that predict discrete class labels. From linear boundaries to neural networks — each approach draws the decision surface differently."
        algorithms={CLASSIFICATION}
      />

      {/* Regression */}
      <FamilySection
        id="regression"
        title="Regression"
        subtitle="Algorithms that predict continuous values. Regularization, ensembles, and kernel methods each offer different tradeoffs between flexibility and generalization."
        algorithms={REGRESSION}
      />

      {/* Clustering */}
      <FamilySection
        id="clustering"
        title="Clustering"
        subtitle="Unsupervised algorithms that discover group structure. Centroid-based, density-based, hierarchical, and graph-based — each defines 'cluster' differently."
        algorithms={CLUSTERING}
      />

      {/* Dim Reduction */}
      <FamilySection
        id="dimensionality-reduction"
        title="Dimensionality Reduction"
        subtitle="Techniques that project high-dimensional data into fewer dimensions while preserving meaningful structure — variance, neighborhoods, or geometry."
        algorithms={DIM_REDUCTION}
      />

      {/* CTA */}
      <section className="py-16 md:py-20 border-t border-border bg-[#EBF0FA]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl font-bold font-montserrat text-foreground mb-3">
            Ready to see them in action?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Open the visualizer, pick an algorithm, adjust hyperparameters, and watch the
            decision boundary morph in real-time.
          </p>
          <Link
            href="/app"
            className="inline-flex px-8 py-3.5 rounded-none border border-[#DDE3EE] bg-transparent text-sm font-semibold text-foreground hover:bg-[#255EBA] hover:border-[#255EBA] hover:text-white transition-all"
          >
            View Algorithms →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
