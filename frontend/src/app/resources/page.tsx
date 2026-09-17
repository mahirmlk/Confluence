"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  getBreadcrumbSchema,
  getFaqSchema,
} from "@/lib/seo/json-ld";

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

/** Essential long-form reading — every URL verified live before adding. */
const ESSENTIALS: { title: string; detail: string; url: string }[] = [
  { title: "Dive into Deep Learning", detail: "Interactive book · code plus math", url: "https://d2l.ai/" },
  { title: "Distill", detail: "Interactive ML explanations · archive", url: "https://distill.pub/" },
  { title: "fast.ai", detail: "Practical Deep Learning for Coders", url: "https://www.fast.ai/" },
  { title: "Understanding Deep Learning", detail: "Free book · Prince", url: "https://udlbook.github.io/udlbook/" },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Where do I start?",
    a: "Start with the Fundamentals layer and go in order. Each layer assumes the ones before it, and every topic links straight into the visualizer so you can practice as you read.",
  },
  {
    q: "Do I need the math first?",
    a: "Enough to follow along, not a degree. Linear Algebra and Statistics give you the vocabulary; the visualizer shows you what the equations are describing.",
  },
  {
    q: "How do the topics connect to Confluence?",
    a: "Every layer lists the exact visualizer tools and algorithms to open next — for example, Optimization pairs with the Training Playground, and Evaluation pairs with the confusion matrix and ROC views.",
  },
  {
    q: "Are these links really free?",
    a: "Everything listed here is freely accessible: open docs, free courses, public lectures, and open-access books and papers.",
  },
];

const CATEGORIES = [...new Set(ROADMAP.map((t) => t.category))];

const DIFFICULTY_DOT: Record<RoadmapTopic["difficulty"], string> = {
  beginner: "bg-[#16a34a]",
  intermediate: "bg-[#d97706]",
  advanced: "bg-[#171719]",
};

function countLinks(t: RoadmapTopic) {
  const r = t.resources;
  return (
    r.documentation.length +
    r.youtube.length +
    r.university.length +
    r.books.length +
    r.papers.length
  );
}

const RESOURCE_GROUPS: { key: keyof ResourceSection; label: string }[] = [
  { key: "documentation", label: "Documentation" },
  { key: "youtube", label: "Videos" },
  { key: "university", label: "Courses" },
  { key: "books", label: "Books" },
  { key: "papers", label: "Papers" },
];

function ExternalRow({ title, url }: ResourceLink) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-ui group flex items-center justify-between gap-4 border-t border-border py-3 transition-colors duration-150 hover:bg-surface"
    >
      <span className="text-[0.95rem] text-foreground">{title}</span>
      <span aria-hidden="true" className="row-arrow shrink-0 pr-1 text-muted-foreground transition-colors group-hover:text-foreground">
        ↗
      </span>
    </a>
  );
}

export default function ResourcesPage() {
  const [openId, setOpenId] = useState<string | null>(ROADMAP[0].id);
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = useMemo(() => {
    const links =
      ROADMAP.reduce((n, t) => n + countLinks(t), 0) +
      countLinks(PLATFORMS) +
      ESSENTIALS.length;
    return { layers: ROADMAP.length, links, formats: 5 };
  }, []);

  const q = query.trim().toLowerCase();
  const visible = ROADMAP.filter((t) => {
    if (category && t.category !== category) return false;
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.keyConcepts.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqSchema(FAQS)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Resources", path: "/resources" },
            ])
          ),
        }}
      />

      <main id="main">
        {/* Hero — editorial, typographic */}
        <section className="border-b border-border bg-white">
          <div className="page-shell pt-28 pb-12 md:pt-36 md:pb-16">
            <p className="mono-label">Learning roadmap</p>
            <h1 className="section-title mt-5 max-w-3xl">
              Learn the ideas behind the visuals.
            </h1>
            <p className="font-ui mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground">
              Seven layers, from linear algebra to deployment. Each one pairs
              readings and videos with the exact visualizer tool to practice on.
            </p>
            <p className="font-mono mt-8 text-[11px] tracking-[0.12em] text-muted-foreground uppercase tabular-nums">
              {stats.layers} layers · {stats.links} curated links · {stats.formats} formats
            </p>
            <p className="font-mono mt-2 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              Last updated · September 2026
            </p>

            <div className="relative mt-8 max-w-xl">
              <label htmlFor="roadmap-search" className="sr-only">
                Search the roadmap
              </label>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                id="roadmap-search"
                type="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search layers, concepts…"
                className="font-ui h-12 max-md:min-h-[48px] max-md:text-[16px] w-full border border-border bg-white pr-4 pl-11 text-[0.95rem] text-foreground transition-colors placeholder:text-muted-foreground focus:border-[#1b1b1b] focus:outline-none"
                style={{ borderRadius: 10 }}
              />
            </div>
          </div>
        </section>

        {/* Sticky filter bar */}
        <div className="sticky top-14 z-30 border-b border-border bg-white/80 backdrop-blur-xl">
          <div className="page-shell flex items-center gap-2 overflow-x-auto mobile-snap-x py-3">
            <div
              className="flex items-center gap-1 bg-black/[0.04] p-1"
              style={{ borderRadius: 999 }}
              role="group"
              aria-label="Filter by category"
            >
              {["All", ...CATEGORIES].map((c) => {
                const value = c === "All" ? null : c;
                const selected = category === value;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(value)}
                    aria-pressed={selected}
                    className={`font-ui h-8 shrink-0 px-4 text-[0.85rem] font-medium whitespace-nowrap transition-all duration-150 ${
                      selected
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ borderRadius: 999 }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <p className="font-mono ml-auto hidden shrink-0 text-[11px] tracking-[0.1em] text-muted-foreground uppercase tabular-nums sm:block" aria-live="polite">
              {visible.length} of {ROADMAP.length}
            </p>
          </div>
        </div>

        {/* Roadmap layers */}
        <section aria-label="Roadmap layers" className="bg-white">
          <div className="page-shell py-12 md:py-16">
            {visible.length === 0 && (
              <p className="font-ui border-t border-border py-12 text-center text-muted-foreground">
                Nothing matches this search.
              </p>
            )}
            <ol>
              {visible.map((topic, i) => {
                const open = openId === topic.id;
                return (
                  <li
                    key={topic.id}
                    className={i === visible.length - 1 ? "border-b border-border" : ""}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : topic.id)}
                      aria-expanded={open}
                      className="group grid w-full grid-cols-[44px_1fr_auto] max-md:mobile-row-tight items-center gap-4 border-t border-border py-5 max-md:min-h-[64px] text-left transition-colors duration-150 hover:bg-surface md:py-6"
                    >
                      <span className="font-mono pl-1 text-[13px] text-muted-foreground tabular-nums">
                        {String(ROADMAP.indexOf(topic) + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="font-ui block truncate text-[1.2rem] font-semibold tracking-[-0.02em] text-foreground md:text-[1.45rem]">
                          {topic.title}
                        </span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono inline-flex items-center gap-1.5 text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                            <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 rounded-full ${DIFFICULTY_DOT[topic.difficulty]}`} />
                            {topic.difficulty}
                          </span>
                          <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                            {topic.category}
                          </span>
                          <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground tabular-nums">
                            {countLinks(topic)} links
                          </span>
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`pr-1 text-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                      >
                        ↓
                      </span>
                    </button>

                    {open && (
                      <div className="grid gap-8 pb-8 md:grid-cols-[1fr_1fr] md:gap-12 md:pl-[60px]">
                        <div>
                          <p className="font-ui max-w-xl leading-relaxed text-muted-foreground">
                            {topic.description}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {topic.keyConcepts.map((c) => (
                              <span
                                key={c}
                                className="font-mono border border-border bg-surface px-2.5 py-1 text-[11px] tracking-[0.04em] text-muted-foreground uppercase"
                                style={{ borderRadius: 4 }}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                          {topic.confluenceLinks.length > 0 && (
                            <div className="mt-6">
                              <p className="mono-label">Practice in Confluence</p>
                              <div className="mt-2">
                                {topic.confluenceLinks.map((link) => (
                                  <Link
                                    key={link.label}
                                    href={link.href}
                                    className="font-ui group mt-1 flex items-center gap-2 text-[0.95rem] font-medium text-foreground"
                                  >
                                    {link.label}
                                    <span aria-hidden="true" className="row-arrow">
                                      →
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                          {topic.relatedAlgorithms.length > 0 && (
                            <div className="mt-6">
                              <p className="mono-label">Related algorithms</p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {topic.relatedAlgorithms.map((a) => (
                                  <Link
                                    key={a}
                                    href={`/algorithms#algo-${a}`}
                                    className="font-mono border border-[#1b1b1b] px-2.5 py-1 text-[11px] tracking-[0.04em] text-foreground transition-colors duration-150 hover:bg-[#151515] hover:text-white"
                                    style={{ borderRadius: 4 }}
                                  >
                                    {a}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          {RESOURCE_GROUPS.map(
                            (g) =>
                              topic.resources[g.key].length > 0 && (
                                <div key={g.key} className="mt-6 first:mt-0">
                                  <p className="mono-label">{g.label}</p>
                                  <div className="mt-1 border-b border-border">
                                    {topic.resources[g.key].map((r) => (
                                      <ExternalRow key={r.title} title={r.title} url={r.url} />
                                    ))}
                                  </div>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Essential reading */}
        <section aria-labelledby="essentials-heading" className="border-t border-border bg-surface">
          <div className="page-shell py-16 md:py-24">
            <p className="mono-label">Essential reading</p>
            <h2 id="essentials-heading" className="section-title mt-5 max-w-3xl">
              Four texts worth your time.
            </h2>
            <p className="font-ui mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground">
              The highest-signal books and journals we know — each link
              verified live before it earned a place here.
            </p>
            <ul className="mt-10">
              {ESSENTIALS.map((e, i) => (
                <li key={e.title} className={i === ESSENTIALS.length - 1 ? "border-b border-border" : ""}>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid grid-cols-[44px_1fr_auto] items-center gap-4 border-t border-border py-5 transition-colors duration-150 hover:bg-white md:py-6"
                  >
                    <span className="font-mono pl-1 text-[13px] text-muted-foreground tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="font-ui block truncate text-[1.15rem] font-semibold tracking-[-0.01em] text-foreground">
                        {e.title}
                      </span>
                      <span className="font-mono mt-1 block text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                        {e.detail}
                      </span>
                    </span>
                    <span aria-hidden="true" className="row-arrow pr-1 text-foreground">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Platforms */}
        <section aria-labelledby="platforms-heading" className="border-t border-border bg-white">
          <div className="page-shell py-16 md:py-24">
            <p className="mono-label">Keep learning</p>
            <h2 id="platforms-heading" className="section-title mt-5 max-w-3xl">
              {PLATFORMS.title}.
            </h2>
            <p className="font-ui mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground">
              {PLATFORMS.description}
            </p>
            <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="mono-label">Documentation</p>
                <div className="mt-1 border-b border-border">
                  {PLATFORMS.resources.documentation.map((r) => (
                    <ExternalRow key={r.title} title={r.title} url={r.url} />
                  ))}
                </div>
              </div>
              <div>
                <p className="mono-label">YouTube channels</p>
                <div className="mt-1 border-b border-border">
                  {PLATFORMS.resources.youtube.map((r) => (
                    <ExternalRow key={r.title} title={r.title} url={r.url} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="border-t border-border bg-white">
          <div className="page-shell grid gap-10 py-16 md:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="mono-label">FAQ</p>
              <h2 id="faq-heading" className="section-title mt-5">
                Questions, answered.
              </h2>
            </div>
            <div>
              <ul>
                {FAQS.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <li key={f.q} className={i === FAQS.length - 1 ? "border-b border-border" : ""}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? null : i)}
                        aria-expanded={open}
                        className="font-ui flex w-full items-center justify-between gap-6 border-t border-border py-5 text-left text-[1.05rem] font-semibold tracking-[-0.01em] text-foreground"
                      >
                        {f.q}
                        <span
                          aria-hidden="true"
                          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-45" : ""}`}
                        >
                          +
                        </span>
                      </button>
                      {open && (
                        <p className="font-ui max-w-2xl pb-6 leading-relaxed text-muted-foreground">
                          {f.a}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section aria-labelledby="resources-cta-heading" className="border-t border-border bg-surface">
          <div className="page-shell py-16 text-center md:py-24">
            <h2 id="resources-cta-heading" className="section-title mx-auto max-w-3xl">
              Reading is half of it. Run the other half.
            </h2>
            <p className="font-ui mx-auto mt-5 max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground">
              Every layer above maps to a tool waiting in the visualizer.
            </p>
            <Link
              href="/app"
              className="font-ui mt-8 inline-flex h-12 items-center justify-center border border-[#151515] bg-[#151515] px-[26px] text-[0.95rem] font-medium text-white transition-all duration-150 hover:bg-[#2a2a2a] active:scale-[0.99]"
              style={{ borderRadius: 4 }}
            >
              Open the visualizer
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
