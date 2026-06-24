"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

type Metric = {
  value: number;
  suffix?: string;
  label: string;
  detail: string;
  position: string;
};

const METRICS: Metric[] = [
  { value: 30, suffix: "+", label: "Algorithms", detail: "REAL MODEL CATALOG", position: "constellation-node--one" },
  { value: 7, label: "Datasets", detail: "BUILT-IN GENERATORS", position: "constellation-node--two" },
  { value: 4, label: "Families", detail: "ONE SHARED PIPELINE", position: "constellation-node--three" },
  { value: 6, label: "Boundary Types", detail: "GEOMETRIC TAXONOMY", position: "constellation-node--four" },
];

const CONNECTIONS = [
  "M 500 195 C 400 175, 310 100, 160 78",
  "M 500 195 C 600 170, 700 95, 840 75",
  "M 500 195 C 390 225, 300 305, 170 325",
  "M 500 195 C 610 230, 710 305, 840 325",
];

function CountedValue({ metric, active, delay, reduced }: { metric: Metric; active: boolean; delay: number; reduced: boolean }) {
  const [value, setValue] = useState(reduced ? metric.value : 0);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setValue(metric.value);
      return;
    }

    let frame = 0;
    let startedAt = 0;
    const timeout = window.setTimeout(() => {
      const tick = (time: number) => {
        if (!startedAt) startedAt = time;
        const progress = Math.min((time - startedAt) / 850, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(metric.value * eased));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
    };
  }, [active, delay, metric.value, reduced]);

  return <>{value}{metric.suffix}</>;
}

export function DataConstellation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.32 });
  const prefersReducedMotion = useReducedMotion();
  const reduced = Boolean(prefersReducedMotion);
  const active = inView || reduced;

  return (
    <div ref={sectionRef} className="data-constellation" aria-label="Confluence platform coverage">
      <div className="constellation-grid" aria-hidden="true" />
      <div className="constellation-scan" aria-hidden="true" />

      <svg
        className="constellation-connections"
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="constellation-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7B9FD4" stopOpacity="0.2" />
            <stop offset="0.5" stopColor="#255EBA" stopOpacity="0.9" />
            <stop offset="1" stopColor="#7B9FD4" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {CONNECTIONS.map((path, index) => (
          <g key={path}>
            <motion.path
              d={path}
              fill="none"
              stroke="url(#constellation-line)"
              strokeWidth="1.25"
              initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }}
              animate={active ? { pathLength: 1, opacity: 1 } : undefined}
              transition={{ duration: 0.85, delay: reduced ? 0 : 0.3 + index * 0.12, ease: "easeInOut" }}
            />
            <motion.circle
              r="3.5"
              fill="#255EBA"
              className="constellation-packet"
              initial={{ opacity: 0 }}
              animate={active ? { opacity: reduced ? 0 : [0, 1, 1, 0] } : undefined}
              transition={{ duration: 2.8, delay: 1.35 + index * 0.35, repeat: reduced ? 0 : Infinity, repeatDelay: 1.4 }}
            >
              <animateMotion dur={`${3.2 + index * 0.25}s`} repeatCount="indefinite" path={path} />
            </motion.circle>
          </g>
        ))}
      </svg>

      <motion.div
        className="constellation-core"
        initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.78 }}
        animate={active ? { opacity: 1, scale: 1 } : undefined}
        transition={{ type: "spring", stiffness: 110, damping: 18, delay: reduced ? 0 : 0.08 }}
      >
        <div className="constellation-core__halo" aria-hidden="true" />
        <svg viewBox="0 0 160 120" aria-hidden="true">
          <defs>
            <pattern id="constellation-core-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#C8D3E8" strokeWidth="0.6" />
            </pattern>
            <linearGradient id="boundary-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#255EBA" stopOpacity="0.18" />
              <stop offset="1" stopColor="#7B9FD4" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <rect width="160" height="120" fill="url(#constellation-core-grid)" />
          <path d="M 0 88 C 32 88, 38 30, 78 50 S 125 98, 160 30 L 160 120 L 0 120 Z" fill="url(#boundary-fill)" />
          <motion.path
            d="M 0 88 C 32 88, 38 30, 78 50 S 125 98, 160 30"
            fill="none"
            stroke="#255EBA"
            strokeWidth="2"
            initial={{ pathLength: reduced ? 1 : 0 }}
            animate={active ? { pathLength: 1 } : undefined}
            transition={{ duration: 1.1, delay: reduced ? 0 : 0.35, ease: "easeInOut" }}
          />
          <circle cx="30" cy="36" r="3" fill="#255EBA" />
          <circle cx="52" cy="26" r="2.5" fill="#4C73B9" />
          <rect x="110" y="78" width="6" height="6" fill="#4C73B9" />
          <rect x="130" y="92" width="5" height="5" fill="#7B9FD4" />
        </svg>
        <div className="constellation-core__caption">
          <span>CONFLUENCE / LIVE</span>
          <i aria-hidden="true" />
        </div>
      </motion.div>

      {METRICS.map((metric, index) => {
        const delay = reduced ? 0 : 0.78 + index * 0.14;
        return (
          <motion.div
            key={metric.label}
            className={`constellation-node ${metric.position}`}
            initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 14, scale: reduced ? 1 : 0.94 }}
            animate={active ? { opacity: 1, y: 0, scale: 1 } : undefined}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="constellation-node__index">0{index + 1}</span>
            <strong>
              <CountedValue metric={metric} active={active} delay={delay} reduced={reduced} />
            </strong>
            <span className="constellation-node__label">{metric.label}</span>
            <span className="constellation-node__detail">{metric.detail}</span>
            <motion.i
              aria-hidden="true"
              animate={active && !reduced ? { opacity: [0, 0.45, 0], scale: [0.8, 1.45, 1.8] } : { opacity: 0 }}
              transition={{ duration: 1.1, delay: delay + 0.55 }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
