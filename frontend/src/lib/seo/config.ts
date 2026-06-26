import type { Metadata, Viewport } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://confluence.website";
const SITE_NAME = "Confluence";
const SITE_DESCRIPTION =
  "Interactive ML visualization platform with real scikit-learn computation. Explore 38 algorithms across classification, regression, clustering, and dimensionality reduction.";

export const siteConfig = {
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  creator: "Mahir Malik",
  publisher: "Mahir Malik",
  authors: [{ name: "Mahir Malik", url: "https://www.mahirmalik.in/" }],
  keywords: [
    "machine learning",
    "visualization",
    "scikit-learn",
    "interactive",
    "decision boundary",
    "classification",
    "regression",
    "clustering",
    "dimensionality reduction",
    "algorithm comparison",
    "ML education",
    "data science",
    "neural network",
    "random forest",
    "SVM",
    "PCA",
    "t-SNE",
    "UMAP",
  ],
  links: {
    github: "https://github.com/mahirmlk",
    twitter: "https://x.com/mahirmllk",
    portfolio: "https://www.mahirmalik.in/",
  },
} as const;

export function constructMetadata({
  title,
  description,
  image,
  path = "",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const pageTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.name;
  const pageDescription = description || siteConfig.description;
  const canonicalUrl = `${siteConfig.url}${path}`;
  const ogImage = image || `${siteConfig.url}/og.png`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [...siteConfig.keywords] as string[],
    authors: [...siteConfig.authors],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: [
        { url: "/confluence-logo.png", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: [
        { url: "/confluence-logo.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          url: "/confluence-logo.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          url: "/confluence-logo.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - ${pageDescription}`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
      creator: "@mahirmlk",
      site: "@mahirmlk",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F7FC" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1B35" },
  ],
  colorScheme: "light dark",
};
