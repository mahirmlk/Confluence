"use client";

import React from "react";
import Link from "next/link";

const FOOTER_LINKS = {
  Product: [
    { label: "Launch Visualizer", href: "/app" },
    { label: "Features", href: "/#features" },
    { label: "Algorithms", href: "/algorithms" },
    { label: "Architecture", href: "/#architecture" },
  ],
  "Algorithm Families": [
    { label: "Classification", href: "/app" },
    { label: "Regression", href: "/app" },
    { label: "Clustering", href: "/app" },
    { label: "Dimensionality Reduction", href: "/app" },
  ],
  Resources: [
    { label: "Documentation", href: "/algorithms" },
    { label: "GitHub Repository", href: "https://github.com/mahirmlk" },
    { label: "API Reference", href: "/app" },
  ],
  Connect: [
    { label: "GitHub", href: "https://github.com/mahirmlk" },
    { label: "X / Twitter", href: "https://x.com/mahirmllk" },
    { label: "Portfolio", href: "https://www.mahirmalik.in/" },
  ],
};

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/mahirmlk",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://x.com/mahirmllk",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Portfolio",
    href: "https://www.mahirmalik.in/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #F5F7FC 0%, #EBF0FA 100%)",
        borderTop: "1px solid #C8D3E8",
      }}
    >
      {/* Top band — CTA strip */}
      <div
        style={{
          background: "linear-gradient(90deg, #255EBA 0%, #4C73B9 100%)",
        }}
        className="py-10 px-6"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/60 mb-1">
              Interactive ML Platform
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-white font-montserrat">
              Understand machine learning visually.
            </h2>
          </div>
          <Link
            href="/app"
            className="shrink-0 px-7 py-3 border border-white/80 text-white text-sm font-semibold hover:bg-white hover:text-[#255EBA] transition-all font-inter"
          >
            Launch Visualizer →
          </Link>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="md:col-span-1">
            <p className="text-sm text-[#4C73B9] leading-relaxed mb-6">
              An interactive visualization platform powered by real scikit-learn
              computation. Explore decision boundaries, compare algorithms, and
              watch models train step-by-step.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 flex items-center justify-center border border-[#C8D3E8] text-[#4C73B9] hover:border-[#255EBA] hover:text-[#255EBA] transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-[10px] font-bold text-[#255EBA] uppercase tracking-[0.2em] font-mono mb-5">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#4C73B9] hover:text-[#255EBA] transition-colors font-inter"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          className="mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid #C8D3E8" }}
        >
          <p className="text-xs text-[#4C73B9] font-mono">
            © {year} Confluence. Built by{" "}
            <a
              href="https://www.mahirmalik.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#255EBA] underline underline-offset-2 transition-colors"
            >
              Mahir Malik
            </a>.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-[#4C73B9] font-mono flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"
                style={{ boxShadow: "0 0 6px #22c55e" }}
              />
              All systems operational
            </span>
            <Link href="/#architecture" className="text-xs text-[#4C73B9] hover:text-[#255EBA] transition-colors font-mono">
              MIT License
            </Link>
            <Link href="/#architecture" className="text-xs text-[#4C73B9] hover:text-[#255EBA] transition-colors font-mono">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
