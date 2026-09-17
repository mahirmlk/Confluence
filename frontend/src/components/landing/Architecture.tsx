import React from "react";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    label: "Dataset",
    description: "Real and synthetic datasets, projected to 2D for the canvas.",
    tech: "25 datasets",
  },
  {
    n: "02",
    label: "Preprocessing",
    description: "Scaling, encoding, and train/test splits before any fitting.",
    tech: "pandas · sklearn",
  },
  {
    n: "03",
    label: "Model Engine",
    description: "Genuine scikit-learn estimators fit server-side on your data.",
    tech: "38 algorithms",
  },
  {
    n: "04",
    label: "Prediction / Metrics",
    description: "Accuracy, ROC-AUC, R², and silhouette computed from real output.",
    tech: "numpy · scipy",
  },
  {
    n: "05",
    label: "Visualization",
    description: "Decision boundaries, training curves, and 3D surfaces rendered live.",
    tech: "canvas · three.js",
  },
  {
    n: "06",
    label: "Explanation",
    description: "Feature contributions and decision paths in plain language.",
    tech: "first principles",
  },
];

export function Architecture() {
  return (
    <section
      id="architecture"
      aria-labelledby="architecture-heading"
      className="border-t border-border bg-surface"
    >
      <div className="page-shell grid gap-12 py-16 max-md:py-12 md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal>
            <p className="mono-label">Architecture</p>
            <h2 id="architecture-heading" className="section-title mt-5">
              From dataset to understanding.
            </h2>
            <p className="font-ui mt-5 max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
              Follow an experiment from configuration through real model
              computation to visual insight. Documented like infrastructure,
              not marketing.
            </p>
            <p className="font-mono mt-8 text-[11px] tracking-[0.12em] text-muted-foreground">
              REACT · FASTAPI · SCIKIT-LEARN · WEBSOCKET
            </p>
          </Reveal>
        </div>

        <ol className="relative border-l border-border pl-0">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={Math.min(i * 60, 240)}>
              <li
                className={`relative grid grid-cols-[52px_1fr] gap-4 pl-8 ${
                  i === 0 ? "pt-0 pb-6" : i === STEPS.length - 1 ? "pt-6 pb-0" : "py-6"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-[-5px] h-2 w-2 rounded-full border border-[#1b1b1b] bg-white ${
                    i === 0 ? "top-2" : "top-8"
                  }`}
                />
                <span className="font-mono pt-0.5 text-[13px] text-muted-foreground">
                  {s.n}
                </span>
                <div className="border border-border bg-white p-5 transition-colors duration-150 hover:border-[#1b1b1b] md:p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-ui text-[1.1rem] font-semibold tracking-[-0.01em] text-foreground">
                      {s.label}
                    </h3>
                    <p className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                      {s.tech}
                    </p>
                  </div>
                  <p className="font-ui mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
