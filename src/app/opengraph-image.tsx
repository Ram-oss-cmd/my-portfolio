import { ImageResponse } from "next/og";

export const alt =
  "Shreeram Chaudhary — hydropower software, loan systems and IoT";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          background: "#0B1114",
          color: "#E8E4D8",
          padding: "52px 64px",
          fontFamily: "monospace",
        }}
      >
        {[180, 360, 540, 720, 900, 1080].map((left) => (
          <div
            key={left}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left,
              width: 1,
              background: "rgba(232, 228, 216, 0.08)",
            }}
          />
        ))}
        {[150, 300, 450].map((top) => (
          <div
            key={top}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top,
              height: 1,
              background: "rgba(232, 228, 216, 0.08)",
            }}
          />
        ))}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(232, 228, 216, 0.24)",
            paddingBottom: 16,
            fontSize: 16,
            letterSpacing: 3,
            color: "#8C968F",
          }}
        >
          <span>SHREERAM CHAUDHARY / PORTFOLIO</span>
          <span>27.7172° N, 85.3240° E</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 136,
              lineHeight: 0.86,
              letterSpacing: -5,
            }}
          >
            Shreeram
          </span>
          <span
            style={{
              display: "flex",
              fontFamily: "Georgia, serif",
              fontSize: 136,
              lineHeight: 0.86,
              letterSpacing: -5,
              marginLeft: 120,
            }}
          >
            Chaudhary
            <span style={{ color: "#FFB000" }}>.</span>
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(232, 228, 216, 0.24)",
            paddingTop: 20,
          }}
        >
          <span
            style={{
              display: "flex",
              maxWidth: 700,
              fontSize: 20,
              lineHeight: 1.5,
              color: "#AAB1A7",
            }}
          >
            Hydropower software. Loan systems. IoT automation. Built in Nepal.
          </span>
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span style={{ fontSize: 13, letterSpacing: 3, color: "#8C968F" }}>
              PLANT OUTPUT
            </span>
            <span style={{ fontSize: 38, color: "#FFB000" }}>0.990 MW</span>
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
