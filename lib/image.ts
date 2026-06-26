import type { CSSProperties } from "react";

export interface Focusable {
  focal_x?: number | null; // 0–100, object-position X
  focal_y?: number | null; // 0–100, object-position Y
  zoom?: number | null; // 1–3
}

/**
 * CSS for a cover image with an admin-chosen focal point + zoom. object-position
 * pans within the natural cover overflow (never reveals empty edges); scale adds
 * extra overflow to zoom toward the focal point. Use on a cover <img>/next-image
 * inside an overflow-hidden box.
 */
export function focalStyle(p: Focusable): CSSProperties {
  const fx = p.focal_x ?? 50;
  const fy = p.focal_y ?? 50;
  const z = p.zoom ?? 1;
  return {
    objectFit: "cover",
    objectPosition: `${fx}% ${fy}%`,
    ...(z && z !== 1
      ? { transform: `scale(${z})`, transformOrigin: `${fx}% ${fy}%` }
      : {}),
  };
}
