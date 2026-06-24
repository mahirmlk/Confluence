"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface Point3D {
  position: [number, number, number];
  color: string;
}

interface Scene3DProps {
  grid: number[][];
  points?: { X: number[][]; y: number[] };
  width?: number;
  height?: number;
}

const CLASS_COLORS_3D = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

function HeatmapSurface({ grid }: { grid: number[][] }) {
  const geometry = useMemo(() => {
    const rows = grid.length;
    const cols = grid[0].length;
    const geo = new THREE.PlaneGeometry(10, 10, cols - 1, rows - 1);
    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const col = Math.floor(((x + 5) / 10) * (cols - 1));
      const row = Math.floor(((5 - y) / 10) * (rows - 1));
      const c = Math.max(0, Math.min(cols - 1, col));
      const r = Math.max(0, Math.min(rows - 1, row));
      const value = grid[r]?.[c] ?? 0;

      positions.setZ(i, value * 5);

      const t = Math.max(0, Math.min(1, value));
      colors[i * 3] = 0.23 + 0.77 * (1 - t);
      colors[i * 3 + 1] = 0.51 + 0.49 * (1 - t);
      colors[i * 3 + 2] = 0.96 - 0.59 * (1 - t);
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [grid]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  );
}

function DataPoints({ points }: { points: { X: number[][]; y: number[] } }) {
  const pointData = useMemo((): Point3D[] => {
    return points.X.map((p, i) => ({
      position: [
        (p[0] / 5) * 5,
        1,
        (p[1] / 5) * 5,
      ],
      color: CLASS_COLORS_3D[points.y[i] % CLASS_COLORS_3D.length],
    }));
  }, [points]);

  return (
    <group>
      {pointData.map((pt, i) => (
        <mesh key={i} position={pt.position}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={pt.color} />
        </mesh>
      ))}
    </group>
  );
}

export function Scene3D({ grid, points }: Scene3DProps) {
  return (
    <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <HeatmapSurface grid={grid} />
      {points && <DataPoints points={points} />}
      <OrbitControls />
      <gridHelper args={[10, 10, "#444", "#222"]} position={[0, -2, 0]} />
    </Canvas>
  );
}
