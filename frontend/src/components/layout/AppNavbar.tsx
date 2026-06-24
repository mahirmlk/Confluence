"use client";

import React from "react";
import Link from "next/link";

export function AppNavbar() {
  return (
    <nav className="h-12 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-4 flex-shrink-0 font-instrument-serif text-lg">
      <Link href="/" className="flex items-center gap-2 mr-6">
        <span className="text-sm font-bold text-foreground tracking-wider font-montserrat uppercase">Confluence</span>
      </Link>
      <div className="flex-1" />
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        Back to Home
      </Link>
    </nav>
  );
}
