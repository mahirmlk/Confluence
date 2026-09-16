import React from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";

const ASSURANCES = ["Real computation", "Open source", "First principles"];

export function FinalCTA() {
  return (
    <section aria-labelledby="final-cta-heading" className="bg-[#0b0b0c]">
      <div className="page-shell border-x border-white/15">
        <div className="px-6 py-16 md:px-12 md:py-24">
          <Reveal>
            <p className="font-mono inline-flex items-center gap-3 border border-white/25 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-white/70 uppercase">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-white" />
              38 algorithms · 24 datasets — verified live
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h2
              id="final-cta-heading"
              className="font-display mt-8 max-w-5xl text-[clamp(3rem,7vw,7rem)] font-extrabold tracking-[-0.04em] text-white"
              style={{ lineHeight: 0.95 }}
            >
              Understand the model. Don&rsquo;t just run it.
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <p className="font-ui mt-6 max-w-xl text-lg leading-relaxed text-[#b5b5b5]">
              Open the visualizer and see the computation happen step by step.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/app"
                className="font-mono inline-flex h-[54px] items-center justify-center bg-white px-9 text-[13px] font-semibold tracking-[0.22em] text-[#0b0b0c] uppercase transition-colors duration-150 hover:bg-[#e4e4e4]"
              >
                Launch visualizer
              </Link>
              <Link
                href="/algorithms"
                className="font-mono inline-flex h-[54px] items-center justify-center border border-white/30 px-9 text-[13px] font-semibold tracking-[0.22em] text-white uppercase transition-colors duration-150 hover:border-white hover:bg-white hover:text-[#0b0b0c]"
              >
                Browse algorithms
              </Link>
            </div>
          </Reveal>

          <Reveal delay={280}>
            <ul
              aria-label="Assurances"
              className="font-mono mt-14 flex flex-col gap-3 border-t border-white/15 pt-6 text-[11px] tracking-[0.18em] text-white/50 uppercase sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-white/15"
            >
              {ASSURANCES.map((a) => (
                <li key={a} className="flex items-center gap-2.5 sm:px-6 sm:first:pl-0">
                  <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-white/40" />
                  {a}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
