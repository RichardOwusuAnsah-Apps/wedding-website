import type { CSSProperties } from "react";

export interface Focusable {
  focal_x?: number | null; // 0–100, object-position X
  focal_y?: number | null; // 0–100, object-position Y
  zoom?: number | null; // < 1 = fit the whole image (letterboxed); ≥ 1 = cover crop
}

/**
 * CSS for a framed image with an admin-chosen focal point + zoom. Two regimes,
 * keyed only on the zoom value so this works identically on the server-rendered
 * public site (no image dimensions needed):
 *
 *   zoom ≥ 1 — object-fit: cover. The image fills the frame; object-position
 *     pans within the cover overflow and scale() zooms further toward the focal
 *     point. This is the original behaviour, unchanged for existing photos.
 *   zoom < 1 — object-fit: contain. The whole image is shown (letterboxed),
 *     scaled down by `zoom` so it can be made as small as desired. Cover crops
 *     the image before scaling, so zooming out this way is the only way to
 *     reveal the parts a cover crop would hide.
 *
 * Use on an <img>/next-image inside an overflow-hidden box.
 */
export function focalStyle(p: Focusable): CSSProperties {
  const fx = p.focal_x ?? 50;
  const fy = p.focal_y ?? 50;
  const z = p.zoom ?? 1;
  return {
    objectFit: z < 1 ? "contain" : "cover",
    objectPosition: `${fx}% ${fy}%`,
    ...(z && z !== 1
      ? { transform: `scale(${z})`, transformOrigin: `${fx}% ${fy}%` }
      : {}),
  };
}
