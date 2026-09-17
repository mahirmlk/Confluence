"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ALGORITHMS, type AlgorithmFamily } from "@/lib/store";
import { Reveal } from "./Reveal";

const FILTERS: { id: AlgorithmFamily | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "classification", label: "Classification" },
  { id: "regression", label: "Regression" },
  { id: "clustering", label: "Clustering" },
  { id: "dim-reduction", label: "Dim. Reduction" },
];

const FAMILY_SHORT: Record<AlgorithmFamily, string> = {
  classification: "Classification",
  regression: "Regression",
  clustering: "Clustering",
  "dim-reduction": "Dim. Reduction",
};

const PAGE_SIZE = 10;

export function Algorithms() {
  const [family, setFamily] = useState<AlgorithmFamily | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALGORITHMS.filter((a) => {
      if (family !== "all" && a.family !== family) return false;
      if (!q) return true;
      return (
        a.label.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.taxonomyTag.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    });
  }, [family, query]);

  const visible = filtered.slice(0, PAGE_SIZE);

  return (
    <section
      id="algorithms"
      aria-labelledby="algorithms-heading"
      className="border-t border-border bg-white"
    >
      <div className="page-shell py-16 md:py-24">
        <Reveal>
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="mono-label">Algorithms</p>
              <h2 id="algorithms-heading" className="section-title mt-5 max-w-4xl">
                Algorithms, without the black box.
              </h2>
              <p className="font-ui mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground">
                Every model runs for real, server-side. Filter by family or search
                to find the one you want to take apart.
              </p>
            </div>
            <figure className="m-0 hidden border border-border bg-white p-4 lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/illustrations/algorithms-visual.svg"
                alt="Schematic taxonomy diagram grouping algorithm families around machine learning"
                className="h-auto w-full"
                loading="lazy"
                decoding="async"
              />
              <figcaption className="sr-only">
                Conceptual taxonomy only. Node positions carry no measured meaning.
              </figcaption>
            </figure>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by family">
              {FILTERS.map((f) => {
                const active = family === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFamily(f.id)}
                    aria-pressed={active}
                    className={`font-ui h-10 border px-4 text-[0.85rem] font-medium transition-all duration-150 active:scale-[0.97] ${
                      active
                        ? "border-[#151515] bg-[#151515] text-white"
                        : "border-border bg-white text-muted-foreground hover:border-[#1b1b1b] hover:text-foreground"
                    }`}
                    style={{ borderRadius: 4 }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <div className="relative lg:w-72">
              <label htmlFor="algorithms-filter" className="sr-only">
                Search algorithms in this list
              </label>
              <input
                id="algorithms-filter"
                type="search"
                autoComplete="off"
                placeholder="Filter list..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="font-ui h-10 w-full border border-border bg-white pr-4 pl-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-[#1b1b1b] focus:outline-none"
                style={{ borderRadius: 4 }}
              />
            </div>
          </div>
        </Reveal>

        <div className="mt-6" aria-live="polite">
          <p className="mono-label mb-2">
            Showing {visible.length} of {filtered.length}
          </p>
          <ul>
            {visible.map((a, i) => (
              <li key={a.name} className={i === visible.length - 1 ? "border-b border-border" : ""}>
                <Link
                  href={`/algorithms#algo-${a.name}`}
                  className="group grid grid-cols-[44px_1fr_auto] items-center gap-4 border-t border-border py-4 transition-colors duration-150 hover:bg-[#f8f8f8] md:py-5"
                >
                  <span className="font-mono pl-1 text-[13px] text-muted-foreground">
                    {String(ALGORITHMS.indexOf(a) + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="font-ui block truncate text-[1.05rem] font-semibold tracking-[-0.01em] text-foreground">
                      {a.label}
                    </span>
                    <span className="font-ui mt-0.5 hidden truncate text-sm text-muted-foreground md:block">
                      {a.description}
                    </span>
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="font-mono hidden text-[11px] tracking-[0.1em] text-muted-foreground uppercase sm:block">
                      {FAMILY_SHORT[a.family]}
                    </span>
                    <span aria-hidden="true" className="row-arrow pr-1 text-foreground">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="font-ui border-t border-border py-10 text-center text-muted-foreground">
              No algorithms match this filter.
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
              {ALGORITHMS.length} algorithms · 4 families
            </p>
            <Link
              href="/algorithms"
              className="font-ui group inline-flex items-center gap-2 text-[0.95rem] font-medium text-foreground"
            >
              Browse the full encyclopedia
              <span aria-hidden="true" className="row-arrow">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
