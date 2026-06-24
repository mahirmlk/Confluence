"use client";

import React, { useState } from "react";
import Link from "next/link";

const FAMILIES = [
  {
    name: "Classification",
    color: "#255EBA",
    algorithms: ["Logistic Reg.", "SVM", "Random Forest", "XGBoost", "Naive Bayes", "KNN"],
    href: "#classification",
  },
  {
    name: "Regression",
    color: "#4C73B9",
    algorithms: ["Linear Reg.", "Ridge", "Lasso", "Elastic Net", "GBR", "SVR"],
    href: "#regression",
  },
  {
    name: "Clustering",
    color: "#7B9FD4",
    algorithms: ["K-Means", "DBSCAN", "GMM", "Spectral", "Agglomerative"],
    href: "#clustering",
  },
  {
    name: "Dim. Reduction",
    color: "#A8BFE8",
    algorithms: ["PCA", "t-SNE", "UMAP", "Isomap"],
    href: "#dimensionality-reduction",
  },
];

export function AlgorithmKnowledgeGraph() {
  const [hoveredFamily, setHoveredFamily] = useState<number | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-foreground tracking-tight mb-4 uppercase tracking-wide">
          Algorithm Knowledge Graph
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Explore algorithms from first principles, mathematics, intuition, and visualization.
        </p>
      </div>

        {/* Graph */}
        <div className="relative">
          <svg
            viewBox="0 0 900 580"
            className="w-full h-auto"
            onMouseLeave={() => setHoveredFamily(null)}
          >
            <defs>
              {/* Glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid background */}
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(76,115,185,0.06)" strokeWidth="0.5" />
            </pattern>
            <rect width="900" height="580" fill="url(#grid)" />

            {/* Connecting lines from center to families */}
            {FAMILIES.map((family, i) => {
              const familyX = 140 + i * 210;
              const familyY = 160;
              const isHovered = hoveredFamily === i;
              return (
                <line
                  key={`line-${i}`}
                  x1={450}
                  y1={80}
                  x2={familyX}
                  y2={familyY}
                  stroke={isHovered ? family.color : "#C8D3E8"}
                  strokeWidth={isHovered ? 3 : 1}
                  strokeDasharray={isHovered ? "none" : "4 4"}
                  opacity={isHovered ? 1 : 0.5}
                  filter={isHovered ? "url(#glow)" : "none"}
                  style={{
                    transition: "all 0.4s ease",
                  }}
                />
              );
            })}

            {/* Lines from family nodes to algorithm nodes */}
            {FAMILIES.map((family, fi) => {
              const familyX = 140 + fi * 210;
              const familyY = 160;
              const isHovered = hoveredFamily === fi;
              return family.algorithms.map((_, ai) => {
                const algX = familyX + (ai % 2 === 0 ? -40 : 40);
                const algY = 270 + Math.floor(ai / 2) * 65;
                return (
                  <line
                    key={`alg-line-${fi}-${ai}`}
                    x1={familyX}
                    y1={familyY + 20}
                    x2={algX}
                    y2={algY - 16}
                    stroke={isHovered ? family.color : "#E8EDF8"}
                    strokeWidth={isHovered ? 2 : 0.75}
                    opacity={isHovered ? 1 : 0.6}
                    style={{
                      transition: "all 0.4s ease",
                    }}
                  />
                );
              });
            })}

            {/* Center node — Machine Learning */}
            <g className="cursor-pointer">
              {/* Outer ring */}
              <circle
                cx={450}
                cy={80}
                r={45}
                fill="none"
                stroke="#255EBA"
                strokeWidth={1}
                opacity={0.3}
              >
                <animate
                  attributeName="r"
                  values="45;50;45"
                  dur="4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0.15;0.3"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Core circle */}
              <circle
                cx={450}
                cy={80}
                r={38}
                fill="#FFFFFF"
                stroke="#255EBA"
                strokeWidth={2}
                filter="url(#glow)"
              />
              <text
                x={450}
                y={75}
                textAnchor="middle"
                fontSize={11}
                fontFamily="var(--font-montserrat), sans-serif"
                fontWeight={800}
                fill="#0D1B35"
              >
                MACHINE
              </text>
              <text
                x={450}
                y={90}
                textAnchor="middle"
                fontSize={11}
                fontFamily="var(--font-montserrat), sans-serif"
                fontWeight={800}
                fill="#0D1B35"
              >
                LEARNING
              </text>
            </g>

            {/* Family nodes */}
            {FAMILIES.map((family, i) => {
              const x = 140 + i * 210;
              const y = 160;
              const isHovered = hoveredFamily === i;
              return (
                <g
                  key={`family-${i}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredFamily(i)}
                >
                  {/* Glow ring on hover */}
                  {isHovered && (
                    <circle
                      cx={x}
                      cy={y}
                      r={32}
                      fill="none"
                      stroke={family.color}
                      strokeWidth={2}
                      filter="url(#glow-strong)"
                      opacity={0.6}
                    >
                      <animate
                        attributeName="r"
                        values="32;38;32"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.6;0.2;0.6"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  {/* Node background */}
                  <rect
                    x={x - 65}
                    y={y - 18}
                    width={130}
                    height={36}
                    rx={0}
                    fill={isHovered ? family.color : "#FFFFFF"}
                    stroke={family.color}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    style={{
                      transition: "all 0.3s ease",
                      filter: isHovered ? "url(#glow)" : "none",
                    }}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fontFamily="var(--font-montserrat), sans-serif"
                    fontWeight={700}
                    fill={isHovered ? "#FFFFFF" : family.color}
                    style={{ transition: "fill 0.3s ease" }}
                  >
                    {family.name}
                  </text>
                </g>
              );
            })}

            {/* Algorithm nodes */}
            {FAMILIES.map((family, fi) => {
              const familyX = 140 + fi * 210;
              const isHovered = hoveredFamily === fi;
              return family.algorithms.map((algo, ai) => {
                const x = familyX + (ai % 2 === 0 ? -40 : 40);
                const y = 270 + Math.floor(ai / 2) * 65;
                return (
                  <g key={`algo-${fi}-${ai}`}>
                    <rect
                      x={x - 50}
                      y={y - 14}
                      width={100}
                      height={28}
                      rx={0}
                      fill="#FFFFFF"
                      stroke={isHovered ? family.color : "#E8EDF8"}
                      strokeWidth={isHovered ? 1.5 : 1}
                      style={{
                        transition: "all 0.35s ease",
                        transitionDelay: `${ai * 50}ms`,
                      }}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fontSize={9}
                      fontFamily="var(--font-geist-mono), monospace"
                      fontWeight={600}
                      fill={isHovered ? "#0D1B35" : "#7B9FD4"}
                      style={{
                        transition: "fill 0.35s ease",
                        transitionDelay: `${ai * 50}ms`,
                      }}
                    >
                      {algo}
                    </text>
                  </g>
                );
              });
            })}

            {/* Animated particles on hover */}
            {hoveredFamily !== null && (
              <>
                {[0, 1, 2].map((pi) => {
                  const family = FAMILIES[hoveredFamily];
                  const startX = 450;
                  const startY = 80;
                  const endX = 140 + hoveredFamily * 210;
                  const endY = 160;
                  return (
                    <circle
                      key={`particle-${pi}`}
                      r={3}
                      fill={family.color}
                      opacity={0.8}
                      filter="url(#glow)"
                    >
                      <animate
                        attributeName="cx"
                        values={`${startX};${endX}`}
                        dur="1.2s"
                        begin={`${pi * 0.4}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="cy"
                        values={`${startY};${endY}`}
                        dur="1.2s"
                        begin={`${pi * 0.4}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0;0.8;0"
                        dur="1.2s"
                        begin={`${pi * 0.4}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  );
                })}
              </>
            )}
          </svg>
        </div>

        {/* Family cards below graph */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {FAMILIES.map((family, i) => (
            <Link
              key={family.name}
              href={family.href}
              onMouseEnter={() => setHoveredFamily(i)}
              onMouseLeave={() => setHoveredFamily(null)}
              className="border border-border bg-card p-5 text-left hover:border-foreground/30 transition-all duration-300 rounded-none group"
              style={{
                borderColor: hoveredFamily === i ? family.color + "60" : undefined,
              }}
            >
              <div
                className="w-full h-1 mb-4 transition-all duration-300"
                style={{
                  background: hoveredFamily === i ? family.color : "#E8EDF8",
                  boxShadow: hoveredFamily === i ? `0 0 12px ${family.color}40` : "none",
                }}
              />
              <div className="text-sm font-bold font-montserrat text-foreground mb-2">
                {family.name}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {family.algorithms.slice(0, 4).map((algo) => (
                  <span
                    key={algo}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-none border"
                    style={{
                      color: hoveredFamily === i ? family.color : "#7B9FD4",
                      borderColor: hoveredFamily === i ? family.color + "40" : "#E8EDF8",
                      backgroundColor: hoveredFamily === i ? family.color + "10" : "transparent",
                    }}
                  >
                    {algo}
                  </span>
                ))}
                {family.algorithms.length > 4 && (
                  <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5">
                    +{family.algorithms.length - 4}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
  );
}
