import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ResourcesOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 22,
            letterSpacing: 4,
            color: "#6f6f73",
          }}
        >
          CONFLUENCE · ROADMAP
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 1,
            color: "#171719",
            marginTop: 24,
          }}
        >
          Learn the ideas behind the visuals
        </div>
        <div style={{ fontSize: 28, color: "#6f6f73", marginTop: 24 }}>
          7 layers · readings · videos · visualizer practice
        </div>
      </div>
    ),
    { ...size }
  );
}
