import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo/config";

export const metadata: Metadata = constructMetadata({
  title: "Machine Learning Algorithms, Visualized",
  description:
    "Explore 38 ML algorithms — classification, regression, clustering, dimensionality reduction — with interactive visualizations and real scikit-learn computation.",
  path: "/algorithms",
  image: "/algorithms/opengraph-image",
});

export default function AlgorithmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
