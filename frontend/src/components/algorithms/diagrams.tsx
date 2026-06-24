"use client";

import React from "react";

const BLUE = "#4a90d9";
const GREEN = "#2ecc71";
const RED = "#e74c3c";
const ORANGE = "#f39c12";
const GRAY = "#95a5a6";
const DARK = "#1e1e1e";
const LIGHT_BLUE = "#dbeafe";
const LIGHT_GREEN = "#d1fae5";
const LIGHT_YELLOW = "#fef9c3";

function SketchFilter() {
  return (
    <filter id="sketch">
      <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="4" result="noise" seed="2" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
}

function InsightBox({ text, x = 20, y = 260 }: { text: string; x?: number; y?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={460} height={50} rx={2} fill={LIGHT_YELLOW} stroke={DARK} strokeWidth={1.5} />
      <text x={x + 12} y={y + 18} fontSize={12} fontFamily="var(--font-montserrat), sans-serif" fontWeight={700} fill={DARK}>
        Key Insight:
      </text>
      <text x={x + 12} y={y + 36} fontSize={11} fontFamily="var(--font-geist-sans), sans-serif" fill={DARK}>
        {text}
      </text>
    </g>
  );
}

function Title({ text, x = 20, y = 28 }: { text: string; x?: number; y?: number }) {
  return (
    <text x={x} y={y} fontSize={20} fontFamily="var(--font-montserrat), sans-serif" fontWeight={700} fill={DARK}>
      {text}
    </text>
  );
}

/* ─── Linear Boundary ─── */
export function LinearBoundaryDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <SketchFilter />
      <Title text="Linear Decision Boundary" />
      {/* Grid */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <React.Fragment key={i}>
          <line x1={40 + i * 50} y1={50} x2={40 + i * 50} y2={250} stroke={GRAY} strokeWidth={0.5} opacity={0.3} />
          <line x1={40} y1={50 + i * 25} x2={490} y2={50 + i * 25} stroke={GRAY} strokeWidth={0.5} opacity={0.3} />
        </React.Fragment>
      ))}
      {/* Class 0 points */}
      {[[80, 180], [100, 200], [120, 190], [90, 220], [130, 210], [110, 240], [70, 210], [140, 230]].map(([cx, cy], i) => (
        <circle key={`c0-${i}`} cx={cx} cy={cy} r={5} fill={BLUE} opacity={0.8} />
      ))}
      {/* Class 1 points */}
      {[[300, 80], [320, 100], [340, 70], [310, 60], [350, 90], [330, 50], [360, 80], [290, 70]].map(([cx, cy], i) => (
        <circle key={`c1-${i}`} cx={cx} cy={cy} r={5} fill={RED} opacity={0.8} />
      ))}
      {/* Decision boundary line */}
      <line x1={200} y1={50} x2={200} y2={250} stroke={DARK} strokeWidth={2.5} strokeDasharray="8 4" filter="url(#sketch)" />
      {/* Labels */}
      <text x={100} y={160} fontSize={14} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} fill={BLUE}>
        Class 0
      </text>
      <text x={320} y={160} fontSize={14} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} fill={RED}>
        Class 1
      </text>
      <text x={208} y={45} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={DARK}>
        w·x + b = 0
      </text>
      <InsightBox text="A linear classifier finds the hyperplane that maximizes the margin between classes." />
    </svg>
  );
}

/* ─── KNN ─── */
export function KNNDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="K-Nearest Neighbors" />
      {/* Data points */}
      {[[80, 120], [100, 140], [90, 100], [120, 130], [70, 150]].map(([cx, cy], i) => (
        <circle key={`a-${i}`} cx={cx} cy={cy} r={5} fill={BLUE} opacity={0.8} />
      ))}
      {[[300, 100], [320, 120], [310, 80], [340, 110], [290, 90]].map(([cx, cy], i) => (
        <circle key={`b-${i}`} cx={cx} cy={cy} r={5} fill={RED} opacity={0.8} />
      ))}
      {/* Query point */}
      <circle cx={200} cy={120} r={7} fill={ORANGE} stroke={DARK} strokeWidth={2} />
      <text x={212} y={115} fontSize={11} fontFamily="var(--font-geist-mono), monospace" fill={DARK}>
        query
      </text>
      {/* K=3 circle */}
      <circle cx={200} cy={120} r={80} fill="none" stroke={ORANGE} strokeWidth={2} strokeDasharray="6 3" />
      {/* Lines to nearest */}
      <line x1={200} y1={120} x2={120} y2={130} stroke={ORANGE} strokeWidth={1.5} strokeDasharray="4 2" />
      <line x1={200} y1={120} x2={300} y2={100} stroke={ORANGE} strokeWidth={1.5} strokeDasharray="4 2" />
      <line x1={200} y1={120} x2={310} y2={80} stroke={ORANGE} strokeWidth={1.5} strokeDasharray="4 2" />
      {/* Labels */}
      <text x={380} y={230} fontSize={12} fontFamily="var(--font-geist-mono), monospace" fill={DARK}>
        k = 3
      </text>
      <text x={380} y={248} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={GRAY}>
        2× blue, 1× red
      </text>
      <text x={380} y={264} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={BLUE}>
        → Class 0
      </text>
      <InsightBox text="KNN classifies by majority vote of the k closest training points — no training needed." />
    </svg>
  );
}

/* ─── Decision Tree ─── */
export function DecisionTreeDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="Decision Tree Splitting" />
      {/* Root node */}
      <rect x={190} y={50} width={120} height={32} rx={2} fill={LIGHT_BLUE} stroke={BLUE} strokeWidth={2} />
      <text x={250} y={71} fontSize={11} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        x₁ ≤ 0.45
      </text>
      {/* Left branch */}
      <line x1={220} y1={82} x2={130} y2={120} stroke={DARK} strokeWidth={1.5} filter="url(#sketch)" />
      <text x={160} y={105} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={GREEN}>
        True
      </text>
      {/* Right branch */}
      <line x1={280} y1={82} x2={370} y2={120} stroke={DARK} strokeWidth={1.5} filter="url(#sketch)" />
      <text x={340} y={105} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={RED}>
        False
      </text>
      {/* Left child */}
      <rect x={70} y={120} width={120} height={32} rx={2} fill={LIGHT_BLUE} stroke={BLUE} strokeWidth={2} />
      <text x={130} y={141} fontSize={11} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        x₂ ≤ 1.22
      </text>
      {/* Right child */}
      <rect x={310} y={120} width={120} height={32} rx={2} fill={LIGHT_BLUE} stroke={BLUE} strokeWidth={2} />
      <text x={370} y={141} fontSize={11} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        x₁ ≤ 0.88
      </text>
      {/* Leaf nodes */}
      <line x1={100} y1={152} x2={70} y2={185} stroke={DARK} strokeWidth={1.5} />
      <line x1={160} y1={152} x2={190} y2={185} stroke={DARK} strokeWidth={1.5} />
      <line x1={340} y1={152} x2={310} y2={185} stroke={DARK} strokeWidth={1.5} />
      <line x1={400} y1={152} x2={430} y2={185} stroke={DARK} strokeWidth={1.5} />
      <circle cx={70} cy={195} r={10} fill={BLUE} />
      <circle cx={190} cy={195} r={10} fill={RED} />
      <circle cx={310} cy={195} r={10} fill={RED} />
      <circle cx={430} cy={195} r={10} fill={BLUE} />
      <text x={70} y={199} fontSize={10} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill="white">
        A
      </text>
      <text x={190} y={199} fontSize={10} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill="white">
        B
      </text>
      <text x={310} y={199} fontSize={10} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill="white">
        B
      </text>
      <text x={430} y={199} fontSize={10} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill="white">
        A
      </text>
      <InsightBox text="Trees recursively partition feature space with axis-aligned splits, creating piecewise constant predictions." />
    </svg>
  );
}

/* ─── SVM Margin ─── */
export function SVMMarginDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="SVM Maximum Margin" />
      {/* Margin area */}
      <rect x={185} y={50} width={130} height={200} fill={LIGHT_BLUE} opacity={0.4} />
      {/* Decision boundary */}
      <line x1={250} y1={50} x2={250} y2={250} stroke={DARK} strokeWidth={2.5} filter="url(#sketch)" />
      {/* Margin lines */}
      <line x1={185} y1={50} x2={185} y2={250} stroke={BLUE} strokeWidth={1.5} strokeDasharray="6 3" />
      <line x1={315} y1={50} x2={315} y2={250} stroke={BLUE} strokeWidth={1.5} strokeDasharray="6 3" />
      {/* Class 0 */}
      {[[80, 100], [100, 130], [90, 160], [120, 120], [70, 180], [110, 200]].map(([cx, cy], i) => (
        <circle key={`c0-${i}`} cx={cx} cy={cy} r={5} fill={BLUE} opacity={0.7} />
      ))}
      {/* Class 1 */}
      {[[380, 90], [400, 120], [390, 150], [410, 110], [370, 170], [420, 140]].map(([cx, cy], i) => (
        <circle key={`c1-${i}`} cx={cx} cy={cy} r={5} fill={RED} opacity={0.7} />
      ))}
      {/* Support vectors */}
      <circle cx={120} cy={120} r={9} fill="none" stroke={ORANGE} strokeWidth={2} />
      <circle cx={110} cy={200} r={9} fill="none" stroke={ORANGE} strokeWidth={2} />
      <circle cx={380} cy={90} r={9} fill="none" stroke={ORANGE} strokeWidth={2} />
      <circle cx={370} cy={170} r={9} fill="none" stroke={ORANGE} strokeWidth={2} />
      {/* Labels */}
      <text x={250} y={44} fontSize={10} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        w·x + b = 0
      </text>
      <text x={185} y={44} fontSize={9} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={BLUE}>
        margin
      </text>
      <text x={315} y={44} fontSize={9} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={BLUE}>
        margin
      </text>
      <text x={430} y={75} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={ORANGE}>
        support
      </text>
      <text x={430} y={87} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={ORANGE}>
        vectors
      </text>
      <InsightBox text="SVM finds the hyperplane that maximizes the margin — the distance to the nearest points from each class." />
    </svg>
  );
}

/* ─── Random Forest ─── */
export function RandomForestDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="Random Forest Ensemble" />
      {/* Input data */}
      <rect x={190} y={45} width={120} height={28} rx={2} fill={LIGHT_BLUE} stroke={BLUE} strokeWidth={1.5} />
      <text x={250} y={64} fontSize={11} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        Training Data
      </text>
      {/* Arrows to trees */}
      <line x1={220} y1={73} x2={80} y2={110} stroke={DARK} strokeWidth={1} />
      <line x1={250} y1={73} x2={250} y2={110} stroke={DARK} strokeWidth={1} />
      <line x1={280} y1={73} x2={420} y2={110} stroke={DARK} strokeWidth={1} />
      {/* Trees */}
      {[
        { x: 30, label: "Tree 1", subset: "Bootstrap #1" },
        { x: 200, label: "Tree 2", subset: "Bootstrap #2" },
        { x: 370, label: "Tree 3", subset: "Bootstrap #3" },
      ].map((tree, i) => (
        <g key={i}>
          <rect x={tree.x} y={110} width={100} height={60} rx={2} fill="white" stroke={BLUE} strokeWidth={1.5} />
          <text x={tree.x + 50} y={130} fontSize={11} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} textAnchor="middle" fill={DARK}>
            {tree.label}
          </text>
          <text x={tree.x + 50} y={148} fontSize={8} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={GRAY}>
            {tree.subset}
          </text>
          <text x={tree.x + 50} y={162} fontSize={8} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={GRAY}>
            random features
          </text>
        </g>
      ))}
      {/* Arrows to vote */}
      <line x1={80} y1={170} x2={200} y2={210} stroke={DARK} strokeWidth={1} />
      <line x1={250} y1={170} x2={250} y2={210} stroke={DARK} strokeWidth={1} />
      <line x1={420} y1={170} x2={300} y2={210} stroke={DARK} strokeWidth={1} />
      {/* Predictions */}
      <text x={80} y={198} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={BLUE}>
        → A
      </text>
      <text x={250} y={198} fontSize={10} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={RED}>
        → B
      </text>
      <text x={420} y={198} fontSize={10} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={BLUE}>
        → A
      </text>
      {/* Majority vote */}
      <rect x={170} y={210} width={160} height={30} rx={2} fill={GREEN} stroke={DARK} strokeWidth={1.5} />
      <text x={250} y={230} fontSize={11} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} textAnchor="middle" fill="white">
        Majority Vote → A
      </text>
      <InsightBox text="Random Forest averages many decorrelated trees, each trained on a random subset of data and features." y={260} />
    </svg>
  );
}

/* ─── Boosting ─── */
export function BoostingDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="Gradient Boosting — Sequential Learning" />
      {/* Stage 1 */}
      <rect x={20} y={50} width={130} height={80} rx={2} fill="white" stroke={BLUE} strokeWidth={1.5} />
      <text x={85} y={68} fontSize={10} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} textAnchor="middle" fill={DARK}>
        Stage 1: Weak Learner
      </text>
      <line x1={30} y1={100} x2={140} y2={100} stroke={GRAY} strokeWidth={1} />
      <text x={85} y={118} fontSize={9} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={GRAY}>
        residual = y - ŷ₁
      </text>
      {/* Arrow */}
      <line x1={150} y1={90} x2={175} y2={90} stroke={DARK} strokeWidth={1.5} />
      <polygon points="175,86 183,90 175,94" fill={DARK} />
      {/* Stage 2 */}
      <rect x={185} y={50} width={130} height={80} rx={2} fill="white" stroke={BLUE} strokeWidth={1.5} />
      <text x={250} y={68} fontSize={10} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} textAnchor="middle" fill={DARK}>
        Stage 2: Fit Residuals
      </text>
      <line x1={195} y1={100} x2={305} y2={100} stroke={GRAY} strokeWidth={1} />
      <text x={250} y={118} fontSize={9} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={GRAY}>
        residual = y - ŷ₁ - ŷ₂
      </text>
      {/* Arrow */}
      <line x1={315} y1={90} x2={340} y2={90} stroke={DARK} strokeWidth={1.5} />
      <polygon points="340,86 348,90 340,94" fill={DARK} />
      {/* Stage 3 */}
      <rect x={350} y={50} width={130} height={80} rx={2} fill="white" stroke={BLUE} strokeWidth={1.5} />
      <text x={415} y={68} fontSize={10} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} textAnchor="middle" fill={DARK}>
        Stage T: Final
      </text>
      <line x1={360} y1={100} x2={470} y2={100} stroke={GRAY} strokeWidth={1} />
      <text x={415} y={118} fontSize={9} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={GRAY}>
        F(x) = Σ fₜ(x)
      </text>
      {/* Loss curve going down */}
      <text x={20} y={160} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={DARK}>
        Loss over iterations:
      </text>
      <path d="M 40 220 Q 100 200 160 185 T 300 170 T 460 165" fill="none" stroke={RED} strokeWidth={2} filter="url(#sketch)" />
      <line x1={40} y1={230} x2={460} y2={230} stroke={GRAY} strokeWidth={1} />
      <line x1={40} y1={160} x2={40} y2={230} stroke={GRAY} strokeWidth={1} />
      <text x={250} y={248} fontSize={9} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={GRAY}>
        boosting rounds →
      </text>
      <InsightBox text="Each new learner fits the residual errors of the ensemble so far, gradually reducing loss." y={260} />
    </svg>
  );
}

/* ─── Gaussian NB ─── */
export function GaussianNBDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="Naive Bayes — Class-Conditional Densities" />
      {/* Class 0 distribution */}
      <text x={100} y={60} fontSize={12} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} fill={BLUE}>
        P(x | Class 0)
      </text>
      <path d="M 20 200 Q 50 200 70 190 T 120 100 T 180 190 T 210 200" fill={BLUE} opacity={0.2} stroke={BLUE} strokeWidth={2} filter="url(#sketch)" />
      <line x1={20} y1={200} x2={210} y2={200} stroke={GRAY} strokeWidth={1} />
      {/* Class 1 distribution */}
      <text x={310} y={60} fontSize={12} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} fill={RED}>
        P(x | Class 1)
      </text>
      <path d="M 280 200 Q 310 200 330 180 T 380 110 T 440 180 T 470 200" fill={RED} opacity={0.2} stroke={RED} strokeWidth={2} filter="url(#sketch)" />
      <line x1={280} y1={200} x2={470} y2={200} stroke={GRAY} strokeWidth={1} />
      {/* Decision boundary */}
      <line x1={245} y1={70} x2={245} y2={210} stroke={DARK} strokeWidth={2} strokeDasharray="6 3" />
      <text x={245} y={225} fontSize={9} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        boundary
      </text>
      {/* Arrow showing Bayes */}
      <text x={170} y={250} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={DARK}>
        P(y|x) ∝ P(x|y) · P(y)
      </text>
      <InsightBox text="NB assumes features are independent given the class, then applies Bayes' rule to find the most probable class." y={268} />
    </svg>
  );
}

/* ─── Neural Network ─── */
export function NeuralNetDiagram() {
  const layers = [
    { x: 60, nodes: 3, label: "Input" },
    { x: 180, nodes: 4, label: "Hidden 1" },
    { x: 300, nodes: 4, label: "Hidden 2" },
    { x: 420, nodes: 2, label: "Output" },
  ];
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="Multi-Layer Perceptron" />
      {/* Connections */}
      {layers.map((layer, li) =>
        li < layers.length - 1
          ? Array.from({ length: layer.nodes }, (_, ni) =>
              Array.from({ length: layers[li + 1].nodes }, (_, mi) => (
                <line
                  key={`${li}-${ni}-${mi}`}
                  x1={layer.x}
                  y1={80 + ni * 45}
                  x2={layers[li + 1].x}
                  y2={80 + mi * 45}
                  stroke={GRAY}
                  strokeWidth={0.8}
                  opacity={0.4}
                />
              ))
            )
          : null
      )}
      {/* Nodes */}
      {layers.map((layer, li) =>
        Array.from({ length: layer.nodes }, (_, ni) => (
          <circle
            key={`node-${li}-${ni}`}
            cx={layer.x}
            cy={80 + ni * 45}
            r={10}
            fill={li === 0 ? LIGHT_BLUE : li === layers.length - 1 ? LIGHT_GREEN : LIGHT_BLUE}
            stroke={BLUE}
            strokeWidth={1.5}
          />
        ))
      )}
      {/* Layer labels */}
      {layers.map((layer) => (
        <text key={layer.label} x={layer.x} y={270} fontSize={9} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={GRAY}>
          {layer.label}
        </text>
      ))}
      {/* Formula */}
      <text x={250} y={290} fontSize={10} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        y = σ(W₃ · σ(W₂ · σ(W₁ · x + b₁) + b₂) + b₃)
      </text>
      <InsightBox text="MLPs compose linear transformations with nonlinear activations to learn complex decision boundaries." y={260} />
    </svg>
  );
}

/* ─── K-Means ─── */
export function KMeansDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="K-Means Clustering" />
      {/* Cluster 0 */}
      {[[80, 100], [90, 120], [70, 130], [100, 110], [85, 140], [60, 115]].map(([cx, cy], i) => (
        <circle key={`a-${i}`} cx={cx} cy={cy} r={4} fill={BLUE} opacity={0.6} />
      ))}
      {/* Cluster 1 */}
      {[[280, 80], [290, 100], [270, 110], [300, 90], [285, 120]].map(([cx, cy], i) => (
        <circle key={`b-${i}`} cx={cx} cy={cy} r={4} fill={RED} opacity={0.6} />
      ))}
      {/* Cluster 2 */}
      {[[180, 200], [190, 220], [170, 230], [200, 210], [185, 240], [160, 215]].map(([cx, cy], i) => (
        <circle key={`c-${i}`} cx={cx} cy={cy} r={4} fill={GREEN} opacity={0.6} />
      ))}
      {/* Centroids */}
      <polygon points="83,115 80,105 77,115 80,125" fill={BLUE} stroke={DARK} strokeWidth={1.5} />
      <polygon points="287,95 284,85 281,95 284,105" fill={RED} stroke={DARK} strokeWidth={1.5} />
      <polygon points="183,215 180,205 177,215 180,225" fill={GREEN} stroke={DARK} strokeWidth={1.5} />
      {/* Voronoi-like boundaries */}
      <line x1={170} y1={50} x2={140} y2={250} stroke={GRAY} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
      <line x1={230} y1={50} x2={260} y2={250} stroke={GRAY} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
      {/* Labels */}
      <text x={80} y={80} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={BLUE}>
        μ₁
      </text>
      <text x={287} y={70} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={RED}>
        μ₂
      </text>
      <text x={183} y={190} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={GREEN}>
        μ₃
      </text>
      <InsightBox text="K-Means alternates between assigning points to the nearest centroid and recomputing centroids." />
    </svg>
  );
}

/* ─── DBSCAN ─── */
export function DBSCANDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="DBSCAN — Density-Based Clustering" />
      {/* Dense cluster */}
      {[[100, 120], [110, 100], [120, 140], [90, 130], [130, 110], [105, 150], [85, 110], [115, 90], [140, 130], [95, 145]].map(
        ([cx, cy], i) => (
          <circle key={`d-${i}`} cx={cx} cy={cy} r={4} fill={BLUE} opacity={0.7} />
        )
      )}
      {/* Noise points */}
      <circle cx={250} cy={80} r={3} fill={GRAY} opacity={0.5} />
      <circle cx={350} cy={200} r={3} fill={GRAY} opacity={0.5} />
      <circle cx={400} cy={100} r={3} fill={GRAY} opacity={0.5} />
      {/* Second cluster (different shape) */}
      {[[300, 150], [310, 170], [330, 160], [320, 180], [340, 170], [350, 155], [335, 145], [315, 140]].map(
        ([cx, cy], i) => (
          <circle key={`e-${i}`} cx={cx} cy={cy} r={4} fill={GREEN} opacity={0.7} />
        )
      )}
      {/* Eps circle around a core point */}
      <circle cx={110} cy={100} r={35} fill="none" stroke={ORANGE} strokeWidth={1.5} strokeDasharray="4 2" />
      <text x={148} y={85} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={ORANGE}>
        ε
      </text>
      {/* Labels */}
      <text x={100} y={75} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={BLUE}>
        core points
      </text>
      <text x={300} y={130} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={GREEN}>
        cluster 2
      </text>
      <text x={340} y={215} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={GRAY}>
        noise
      </text>
      <InsightBox text="DBSCAN groups points in high-density regions and marks isolated points as noise — no need to specify k." />
    </svg>
  );
}

/* ─── GMM ─── */
export function GMMDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="Gaussian Mixture Model" />
      {/* Gaussian 1 */}
      <path d="M 40 200 Q 80 200 110 180 T 170 80 T 230 180 T 260 200" fill={BLUE} opacity={0.15} stroke={BLUE} strokeWidth={2} filter="url(#sketch)" />
      <line x1={40} y1={200} x2={260} y2={200} stroke={GRAY} strokeWidth={1} />
      <text x={150} y={70} fontSize={11} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={BLUE}>
        N(μ₁, σ₁)
      </text>
      {/* Gaussian 2 */}
      <path d="M 240 200 Q 280 200 310 185 T 370 100 T 430 185 T 460 200" fill={RED} opacity={0.15} stroke={RED} strokeWidth={2} filter="url(#sketch)" />
      <line x1={240} y1={200} x2={460} y2={200} stroke={GRAY} strokeWidth={1} />
      <text x={350} y={85} fontSize={11} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={RED}>
        N(μ₂, σ₂)
      </text>
      {/* Mixture line */}
      <path d="M 40 200 Q 80 200 110 178 T 170 75 T 230 178 T 260 200 Q 280 200 310 183 T 370 95 T 430 183 T 460 200" fill="none" stroke={DARK} strokeWidth={2} strokeDasharray="6 3" />
      <text x={250} y={220} fontSize={9} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        mixture = π₁·N₁ + π₂·N₂
      </text>
      <InsightBox text="GMM models data as a weighted sum of Gaussians, giving soft probabilistic cluster assignments." y={240} />
    </svg>
  );
}

/* ─── PCA ─── */
export function PCADiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="PCA — Principal Component Analysis" />
      {/* Original 2D data (elliptical cloud) */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const rx = 80, ry = 30;
        const cx = 150 + Math.cos(angle) * rx * (0.6 + Math.random() * 0.4);
        const cy = 150 + Math.sin(angle) * ry * (0.6 + Math.random() * 0.4);
        return <circle key={i} cx={cx} cy={cy} r={3} fill={BLUE} opacity={0.6} />;
      })}
      {/* PC1 arrow */}
      <line x1={60} y1={185} x2={240} y2={115} stroke={RED} strokeWidth={2.5} filter="url(#sketch)" />
      <polygon points="240,115 232,120 236,112" fill={RED} />
      <text x={245} y={110} fontSize={11} fontFamily="var(--font-geist-mono), monospace" fill={RED}>
        PC1 (max variance)
      </text>
      {/* PC2 arrow */}
      <line x1={110} y1={100} x2={190} y2={200} stroke={GREEN} strokeWidth={2} filter="url(#sketch)" />
      <polygon points="190,200 182,194 186,202" fill={GREEN} />
      <text x={195} y={210} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={GREEN}>
        PC2
      </text>
      {/* Arrow to projection */}
      <line x1={280} y1={150} x2={310} y2={150} stroke={DARK} strokeWidth={1.5} />
      <polygon points="310,146 318,150 310,154" fill={DARK} />
      {/* Projected 1D data */}
      <line x1={340} y1={150} x2={470} y2={150} stroke={GRAY} strokeWidth={1} />
      {[-40, -25, -15, -5, 5, 15, 25, 35].map((offset, i) => (
        <circle key={i} cx={400 + offset} cy={150} r={3} fill={RED} opacity={0.6} />
      ))}
      <text x={400} y={140} fontSize={9} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        1D projection
      </text>
      <InsightBox text="PCA finds orthogonal directions of maximum variance, allowing dimensionality reduction with minimal information loss." y={260} />
    </svg>
  );
}

/* ─── t-SNE / Manifold ─── */
export function ManifoldDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="Manifold Learning (t-SNE / UMAP)" />
      {/* Curved manifold */}
      <path d="M 50 200 Q 100 80 200 120 T 350 100 T 450 180" fill="none" stroke={BLUE} strokeWidth={2} strokeDasharray="6 3" filter="url(#sketch)" />
      {/* Points on manifold */}
      {[[70, 180], [100, 120], [130, 100], [170, 115], [210, 105], [250, 100], [290, 105], [330, 100], [370, 120], [410, 160]].map(
        ([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={4} fill={i < 5 ? BLUE : RED} opacity={0.7} />
        )
      )}
      {/* Arrow down to embedded space */}
      <line x1={250} y1={210} x2={250} y2={235} stroke={DARK} strokeWidth={1.5} />
      <polygon points="246,235 250,243 254,235" fill={DARK} />
      {/* Embedded 2D */}
      <text x={250} y={258} fontSize={10} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        2D Embedding
      </text>
      {/* Two clusters in embedding */}
      {[[140, 285], [155, 290], [145, 300], [160, 280]].map(([cx, cy], i) => (
        <circle key={`e-${i}`} cx={cx} cy={cy} r={4} fill={BLUE} opacity={0.7} />
      ))}
      {[[320, 285], [335, 290], [325, 300], [340, 280]].map(([cx, cy], i) => (
        <circle key={`f-${i}`} cx={cx} cy={cy} r={4} fill={RED} opacity={0.7} />
      ))}
      <InsightBox text="Manifold methods preserve local neighborhoods, unfolding curved surfaces into interpretable 2D embeddings." y={260} />
    </svg>
  );
}

/* ─── Kernel Trick ─── */
export function KernelTrickDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="The Kernel Trick" />
      {/* Input space */}
      <text x={100} y={55} fontSize={11} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} fill={DARK}>
        Input Space (not linearly separable)
      </text>
      {/* Ring pattern */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <circle key={`inner-${i}`} cx={120 + Math.cos(a) * 25} cy={140 + Math.sin(a) * 25} r={4} fill={BLUE} opacity={0.7} />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={`outer-${i}`} cx={120 + Math.cos(a) * 65} cy={140 + Math.sin(a) * 65} r={4} fill={RED} opacity={0.7} />;
      })}
      <circle cx={120} cy={140} r={45} fill="none" stroke={GRAY} strokeWidth={1} strokeDasharray="4 2" />
      {/* Arrow */}
      <text x={215} y={140} fontSize={18} fontFamily="var(--font-geist-mono), monospace" fill={ORANGE}>
        φ(x)
      </text>
      <line x1={240} y1={140} x2={270} y2={140} stroke={DARK} strokeWidth={1.5} />
      <polygon points="270,136 278,140 270,144" fill={DARK} />
      {/* Feature space */}
      <text x={330} y={55} fontSize={11} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} fill={DARK}>
        Feature Space (linearly separable)
      </text>
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={`fi-${i}`} cx={370 + (i % 4) * 20} cy={100 + Math.floor(i / 4) * 20} r={4} fill={BLUE} opacity={0.7} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={`fo-${i}`} cx={340 + (i % 4) * 30} cy={170 + Math.floor(i / 4) * 25} r={4} fill={RED} opacity={0.7} />
      ))}
      <line x1={310} y1={145} x2={460} y2={145} stroke={DARK} strokeWidth={2} strokeDasharray="6 3" />
      <text x={385} y={140} fontSize={9} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        hyperplane
      </text>
      <InsightBox text="The kernel trick maps data to a higher dimension where a linear separator exists, without explicitly computing the mapping." y={260} />
    </svg>
  );
}

/* ─── Ridge vs Lasso ─── */
export function RegularizationDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="L1 (Lasso) vs L2 (Ridge) Regularization" />
      {/* L1 Diamond */}
      <text x={60} y={55} fontSize={12} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} fill={DARK}>
        L1 — Lasso
      </text>
      <polygon points="130,80 180,130 130,180 80,130" fill={LIGHT_BLUE} stroke={BLUE} strokeWidth={2} filter="url(#sketch)" />
      {/* Loss ellipses */}
      <ellipse cx={130} cy={130} rx={50} ry={25} fill="none" stroke={RED} strokeWidth={1.5} />
      <ellipse cx={130} cy={130} rx={35} ry={18} fill="none" stroke={RED} strokeWidth={1.5} />
      <ellipse cx={130} cy={130} rx={20} ry={10} fill="none" stroke={RED} strokeWidth={1.5} />
      {/* Touch point at corner */}
      <circle cx={130} cy={80} r={5} fill={ORANGE} stroke={DARK} strokeWidth={1.5} />
      <text x={140} y={78} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={DARK}>
        sparse!
      </text>
      {/* Axes */}
      <line x1={50} y1={130} x2={210} y2={130} stroke={GRAY} strokeWidth={0.8} />
      <line x1={130} y1={60} x2={130} y2={200} stroke={GRAY} strokeWidth={0.8} />
      <text x={215} y={134} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={GRAY}>
        β₁
      </text>
      <text x={130} y={55} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={GRAY} textAnchor="middle">
        β₂
      </text>
      {/* L2 Circle */}
      <text x={310} y={55} fontSize={12} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} fill={DARK}>
        L2 — Ridge
      </text>
      <circle cx={380} cy={130} r={50} fill={LIGHT_GREEN} stroke={GREEN} strokeWidth={2} filter="url(#sketch)" />
      {/* Loss ellipses */}
      <ellipse cx={380} cy={130} rx={50} ry={25} fill="none" stroke={RED} strokeWidth={1.5} />
      <ellipse cx={380} cy={130} rx={35} ry={18} fill="none" stroke={RED} strokeWidth={1.5} />
      <ellipse cx={380} cy={130} rx={20} ry={10} fill="none" stroke={RED} strokeWidth={1.5} />
      {/* Touch point on edge */}
      <circle cx={380} cy={80} r={5} fill={ORANGE} stroke={DARK} strokeWidth={1.5} />
      <text x={390} y={78} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={DARK}>
        small β
      </text>
      {/* Axes */}
      <line x1={300} y1={130} x2={460} y2={130} stroke={GRAY} strokeWidth={0.8} />
      <line x1={380} y1={60} x2={380} y2={200} stroke={GRAY} strokeWidth={0.8} />
      <text x={465} y={134} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={GRAY}>
        β₁
      </text>
      <text x={380} y={55} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={GRAY} textAnchor="middle">
        β₂
      </text>
      <InsightBox text="L1 diamond corners touch axes → sparse solutions. L2 circle touches远离 axes → small but nonzero coefficients." y={210} />
    </svg>
  );
}

/* ─── Spectral Clustering ─── */
export function SpectralDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="Spectral Clustering — Graph Cut" />
      {/* Two moon shapes */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI;
        return <circle key={`m1-${i}`} cx={120 + Math.cos(a) * 50} cy={130 + Math.sin(a) * 30} r={4} fill={BLUE} opacity={0.7} />;
      })}
      {Array.from({ length: 10 }, (_, i) => {
        const a = Math.PI + (i / 10) * Math.PI;
        return <circle key={`m2-${i}`} cx={200 + Math.cos(a) * 50} cy={130 + Math.sin(a) * 30} r={4} fill={RED} opacity={0.7} />;
      })}
      {/* Graph edges (within clusters) */}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`e1-${i}`} x1={120 + Math.cos((i / 10) * Math.PI) * 50} y1={130 + Math.sin((i / 10) * Math.PI) * 30} x2={120 + Math.cos(((i + 1) / 10) * Math.PI) * 50} y2={130 + Math.sin(((i + 1) / 10) * Math.PI) * 30} stroke={BLUE} strokeWidth={0.8} opacity={0.4} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`e2-${i}`} x1={200 + Math.cos(Math.PI + (i / 10) * Math.PI) * 50} y1={130 + Math.sin(Math.PI + (i / 10) * Math.PI) * 30} x2={200 + Math.cos(Math.PI + ((i + 1) / 10) * Math.PI) * 50} y2={130 + Math.sin(Math.PI + ((i + 1) / 10) * Math.PI) * 30} stroke={RED} strokeWidth={0.8} opacity={0.4} />
      ))}
      {/* Arrow to Laplacian */}
      <line x1={280} y1={130} x2={310} y2={130} stroke={DARK} strokeWidth={1.5} />
      <polygon points="310,126 318,130 310,134" fill={DARK} />
      {/* Laplacian matrix */}
      <rect x={320} y={80} width={80} height={100} rx={2} fill="white" stroke={DARK} strokeWidth={1.5} />
      <text x={360} y={100} fontSize={9} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        L = D - A
      </text>
      <text x={360} y={120} fontSize={8} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={GRAY}>
        eigenvectors
      </text>
      <text x={360} y={135} fontSize={8} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={GRAY}>
        of L
      </text>
      <text x={360} y={155} fontSize={8} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={GRAY}>
        → embed
      </text>
      <text x={360} y={170} fontSize={8} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={GRAY}>
        → K-Means
      </text>
      <InsightBox text="Spectral clustering builds a similarity graph, computes eigenvectors of the Laplacian, then clusters in the embedded space." y={260} />
    </svg>
  );
}

/* ─── Agglomerative ─── */
export function AgglomerativeDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="Agglomerative Hierarchical Clustering" />
      {/* Step labels */}
      <text x={20} y={65} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={GRAY}>
        Step 1:
      </text>
      <text x={20} y={130} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={GRAY}>
        Step 2:
      </text>
      <text x={20} y={195} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={GRAY}>
        Step 3:
      </text>
      {/* Step 1: individual points */}
      {[[80, 60], [110, 55], [140, 65], [200, 60], [230, 55], [260, 65]].map(([cx, cy], i) => (
        <circle key={`s1-${i}`} cx={cx} cy={cy} r={6} fill={[BLUE, BLUE, BLUE, RED, RED, RED][i]} opacity={0.7} />
      ))}
      {/* Step 2: pairs */}
      <line x1={80} y1={60} x2={110} y2={55} stroke={BLUE} strokeWidth={1.5} />
      <line x1={110} y1={55} x2={140} y2={65} stroke={BLUE} strokeWidth={1.5} />
      <line x1={200} y1={60} x2={230} y2={55} stroke={RED} strokeWidth={1.5} />
      <line x1={230} y1={55} x2={260} y2={65} stroke={RED} strokeWidth={1.5} />
      {/* Step 2: merge */}
      {[[80, 125], [140, 125], [200, 125], [260, 125]].map(([cx, cy], i) => (
        <circle key={`s2-${i}`} cx={cx} cy={cy} r={6} fill={[BLUE, BLUE, RED, RED][i]} opacity={0.7} />
      ))}
      <line x1={80} y1={125} x2={140} y2={125} stroke={BLUE} strokeWidth={1.5} />
      <line x1={200} y1={125} x2={260} y2={125} stroke={RED} strokeWidth={1.5} />
      {/* Step 3: bigger clusters */}
      {[[120, 190], [220, 190]].map(([cx, cy], i) => (
        <circle key={`s3-${i}`} cx={cx} cy={cy} r={6} fill={[BLUE, RED][i]} opacity={0.7} />
      ))}
      <line x1={120} y1={190} x2={220} y2={190} stroke={DARK} strokeWidth={1.5} />
      {/* Dendrogram on right */}
      <text x={320} y={55} fontSize={10} fontFamily="var(--font-montserrat), sans-serif" fontWeight={600} fill={DARK}>
        Dendrogram
      </text>
      <line x1={350} y1={70} x2={350} y2={200} stroke={GRAY} strokeWidth={1} />
      <line x1={370} y1={70} x2={370} y2={200} stroke={GRAY} strokeWidth={1} />
      <line x1={390} y1={70} x2={390} y2={200} stroke={GRAY} strokeWidth={1} />
      <line x1={410} y1={70} x2={410} y2={200} stroke={GRAY} strokeWidth={1} />
      <line x1={430} y1={70} x2={430} y2={200} stroke={GRAY} strokeWidth={1} />
      <line x1={450} y1={70} x2={450} y2={200} stroke={GRAY} strokeWidth={1} />
      {/* Merge levels */}
      <line x1={350} y1={100} x2={370} y2={100} stroke={BLUE} strokeWidth={1.5} />
      <line x1={410} y1={100} x2={430} y2={100} stroke={RED} strokeWidth={1.5} />
      <line x1={350} y1={100} x2={350} y2={140} stroke={BLUE} strokeWidth={1.5} />
      <line x1={370} y1={100} x2={370} y2={140} stroke={BLUE} strokeWidth={1.5} />
      <line x1={410} y1={100} x2={410} y2={150} stroke={RED} strokeWidth={1.5} />
      <line x1={430} y1={100} x2={430} y2={150} stroke={RED} strokeWidth={1.5} />
      <line x1={350} y1={140} x2={370} y2={140} stroke={BLUE} strokeWidth={1.5} />
      <line x1={410} y1={150} x2={430} y2={150} stroke={RED} strokeWidth={1.5} />
      <line x1={360} y1={140} x2={360} y2={180} stroke={DARK} strokeWidth={1.5} />
      <line x1={420} y1={150} x2={420} y2={180} stroke={DARK} strokeWidth={1.5} />
      <line x1={360} y1={180} x2={420} y2={180} stroke={DARK} strokeWidth={1.5} />
      <line x1={390} y1={180} x2={390} y2={200} stroke={DARK} strokeWidth={1.5} />
      <InsightBox text="Agglomerative clustering merges the closest pairs bottom-up, building a dendrogram that captures the hierarchy." y={220} />
    </svg>
  );
}

/* ─── Gaussian Process ─── */
export function GaussianProcessDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="Gaussian Process Regression" />
      {/* Axes */}
      <line x1={40} y1={200} x2={460} y2={200} stroke={GRAY} strokeWidth={1} />
      <line x1={40} y1={50} x2={40} y2={200} stroke={GRAY} strokeWidth={1} />
      {/* Uncertainty band */}
      <path d="M 60 170 Q 120 130 180 140 T 300 120 T 420 100" fill="none" stroke={BLUE} strokeWidth={1} opacity={0.3} />
      <path d="M 60 170 Q 120 130 180 140 T 300 120 T 420 100 L 420 160 Q 300 170 180 165 T 60 170" fill={BLUE} opacity={0.1} />
      <path d="M 60 130 Q 120 90 180 100 T 300 80 T 420 60" fill="none" stroke={BLUE} strokeWidth={1} opacity={0.3} />
      <path d="M 60 130 Q 120 90 180 100 T 300 80 T 420 60 L 420 100 Q 300 120 180 115 T 60 130" fill={BLUE} opacity={0.1} />
      {/* Mean line */}
      <path d="M 60 150 Q 120 110 180 120 T 300 100 T 420 80" fill="none" stroke={BLUE} strokeWidth={2.5} filter="url(#sketch)" />
      {/* Training points */}
      {[[100, 140], [180, 120], [260, 130], [340, 90], [400, 85]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={4} fill={RED} />
      ))}
      {/* Test point with narrow uncertainty */}
      <circle cx={300} cy={100} r={4} fill={GREEN} />
      <line x1={300} y1={85} x2={300} y2={115} stroke={GREEN} strokeWidth={1.5} />
      <text x={310} y={82} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={GREEN}>
        σ narrow
      </text>
      {/* Test point far from data with wide uncertainty */}
      <text x={440} y={65} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={BLUE}>
        σ wide
      </text>
      <InsightBox text="GP regression provides a full posterior distribution — predictions come with calibrated uncertainty estimates." y={220} />
    </svg>
  );
}

/* ─── Isomap ─── */
export function IsomapDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="Isomap — Geodesic Distance" />
      {/* Swiss roll-like shape */}
      <path d="M 60 180 Q 100 60 180 100 T 320 80 T 400 160" fill="none" stroke={BLUE} strokeWidth={2} filter="url(#sketch)" />
      {/* Points on the roll */}
      {[[70, 170], [100, 110], [130, 90], [170, 100], [210, 85], [260, 80], [310, 85], [360, 120], [390, 155]].map(
        ([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={4} fill={i < 4 ? BLUE : RED} opacity={0.7} />
        )
      )}
      {/* Geodesic path (along manifold) */}
      <path d="M 70 170 Q 100 110 130 90 T 210 85 T 310 85" fill="none" stroke={GREEN} strokeWidth={2} strokeDasharray="4 2" />
      <text x={160} y={70} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={GREEN}>
        geodesic (along surface)
      </text>
      {/* Euclidean shortcut (through) */}
      <line x1={70} y1={170} x2={310} y2={85} stroke={RED} strokeWidth={1.5} strokeDasharray="4 2" />
      <text x={150} y={155} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={RED}>
        Euclidean (through — wrong!)
      </text>
      {/* Arrow to flat embedding */}
      <line x1={420} y1={130} x2={440} y2={130} stroke={DARK} strokeWidth={1.5} />
      <polygon points="440,126 448,130 440,134" fill={DARK} />
      {/* Flat embedding */}
      <text x={340} y={210} fontSize={10} fontFamily="var(--font-geist-mono), monospace" fill={DARK}>
        Flat Embedding
      </text>
      <line x1={340} y1={230} x2={470} y2={230} stroke={GRAY} strokeWidth={1} />
      {[-50, -30, -10, 10, 30, 50].map((offset, i) => (
        <circle key={i} cx={405 + offset} cy={230} r={4} fill={i < 3 ? BLUE : RED} opacity={0.7} />
      ))}
      <InsightBox text="Isomap preserves geodesic (along-the-surface) distances rather than straight-line Euclidean distances." y={260} />
    </svg>
  );
}

/* ─── Elastic Net ─── */
export function ElasticNetDiagram() {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto">
      <Title text="Elastic Net — L1 + L2 Combined" />
      {/* Shape between diamond and circle */}
      <path d="M 200 80 Q 260 90 280 130 Q 260 180 200 200 Q 140 180 120 130 Q 140 90 200 80" fill={LIGHT_BLUE} stroke={BLUE} strokeWidth={2} filter="url(#sketch)" />
      {/* Loss ellipses */}
      <ellipse cx={200} cy={140} rx={60} ry={30} fill="none" stroke={RED} strokeWidth={1.5} />
      <ellipse cx={200} cy={140} rx={40} ry={20} fill="none" stroke={RED} strokeWidth={1.5} />
      {/* Touch point */}
      <circle cx={200} cy={95} r={5} fill={ORANGE} stroke={DARK} strokeWidth={1.5} />
      <text x={210} y={90} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={DARK}>
        elastic
      </text>
      {/* Axes */}
      <line x1={100} y1={140} x2={300} y2={140} stroke={GRAY} strokeWidth={0.8} />
      <line x1={200} y1={60} x2={200} y2={220} stroke={GRAY} strokeWidth={0.8} />
      <text x={305} y={144} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={GRAY}>
        β₁
      </text>
      <text x={200} y={55} fontSize={9} fontFamily="var(--font-geist-mono), monospace" fill={GRAY} textAnchor="middle">
        β₂
      </text>
      {/* Formula */}
      <text x={200} y={250} fontSize={10} fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" fill={DARK}>
        penalty = α · (λ₁‖β‖₁ + λ₂‖β‖₂²)
      </text>
      <InsightBox text="Elastic Net blends L1 sparsity with L2 group stability — best of both worlds for correlated features." y={265} />
    </svg>
  );
}

/* Map algorithm name to diagram component */
export const DIAGRAM_MAP: Record<string, React.FC> = {
  "logistic-regression": LinearBoundaryDiagram,
  "knn": KNNDiagram,
  "decision-tree": DecisionTreeDiagram,
  "rbf-svm": KernelTrickDiagram,
  "linear-svm": SVMMarginDiagram,
  "poly-svm": KernelTrickDiagram,
  "random-forest": RandomForestDiagram,
  "adaboost": BoostingDiagram,
  "gradient-boosting": BoostingDiagram,
  "gaussian-nb": GaussianNBDiagram,
  "mlp": NeuralNetDiagram,
  "linear-regression": LinearBoundaryDiagram,
  "ridge": RegularizationDiagram,
  "lasso": RegularizationDiagram,
  "elastic-net": ElasticNetDiagram,
  "decision-tree-regressor": DecisionTreeDiagram,
  "random-forest-regressor": RandomForestDiagram,
  "gradient-boosting-regressor": BoostingDiagram,
  "svr-linear": SVMMarginDiagram,
  "svr-rbf": KernelTrickDiagram,
  "knn-regressor": KNNDiagram,
  "gaussian-process-regressor": GaussianProcessDiagram,
  "mlp-regressor": NeuralNetDiagram,
  "kmeans": KMeansDiagram,
  "dbscan": DBSCANDiagram,
  "agglomerative": AgglomerativeDiagram,
  "gmm": GMMDiagram,
  "spectral": SpectralDiagram,
  "pca": PCADiagram,
  "tsne": ManifoldDiagram,
  "umap": ManifoldDiagram,
  "isomap": IsomapDiagram,
};
