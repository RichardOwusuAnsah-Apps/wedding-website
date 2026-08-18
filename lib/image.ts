import type { CSSProperties } from "react";

export interface Focusable {
  focal_x?: number | null; // 0–100, focal point X
  focal_y?: number | null; // 0–100, focal point Y
  zoom?: number | null; // 1 = fill the frame (cover); <1 shows more, down to the whole image; >1 zooms in
}

/**
 * Cover fallback used for the very first paint, before an image's natural
 * proportions are known (see `spriteStyle`). object-fit: cover fills the frame
 * with the focal point centred — identical to how photos rendered originally,
 * so there is never a flash of the wrong framing for a zoom = 1 photo.
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

/**
 * The real framing model, shared by the admin cropper and the public site so
 * they always agree. Given the image's natural aspect and the frame's aspect,
 * it produces a single continuous transform:
 *
 *   zoom = 1        → the image exactly fills (covers) the frame, as before.
 *   zoom decreasing → the image shrinks smoothly, revealing more of it, all the
 *                     way down to the whole image and smaller (gaps are filled
 *                     by a blurred backdrop, not left blank).
 *   zoom > 1        → zooms further in.
 *
 * There is no fit-mode switch, so every size in between is reachable. Because
 * zoom = 1 still means "cover", existing photos render unchanged with no
 * migration. Everything is expressed in percentages of the frame, so it is
 * resolution-independent — only the two aspect ratios are needed.
 */
export function spriteStyle(
  p: Focusable,
  imgAspect: number, // natural width / height
  frameAspect: number, // frame width / height
): CSSProperties {
  const fx = p.focal_x ?? 50;
  const fy = p.focal_y ?? 50;
  const zoom = p.zoom ?? 1;

  // K is the scale (relative to a "contain" baseline) at which the image just
  // covers the frame — i.e. what zoom = 1 must map to.
  const K = coverMultiplier(imgAspect, frameAspect);
  const S = zoom * K; // display scale relative to contain

  // Overflow fraction beyond the frame on each axis (>0 means it overflows and
  // can be panned; ≤0 means it is inset and centred, nothing to pan).
  const ox = S * Math.min(1, imgAspect / frameAspect) - 1;
  const oy = S * Math.min(1, frameAspect / imgAspect) - 1;
  const tx = ox > 0 ? (50 - fx) * ox : 0; // % of frame width
  const ty = oy > 0 ? (50 - fy) * oy : 0; // % of frame height

  return {
    objectFit: "contain",
    transform: `translate(${round(tx)}%, ${round(ty)}%) scale(${round(S)})`,
    transformOrigin: "center center",
  };
}

/** Scale (over a contain baseline) at which the image covers the frame. ≥ 1. */
export function coverMultiplier(imgAspect: number, frameAspect: number): number {
  return Math.max(imgAspect / frameAspect, frameAspect / imgAspect);
}

const round = (n: number) => Math.round(n * 1000) / 1000;
