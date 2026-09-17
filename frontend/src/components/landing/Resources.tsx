import React from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";

const TOPICS = [
  "Machine Learning",
  "Linear Algebra",
  "Probability",
  "Statistics",
  "Model Evaluation",
  "Feature Engineering",
];

const READING_LIST = [
  {
    title: "Understanding Logistic Regression",
    tag: "Machine Learning",
    href: "/algorithms#algo-logistic-regression",
  },
  {
    title: "Decision Trees from first principles",
    tag: "Machine Learning",
    href: "/algorithms#algo-decision-tree",
  },
  {
    title: "ROC-AUC, without the confusion",
    tag: "Model Evaluation",
    href: "/app",
  },
  {
    title: "The full learning roadmap",
    tag: "All topics",
    href: "/resources",
  },
];

export function Resources() {
  return (
    <section
      id="resources"
      aria-labelledby="resources-heading"
      className="border-t border-border bg-white"
    >
      <div className="page-shell py-16 md:py-24">
        <Reveal>
          <p className="mono-label">Resources</p>
          <h2 id="resources-heading" className="section-title mt-5 max-w-3xl">
            Learn the ideas behind the visuals.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <Reveal>
            <ul className="space-y-3" aria-label="Topics covered">
              {TOPICS.map((t) => (
                <li
                  key={t}
                  className="font-mono text-xs tracking-[0.1em] text-muted-foreground uppercase"
                >
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <div>
            <ul>
              {READING_LIST.map((r, i) => (
                <Reveal key={r.title} delay={Math.min(i * 60, 180)}>
                  <li className={i === READING_LIST.length - 1 ? "border-b border-border" : ""}>
                    <Link
                      href={r.href}
                      className="group flex items-center justify-between gap-6 max-md:gap-3 border-t border-border py-6 max-md:py-4 transition-colors duration-150 hover:bg-surface"
                    >
                      <span className="min-w-0">
                        <span className="font-mono block text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                          {r.tag}
                        </span>
                        <span className="font-ui mt-1 block text-[1.4rem] max-md:text-[1.15rem] font-semibold tracking-[-0.02em] text-foreground md:text-[1.7rem]">
                          {r.title}
                        </span>
                      </span>
                      <span aria-hidden="true" className="row-arrow shrink-0 pr-1 text-xl text-foreground">
                        →
                      </span>
                    </Link>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
