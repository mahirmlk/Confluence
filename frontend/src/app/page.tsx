import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { Features } from "@/components/landing/Features";
import { Algorithms } from "@/components/landing/Algorithms";
import { Datasets } from "@/components/landing/Datasets";
import { Resources } from "@/components/landing/Resources";
import { Architecture } from "@/components/landing/Architecture";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main id="main">
        <Hero />
        <ProductPreview />
        <Features />
        <Algorithms />
        <Datasets />
        <Resources />
        <Architecture />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
