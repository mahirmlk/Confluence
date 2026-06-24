"use client";

import React, { useEffect } from "react";
import { useAppStore, ALGORITHMS } from "@/lib/store";

export function useUrlState() {
  const { setFamily, setAlgorithm, setHyperparameters, setDatasetName, setResolution, setNoise, setNSamples } = useAppStore();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const algo = params.get("algo");
    const dataset = params.get("dataset");
    const family = params.get("family");
    const res = params.get("resolution");
    const noiseParam = params.get("noise");
    const nSamplesParam = params.get("nSamples");

    if (algo) {
      const config = ALGORITHMS.find((a) => a.name === algo);
      if (config) {
        setFamily(config.family);
        setAlgorithm(algo);
      }
    }
    if (family) setFamily(family as "classification" | "regression" | "clustering" | "dim-reduction");
    if (dataset) setDatasetName(dataset);
    if (res) setResolution(parseInt(res));
    if (noiseParam) setNoise(parseFloat(noiseParam));
    if (nSamplesParam) setNSamples(parseInt(nSamplesParam));

    const hyperParams: Record<string, number> = {};
    params.forEach((value, key) => {
      if (["algo", "dataset", "family", "resolution", "noise", "nSamples"].includes(key)) return;
      const num = parseFloat(value);
      if (!isNaN(num)) hyperParams[key] = num;
    });
    if (Object.keys(hyperParams).length > 0) setHyperparameters(hyperParams);
  }, [setFamily, setAlgorithm, setHyperparameters, setDatasetName, setResolution, setNoise, setNSamples]);
}

export function ShareButton() {
  const { algorithm, hyperparameters, datasetName, resolution, noise, nSamples } = useAppStore();

  const share = () => {
    const params = new URLSearchParams();
    params.set("algo", algorithm);
    params.set("dataset", datasetName);
    params.set("resolution", String(resolution));
    params.set("noise", String(noise));
    params.set("nSamples", String(nSamples));
    Object.entries(hyperparameters).forEach(([k, v]) => params.set(k, String(v)));

    const url = `${window.location.origin}/app?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("URL copied to clipboard!");
    });
  };

  return (
    <button onClick={share} className="px-3 py-1.5 rounded-md text-xs font-medium border border-border text-foreground hover:bg-accent transition-colors">
      Share URL
    </button>
  );
}

interface ExportButtonProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  metrics?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export function ExportButton({ canvasRef, metrics, config }: ExportButtonProps) {
  const exportPNG = () => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "confluence-export.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const exportSVG = () => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
  <image href="${dataUrl}" width="${canvas.width}" height="${canvas.height}"/>
</svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = "confluence-export.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      metrics: metrics ?? null,
      config: config ?? null,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = "confluence-export.json";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="flex gap-1">
      <button onClick={exportPNG} className="px-2 py-1.5 rounded-md text-[10px] font-medium border border-border text-foreground hover:bg-accent transition-colors" title="Export as PNG">
        PNG
      </button>
      <button onClick={exportSVG} className="px-2 py-1.5 rounded-md text-[10px] font-medium border border-border text-foreground hover:bg-accent transition-colors" title="Export as SVG">
        SVG
      </button>
      {(metrics || config) && (
        <button onClick={exportJSON} className="px-2 py-1.5 rounded-md text-[10px] font-medium border border-border text-foreground hover:bg-accent transition-colors" title="Export metrics as JSON">
          JSON
        </button>
      )}
    </div>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("confluence-theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("confluence-theme", next ? "dark" : "light");
  };

  return (
    <button onClick={toggle} className="px-3 py-1.5 rounded-md text-xs font-medium border border-border text-foreground hover:bg-accent transition-colors">
      {dark ? "Light" : "Dark"}
    </button>
  );
}
