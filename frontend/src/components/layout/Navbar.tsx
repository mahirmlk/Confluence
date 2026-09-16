"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#algorithms", label: "Algorithms" },
  { href: "/#resources", label: "Resources" },
  { href: "/#architecture", label: "Architecture" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background transition-colors duration-200 ${
        isScrolled ? "border-b border-border" : "border-b border-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-background focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between px-7"
      >
        <Link
          href="/"
          className="font-display text-[15px] font-extrabold tracking-[-0.01em] text-foreground"
        >
          CONFLUENCE
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link font-ui text-[0.9rem] font-[450] tracking-[-0.015em] text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/app"
            className="font-ui inline-flex min-h-[42px] items-center border border-[#1b1b1b] bg-transparent px-[18px] text-[0.9rem] font-medium tracking-[-0.015em] text-foreground transition-colors duration-160 hover:bg-[#111111] hover:text-white"
            style={{ borderRadius: 3 }}
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
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
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
        <div className="border-t border-border bg-background md:hidden">
          <nav
            aria-label="Mobile"
            className="flex flex-col gap-1 px-7 py-6"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-ui border-b border-border py-3 text-base text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/app"
              onClick={() => setMobileOpen(false)}
              className="font-ui mt-4 inline-flex min-h-[48px] items-center justify-center border border-[#1b1b1b] text-base font-medium text-foreground transition-colors hover:bg-[#111111] hover:text-white"
              style={{ borderRadius: 3 }}
            >
              Launch Tool
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
