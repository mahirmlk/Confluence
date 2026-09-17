import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo/config";

export const metadata: Metadata = constructMetadata({
  title: "Machine Learning Roadmap & Resources",
  description:
    "Seven layers from linear algebra to deployment: curated readings, videos, and courses, each paired with the exact visualizer tool to practice on.",
  path: "/resources",
  image: "/resources/opengraph-image",
});

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
