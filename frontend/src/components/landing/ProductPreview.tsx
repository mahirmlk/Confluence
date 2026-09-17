import React from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";
import previewData from "./product-preview-data.json";

/**
 * Product preview showing an example run — same layout and visual language
 * as the visualizer, with shapes computed from a real fitted model
 * (backend/scripts/generate_preview_data.py) so the example looks genuine.
 * Labeled as an example throughout; live numbers only appear in /app.
 */

const {
  boundary: BOUNDARY_LINE,
  regions: REGIONS,
  points: REAL_POINTS,
  metrics: REAL_METRICS,
  curve: REAL_CURVE,
} = previewData as unknown as {
  boundary: [[number, number], [number, number]];
  regions: Record<string, [number, number][]>;
  points: [number, number, number][];
  metrics: { accuracy: number; f1: number; n_test: number };
  curve: { points: [number, number][] };
};

function toSvgPoints(poly: [number, number][]) {
  return poly.map(([x, y]) => `${x},${y}`).join(" ");
}

function RealPoints() {
  return (
    <g>
      {REAL_POINTS.map(([x, y, c], i) =>
        c === 0 ? (
          <circle key={`a-${i}`} cx={x} cy={y} r={4} fill="#2563eb" opacity={0.85} />
        ) : (
          <rect
            key={`b-${i}`}
            x={x - 3.5}
            y={y - 3.5}
            width={7}
            height={7}
            fill="#dc2626"
            opacity={0.8}
          />
        )
      )}
    </g>
  );
}

function LearningCurve() {
  const d = REAL_CURVE.points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const [lx, ly] = REAL_CURVE.points[REAL_CURVE.points.length - 1];
  return (
    <svg viewBox="0 0 200 56" className="h-14 w-full" aria-hidden="true">
      <path d={d} fill="none" stroke="#2563eb" strokeWidth="2" />
      <circle cx={lx} cy={ly} r="3.5" fill="#2563eb" />
      <line x1="4" y1="52" x2="196" y2="52" stroke="#e8e8e8" strokeWidth="1" />
    </svg>
  );
}

export function ProductPreview() {
  const [[x1, y1], [x2, y2]] = BOUNDARY_LINE;
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
            className="overflow-hidden border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_30px_rgba(0,0,0,0.05)] transition-colors duration-200 hover:border-[#c9c9c9]"
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
                EXAMPLE
              </p>
            </div>

            {/* Product body */}
            <div className="grid lg:grid-cols-[1.6fr_1fr]">
              <div className="border-b border-border p-4 md:p-6 lg:border-r lg:border-b-0">
                <svg
                  viewBox="0 0 560 360"
                  role="img"
                  aria-label="Example decision boundary visualization separating two classes of data points"
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
                  {REGIONS.class0 && (
                    <polygon
                      points={toSvgPoints(REGIONS.class0)}
                      fill="#2563eb"
                      opacity={0.06}
                    />
                  )}
                  {REGIONS.class1 && (
                    <polygon
                      points={toSvgPoints(REGIONS.class1)}
                      fill="#dc2626"
                      opacity={0.05}
                    />
                  )}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#171719"
                    strokeWidth="2"
                  />
                  <RealPoints />
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
                <p className="font-ui mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  Example summary — open the visualizer to run it live and
                  see your own numbers.
                </p>
                <dl className="font-mono mt-5 space-y-3 text-xs tabular-nums">
                  {[
                    ["ALGORITHM", "logistic-regression"],
                    ["DATASET", "breast-cancer"],
                    ["SAMPLES", "300"],
                    ["ACCURACY", REAL_METRICS.accuracy.toFixed(2)],
                    ["F1-SCORE", REAL_METRICS.f1.toFixed(2)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4">
                      <dt className="tracking-[0.08em] text-muted-foreground">{k}</dt>
                      <dd className="text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 border-t border-border pt-5">
                  <p className="font-mono mb-2 text-[11px] tracking-[0.08em] text-muted-foreground">
                    LEARNING CURVE
                  </p>
                  <LearningCurve />
                </div>
                <Link
                  href="/app"
                  className="font-ui mt-auto inline-flex h-12 items-center justify-center border border-[#151515] bg-[#151515] px-[22px] text-[0.95rem] font-medium text-white transition-all duration-150 hover:bg-[#2a2a2a] active:scale-[0.99] max-lg:mt-8"
                  style={{ borderRadius: 4 }}
                >
                  Try it live
                </Link>
              </div>
            </div>

            {/* Status strip */}
            <div className="border-t border-border bg-surface px-5 py-3">
              <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
                SCIKIT-LEARN · EXAMPLE PREVIEW · 300 ROWS
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
