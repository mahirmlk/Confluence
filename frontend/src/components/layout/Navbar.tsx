"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SearchPalette } from "@/components/layout/SearchPalette";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#algorithms", label: "Algorithms" },
  { href: "/resources", label: "Resources" },
  { href: "/#architecture", label: "Architecture" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled || mobileOpen
          ? "border-b border-black/[0.08] bg-white/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-background focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 w-full max-w-[1120px] items-center px-6"
      >
        <Link
          href="/"
          className="font-display text-[15px] font-extrabold tracking-[-0.01em] text-foreground"
        >
          CONFLUENCE
        </Link>

        {/* Desktop nav — centered, quiet, Apple-like */}
        <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-ui rounded-full px-3.5 py-1.5 text-sm font-normal tracking-[-0.01em] text-foreground/70 transition-colors duration-200 hover:bg-black/[0.05] hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden items-center gap-2.5 md:flex">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search (Control K)"
            className="font-ui group inline-flex h-9 items-center gap-2 border border-black/10 bg-black/[0.03] pr-1.5 pl-3 text-sm text-muted-foreground transition-colors duration-200 hover:border-black/20 hover:text-foreground"
            style={{ borderRadius: 999 }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Search
            <kbd className="font-mono border border-black/10 bg-white px-1.5 py-px text-[10px] tracking-wider text-muted-foreground" style={{ borderRadius: 999 }}>
              ⌘K
            </kbd>
          </button>
          <Link
            href="/app"
            className="font-ui inline-flex h-9 items-center bg-[#151515] px-4 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.03] hover:bg-[#2a2a2a] active:scale-[0.98]"
            style={{ borderRadius: 999 }}
          >
            Launch Tool
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="ml-auto flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`block h-px w-5 bg-foreground transition-transform duration-200 ${
              mobileOpen ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-5 bg-foreground transition-transform duration-200 ${
              mobileOpen ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-black/[0.08] bg-white/80 backdrop-blur-xl md:hidden">
          <nav
            aria-label="Mobile"
            className="flex flex-col gap-1 px-5 max-md:px-4 py-6 max-md:py-4 max-h-[calc(100dvh-3.5rem)] overflow-y-auto mobile-safe-bottom"
          >
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="font-ui mb-3 inline-flex min-h-[44px] items-center gap-3 border border-black/10 bg-black/[0.03] px-4 text-[15px] text-muted-foreground"
              style={{ borderRadius: 10 }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Search algorithms…
            </button>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-ui border-b border-black/[0.08] py-3 text-[15px] text-foreground/80 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/app"
              onClick={() => setMobileOpen(false)}
              className="font-ui mt-5 inline-flex min-h-[44px] items-center justify-center bg-[#151515] text-[15px] font-medium text-white transition-colors hover:bg-[#2a2a2a]"
              style={{ borderRadius: 999 }}
            >
              Launch Tool
            </Link>
          </nav>
        </div>
      )}
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
