"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Focusable } from "@/lib/image";
import { focalStyle, spriteStyle } from "@/lib/image";
import { optimizedImageUrl } from "@/lib/storage";

/**
 * Renders a photo inside its (position:relative, overflow:hidden) frame exactly
 * the way the admin cropper frames it: a continuously-scalable foreground over a
 * blurred copy of the same photo, so a zoomed-out image shows the whole picture
 * with no blank space. Drop-in replacement for a `<Image fill style={focalStyle}>`.
 *
 * Framing needs the image's real proportions and the frame's, so both are
 * measured in the browser. Until they are known it paints the cover fallback,
 * which is identical for the common zoom = 1 photos — no flash.
 */
export function FramedPhoto({
  src,
  alt,
  crop,
  sizePx = 828,
}: {
  src: string;
  alt: string;
  crop: Focusable;
  sizePx?: number; // rough displayed width; picks the optimizer size to fetch
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [imgAspect, setImgAspect] = useState<number | null>(null);
  const [frameAspect, setFrameAspect] = useState<number | null>(null);
  // one resized copy, reused for both layers; fall back to the original if the
  // optimizer can't handle it (e.g. a very large source) so nothing ever breaks
  const [optFailed, setOptFailed] = useState(false);
  const shownSrc = optFailed ? src : optimizedImageUrl(src, sizePx);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setFrameAspect(r.width / r.height);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ready = imgAspect != null && frameAspect != null;
  const fgStyle = ready
    ? spriteStyle(crop, imgAspect, frameAspect)
    : focalStyle(crop);

  return (
    <div
      ref={rootRef}
      className="framed"
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    >
      {/* blurred backdrop — fills the frame, hidden when the photo covers it */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={shownSrc}
        alt=""
        aria-hidden
        draggable={false}
        loading="lazy"
        decoding="async"
        onError={() => setOptFailed(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(18px) brightness(0.96)",
          transform: "scale(1.12)",
          pointerEvents: "none",
        }}
      />
      {/* foreground photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={shownSrc}
        alt={alt}
        draggable={false}
        loading="lazy"
        decoding="async"
        onError={() => setOptFailed(true)}
        // ref catches already-cached images (whose onLoad fires before React
        // attaches the handler); onLoad catches the rest.
        ref={(el) => {
          if (el && el.complete && el.naturalWidth && el.naturalHeight)
            setImgAspect(el.naturalWidth / el.naturalHeight);
        }}
        onLoad={(e) => {
          const el = e.currentTarget;
          if (el.naturalWidth && el.naturalHeight)
            setImgAspect(el.naturalWidth / el.naturalHeight);
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          ...fgStyle,
        }}
      />
    </div>
  );
}
