import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Confluence - Interactive ML Visualization",
    short_name: "Confluence",
    description:
      "Interactive ML visualization platform with real scikit-learn computation. Explore 38 algorithms across classification, regression, clustering, and dimensionality reduction.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#F5F7FC",
    theme_color: "#255EBA",
    icons: [
      {
        src: "/android-chrome-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/android-chrome-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
      {
        src: "/android-chrome-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
