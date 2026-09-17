import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo/config";

export const metadata: Metadata = constructMetadata({
  title: "Interactive ML Visualizer",
  description:
    "Run real scikit-learn models in the browser: decision boundaries, training curves, metrics, and explanations.",
  path: "/app",
  noIndex: true,
});

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
