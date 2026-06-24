"use client";

import React, { useCallback, useRef, useEffect } from "react";

interface Transform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

interface InteractiveCanvasProps {
  width: number;
  height: number;
  transform: Transform;
  onTransformChange: (t: Transform) => void;
  children: (transform: Transform) => React.ReactNode;
}

export function InteractiveCanvas({
  width,
  height,
  transform,
  onTransformChange,
  children,
}: InteractiveCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(5, transform.scale * delta));
    onTransformChange({ ...transform, scale: newScale });
  }, [transform, onTransformChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      isDragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    onTransformChange({
      ...transform,
      offsetX: transform.offsetX + dx,
      offsetY: transform.offsetY + dy,
    });
  }, [transform, onTransformChange]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden relative"
      style={{ width, height }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <div
        style={{
          transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
        }}
      >
        {children(transform)}
      </div>
    </div>
  );
}

export type { Transform };
