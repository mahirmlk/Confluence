"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DataConstellation } from "@/components/landing/DataConstellation";
import { ArchitectureOrbit } from "@/components/landing/ArchitectureOrbit";
import { AlgorithmKnowledgeGraph } from "@/components/algorithms/knowledge-graph";

const FEATURES = [
  {
    title: "Real Computation",
    description: "Every prediction comes from actual scikit-learn models running server-side. No simplified math, no toy approximations.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
      </svg>
    ),
  },
  {
    title: "Boundary Taxonomy",
    description: "Algorithms organized by the geometric shape of their decision boundaries — linear, tree-based, kernel, probabilistic, neural.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: "Training Dynamics",
    description: "Watch boosting rounds, tree splits, and gradient descent iterations evolve in real-time with a scrubber timeline.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
  },
  {
    title: "Side-by-Side Comparison",
    description: "Compare 2-4 algorithms on the same dataset simultaneously. Overlay boundaries to see exactly where they diverge.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="8" height="18" rx="1" />
        <rect x="14" y="3" width="8" height="18" rx="1" />
      </svg>
    ),
  },
  {
    title: "3D Visualization",
    description: "Render decision surfaces, Gaussian Process uncertainty bands, and embedding projections in interactive 3D with Three.js.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: "Full Metrics Suite",
    description: "Accuracy, precision, recall, F1, confusion matrix, ROC/AUC for classification. R, MSE, MAE for regression. Silhouette for clustering.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
];

function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  const renderDiagram = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#EBF0FA] p-4 rounded-none">
            <svg width="240" height="240" viewBox="0 0 100 100" className="border border-border rounded-none bg-white shadow-sm">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#C8D3E8" strokeWidth="0.5" opacity="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <path
                d="M -10 30 Q 30 20 50 50 T 110 70"
                fill="none"
                stroke="#255EBA"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <path d="M -10 30 Q 30 20 50 50 T 110 70 L 110 110 L -10 110 Z" fill="#255EBA" opacity="0.08" />
              <circle cx="20" cy="20" r="2" fill="#255EBA" />
              <circle cx="35" cy="15" r="2" fill="#255EBA" />
              <circle cx="15" cy="45" r="2" fill="#255EBA" />
              <circle cx="45" cy="35" r="2" fill="#255EBA" />
              <rect x="75" y="70" width="3.5" height="3.5" fill="#4C73B9" />
              <rect x="60" y="80" width="3.5" height="3.5" fill="#4C73B9" />
              <rect x="85" y="55" width="3.5" height="3.5" fill="#4C73B9" />
              <rect x="55" y="65" width="3.5" height="3.5" fill="#4C73B9" />
            </svg>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-4 font-mono">Scikit-Learn Boundary Overlay</div>
          </div>
        );
      case 1:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#EBF0FA] p-4 rounded-none">
            <svg width="240" height="240" viewBox="0 0 100 100" className="border border-border rounded-none bg-white p-2 shadow-sm">
              <rect x="42" y="10" width="16" height="8" rx="1" fill="#255EBA" stroke="#C8D3E8" strokeWidth="0.5" />
              <text x="50" y="15" fontSize="3.5" fill="#FFFFFF" textAnchor="middle" fontFamily="monospace">x₁ ≤ 0.45</text>
              <line x1="45" y1="18" x2="25" y2="35" stroke="#4C73B9" strokeWidth="0.5" />
              <line x1="55" y1="18" x2="75" y2="35" stroke="#4C73B9" strokeWidth="0.5" />
              <rect x="17" y="35" width="16" height="8" rx="1" fill="#DDE3EE" stroke="#C8D3E8" strokeWidth="0.5" />
              <text x="25" y="40" fontSize="3" fill="#0D1B35" textAnchor="middle" fontFamily="monospace">x₂ ≤ 1.22</text>
              <rect x="67" y="35" width="16" height="8" rx="1" fill="#DDE3EE" stroke="#C8D3E8" strokeWidth="0.5" />
              <text x="75" y="40" fontSize="3" fill="#0D1B35" textAnchor="middle" fontFamily="monospace">x₁ ≤ 0.88</text>
              <line x1="20" y1="43" x2="12" y2="60" stroke="#4C73B9" strokeWidth="0.5" />
              <line x1="30" y1="43" x2="38" y2="60" stroke="#4C73B9" strokeWidth="0.5" />
              <line x1="70" y1="43" x2="62" y2="60" stroke="#4C73B9" strokeWidth="0.5" />
              <line x1="80" y1="43" x2="88" y2="60" stroke="#4C73B9" strokeWidth="0.5" />
              <circle cx="12" cy="63" r="2.5" fill="#255EBA" />
              <circle cx="38" cy="63" r="2.5" fill="#4C73B9" />
              <circle cx="62" cy="63" r="2.5" fill="#255EBA" />
              <circle cx="88" cy="63" r="2.5" fill="#4C73B9" />
            </svg>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-4 font-mono">Axis-Aligned Partition Tree</div>
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#EBF0FA] p-4 font-mono rounded-none">
            <div className="w-full max-w-[240px] border border-border rounded-none bg-white p-4 flex flex-col gap-4 shadow-sm">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>EPOCH: 42/100</span>
                <span className="text-[#255EBA]">LOSS: 0.142</span>
              </div>
              <svg width="100%" height="80" viewBox="0 0 100 40">
                <path
                  d="M 5 35 Q 25 30 45 15 T 95 5"
                  fill="none"
                  stroke="#255EBA"
                  strokeWidth="1.5"
                />
                <circle cx="45" cy="15" r="2" fill="#255EBA" className="animate-ping" />
                <circle cx="45" cy="15" r="1.5" fill="#255EBA" />
              </svg>
              <div className="flex flex-col gap-1.5">
                <div className="h-1 w-full bg-[#DDE3EE] rounded-none relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[45%] bg-[#255EBA]" />
                  <div className="absolute left-[45%] top-1/2 -translate-y-1/2 w-3 h-3 rounded-none bg-white border border-[#255EBA]" />
                </div>
                <div className="flex justify-between text-[8px] text-muted-foreground">
                  <span>0.0s</span>
                  <span>Scrub Iterations</span>
                  <span>2.5s</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-4 font-mono">Real-Time WebSocket Stream</div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#EBF0FA] p-4 rounded-none">
            <div className="flex gap-4 w-full max-w-[280px]">
              <div className="flex-1 flex flex-col items-center">
                <div className="text-[9px] text-muted-foreground uppercase mb-1 font-mono">Logistic Regression</div>
                <svg width="100" height="100" viewBox="0 0 100 100" className="border border-border rounded-none bg-white shadow-sm">
                  <line x1="10" y1="90" x2="90" y2="10" stroke="#255EBA" strokeWidth="2" />
                  <circle cx="25" cy="35" r="2" fill="#255EBA" />
                  <circle cx="35" cy="65" r="2" fill="#255EBA" />
                  <rect x="70" y="30" width="3" height="3" fill="#4C73B9" />
                  <rect x="60" y="55" width="3" height="3" fill="#4C73B9" />
                </svg>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="text-[9px] text-muted-foreground uppercase mb-1 font-mono">Decision Tree</div>
                <svg width="100" height="100" viewBox="0 0 100 100" className="border border-border rounded-none bg-white shadow-sm">
                  <path d="M 0 50 L 50 50 L 50 100" fill="none" stroke="#255EBA" strokeWidth="2" />
                  <circle cx="25" cy="35" r="2" fill="#255EBA" />
                  <circle cx="35" cy="65" r="2" fill="#255EBA" />
                  <rect x="70" y="30" width="3" height="3" fill="#4C73B9" />
                  <rect x="60" y="55" width="3" height="3" fill="#4C73B9" />
                </svg>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-4 font-mono">Synchronized Zoom/Pan Comparison</div>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#EBF0FA] p-4 rounded-none">
            <svg width="240" height="240" viewBox="0 0 100 100" className="border border-border rounded-none bg-white p-2 shadow-sm">
              <g transform="translate(50, 50) rotate(15)">
                <path d="M -30 -10 L 0 -35 L 30 -10 L 0 15 Z" fill="none" stroke="#4C73B9" strokeWidth="0.5" />
                <path d="M -30 10 L 0 -15 L 30 10 L 0 35 Z" fill="none" stroke="#4C73B9" strokeWidth="0.5" opacity="0.7" />
                <path d="M -15 0 L 15 -25 L 15 25 L -15 0 Z" fill="none" stroke="#255EBA" strokeWidth="0.75" />
                <circle cx="-10" cy="-12" r="1.5" fill="#255EBA" />
                <circle cx="15" cy="-8" r="1.5" fill="#7B9FD4" />
                <circle cx="5" cy="18" r="1.5" fill="#4C73B9" />
              </g>
            </svg>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-4 font-mono">Three.js Decision Surface</div>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#EBF0FA] p-4 font-mono rounded-none">
            <div className="border border-border rounded-none bg-white p-4 flex flex-col items-center gap-2 shadow-sm">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Confusion Matrix</div>
              <div className="grid grid-cols-2 gap-1 w-32 h-32 mt-2">
                <div className="bg-[#255EBA] border border-[#255EBA] flex flex-col items-center justify-center rounded-none">
                  <span className="text-[9px] text-white/80">TP</span>
                  <span className="text-xs font-bold text-white">0.92</span>
                </div>
                <div className="bg-[#EBF0FA] border border-border flex flex-col items-center justify-center rounded-none">
                  <span className="text-[9px] text-muted-foreground">FN</span>
                  <span className="text-xs font-bold text-muted-foreground">0.08</span>
                </div>
                <div className="bg-[#EBF0FA] border border-border flex flex-col items-center justify-center rounded-none">
                  <span className="text-[9px] text-muted-foreground">FP</span>
                  <span className="text-xs font-bold text-muted-foreground">0.12</span>
                </div>
                <div className="bg-[#4C73B9] border border-[#4C73B9] flex flex-col items-center justify-center rounded-none">
                  <span className="text-[9px] text-white/80">TN</span>
                  <span className="text-xs font-bold text-white">0.88</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-4 font-mono">Precision, Recall, ROC/AUC Metrics</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 mt-12 items-stretch">
      {/* Left Column: Feature Selector */}
      <div className="flex-1 flex flex-col gap-4">
        {FEATURES.map((feature, i) => (
          <button
            key={feature.title}
            onClick={() => setActiveFeature(i)}
            className={`text-left p-5 border transition-all duration-300 rounded-none cursor-pointer flex gap-4 items-start ${
              activeFeature === i
                ? "border-[#255EBA] bg-white shadow-md"
                : "border-border bg-white/60 hover:border-[#4C73B9]"
            }`}
          >
            <div className={`p-2 rounded-none bg-primary/10 ${activeFeature === i ? "text-[#255EBA]" : "text-muted-foreground"}`}>
              {feature.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground font-montserrat">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{feature.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Right Column: Visual Diagram Display */}
      <div className="flex-1 flex items-center justify-center bg-card border border-border/80 p-8 shadow-2xl relative min-h-[460px] rounded-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="w-full h-full flex items-center justify-center">
          {renderDiagram(activeFeature)}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen pt-28 pb-16 overflow-hidden flex flex-col justify-center">
        {/* Full-cover background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-bg.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "cover", objectPosition: "center", zIndex: 0 }}
        />

        {/* Overlay — fades image into the light page background at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F5F7FC] via-[#F5F7FC]/50 to-transparent pointer-events-none" style={{ zIndex: 1 }} />
        {/* Left-side semi-white scrim keeps text readable over the bright image */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/10 to-transparent pointer-events-none" style={{ zIndex: 1 }} />
        {/* Blue glow echoing the image */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(37,94,186,0.12) 0%, transparent 70%)", zIndex: 1 }} />

        <div className="relative max-w-7xl mx-auto px-6 text-center pt-8" style={{ zIndex: 2 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none border border-[#C8D3E8] bg-white/80 text-xs text-[#4C73B9] mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            30+ algorithms across 4 families
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-tight mb-4 font-montserrat">
            See How Machine
            <br />
            Learning{" "}
            <span className="bg-gradient-to-r from-[#4C73B9] to-[#FFFFFF] bg-clip-text text-transparent">
              Actually Works
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
            An interactive visualization platform powered by real scikit-learn computation.
            Explore decision boundaries, compare algorithms side-by-side, and watch models
            train step-by-step.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/app"
              className="px-8 py-3.5 rounded-none border border-[#DDE3EE] bg-transparent text-[#FFFFFF] text-sm font-semibold hover:bg-[#255EBA] hover:border-[#255EBA] transition-all"
            >
              Launch Visualizer
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-none border border-[#255EBA]/60 text-[#DDE3EE] text-sm font-semibold hover:bg-[#255EBA]/20 transition-colors backdrop-blur-sm"
            >
              Learn More
            </a>
          </div>

          <div className="mt-12 mx-auto max-w-5xl">
            <DataConstellation />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-montserrat uppercase tracking-wide">
              Built for Understanding
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Not another toy demo. Confluence gives you real algorithms with real computation,
              wrapped in an interface designed for exploration and comparison.
            </p>
          </div>

          <FeaturesSection />
        </div>
      </section>

      {/* Algorithm Knowledge Graph */}
      <section className="py-16 border-t border-border">
        <AlgorithmKnowledgeGraph />

        <div className="text-center mt-8">
          <Link
            href="/algorithms"
            className="inline-flex px-8 py-3.5 rounded-none border border-[#255EBA] bg-[#255EBA] text-white text-sm font-semibold hover:bg-[#4C73B9] hover:border-[#4C73B9] transition-all"
          >
            View All Algorithms →
          </Link>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-montserrat uppercase tracking-wide">
              Production-Grade Architecture
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow an experiment from interactive configuration through real model computation,
              streamed training states, and high-performance visual rendering.
            </p>
          </div>

          <ArchitectureOrbit />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-montserrat uppercase tracking-wide">
            Ready to Explore?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Open the visualizer, pick an algorithm, adjust hyperparameters, and see the
            decision boundary morph in real-time.
          </p>
          <Link
            href="/app"
            className="inline-flex px-10 py-4 rounded-none border border-[#255EBA] bg-[#255EBA] text-white text-base font-semibold hover:bg-[#4C73B9] hover:border-[#4C73B9] transition-all"
          >
            Launch Confluence
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
