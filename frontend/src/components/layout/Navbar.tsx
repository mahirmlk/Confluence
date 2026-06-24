"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-instrument-serif ${
        isScrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-xl font-bold text-foreground tracking-wider font-montserrat uppercase">Confluence</span>
        </Link>

        <div className="flex items-center gap-8 text-lg">
          <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/algorithms" className="text-muted-foreground hover:text-foreground transition-colors">
            Algorithms
          </Link>
          <Link href="/#architecture" className="text-muted-foreground hover:text-foreground transition-colors">
            Architecture
          </Link>
          <Link
            href="/app"
            className="px-5 py-2 rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            Launch Tool
          </Link>
        </div>
      </div>
    </nav>
  );
}
