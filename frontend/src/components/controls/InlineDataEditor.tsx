"use client";

import React, { useState, useCallback } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface InlineDataEditorProps {
  onDatasetReady: (datasetId: string, name: string) => void;
}

export function InlineDataEditor({ onDatasetReady }: InlineDataEditorProps) {
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);

  const parseCSV = useCallback((text: string) => {
    const lines = text.trim().split("\n").map(l => l.split(/[,\t]/).map(c => c.trim()));
    if (lines.length < 2) { setPreview(null); return; }
    const headers = lines[0];
    const rows = lines.slice(1, 6);
    setPreview({ headers, rows });
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCsvText(val);
    setError(null);
    if (val.trim()) parseCSV(val);
    else setPreview(null);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    setTimeout(() => parseCSV((e.target as HTMLTextAreaElement).value), 0);
  };

  const handleSubmit = async () => {
    const lines = csvText.trim().split("\n").map(l => l.split(/[,\t]/).map(c => c.trim()));
    if (lines.length < 2) { setError("Need at least a header row and one data row"); return; }

    const headers = lines[0];
    if (headers.length < 2) { setError("Need at least 2 columns"); return; }

    const numericCols: number[] = [];
    for (let j = 0; j < headers.length; j++) {
      const isNumeric = lines.slice(1, 6).every(row => !row[j] || !isNaN(Number(row[j])));
      if (isNumeric) numericCols.push(j);
    }

    if (numericCols.length < 2) { setError("Need at least 2 numeric columns"); return; }

    const xIndices = numericCols.slice(0, -1);
    const yIndex = numericCols[numericCols.length - 1];

    const points: number[][] = [];
    const labels: number[] = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      try {
        const x = xIndices.map(j => parseFloat(row[j]));
        const y = parseInt(row[yIndex]);
        if (x.every(v => !isNaN(v)) && !isNaN(y)) {
          points.push(x);
          labels.push(y);
        }
      } catch { continue; }
    }

    if (points.length < 2) { setError("Not enough valid numeric rows"); return; }

    setLoading(true);
    try {
      const { data } = await axios.post<{ dataset_id: string }>(`${API_URL}/api/datasets/custom`, {
        points,
        labels,
        dataset_name: "inline",
      });
      onDatasetReady(data.dataset_id, "inline");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.detail || err.message : "Failed to load data";
      setError(String(msg));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <textarea
        value={csvText}
        onChange={handleTextChange}
        onPaste={handlePaste}
        placeholder={"x1,x2,y\n1.5,2.3,0\n-0.5,1.2,1\n3.1,-0.8,0"}
        className="w-full h-32 rounded-md border border-border bg-background px-3 py-2 text-xs font-mono text-foreground resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {preview && (
        <div className="overflow-auto max-h-24 border border-border rounded-lg">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="bg-muted/50">
                {preview.headers.map((h, i) => (
                  <th key={i} className="px-2 py-1 text-left text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {row.map((cell, j) => (
                    <td key={j} className="px-2 py-0.5 text-foreground whitespace-nowrap">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !csvText.trim()}
        className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "Processing..." : "Load as Dataset"}
      </button>

      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );
}
