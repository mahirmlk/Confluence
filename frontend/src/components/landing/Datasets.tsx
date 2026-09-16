import React from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";

const DATASETS = [
  {
    name: "Breast Cancer",
    rows: "569 rows",
    features: "30 features",
    task: "Classification",
    target: "diagnosis",
  },
  {
    name: "Digits",
    rows: "1,797 rows",
    features: "64 features",
    task: "Classification",
    target: "digit",
  },
  {
    name: "Titanic",
    rows: "1,309 rows",
    features: "6 features",
    task: "Classification",
    target: "survived",
  },
  {
    name: "Heart Disease",
    rows: "1,025 rows",
    features: "7 features",
    task: "Classification",
    target: "target",
  },
  {
    name: "Penguins",
    rows: "342 rows",
    features: "2 features",
    task: "Classification",
    target: "species",
  },
  {
    name: "Iris",
    rows: "150 rows",
    features: "4 features",
    task: "Classification",
    target: "species",
  },
];

export function Datasets() {
  return (
    <section
      id="datasets"
      aria-labelledby="datasets-heading"
      className="border-t border-border bg-surface"
    >
      <div className="page-shell grid gap-12 py-16 md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal>
            <p className="mono-label">Datasets</p>
            <h2 id="datasets-heading" className="section-title mt-5">
              Real data.
              <br />
              Real behavior.
            </h2>
            <p className="font-ui mt-5 max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
              Every dataset ships with its full shape — rows, features, task,
              and target — so you know exactly what the model is learning from.
            </p>
            <Link
              href="/app"
              className="font-ui group mt-8 inline-flex items-center gap-2 text-[0.95rem] font-medium text-foreground"
            >
              Explore datasets in the visualizer
              <span aria-hidden="true" className="row-arrow">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <div>
          <ul>
            {DATASETS.map((d, i) => (
              <Reveal key={d.name} delay={Math.min(i * 60, 240)}>
                <li
                  className={`border-t border-border py-5 transition-colors duration-150 hover:bg-white ${
                    i === DATASETS.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-ui text-[1.15rem] font-semibold tracking-[-0.01em] text-foreground">
                      {d.name}
                    </h3>
                    <p className="font-mono shrink-0 text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                      {d.task}
                    </p>
                  </div>
                  <p className="font-mono mt-2 text-xs tracking-[0.06em] text-muted-foreground uppercase">
                    {d.rows} · {d.features} · target: {d.target}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal>
            <p className="font-mono mt-6 text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
              + 18 more in the visualizer
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
