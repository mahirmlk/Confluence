import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://confluence.website";

// Last genuine content updates. Keep static so builds don't fake freshness.
const UPDATED = new Date("2026-09-17");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: UPDATED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/algorithms`,
      lastModified: UPDATED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/resources`,
      lastModified: UPDATED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/app`,
      lastModified: UPDATED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
