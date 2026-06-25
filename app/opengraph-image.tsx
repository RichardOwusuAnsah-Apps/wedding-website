import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Richie & Shula — Our Wedding · 24 October 2026";

// Social share card — RS monogram + names + date on burgundy.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #5A1B2E, #3F121F)",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 150,
            border: "2px solid #C49A48",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#E2C588",
            fontSize: 64,
            marginBottom: 36,
          }}
        >
          RS
        </div>
        <div style={{ display: "flex", alignItems: "center", color: "#fff", fontSize: 92 }}>
          <span>Richie</span>
          <span style={{ color: "#C49A48", padding: "0 18px", fontStyle: "italic" }}>&amp;</span>
          <span>Shula</span>
        </div>
        <div
          style={{
            display: "flex",
            color: "#E2C588",
            fontSize: 28,
            letterSpacing: 10,
            marginTop: 22,
            textTransform: "uppercase",
          }}
        >
          24 October 2026 · Maryland, USA
        </div>
      </div>
    ),
    { ...size },
  );
}
