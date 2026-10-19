import { ImageResponse } from "next/og";

export const alt =
  "Shreeram Chaudhary — software for hydropower, finance and automation";
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
          background: "#F8F5EC",
          color: "#171717",
          padding: "48px 60px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 250,
            height: "100%",
            background: "#244BFF",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 250,
            top: 0,
            width: 24,
            height: "100%",
            background: "#FF5738",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: 220,
            height: 22,
            background: "#D7FF64",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 18,
            borderBottom: "2px solid #171717",
            fontFamily: "Arial, sans-serif",
            fontSize: 18,
            letterSpacing: 1,
            maxWidth: 880,
          }}
        >
          <span>SOFTWARE DEVELOPER — NEPAL</span>
          <span>rc.cloop@gmail.com</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 880,
          }}
        >
          <span
            style={{
              fontSize: 126,
              lineHeight: 0.9,
              letterSpacing: -4,
            }}
          >
            Shreeram
          </span>
          <span
            style={{
              display: "flex",
              fontSize: 126,
              lineHeight: 0.9,
              letterSpacing: -4,
              marginLeft: 96,
            }}
          >
            Chaudhary
            <span style={{ color: "#FF5738" }}>.</span>
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: "2px solid #171717",
            paddingTop: 20,
            maxWidth: 880,
            fontFamily: "Arial, sans-serif",
          }}
        >
          <span
            style={{
              display: "flex",
              maxWidth: 640,
              fontSize: 24,
              lineHeight: 1.4,
            }}
          >
            Hydropower plant systems, loan and audit software, web applications
            and IoT automation.
          </span>
          <span
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 700,
              padding: "10px 16px",
              background: "#171717",
              color: "#F8F5EC",
            }}
          >
            PORTFOLIO
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
