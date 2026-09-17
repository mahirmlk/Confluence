"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/config";

const FOOTER_COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Algorithms", href: "/#algorithms" },
      { label: "Datasets", href: "/#datasets" },
      { label: "Architecture", href: "/#architecture" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { label: "Resources", href: "/#resources" },
      { label: "Algorithm encyclopedia", href: "/algorithms" },
      { label: "Learning roadmap", href: "/resources" },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "Launch visualizer", href: "/app" },
      { label: "GitHub", href: "https://github.com/mahirmlk" },
      { label: "API reference", href: "/app" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/mahirmlk",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://x.com/mahirmllk",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Portfolio",
    href: "https://www.mahirmalik.in/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  const [systemOk, setSystemOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/health`, { cache: "no-store" })
      .then((res) => {
        if (!cancelled) setSystemOk(res.ok);
      })
      .catch(() => {
        if (!cancelled) setSystemOk(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border bg-background">
      <div className="page-shell pt-16 max-md:pt-12 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          {/* Brand + status */}
          <div>
            <p className="font-display text-[15px] font-extrabold tracking-[-0.01em] text-foreground">
              CONFLUENCE
            </p>
            <p className="font-ui mt-4 max-w-xs text-[0.9rem] leading-relaxed text-muted-foreground">
              An interactive visualization platform powered by real
              scikit-learn computation. Explore decision boundaries, compare
              algorithms, and watch models train step by step.
            </p>
            <p className="font-mono mt-6 inline-flex items-center gap-2.5 border border-border bg-surface px-3.5 py-2 text-[11px] tracking-[0.12em] text-muted-foreground uppercase" style={{ borderRadius: 999 }}>
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#16a34a]" />
              All systems operational
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors duration-150 hover:border-[#1b1b1b] hover:text-foreground"
                  style={{ borderRadius: 4 }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 max-sm:grid-cols-1 max-sm:gap-6 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading}>
                <h2 className="mono-label">{col.heading}</h2>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-ui text-[0.9rem] text-muted-foreground transition-colors duration-150 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Giant wordmark */}
        <div aria-hidden="true" className="mt-16 overflow-hidden select-none md:mt-20">
          <p
            className="font-display bg-gradient-to-b from-[#6e6e73] via-[#2e2e33] to-[#0a0a0b] bg-clip-text text-center text-[13.5vw] leading-[0.85] font-extrabold tracking-[-0.05em] text-transparent lg:text-[10rem]"
          >
            CONFLUENCE
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-border py-7 md:flex-row md:items-center md:justify-between">
          <p className="font-ui text-[0.85rem] text-muted-foreground">
            Built for learning how ML actually works.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="font-mono text-xs text-muted-foreground">
              © {year} Confluence ·{" "}
              <a
                href="https://www.mahirmalik.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Mahir Malik
              </a>{" "}
              · MIT License
            </p>
            <button
              type="button"
              onClick={scrollToTop}
              className="font-mono group inline-flex items-center gap-2 text-xs tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Back to top
              <span aria-hidden="true" className="inline-block transition-transform duration-150 group-hover:-translate-y-0.5">
                ↑
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
