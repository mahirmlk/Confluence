import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://confluence.website";

// AI search crawlers are explicitly welcome: being fetchable is a
// prerequisite for being cited in AI answers. Search/retrieval bots are
// allowed; training-only bots are left to the default wildcard rule.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/.well-known/security.txt"],
        disallow: ["/api/", "/_next/"],
      },
      ...AI_CRAWLERS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: ["/api/", "/_next/"],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
