"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export type Crop = { focal_x: number; focal_y: number; zoom: number };

/**
 * Reusable in-place crop editor. The photo IS the crop area (container is the
 * target aspect, image covers it). Drag to move, wheel/pinch to zoom, arrow
 * keys to nudge, +/- buttons as fallback. Emits {focal_x, focal_y, zoom} on
 * every settle — the parent persists it (gallery: auto-save; party: form state).
 */
export function ImageCropper({
  url,
  aspect,
  value,
  onChange,
  minZoom = 1,
  maxZoom = 4,
}: {
  url: string;
  aspect: number; // width / height
  value: Crop;
  onChange: (c: Crop) => void;
  minZoom?: number;
  maxZoom?: number;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(value.zoom || 1);
  const [imgAspect, setImgAspect] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const img = new window.Image();
    img.onload = () => {
      if (alive) setImgAspect(img.naturalWidth / img.naturalHeight);
    };
    img.src = url;
    return () => {
      alive = false;
    };
  }, [url]);

  // Restore the prior crop window from stored focal point + zoom.
  let initialArea: Area | undefined;
  if (imgAspect != null) {
    const z = value.zoom || 1;
    let w: number, h: number;
    if (imgAspect > aspect) {
      h = 100 / z;
      w = (100 * (aspect / imgAspect)) / z;
    } else {
      w = 100 / z;
      h = (100 * (imgAspect / aspect)) / z;
    }
    initialArea = {
      x: clamp(value.focal_x - w / 2, 0, 100 - w),
      y: clamp(value.focal_y - h / 2, 0, 100 - h),
      width: w,
      height: h,
    };
  }

  const handleComplete = useCallback(
    (area: Area) => {
      const fx = Math.round(clamp(area.x + area.width / 2, 0, 100));
      const fy = Math.round(clamp(area.y + area.height / 2, 0, 100));
      const z = Math.round(zoom * 100) / 100;
      // Skip the no-op sync that fires on mount (matches stored value).
      if (fx === value.focal_x && fy === value.focal_y && Math.abs(z - value.zoom) < 0.01)
        return;
      onChange({ focal_x: fx, focal_y: fy, zoom: z });
    },
    [zoom, value.focal_x, value.focal_y, value.zoom, onChange],
  );

  function onKeyDown(e: React.KeyboardEvent) {
    const step = 14;
    const map: Record<string, () => void> = {
      ArrowLeft: () => setCrop((c) => ({ ...c, x: c.x + step })),
      ArrowRight: () => setCrop((c) => ({ ...c, x: c.x - step })),
      ArrowUp: () => setCrop((c) => ({ ...c, y: c.y + step })),
      ArrowDown: () => setCrop((c) => ({ ...c, y: c.y - step })),
      "+": () => setZoom((z) => clamp(z + 0.1, minZoom, maxZoom)),
      "=": () => setZoom((z) => clamp(z + 0.1, minZoom, maxZoom)),
      "-": () => setZoom((z) => clamp(z - 0.1, minZoom, maxZoom)),
    };
    if (map[e.key]) {
      map[e.key]();
      e.preventDefault();
    }
  }

  if (imgAspect == null) {
    return (
      <div
        className="w-full rounded border border-line bg-sand"
        style={{ aspectRatio: String(aspect) }}
      />
    );
  }

  return (
    <div
      className="relative w-full rounded overflow-hidden border border-line bg-sand select-none cursor-move"
      style={{ aspectRatio: String(aspect) }}
      tabIndex={0}
      role="group"
      aria-label="Reposition photo — drag to move, scroll to zoom, arrow keys to nudge, +/- to zoom"
      onKeyDown={onKeyDown}
    >
      <Cropper
        image={url}
        crop={crop}
        zoom={zoom}
        aspect={aspect}
        minZoom={minZoom}
        maxZoom={maxZoom}
        objectFit="cover"
        showGrid={false}
        zoomWithScroll
        restrictPosition
        initialCroppedAreaPercentages={initialArea}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleComplete}
        style={{ cropAreaStyle: { border: "none", boxShadow: "none" } }}
      />
      <div className="absolute bottom-1.5 right-1.5 flex gap-1 z-10">
        <button
          type="button"
          aria-label="Zoom out"
          className="w-6 h-6 flex items-center justify-center rounded bg-white/90 border border-line text-burgundy text-base leading-none"
          onClick={() => setZoom((z) => clamp(z - 0.2, minZoom, maxZoom))}
        >
          −
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          className="w-6 h-6 flex items-center justify-center rounded bg-white/90 border border-line text-burgundy text-base leading-none"
          onClick={() => setZoom((z) => clamp(z + 0.2, minZoom, maxZoom))}
        >
          +
        </button>
      </div>
    </div>
  );
}
