import React from "react";
import { Reveal } from "./Reveal";

const FEATURES = [
  {
    n: "01",
    title: "Interactive visualization",
    description:
      "See decision boundaries, loss curves, classifications, and model behavior update as you change hyperparameters.",
  },
  {
    n: "02",
    title: "Real data",
    description:
      "Explore 25 real datasets — from Iris and Breast Cancer to Titanic and California Housing — instead of toy-only examples.",
  },
  {
    n: "03",
    title: "First-principles learning",
    description:
      "Understand what each algorithm is actually optimizing, with theory, formulas, and visual intuition side by side.",
  },
  {
    n: "04",
    title: "Explanations",
    description:
      "Turn model output into something readable: feature contributions, decision paths, and plain-language prediction breakdowns.",
  },
  {
    n: "05",
    title: "Algorithm comparison",
    description:
      "Race algorithms on the same dataset, overlay their boundaries, and see exactly where — and why — they diverge.",
  },
  {
    n: "06",
    title: "Learning notes",
    description:
      "Connect visual behavior with the math through a curated roadmap from linear algebra to model evaluation.",
  },
];

export function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="border-t border-border bg-white">
      <div className="page-shell py-16 max-md:py-12 md:py-24">
        <Reveal>
          <p className="mono-label">Features</p>
          <h2 id="features-heading" className="section-title mt-5 max-w-3xl">
            Built for understanding.
          </h2>
          <p className="font-ui mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground">
            Not another toy demo. Confluence runs real algorithms with real
            computation, wrapped in an interface designed for exploration.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
          {FEATURES.map((f, i) => (
            <Reveal key={f.n} delay={Math.min(i * 60, 240)}>
              <div
                className={`group grid gap-2 border-t border-border py-7 transition-colors duration-150 hover:bg-surface md:grid-cols-[72px_1fr] md:gap-8 md:py-8 ${
                  i === FEATURES.length - 1 ? "border-b" : ""
                }`}
              >
                <p className="font-mono text-[13px] tracking-[0.1em] text-muted-foreground md:pt-1">
                  {f.n}
                </p>
                <div>
                  <h3 className="font-ui text-[1.3rem] font-semibold tracking-[-0.02em] text-foreground">
                    {f.title}
                  </h3>
                  <p className="font-ui mt-2 max-w-2xl leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={120}>
              <figure className="m-0 border border-border bg-white p-4 md:p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/illustrations/features-visual.svg"
                  alt="Schematic transformation from raw data points to a model boundary to prediction regions"
                  className="h-auto w-full"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="sr-only">
                  Conceptual diagram only. No measured values are shown.
                </figcaption>
              </figure>
              <p className="mono-label mt-4">Data → Model → Behavior</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
