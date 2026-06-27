"use client";

import React, { useState, useEffect, useCallback } from "react";
import { generateCode, type CodeResponse } from "@/lib/api/client";

interface CodeGeneratorProps {
  algorithm: string;
  datasetName: string;
  hyperparameters: Record<string, number>;
}

export function CodeGenerator({ algorithm, datasetName, hyperparameters }: CodeGeneratorProps) {
  const [result, setResult] = useState<CodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchCode = useCallback(async () => {
    setLoading(true);
    try {
      const data = await generateCode({ algorithm, dataset_name: datasetName, hyperparameters });
      setResult(data);
    } catch { /* */ }
    setLoading(false);
  }, [algorithm, datasetName, hyperparameters]);

  useEffect(() => {
    const timer = setTimeout(fetchCode, 500);
    return () => clearTimeout(timer);
  }, [fetchCode]);

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${algorithm.replace(/\s+/g, "_")}_model.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Code Generator</h3>
        <div className="flex gap-1">
          <button onClick={handleCopy}
            className="px-2 py-1 rounded border border-border text-[10px] font-medium hover:bg-accent transition-colors">
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={handleDownload}
            className="px-2 py-1 rounded border border-border text-[10px] font-medium hover:bg-accent transition-colors">
            Download
          </button>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground">
        Python code matching your current configuration: {algorithm} on {datasetName}
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground animate-pulse py-4">Generating code...</div>
      ) : result ? (
        <pre className="bg-muted rounded-lg p-4 text-[11px] font-mono overflow-x-auto leading-relaxed max-h-96 overflow-y-auto">
          <code>{result.code}</code>
        </pre>
      ) : null}
    </div>
  );
}
