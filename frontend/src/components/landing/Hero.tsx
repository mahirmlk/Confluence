import React from "react";
import { LiveVisitorsCard } from "@/components/landing/LiveVisitorsCard";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-white">
      {/* Barely-there geometry: cropped arcs + grid fragment, 0.04–0.08 opacity */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[280px] w-full text-[#171719]"
        style={{ opacity: 0.05 }}
        preserveAspectRatio="xMidYMax slice"
        viewBox="0 0 1440 280"
        fill="none"
      >
        <circle cx="1280" cy="330" r="220" stroke="currentColor" strokeWidth="1" />
        <circle cx="1280" cy="330" r="150" stroke="currentColor" strokeWidth="1" />
        <circle cx="120" cy="330" r="180" stroke="currentColor" strokeWidth="1" />
        {Array.from({ length: 24 }, (_, i) => (
          <line
            key={i}
            x1={60 + i * 56}
            y1="180"
            x2={60 + i * 56}
            y2="280"
            stroke="currentColor"
            strokeWidth="1"
          />
        ))}
      </svg>

      <div className="page-shell relative">
        <div className="grid items-center gap-12 pt-32 pb-16 md:pt-40 md:pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* Left: oversized headline */}
          <div>
            <h1 id="hero-heading" className="hero-title">
              <span className="hero-glass hero-glass--solid hero-line--raised">
                Machine Learning,
              </span>
              <br />
              <span className="hero-glass hero-glass--fade">Made Visible.</span>
            </h1>
          </div>

          {/* Right: live visitors */}
          <div className="flex flex-col justify-center">
            <LiveVisitorsCard />
          </div>
        </div>
      </div>
    </section>
  );
}
