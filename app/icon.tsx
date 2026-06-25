import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon — RS monogram on burgundy. Swap for the real rs-logo.svg later.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#5A1B2E",
          color: "#E2C588",
          fontSize: 34,
          fontWeight: 600,
          fontFamily: "Georgia, serif",
          letterSpacing: -1,
        }}
      >
        RS
      </div>
    ),
    { ...size },
  );
}
