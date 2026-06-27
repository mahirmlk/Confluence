"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface RoadmapTopic {
  id: string;
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  keyConcepts: string[];
  confluenceLinks: { label: string; href: string }[];
  relatedAlgorithms: string[];
  externalResources: { title: string; url: string }[];
}

const ROADMAP: RoadmapTopic[] = [
  {
    id: "statistics", title: "Statistics & Probability", category: "Fundamentals",
    difficulty: "beginner",
    description: "The mathematical foundation of machine learning. Understanding distributions, hypothesis testing, and Bayesian thinking is essential for interpreting model results.",
    keyConcepts: ["Descriptive Statistics", "Probability Distributions", "Hypothesis Testing", "Bayesian Thinking", "Central Limit Theorem", "Confidence Intervals"],
    confluenceLinks: [{ label: "Explore Gaussian Naive Bayes", href: "/app" }],
    relatedAlgorithms: ["gaussian-nb", "logistic-regression"],
    externalResources: [
      { title: "Khan Academy: Statistics", url: "https://www.khanacademy.org/math/statistics-probability" },
      { title: "Seeing Theory (visual)", url: "https://seeing-theory.brown.edu/" },
    ],
  },
  {
    id: "linear-algebra", title: "Linear Algebra", category: "Fundamentals",
    difficulty: "beginner",
    description: "Vectors, matrices, and transformations are the language of ML. Every model internally uses linear algebra for computation.",
    keyConcepts: ["Vectors & Matrices", "Eigenvalues & Eigenvectors", "Matrix Decomposition", "Dot Products", "Matrix Inversion"],
    confluenceLinks: [{ label: "PCA Explorer — see eigenvectors in action", href: "/app" }],
    relatedAlgorithms: ["pca", "lda", "linear-regression"],
    externalResources: [
      { title: "3Blue1Brown: Essence of Linear Algebra", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
    ],
  },
  {
    id: "optimization", title: "Optimization", category: "Fundamentals",
    difficulty: "intermediate",
    description: "How models learn. Gradient descent, loss functions, and convergence are the mechanisms behind training.",
    keyConcepts: ["Gradient Descent", "Loss Functions", "Learning Rate", "Convergence", "Local vs Global Minima", "Regularization"],
    confluenceLinks: [{ label: "Training Playground — watch gradient descent", href: "/app" }],
    relatedAlgorithms: ["logistic-regression", "mlp", "gradient-boosting"],
    externalResources: [
      { title: "Stanford CS229: Optimization", url: "https://cs229.stanford.edu/" },
    ],
  },
  {
    id: "feature-engineering", title: "Feature Engineering", category: "Practice",
    difficulty: "intermediate",
    description: "Transforming raw data into useful features. Often more impactful than algorithm choice.",
    keyConcepts: ["Scaling & Normalization", "Encoding Categoricals", "Feature Selection", "Dimensionality Reduction", "Polynomial Features", "Missing Value Handling"],
    confluenceLinks: [
      { label: "PCA Explorer — dimensionality reduction", href: "/app" },
      { label: "Dataset Info Panel — see preprocessing", href: "/app" },
    ],
    relatedAlgorithms: ["pca", "lasso", "ridge"],
    externalResources: [
      { title: "Feature Engineering for ML", url: "https://www.featuretools.com/" },
    ],
  },
  {
    id: "evaluation", title: "Evaluation", category: "Practice",
    difficulty: "intermediate",
    description: "Measuring model performance correctly. Understanding metrics prevents overfitting to the wrong goal.",
    keyConcepts: ["Accuracy, Precision, Recall, F1", "Confusion Matrix", "ROC & PR Curves", "Cross-Validation", "Bias-Variance Tradeoff"],
    confluenceLinks: [
      { label: "Interactive Confusion Matrix", href: "/app" },
      { label: "Interactive ROC Curve", href: "/app" },
      { label: "Explain Every Metric", href: "/app" },
    ],
    relatedAlgorithms: [],
    externalResources: [
      { title: "Google ML Crash Course: Classification", url: "https://developers.google.com/machine-learning/crash-course/classification" },
    ],
  },
  {
    id: "model-selection", title: "Model Selection", category: "Practice",
    difficulty: "intermediate",
    description: "Choosing the right algorithm and tuning it. No single algorithm works best for everything.",
    keyConcepts: ["Algorithm Comparison", "Hyperparameter Tuning", "Ensemble Methods", "Cross-Validation", "No Free Lunch Theorem"],
    confluenceLinks: [
      { label: "Algorithm Race — compare algorithms", href: "/app" },
      { label: "Hyperparameter Comparison", href: "/app" },
      { label: "Benchmark Suite", href: "/app" },
    ],
    relatedAlgorithms: ["random-forest", "gradient-boosting"],
    externalResources: [
      { title: "scikit-learn Algorithm Cheat Sheet", url: "https://scikit-learn.org/stable/tutorial/machine_learning_map/index.html" },
    ],
  },
  {
    id: "deployment", title: "Deployment", category: "Advanced",
    difficulty: "advanced",
    description: "Taking models to production. Serialization, APIs, monitoring, and maintaining models over time.",
    keyConcepts: ["Model Serialization", "API Design", "Monitoring & Drift", "A/B Testing", "MLOps", "Retraining Pipelines"],
    confluenceLinks: [
      { label: "Code Generator — export production code", href: "/app" },
    ],
    relatedAlgorithms: [],
    externalResources: [
      { title: "Made With ML", url: "https://madewithml.com/" },
      { title: "MLOps Community", url: "https://mlops.community/" },
    ],
  },
];

const CATEGORIES = [...new Set(ROADMAP.map((t) => t.category))];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function ResourcesPage() {
  const [selectedTopic, setSelectedTopic] = useState<RoadmapTopic | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = selectedCategory ? ROADMAP.filter((t) => t.category === selectedCategory) : ROADMAP;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 font-montserrat uppercase tracking-wide">ML Roadmap</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A structured learning path from fundamentals to production ML. Each topic links to
            interactive Confluence features where you can practice.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-2 mb-8">
          <button onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!selectedCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Roadmap Flow */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden lg:block" />

          <div className="space-y-6">
            {filtered.map((topic, i) => (
              <div key={topic.id} className="relative pl-16">
                {/* Step number */}
                <div className="absolute left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>

                <div
                  className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                    selectedTopic?.id === topic.id ? "border-primary shadow-md" : "border-border"
                  }`}
                  onClick={() => setSelectedTopic(selectedTopic?.id === topic.id ? null : topic)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-semibold text-foreground">{topic.title}</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_COLORS[topic.difficulty]}`}>
                      {topic.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">{topic.category}</span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>

                  {selectedTopic?.id === topic.id && (
                    <div className="mt-4 space-y-4 text-sm">
                      {/* Key Concepts */}
                      <div>
                        <h3 className="text-xs font-semibold text-foreground mb-2">Key Concepts:</h3>
                        <div className="flex flex-wrap gap-1">
                          {topic.keyConcepts.map((c) => (
                            <span key={c} className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs">{c}</span>
                          ))}
                        </div>
                      </div>

                      {/* Confluence Links */}
                      {topic.confluenceLinks.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-foreground mb-2">Practice in Confluence:</h3>
                          <div className="space-y-1">
                            {topic.confluenceLinks.map((link) => (
                              <Link key={link.label} href={link.href}
                                className="block text-primary hover:underline text-xs">
                                → {link.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Related Algorithms */}
                      {topic.relatedAlgorithms.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-foreground mb-2">Related Algorithms:</h3>
                          <div className="flex flex-wrap gap-1">
                            {topic.relatedAlgorithms.map((a) => (
                              <span key={a} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono">{a}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* External Resources */}
                      <div>
                        <h3 className="text-xs font-semibold text-foreground mb-2">External Resources:</h3>
                        <div className="space-y-1">
                          {topic.externalResources.map((r) => (
                            <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                              className="block text-primary hover:underline text-xs">
                              ↗ {r.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
