"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

type LifecycleStage = {
  title: string;
  eyebrow: string;
  description: string;
  tools: string;
};

const STAGES: LifecycleStage[] = [
  {
    title: "Configure Experiment",
    eyebrow: "Intent → State",
    description: "Dataset, algorithm, hyperparameters, and comparison slots become one synchronized experiment state that can be reproduced and shared.",
    tools: "Next.js · Zustand · URL state",
  },
  {
    title: "Validate Request",
    eyebrow: "State → Contract",
    description: "The client turns experiment state into typed payloads. FastAPI and Pydantic validate the contract before computation begins.",
    tools: "TypeScript · Axios · FastAPI · Pydantic",
  },
  {
    title: "Execute Real Models",
    eyebrow: "Contract → Model",
    description: "Server-side scikit-learn estimators fit against generated datasets, preserving genuine model behavior instead of browser-side approximations.",
    tools: "Python · scikit-learn · SciPy",
  },
  {
    title: "Resolve Geometry",
    eyebrow: "Model → Surface",
    description: "NumPy evaluates the fitted model over a prediction mesh and resolves probability grids, contours, metrics, and uncertainty data with deterministic cache keys.",
    tools: "NumPy · meshgrid · contours · cache",
  },
  {
    title: "Stream Evolution",
    eyebrow: "Iterations → Frames",
    description: "Staged algorithms publish boosting rounds, tree depth, gradient descent, and neural epochs as WebSocket frames for immediate timeline playback.",
    tools: "WebSocket · async frames · staged training",
  },
  {
    title: "Render Insight",
    eyebrow: "Data → Understanding",
    description: "The interface combines fast 2D heatmaps, precise SVG overlays, motion transitions, and optional 3D scenes into one interactive analytical surface.",
    tools: "Canvas2D · SVG · Framer Motion · Three.js",
  },
  {
    title: "Run Consistently",
    eyebrow: "Services → Runtime",
    description: "Containerized services keep the Next.js interface, FastAPI computation service, and cache infrastructure reproducible across development environments.",
    tools: "Docker Compose · Next.js · FastAPI · Redis",
  },
];

const TOTAL = STAGES.length;

function getStagePosition(index: number) {
  const angle = -Math.PI / 2 + (index / TOTAL) * 2 * Math.PI;
  let x = 50 + 34 * Math.cos(angle);
  const y = 50 + 28 * Math.sin(angle);
  if (index === 5) x = 8;
  if (index === 6) x = 14;
  return { x, y };
}

export function ArchitectureOrbit() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();
  const reduced = Boolean(prefersReducedMotion);
  const active = inView || reduced;
  const [selectedStage, setSelectedStage] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const selected = STAGES[selectedStage];

  return (
    <div ref={sectionRef} className={`architecture-system ${interacting ? "architecture-system--paused" : ""}`}>
      <div className="architecture-system__grid" aria-hidden="true" />

      <div className="architecture-orbit" aria-label="Confluence experiment lifecycle">
        <svg className="architecture-orbit__tracks" viewBox="0 0 1000 650" aria-hidden="true">
          <defs>
            <linearGradient id="orbit-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7B9FD4" stopOpacity="0.18" />
              <stop offset="0.52" stopColor="#255EBA" stopOpacity="0.62" />
              <stop offset="1" stopColor="#7B9FD4" stopOpacity="0.18" />
            </linearGradient>
          </defs>
          {[{ rx: 420, ry: 246, delay: 0.15 }, { rx: 335, ry: 193, delay: 0.28 }, { rx: 250, ry: 140, delay: 0.4 }].map((track) => (
            <motion.ellipse
              key={track.rx}
              cx="500"
              cy="325"
              rx={track.rx}
              ry={track.ry}
              fill="none"
              stroke="url(#orbit-line)"
              strokeWidth="1"
              strokeDasharray={track.rx === 335 ? "5 7" : undefined}
              initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }}
              animate={active ? { pathLength: 1, opacity: 1 } : undefined}
              transition={{ duration: 1.2, delay: reduced ? 0 : track.delay, ease: "easeInOut" }}
            />
          ))}
        </svg>

        <div className="architecture-runner architecture-runner--outer" aria-hidden="true"><i /></div>
        <div className="architecture-runner architecture-runner--middle" aria-hidden="true"><i /></div>
        <div className="architecture-runner architecture-runner--inner" aria-hidden="true"><i /></div>

        <motion.div
          className="architecture-core"
          initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.75 }}
          animate={active ? { opacity: 1, scale: 1 } : undefined}
          transition={{ type: "spring", stiffness: 100, damping: 18, delay: reduced ? 0 : 0.35 }}
        >
          <div className="architecture-core__status"><span>CONFLUENCE ENGINE</span><i aria-hidden="true" /></div>
          <svg viewBox="0 0 220 128" aria-hidden="true">
            <defs>
              <pattern id="architecture-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#C8D3E8" strokeWidth="0.6" />
              </pattern>
              <linearGradient id="architecture-surface" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#255EBA" stopOpacity="0.22" />
                <stop offset="1" stopColor="#7B9FD4" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <rect width="220" height="128" fill="url(#architecture-grid)" />
            <motion.path
              d="M 0 95 C 35 92, 48 35, 91 52 S 148 105, 220 22 L 220 128 L 0 128 Z"
              fill="url(#architecture-surface)"
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={active ? { opacity: [0.35, 0.9, 0.35] } : undefined}
              transition={{ duration: 4, repeat: reduced ? 0 : Infinity }}
            />
            <motion.path
              d="M 0 95 C 35 92, 48 35, 91 52 S 148 105, 220 22"
              fill="none"
              stroke="#255EBA"
              strokeWidth="2.4"
              initial={{ pathLength: reduced ? 1 : 0 }}
              animate={active ? { pathLength: 1 } : undefined}
              transition={{ duration: 1.1, delay: reduced ? 0 : 0.65 }}
            />
            <circle cx="42" cy="37" r="3" fill="#255EBA" />
            <circle cx="72" cy="26" r="2.5" fill="#7B9FD4" />
            <rect x="164" y="84" width="6" height="6" fill="#4C73B9" />
            <rect x="190" y="98" width="5" height="5" fill="#7B9FD4" />
          </svg>

          <AnimatePresence mode="wait">
            <motion.div
              key={selected.title}
              className="architecture-core__detail"
              initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
              aria-live="polite"
            >
              <span>{selected.eyebrow}</span>
              <h3>{selected.title}</h3>
              <p>{selected.description}</p>
              <code>{selected.tools}</code>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {STAGES.map((stage, index) => {
          const pos = getStagePosition(index);
          return (
            <motion.button
              key={stage.title}
              type="button"
              className={`architecture-stage${selectedStage === index ? " architecture-stage--active" : ""}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
              initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.88 }}
              animate={active ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.45, delay: reduced ? 0 : 0.65 + index * 0.1 }}
              onMouseEnter={() => { setSelectedStage(index); setInteracting(true); }}
              onMouseLeave={() => setInteracting(false)}
              onFocus={() => { setSelectedStage(index); setInteracting(true); }}
              onBlur={() => setInteracting(false)}
              onClick={() => setSelectedStage(index)}
              aria-pressed={selectedStage === index}
            >
              <span className="architecture-stage__number">{String(index + 1).padStart(2, "0")}</span>
              <span className="architecture-stage__copy">
                <small>{stage.eyebrow}</small>
                <strong>{stage.title}</strong>
              </span>
              <i aria-hidden="true" />
            </motion.button>
          );
        })}
      </div>

      <div className="architecture-mobile" aria-label="Confluence experiment lifecycle stages">
        <div className="architecture-mobile__rail" aria-hidden="true" />
        {STAGES.map((stage, index) => (
          <motion.article
            key={stage.title}
            className="architecture-mobile__stage"
            initial={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : index % 2 ? 18 : -18 }}
            animate={active ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.45, delay: reduced ? 0 : index * 0.08 }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <small>{stage.eyebrow}</small>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
              <code>{stage.tools}</code>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
