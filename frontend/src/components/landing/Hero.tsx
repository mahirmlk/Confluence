import React from "react";
import Link from "next/link";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-white">
      {/* Barely-there geometry: cropped arcs only, 0.05 opacity */}
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
      </svg>

      <div className="page-shell relative">
        <div className="grid items-center gap-12 max-md:gap-8 max-md:pt-24 max-md:pb-12 pt-32 pb-16 md:pt-36 md:pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Left: heading, avatars, actions */}
          <div>
            <h1 id="hero-heading" className="hero-title">
              <span className="hero-line--raised inline-block">Machine Learning,</span>
              <br />
              <span className="hero-title__secondary inline-block">Made Visible.</span>
            </h1>

            <p className="hero-copy mt-6 max-md:mt-4">
              A hands-on way to learn ml, experiment with models, mess with
              the parameters, and watch the results change in real time.
            </p>

            <div className="mt-8 max-md:mt-6 flex flex-col gap-3 max-md:gap-2.5 max-md:w-full sm:flex-row">
              <Link
                href="/app"
                className="font-ui inline-flex h-12 max-md:min-h-[48px] max-md:w-full items-center justify-center border border-[#151515] bg-[#151515] px-[22px] text-[0.95rem] font-medium text-white transition-all duration-150 hover:bg-[#2a2a2a] active:scale-[0.99]"
                style={{ borderRadius: 4 }}
              >
                Launch Visualizer
              </Link>
              <Link
                href="/algorithms"
                className="font-ui inline-flex h-12 max-md:min-h-[48px] max-md:w-full items-center justify-center border border-border bg-white px-[22px] text-[0.95rem] font-medium text-foreground transition-all duration-150 hover:border-[#1b1b1b] active:scale-[0.99]"
                style={{ borderRadius: 4 }}
              >
                Browse algorithms
              </Link>
            </div>
          </div>

          {/* Right: single hero visualization, no card chrome */}
          <figure className="relative m-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/hero-visual.svg"
              alt="Decision-boundary diagram separating two classes of data points with a single model boundary"
              className="h-auto w-full max-md:mt-2 max-md:max-h-[300px] max-md:object-contain"
              loading="eager"
              decoding="async"
            />
            <figcaption className="sr-only">
              Schematic decision-boundary illustration. No measured accuracy is shown.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
