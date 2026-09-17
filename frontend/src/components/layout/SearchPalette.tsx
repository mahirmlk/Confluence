"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ALGORITHMS, type AlgorithmFamily } from "@/lib/store";

const FAMILY_LABEL: Record<AlgorithmFamily, string> = {
  classification: "Classification",
  regression: "Regression",
  clustering: "Clustering",
  "dim-reduction": "Dim. Reduction",
};

const PAGES = [
  { label: "Launch visualizer", href: "/app", hint: "Tool" },
  { label: "Algorithm encyclopedia", href: "/algorithms", hint: "Page" },
  { label: "Learning resources", href: "/resources", hint: "Page" },
];

const MAX_RESULTS = 7;

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = "hidden";
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
  }, [open ]);

  const q = query.trim().toLowerCase();
  const algos = useMemo(() => {
    if (!q) return ALGORITHMS.slice(0, MAX_RESULTS);
    return ALGORITHMS.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.taxonomyTag.toLowerCase().includes(q) ||
        a.family.toLowerCase().includes(q)
    ).slice(0, MAX_RESULTS);
  }, [q]);

  const pages = useMemo(() => {
    if (!q) return PAGES;
    return PAGES.filter((p) => p.label.toLowerCase().includes(q));
  }, [q]);

  const totalRows = algos.length + pages.length;

  useEffect(() => {
    setActive(0);
  }, [q]);

  const goAlgo = (name: string) => {
    onClose();
    router.push(`/algorithms#algo-${name}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (totalRows === 0 ? 0 : (i + 1) % totalRows));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (totalRows === 0 ? 0 : (i - 1 + totalRows) % totalRows));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active < algos.length) {
        const a = algos[active];
        if (a) goAlgo(a.name);
      } else {
        const p = pages[active - algos.length];
        if (p) {
          onClose();
          router.push(p.href);
        }
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/25 px-4 pt-[14vh] backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Confluence"
        className="w-full max-w-xl overflow-hidden border border-black/10 bg-white/90 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl"
        style={{ borderRadius: 14 }}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-black/[0.08] px-5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-muted-foreground"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search algorithms, pages…"
            aria-label="Search algorithms and pages"
            className="font-ui h-14 w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="font-mono hidden shrink-0 border border-black/10 bg-black/[0.03] px-1.5 py-0.5 text-[10px] tracking-wider text-muted-foreground sm:block" style={{ borderRadius: 4 }}>
            ESC
          </kbd>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2">
          {totalRows === 0 && (
            <p className="font-ui px-4 py-8 text-center text-sm text-muted-foreground">
              No matches. Try a name, family, or tag.
            </p>
          )}
          {algos.length > 0 && (
            <>
              <p className="mono-label px-3 pt-2 pb-1">Algorithms</p>
              <ul>
                {algos.map((a, i) => (
                  <li key={a.name}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => goAlgo(a.name)}
                      className={`font-ui flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 ${
                        active === i ? "bg-black/[0.05]" : "bg-transparent"
                      }`}
                      style={{ borderRadius: 8 }}
                    >
                      <span className="min-w-0 flex-1 truncate text-[0.95rem] font-medium tracking-[-0.01em] text-foreground">
                        {a.label}
                      </span>
                      <span className="font-mono shrink-0 text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
                        {FAMILY_LABEL[a.family]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {pages.length > 0 && (
            <>
              <p className="mono-label px-3 pt-3 pb-1">Pages</p>
              <ul>
                {pages.map((p, j) => {
                  const idx = algos.length + j;
                  return (
                    <li key={p.href + p.label}>
                      <Link
                        href={p.href}
                        onClick={onClose}
                        onMouseEnter={() => setActive(idx)}
                        className={`font-ui flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 ${
                          active === idx ? "bg-black/[0.05]" : "bg-transparent"
                        }`}
                        style={{ borderRadius: 8 }}
                      >
                        <span className="min-w-0 flex-1 truncate text-[0.95rem] font-medium tracking-[-0.01em] text-foreground">
                          {p.label}
                        </span>
                        <span className="font-mono shrink-0 text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
                          {p.hint}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <div className="font-mono hidden items-center gap-4 border-t border-black/[0.08] px-5 py-2.5 text-[10px] tracking-[0.1em] text-muted-foreground uppercase sm:flex">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
