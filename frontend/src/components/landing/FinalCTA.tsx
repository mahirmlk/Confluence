import React from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";

const ASSURANCES = ["Real computation", "Open source", "First principles"];

export function FinalCTA() {
  return (
    <section aria-labelledby="final-cta-heading" className="bg-[#0b0b0c]">
      <div className="page-shell border-x max-md:border-x-0 border-white/15">
        <div className="px-6 max-md:px-2 py-16 max-md:py-12 md:px-12 md:py-24">
          <Reveal delay={100}>
            <h2
              id="final-cta-heading"
              className="font-display mt-8 max-md:mt-6 max-w-5xl text-[clamp(3rem,7vw,7rem)] max-md:text-[2.55rem] font-extrabold tracking-[-0.04em] max-md:tracking-[-0.03em] text-white"
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
            <div className="mt-10 flex flex-col gap-4 max-md:gap-3 sm:flex-row">
              <Link
                href="/app"
                className="font-mono inline-flex h-[54px] max-md:h-[52px] max-md:w-full items-center justify-center bg-white px-9 text-[13px] font-semibold tracking-[0.22em] text-[#0b0b0c] uppercase transition-all duration-150 hover:bg-[#e4e4e4] active:scale-[0.99]"
              >
                Launch visualizer
              </Link>
              <Link
                href="/algorithms"
                className="font-mono inline-flex h-[54px] max-md:h-[52px] max-md:w-full items-center justify-center border border-white/30 px-9 text-[13px] font-semibold tracking-[0.22em] text-white uppercase transition-all duration-150 hover:border-white hover:bg-white hover:text-[#0b0b0c] active:scale-[0.99]"
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
