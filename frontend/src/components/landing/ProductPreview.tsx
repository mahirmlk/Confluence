import React from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";

/** Deterministic pseudo-random generator so SSR and client markup match. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BOUNDARY =
  "M -20 268 C 90 250, 150 190, 235 178 C 320 166, 360 210, 430 170 C 490 138, 540 120, 600 96";

function ScatterPoints() {
  const rand = mulberry32(42);
  const classA: { x: number; y: number }[] = [];
  const classB: { x: number; y: number }[] = [];
  // Class A clusters upper-left of the boundary, class B lower-right.
  for (let i = 0; i < 42; i++) {
    classA.push({ x: 40 + rand() * 380, y: 30 + rand() * 130 });
    classB.push({ x: 150 + rand() * 380, y: 200 + rand() * 120 });
  }
  return (
    <g>
      {classA.map((p, i) => (
        <circle key={`a-${i}`} cx={p.x} cy={p.y} r={4} fill="#2563eb" opacity={0.85} />
      ))}
      {classB.map((p, i) => (
        <rect
          key={`b-${i}`}
          x={p.x - 3.5}
          y={p.y - 3.5}
          width={7}
          height={7}
          fill="#dc2626"
          opacity={0.8}
        />
      ))}
    </g>
  );
}

function LossSparkline() {
  return (
    <svg viewBox="0 0 200 56" className="h-14 w-full" aria-hidden="true">
      <path
        d="M 4 48 C 40 44, 70 30, 110 24 C 150 18, 175 12, 196 8"
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
      />
      <circle cx="110" cy="24" r="3.5" fill="#2563eb" />
      <line x1="4" y1="52" x2="196" y2="52" stroke="#e8e8e8" strokeWidth="1" />
    </svg>
  );
}

export function ProductPreview() {
  return (
    <section aria-label="Product preview" className="border-t border-border bg-white">
      <div className="page-shell py-16 md:py-24">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <p className="mono-label">Live product preview</p>
            <Link
              href="/app"
              className="font-ui group inline-flex items-center gap-2 text-[0.9rem] font-medium text-foreground"
            >
              Open the visualizer
              <span aria-hidden="true" className="row-arrow">
                →
              </span>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div
            className="overflow-hidden border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_30px_rgba(0,0,0,0.05)]"
            style={{ borderRadius: 12 }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-4 border-b border-border px-5 py-3.5">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e2e2e2]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#e2e2e2]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#e2e2e2]" />
              </div>
              <p className="font-ui truncate text-[13px] text-muted-foreground">
                Confluence&nbsp;&nbsp;/&nbsp;&nbsp;Logistic Regression
              </p>
              <p className="font-mono ml-auto hidden items-center gap-2 text-[11px] tracking-[0.1em] text-muted-foreground sm:flex">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                LIVE
              </p>
            </div>

            {/* Product body */}
            <div className="grid lg:grid-cols-[1.6fr_1fr]">
              <div className="border-b border-border p-4 md:p-6 lg:border-r lg:border-b-0">
                <svg
                  viewBox="0 0 560 360"
                  role="img"
                  aria-label="Decision boundary visualization separating two classes of data points"
                  className="h-auto w-full border border-border bg-white"
                >
                  <defs>
                    <pattern id="preview-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                      <path
                        d="M 28 0 L 0 0 0 28"
                        fill="none"
                        stroke="#e8e8e8"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="560" height="360" fill="url(#preview-grid)" />
                  <path d={`${BOUNDARY} L 600 360 L -20 360 Z`} fill="#2563eb" opacity={0.06} />
                  <path d={`${BOUNDARY} L 600 -20 L -20 -20 Z`} fill="#dc2626" opacity={0.05} />
                  <path d={BOUNDARY} fill="none" stroke="#171719" strokeWidth="2" />
                  <ScatterPoints />
                </svg>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground">
                    DECISION BOUNDARY · C = 1.0
                  </p>
                  <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground">
                    <span className="text-[#2563eb]">● CLASS 0</span>
                    {"  "}
                    <span className="text-[#dc2626]">■ CLASS 1</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col p-5 md:p-6">
                <p className="mono-label">Run summary</p>
                <dl className="font-mono mt-5 space-y-3 text-xs">
                  {[
                    ["ALGORITHM", "logistic-regression"],
                    ["DATASET", "breast-cancer"],
                    ["SAMPLES", "569"],
                    ["ACCURACY", "0.94"],
                    ["F1-SCORE", "0.93"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4">
                      <dt className="tracking-[0.08em] text-muted-foreground">{k}</dt>
                      <dd className="text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 border-t border-border pt-5">
                  <p className="font-mono mb-2 text-[11px] tracking-[0.08em] text-muted-foreground">
                    TRAINING LOSS
                  </p>
                  <LossSparkline />
                </div>
                <Link
                  href="/app"
                  className="font-ui mt-auto inline-flex h-12 items-center justify-center border border-[#151515] bg-[#151515] px-[22px] text-[0.95rem] font-medium text-white transition-colors duration-150 hover:bg-[#2a2a2a] max-lg:mt-8"
                  style={{ borderRadius: 4 }}
                >
                  Try it live
                </Link>
              </div>
            </div>

            {/* Status strip */}
            <div className="border-t border-border bg-surface px-5 py-3">
              <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
                SCIKIT-LEARN · REAL COMPUTATION · 569 ROWS
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
