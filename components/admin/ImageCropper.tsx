"use client";

import { useEffect, useRef, useState } from "react";
import { focalStyle } from "@/lib/image";

export type Crop = { focal_x: number; focal_y: number; zoom: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Shared in-place crop editor. The photo IS the crop area (container = target
 * aspect, image covers it). Drag to move, wheel/pinch to zoom, +/- + arrow
 * keys as fallback; edges clamp so there's never a gap. Auto-saves on release.
 *
 * CRITICAL: the live preview renders via the SAME `focalStyle` helper the
 * public site uses, so what you frame here is what guests see at that aspect.
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
  const natural = useRef<{ w: number; h: number } | null>(null);
  const [fx, setFx] = useState(value.focal_x ?? 50);
  const [fy, setFy] = useState(value.focal_y ?? 50);
  const [zoom, setZoom] = useState(value.zoom ?? 1);

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

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      natural.current = { w: img.naturalWidth, h: img.naturalHeight };
    };
    img.src = url;
  }, [url]);

  function overflowPx() {
    const el = frameRef.current;
    const nat = natural.current;
    if (!el || !nat) return { ox: 1, oy: 1 };
    const Cw = el.clientWidth;
    const Ch = el.clientHeight;
    const s = Math.max(Cw / nat.w, Ch / nat.h);
    const ox = Math.max(1, nat.w * s - Cw) + (zR.current - 1) * Cw;
    const oy = Math.max(1, nat.h * s - Ch) + (zR.current - 1) * Ch;
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
    if ((e.target as HTMLElement).closest("button")) return; // let +/- buttons work
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
      setZoom(clamp((pinchStart.current.zoom * dist) / pinchStart.current.dist, 1, maxZoom));
    } else if (dragStart.current) {
      const { ox, oy } = overflowPx();
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setFx(clamp(dragStart.current.fx - (dx / ox) * 100, 0, 100));
      setFy(clamp(dragStart.current.fy - (dy / oy) * 100, 0, 100));
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
      setZoom((z) => clamp(z - e.deltaY * 0.0015, 1, maxZoom));
      commitSoon();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxZoom]);

  function onKeyDown(e: React.KeyboardEvent) {
    const step = 2;
    const acts: Record<string, () => void> = {
      ArrowLeft: () => setFx((v) => clamp(v - step, 0, 100)),
      ArrowRight: () => setFx((v) => clamp(v + step, 0, 100)),
      ArrowUp: () => setFy((v) => clamp(v - step, 0, 100)),
      ArrowDown: () => setFy((v) => clamp(v + step, 0, 100)),
      "+": () => setZoom((z) => clamp(z + 0.1, 1, maxZoom)),
      "=": () => setZoom((z) => clamp(z + 0.1, 1, maxZoom)),
      "-": () => setZoom((z) => clamp(z - 0.1, 1, maxZoom)),
    };
    if (acts[e.key]) {
      acts[e.key]();
      e.preventDefault();
      commitSoon();
    }
  }

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={focalStyle({ focal_x: fx, focal_y: fy, zoom })}
      />
      <div className="absolute bottom-1.5 right-1.5 z-10 flex gap-1">
        <button
          type="button"
          aria-label="Zoom out"
          className="w-6 h-6 flex items-center justify-center rounded bg-white/90 border border-line text-burgundy leading-none"
          onClick={() => {
            setZoom((z) => clamp(z - 0.2, 1, maxZoom));
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
            setZoom((z) => clamp(z + 0.2, 1, maxZoom));
            commitSoon();
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
