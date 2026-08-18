import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/queries";
import { publicImageUrl } from "@/lib/storage";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
// read current settings each request so a newly-uploaded monogram takes effect
export const dynamic = "force-dynamic";

// Favicon: the uploaded monogram if there is one, otherwise the "RS" placeholder.
export default async function Icon() {
  const s = await getSettings();
  if (s.monogram_path) {
    try {
      const res = await fetch(publicImageUrl("gallery", s.monogram_path));
      if (res.ok) {
        return new Response(await res.arrayBuffer(), {
          headers: {
            "content-type": res.headers.get("content-type") ?? "image/png",
            "cache-control": "public, max-age=3600",
          },
        });
      }
    } catch {
      // fall through to the placeholder
    }
  }

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
