"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface ResourceLink {
  title: string;
  url: string;
}

interface ResourceSection {
  documentation: ResourceLink[];
  youtube: ResourceLink[];
  university: ResourceLink[];
  books: ResourceLink[];
  papers: ResourceLink[];
}

interface RoadmapTopic {
  id: string;
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  keyConcepts: string[];
  confluenceLinks: { label: string; href: string }[];
  relatedAlgorithms: string[];
  resources: ResourceSection;
}

const ROADMAP: RoadmapTopic[] = [
  {
    id: "linear-algebra", title: "Linear Algebra", category: "Fundamentals",
    difficulty: "beginner",
    description: "Vectors, matrices, and transformations are the language of ML. Every model internally uses linear algebra for computation.",
    keyConcepts: ["Vectors & Matrices", "Eigenvalues & Eigenvectors", "Matrix Decomposition", "Dot Products", "Matrix Inversion"],
    confluenceLinks: [{ label: "PCA Explorer — see eigenvectors in action", href: "/app" }],
    relatedAlgorithms: ["pca", "lda", "linear-regression"],
    resources: {
      documentation: [
        { title: "Math for Machine Learning Book", url: "https://mml-book.github.io/" },
        { title: "NumPy Documentation", url: "https://numpy.org/doc/" },
      ],
      youtube: [
        { title: "3Blue1Brown — Essence of Linear Algebra", url: "https://youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab&si=VYly4RQgqCDaNZgJ" },
        { title: "MIT 18.06 — Gilbert Strang", url: "https://youtube.com/playlist?list=PLE7DDD91010BC51F8&si=iDAFgXPcZUwpQoz1" },
        { title: "Khan Academy — Linear Algebra", url: "https://youtube.com/playlist?list=PLFD0EB975BA0CC1E0&si=Z-nuvrZc7oZZD2HD" },
      ],
      university: [
        { title: "MIT OpenCourseWare 18.06", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/" },
      ],
      books: [
        { title: "Introduction to Linear Algebra — Gilbert Strang", url: "https://math.mit.edu/~gs/linearalgebra/" },
        { title: "Mathematics for Machine Learning", url: "https://mml-book.github.io/" },
      ],
      papers: [],
    },
  },
  {
    id: "statistics", title: "Statistics & Probability", category: "Fundamentals",
    difficulty: "beginner",
    description: "The mathematical foundation of machine learning. Understanding distributions, hypothesis testing, and Bayesian thinking is essential for interpreting model results.",
    keyConcepts: ["Descriptive Statistics", "Probability Distributions", "Hypothesis Testing", "Bayesian Thinking", "Central Limit Theorem", "Confidence Intervals"],
    confluenceLinks: [{ label: "Explore Gaussian Naive Bayes", href: "/app" }],
    relatedAlgorithms: ["gaussian-nb", "logistic-regression"],
    resources: {
      documentation: [
        { title: "Khan Academy – Statistics & Probability", url: "https://www.khanacademy.org/math/statistics-probability?utm_source=chatgpt.com" },
        { title: "StatQuest Website", url: "https://statquest.org?utm_source=chatgpt.com" },
      ],
      youtube: [
        { title: "Steve Brunton", url: "https://youtube.com/playlist?list=PLMrJAkhIeNNR3sNYvfgiKgcStwuPSts9V&si=pZgPbLClsM62LCLZ" },
        { title: "StatQuest with Josh Starmer — Statistics", url: "https://youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9&si=Zr_kB32YZ5XYfIKp" },
        { title: "Khan Academy — Statistics", url: "https://youtube.com/playlist?list=PL1328115D3D8A2566&si=Kui9gO9ocyD7yu47" },
        { title: "Khan Academy — Probability", url: "https://youtube.com/playlist?list=PLC58778F28211FA19&si=2UD-qHNcxxVdlbKT" },
      ],
      university: [
        { title: "Harvard STAT110", url: "https://projects.iq.harvard.edu/stat110" },
        { title: "MIT Probability", url: "https://ocw.mit.edu/courses/6-431-probabilistic-systems-analysis-and-applied-probability-fall-2010/" },
      ],
      books: [],
      papers: [],
    },
  },
  {
    id: "optimization", title: "Optimization", category: "Fundamentals",
    difficulty: "intermediate",
    description: "How models learn. Gradient descent, loss functions, and convergence are the mechanisms behind training.",
    keyConcepts: ["Gradient Descent", "Loss Functions", "Learning Rate", "Convergence", "Local vs Global Minima", "Regularization"],
    confluenceLinks: [{ label: "Training Playground — watch gradient descent", href: "/app" }],
    relatedAlgorithms: ["logistic-regression", "mlp", "gradient-boosting"],
    resources: {
      documentation: [],
      youtube: [
        { title: "Stanford Convex Optimization", url: "https://youtube.com/playlist?list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&si=MzA6djfmnsOICBCa" },
        { title: "StatQuest — Gradient Descent", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF" },
        { title: "MIT Optimization Lectures", url: "https://youtube.com/playlist?list=PLB7540DEDD482705B&si=ETieOn98OOXP5m7j" },
      ],
      university: [],
      books: [],
      papers: [],
    },
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
    resources: {
      documentation: [
        { title: "scikit-learn Preprocessing Guide", url: "https://scikit-learn.org/stable/modules/preprocessing.html" },
        { title: "Feature-engine Documentation", url: "https://feature-engine.trainindata.com/" },
      ],
      youtube: [
        { title: "Krish Naik — Feature Engineering Playlist", url: "https://www.youtube.com/playlist?list=PLZoTAELRMXVMdJ5sqbCK2LiM0HhQVWNzm" },
        { title: "StatQuest — Feature Selection", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUK0UGK11EJQ3RypVp08S_-y" },
        { title: "CampusX — Feature Engineering", url: "https://www.youtube.com/playlist?list=PLZoTAELRMXVGR5CfA10rYXV4L33EB6Y3T" },
      ],
      university: [],
      books: [],
      papers: [],
    },
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
    resources: {
      documentation: [
        { title: "scikit-learn Model Evaluation Guide", url: "https://scikit-learn.org/stable/modules/model_evaluation.html" },
        { title: "Google Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course/classification/accuracy" },
      ],
      youtube: [
        { title: "StatQuest — Precision, Recall, ROC, AUC", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9" },
        { title: "Andrew Ng — Model Evaluation", url: "https://www.youtube.com/playlist?list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy" },
        { title: "Krish Naik — Evaluation Metrics", url: "https://www.youtube.com/playlist?list=PLZoTAELRMXVNxVE56yn6TLVLVJWRVn9R7" },
      ],
      university: [],
      books: [],
      papers: [
        { title: "Sebastian Raschka — Model Evaluation, Model Selection & Algorithm Selection", url: "https://arxiv.org/abs/1811.12808" },
      ],
    },
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
    resources: {
      documentation: [
        { title: "scikit-learn Model Selection", url: "https://scikit-learn.org/stable/modules/classes.html#module-sklearn.model_selection" },
        { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course" },
      ],
      youtube: [
        { title: "StatQuest — Cross Validation", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF" },
        { title: "StatQuest — Hyperparameter Tuning", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF" },
        { title: "Krish Naik — Grid Search & Random Search", url: "https://www.youtube.com/playlist?list=PLZoTAELRMXVNxVE56yn6TLVLVJWRVn9R7" },
        { title: "Andrew Ng — Bias vs Variance", url: "https://www.youtube.com/playlist?list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy" },
      ],
      university: [],
      books: [],
      papers: [
        { title: "Model Selection Techniques Overview", url: "https://en.wikipedia.org/wiki/Model_selection" },
      ],
    },
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
    resources: {
      documentation: [
        { title: "FastAPI Documentation", url: "https://fastapi.tiangolo.com/" },
        { title: "MLflow Documentation", url: "https://mlflow.org/docs/latest/index.html" },
        { title: "Docker Documentation", url: "https://docs.docker.com/" },
        { title: "BentoML Documentation", url: "https://docs.bentoml.com/" },
        { title: "ONNX Documentation", url: "https://onnx.ai/onnx/" },
      ],
      youtube: [
        { title: "Krish Naik — ML Deployment", url: "https://www.youtube.com/playlist?list=PLZoTAELRMXVNxVE56yn6TLVLVJWRVn9R7" },
        { title: "Codebasics — FastAPI", url: "https://www.youtube.com/playlist?list=PLeo1K3hjS3uu_nAyiLP6DGusf78hzhRIR" },
        { title: "DataTalksClub — MLOps Zoomcamp", url: "https://www.youtube.com/playlist?list=PL3MmuxUbc_hIhcl5WZIazFBv3Go7uT7VZ" },
        { title: "AssemblyAI — Production ML", url: "https://www.youtube.com/playlist?list=PLcTfeOx-flJbqDbwONrQ-fWkYfcN80p0p" },
      ],
      university: [
        { title: "Full Stack Deep Learning", url: "https://fullstackdeeplearning.com/" },
        { title: "MLOps Zoomcamp", url: "https://github.com/DataTalksClub/mlops-zoomcamp" },
      ],
      books: [
        { title: "Designing Machine Learning Systems — Chip Huyen", url: "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/" },
      ],
      papers: [],
    },
  },
];

const PLATFORMS: RoadmapTopic = {
  id: "platforms", title: "Recommended Learning Platforms", category: "Resources",
  difficulty: "beginner",
  description: "Curated collection of documentation, interactive courses, and YouTube channels for continuous learning in machine learning and data science.",
  keyConcepts: ["Documentation", "Interactive Learning", "YouTube Channels", "Online Courses"],
  confluenceLinks: [],
  relatedAlgorithms: [],
  resources: {
    documentation: [
      { title: "scikit-learn Documentation", url: "https://scikit-learn.org/stable/documentation.html" },
      { title: "PyTorch Documentation", url: "https://pytorch.org/docs/stable/" },
      { title: "TensorFlow Documentation", url: "https://www.tensorflow.org/guide" },
      { title: "NumPy Documentation", url: "https://numpy.org/doc/" },
      { title: "Pandas Documentation", url: "https://pandas.pydata.org/docs/" },
    ],
    youtube: [
      { title: "3Blue1Brown", url: "https://www.youtube.com/c/3blue1brown" },
      { title: "StatQuest with Josh Starmer", url: "https://www.youtube.com/c/joshstarmer" },
      { title: "MIT OpenCourseWare", url: "https://www.youtube.com/c/MITOpenCourseWare" },
      { title: "Stanford Online", url: "https://www.youtube.com/c/stanfordonline" },
      { title: "DeepLearning.AI", url: "https://www.youtube.com/c/deeplearningai" },
      { title: "Krish Naik", url: "https://www.youtube.com/c/krishnaik06" },
      { title: "CampusX", url: "https://www.youtube.com/c/Campusx-official" },
      { title: "freeCodeCamp.org", url: "https://www.youtube.com/c/Freecodecamp" },
      { title: "Harvard University", url: "https://www.youtube.com/c/HarvardUniversity" },
    ],
    university: [],
    books: [],
    papers: [],
  },
};

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
      
      {/* Hero Section */}
      <div className="relative w-full h-[280px] md:h-[400px] mt-16 overflow-hidden">
        <img 
          src="/resources-hero.png" 
          alt="Machine Learning Resources" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-montserrat uppercase tracking-wide drop-shadow-lg">
            Some of Machine Learning Resources
          </h1>
          <p className="text-gray-200 max-w-2xl mx-auto text-lg drop-shadow-md">
            Explore curated learning paths from fundamentals to advanced topics. Each resource connects to
            interactive Confluence tools where you can practice and experiment with real algorithms.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-16">

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

                      {/* Resources */}
                      {topic.resources.documentation.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-foreground mb-2">Documentation:</h3>
                          <div className="space-y-1">
                            {topic.resources.documentation.map((r) => (
                              <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                                className="block text-primary hover:underline text-xs">
                                ↗ {r.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {topic.resources.youtube.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-foreground mb-2">YouTube Playlists:</h3>
                          <div className="space-y-1">
                            {topic.resources.youtube.map((r) => (
                              <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                                className="block text-primary hover:underline text-xs">
                                ▶ {r.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {topic.resources.university.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-foreground mb-2">University Lectures:</h3>
                          <div className="space-y-1">
                            {topic.resources.university.map((r) => (
                              <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                                className="block text-primary hover:underline text-xs">
                                🎓 {r.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {topic.resources.books.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-foreground mb-2">Books:</h3>
                          <div className="space-y-1">
                            {topic.resources.books.map((r) => (
                              <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                                className="block text-primary hover:underline text-xs">
                                📚 {r.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {topic.resources.papers.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-foreground mb-2">Papers:</h3>
                          <div className="space-y-1">
                            {topic.resources.papers.map((r) => (
                              <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                                className="block text-primary hover:underline text-xs">
                                📄 {r.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Learning Platforms — standalone section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="border-t border-border pt-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-foreground">{PLATFORMS.title}</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_COLORS[PLATFORMS.difficulty]}`}>
              {PLATFORMS.difficulty}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{PLATFORMS.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORMS.resources.documentation.length > 0 && (
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-xs font-semibold text-foreground mb-3">Documentation</h3>
                <div className="space-y-2">
                  {PLATFORMS.resources.documentation.map((r) => (
                    <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="block text-primary hover:underline text-xs">
                      ↗ {r.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {PLATFORMS.resources.youtube.length > 0 && (
              <div className="border border-border rounded-lg p-4 md:col-span-2 lg:col-span-2">
                <h3 className="text-xs font-semibold text-foreground mb-3">YouTube Channels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PLATFORMS.resources.youtube.map((r) => (
                    <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="block text-primary hover:underline text-xs">
                      ▶ {r.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
