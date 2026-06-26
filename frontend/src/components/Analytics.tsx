"use client";

import { GoogleAnalytics } from "@next/third-parties/google";

export function Analytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId || process.env.NODE_ENV !== "production") {
    return null;
  }

  return <GoogleAnalytics gaId={measurementId} />;
}
