"use client";

import React, { useRef, useEffect } from "react";

interface TreeNode {
  id: number;
  type: "split" | "leaf";
  feature?: string;
  threshold?: number;
  gini?: number;
  samples?: number;
  prediction?: number;
  confidence?: number;
  class_counts?: number[];
  left?: TreeNode;
  right?: TreeNode;
}

interface TreeVisualizationProps {
  tree: Record<string, unknown>;
}

function toTreeNode(t: Record<string, unknown>): TreeNode {
  return {
    id: Number(t.id),
    type: t.type as "split" | "leaf",
    feature: t.feature as string | undefined,
    threshold: t.threshold as number | undefined,
    gini: t.gini as number | undefined,
    samples: t.samples as number | undefined,
    prediction: t.prediction as number | undefined,
    confidence: t.confidence as number | undefined,
    class_counts: t.class_counts as number[] | undefined,
    left: t.left ? toTreeNode(t.left as Record<string, unknown>) : undefined,
    right: t.right ? toTreeNode(t.right as Record<string, unknown>) : undefined,
  };
}

function treeDepth(node: TreeNode): number {
  if (!node.left && !node.right) return 1;
  return 1 + Math.max(
    node.left ? treeDepth(node.left) : 0,
    node.right ? treeDepth(node.right) : 0
  );
}

export function TreeVisualization({ tree }: TreeVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tree || !tree.id) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const root = toTreeNode(tree);
    const depth = treeDepth(root);
    const nodeW = 70;
    const nodeH = 28;
    const vGap = 40;
    const totalH = depth * (nodeH + vGap) + 20;
    const totalW = Math.max(200, Math.pow(2, depth - 1) * (nodeW + 10));

    canvas.width = totalW;
    canvas.height = totalH;

    const c = ctx;
    c.fillStyle = "var(--background, #fff)";
    c.fillRect(0, 0, totalW, totalH);

    function drawNode(node: TreeNode, x: number, y: number, level: number) {
      const halfW = nodeW / 2;

      if (node.left) {
        const childX = x - totalW / Math.pow(2, level + 2);
        const childY = y + nodeH + vGap;
        c.strokeStyle = "#94a3b8";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(x, y + nodeH);
        c.lineTo(childX + halfW, childY);
        c.stroke();
        c.fillStyle = "#64748b";
        c.font = "9px sans-serif";
        c.textAlign = "center";
        c.fillText("≤", (x + childX + halfW) / 2 - 5, (y + nodeH + childY) / 2);
        drawNode(node.left, childX, childY, level + 1);
      }
      if (node.right) {
        const childX = x + totalW / Math.pow(2, level + 2);
        const childY = y + nodeH + vGap;
        c.strokeStyle = "#94a3b8";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(x, y + nodeH);
        c.lineTo(childX + halfW, childY);
        c.stroke();
        c.fillStyle = "#64748b";
        c.font = "9px sans-serif";
        c.textAlign = "center";
        c.fillText(">", (x + childX + halfW) / 2 + 5, (y + nodeH + childY) / 2);
        drawNode(node.right, childX, childY, level + 1);
      }

      const radius = 4;
      c.beginPath();
      c.roundRect(x, y, nodeW, nodeH, radius);

      if (node.type === "leaf") {
        c.fillStyle = "#dbeafe";
        c.strokeStyle = "#3b82f6";
      } else {
        c.fillStyle = "#f1f5f9";
        c.strokeStyle = "#94a3b8";
      }
      c.fill();
      c.lineWidth = 1;
      c.stroke();

      c.fillStyle = "#0f172a";
      c.font = "bold 9px monospace";
      c.textAlign = "center";
      if (node.type === "leaf") {
        c.fillText(`C${node.prediction}`, x + halfW, y + 11);
        c.font = "8px sans-serif";
        c.fillStyle = "#64748b";
        c.fillText(`${node.samples}`, x + halfW, y + 22);
      } else {
        c.fillText(`${node.feature}`, x + halfW, y + 11);
        c.font = "8px sans-serif";
        c.fillStyle = "#64748b";
        c.fillText(`≤${node.threshold?.toFixed(1)}`, x + halfW, y + 22);
      }
    }

    drawNode(root, (totalW - nodeW) / 2, 10, 0);
  }, [tree]);

  if (!tree || !tree.id) {
    return <div className="text-xs text-muted-foreground">No tree data</div>;
  }

  return (
    <div className="overflow-auto">
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}
