"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { coverMultiplier, focalStyle, spriteStyle } from "@/lib/image";

export type Crop = { focal_x: number; focal_y: number; zoom: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Smallest on-screen size (as a fraction of the frame) the image may shrink to.
const MIN_DISPLAY = 0.15;

/**
 * In-place crop editor. What you frame here is exactly what the public site
 * shows: the same `spriteStyle` model runs in both. zoom = 1 fills the frame
 * (cover); zooming out shrinks the photo continuously — every size in between is
 * reachable — revealing the whole image, with a blurred copy filling the frame
 * behind it instead of blank space. Drag to move, wheel/pinch/±/arrows to adjust.
 * Auto-saves on release.
 */
export function ImageCropper({
  url,
  aspect,
  value,
  onChange,
  maxZoom = 4,
}: {
  url: string;
  aspect: number; // width / height
  value: Crop;
  onChange: (c: Crop) => void;
  maxZoom?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [fx, setFx] = useState(value.focal_x ?? 50);
  const [fy, setFy] = useState(value.focal_y ?? 50);
  const [zoom, setZoom] = useState(value.zoom ?? 1);
  // natural image aspect + measured frame aspect drive the framing math
  const [imgAspect, setImgAspect] = useState<number | null>(null);
  const [frameAspect, setFrameAspect] = useState<number>(aspect);

  const fxR = useRef(fx);
  const fyR = useRef(fy);
  const zR = useRef(zoom);
  fxR.current = fx;
  fyR.current = fy;
  zR.current = zoom;

  const committed = useRef<Crop>({
    focal_x: value.focal_x ?? 50,
    focal_y: value.focal_y ?? 50,
    zoom: value.zoom ?? 1,
  });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dragStart = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null);
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load the natural aspect
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight)
        setImgAspect(img.naturalWidth / img.naturalHeight);
    };
    img.src = url;
  }, [url]);

  // keep the frame aspect in sync (in case CSS differs from the nominal aspect)
  useLayoutEffect(() => {
    const el = frameRef.current;
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

  const K = imgAspect ? coverMultiplier(imgAspect, frameAspect) : 1;
  const minZoom = MIN_DISPLAY / K; // reach the whole image (at 1/K) and smaller

  // overflow of the displayed image beyond the frame, in px, per axis
  function overflowPx() {
    const el = frameRef.current;
    if (!el || !imgAspect) return { ox: 0, oy: 0 };
    const S = zR.current * K;
    const ox = Math.max(0, S * Math.min(1, imgAspect / frameAspect) - 1) * el.clientWidth;
    const oy = Math.max(0, S * Math.min(1, frameAspect / imgAspect) - 1) * el.clientHeight;
    return { ox, oy };
  }

  function commit() {
    const c = {
      focal_x: Math.round(fxR.current),
      focal_y: Math.round(fyR.current),
      zoom: Math.round(zR.current * 100) / 100,
    };
    if (
      c.focal_x === committed.current.focal_x &&
      c.focal_y === committed.current.focal_y &&
      Math.abs(c.zoom - committed.current.zoom) < 0.005
    )
      return;
    committed.current = c;
    onChange(c);
  }
  function commitSoon() {
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(commit, 350);
  }

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return; // let ± buttons work
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      dragStart.current = { x: e.clientX, y: e.clientY, fx, fy };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: zR.current };
      dragStart.current = null;
    }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size >= 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      setZoom(clamp((pinchStart.current.zoom * dist) / pinchStart.current.dist, minZoom, maxZoom));
    } else if (dragStart.current) {
      const { ox, oy } = overflowPx();
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      // pan only along axes that actually overflow the frame
      if (ox > 0) setFx(clamp(dragStart.current.fx - (dx / ox) * 100, 0, 100));
      if (oy > 0) setFy(clamp(dragStart.current.fy - (dy / oy) * 100, 0, 100));
    }
  }
  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      dragStart.current = null;
      commit();
    }
  }

  // wheel zoom needs a non-passive listener to preventDefault page scroll
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => clamp(z - e.deltaY * 0.0015 * z, minZoom, maxZoom));
      commitSoon();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxZoom, minZoom]);

  function onKeyDown(e: React.KeyboardEvent) {
    const step = 2;
    const zStep = () => zR.current * 0.08; // proportional, so ± feel even at any zoom
    const acts: Record<string, () => void> = {
      ArrowLeft: () => setFx((v) => clamp(v - step, 0, 100)),
      ArrowRight: () => setFx((v) => clamp(v + step, 0, 100)),
      ArrowUp: () => setFy((v) => clamp(v - step, 0, 100)),
      ArrowDown: () => setFy((v) => clamp(v + step, 0, 100)),
      "+": () => setZoom((z) => clamp(z + zStep(), minZoom, maxZoom)),
      "=": () => setZoom((z) => clamp(z + zStep(), minZoom, maxZoom)),
      "-": () => setZoom((z) => clamp(z - zStep(), minZoom, maxZoom)),
    };
    if (acts[e.key]) {
      acts[e.key]();
      e.preventDefault();
      commitSoon();
    }
  }

  const ready = imgAspect != null;
  const fgStyle = ready
    ? spriteStyle({ focal_x: fx, focal_y: fy, zoom }, imgAspect, frameAspect)
    : focalStyle({ focal_x: fx, focal_y: fy, zoom });

  return (
    <div
      ref={frameRef}
      className="relative w-full overflow-hidden rounded border border-line bg-sand select-none cursor-move touch-none outline-none focus:ring-2 focus:ring-gold"
      style={{ aspectRatio: String(aspect) }}
      tabIndex={0}
      role="group"
      aria-label="Reposition photo — drag to move, scroll to zoom, arrow keys to nudge, plus/minus to zoom"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      {/* blurred backdrop — fills the frame when the photo is zoomed out */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          objectFit: "cover",
          filter: "blur(18px) brightness(0.96)",
          transform: "scale(1.12)",
        }}
      />
      {/* foreground photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={fgStyle}
      />
      <div className="absolute bottom-1.5 right-1.5 z-10 flex gap-1">
        <button
          type="button"
          aria-label="Zoom out"
          className="w-6 h-6 flex items-center justify-center rounded bg-white/90 border border-line text-burgundy leading-none"
          onClick={() => {
            setZoom((z) => clamp(z - z * 0.12, minZoom, maxZoom));
            commitSoon();
          }}
        >
          −
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          className="w-6 h-6 flex items-center justify-center rounded bg-white/90 border border-line text-burgundy leading-none"
          onClick={() => {
            setZoom((z) => clamp(z + z * 0.12, minZoom, maxZoom));
            commitSoon();
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
