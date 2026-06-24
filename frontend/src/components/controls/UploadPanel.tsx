"use client";

import React, { useState, useCallback, useRef } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UploadInfo {
  sessionId: string;
  columns: string[];
  nRows: number;
  nNumericColumns: number;
  sample: string[][];
}

interface UploadPanelProps {
  onDatasetReady: (datasetId: string, name: string) => void;
}

export function UploadPanel({ onDatasetReady }: UploadPanelProps) {
  const [uploadInfo, setUploadInfo] = useState<UploadInfo | null>(null);
  const [xColumns, setXColumns] = useState<string[]>([]);
  const [yColumn, setYColumn] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await axios.post<UploadInfo>(`${API_URL}/api/datasets/upload`, form);
      setUploadInfo(data);
      const numericCols = data.columns.filter((_, i) => {
        const sampleVals = data.sample.map(r => r[i]).filter(Boolean);
        return sampleVals.some(v => !isNaN(Number(v)));
      });
      if (numericCols.length >= 2) {
        setXColumns(numericCols.slice(0, -1));
        setYColumn(numericCols[numericCols.length - 1]);
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.detail || err.message : "Upload failed";
      setError(String(msg));
    }
    setUploading(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleMapColumns = async () => {
    if (!uploadInfo || xColumns.length === 0 || !yColumn) return;
    setMapping(true);
    setError(null);
    try {
      const { data } = await axios.post<{ dataset_id: string }>(`${API_URL}/api/datasets/map-columns`, {
        session_id: uploadInfo.sessionId,
        x_columns: xColumns,
        y_column: yColumn,
        dataset_name: "uploaded",
      });
      onDatasetReady(data.dataset_id, "uploaded");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.detail || err.message : "Mapping failed";
      setError(String(msg));
    }
    setMapping(false);
  };

  const toggleXColumn = (col: string) => {
    setXColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  };

  if (!uploadInfo) {
    return (
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleFileChange} />
        <div className="text-sm text-muted-foreground mb-1">
          {uploading ? "Uploading..." : "Drop a CSV file here or click to browse"}
        </div>
        <div className="text-xs text-muted-foreground">Max 10MB, 10,000 rows</div>
        {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
      </div>
    );
  }

  const numericCols = uploadInfo.columns.filter((_, i) => {
    const sampleVals = uploadInfo.sample.map(r => r[i]).filter(Boolean);
    return sampleVals.some(v => !isNaN(Number(v)));
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-foreground">
          {uploadInfo.nRows} rows, {uploadInfo.columns.length} columns
        </div>
        <button
          onClick={() => { setUploadInfo(null); setError(null); }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      </div>

      <div className="overflow-auto max-h-32 border border-border rounded-lg">
        <table className="w-full text-[10px] font-mono">
          <thead>
            <tr className="bg-muted/50">
              {uploadInfo.columns.map((col) => (
                <th key={col} className="px-2 py-1 text-left text-muted-foreground whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uploadInfo.sample.map((row, i) => (
              <tr key={i} className="border-t border-border">
                {row.map((cell, j) => (
                  <td key={j} className="px-2 py-0.5 text-foreground whitespace-nowrap">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {numericCols.length >= 2 && (
        <>
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Features (X)</label>
            <div className="flex flex-wrap gap-1">
              {numericCols.map((col) => (
                <button
                  key={col}
                  onClick={() => toggleXColumn(col)}
                  className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${
                    xColumns.includes(col)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-foreground hover:bg-accent"
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Target (y)</label>
            <select
              value={yColumn}
              onChange={(e) => setYColumn(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
            >
              {numericCols.filter(c => !xColumns.includes(c)).map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleMapColumns}
            disabled={mapping || xColumns.length === 0 || !yColumn}
            className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {mapping ? "Processing..." : "Use This Dataset"}
          </button>
        </>
      )}
      {numericCols.length < 2 && (
        <div className="text-xs text-muted-foreground">Not enough numeric columns detected (need at least 2)</div>
      )}
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );
}
