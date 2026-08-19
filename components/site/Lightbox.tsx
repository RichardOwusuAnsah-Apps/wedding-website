"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { optimizedImageUrl } from "@/lib/storage";

export type LightboxItem = { src: string; caption?: string | null; alt: string };

// full-screen quality, but still resized/compressed from the raw original
const lbSrc = (src: string) => optimizedImageUrl(src, 1920);

// if the optimizer can't handle an image, show the original so it still appears
function fallbackToOriginal(e: React.SyntheticEvent<HTMLImageElement>) {
  const el = e.currentTarget;
  const orig = el.dataset.orig;
  if (orig && el.src !== orig) el.src = orig;
}

const SWIPE_THRESHOLD = 0.18; // fraction of viewport width to commit a swipe
const MAX_SCALE = 4;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Fullscreen photo viewer. The whole (uncropped) image is shown on a dark
 * backdrop. Navigate by swipe / arrows / ← → keys; pinch (two fingers) or
 * double-tap to zoom, then drag to pan; close with ✕, a backdrop tap, or Esc.
 * Body scroll is locked and focus is trapped while open. Reusable across
 * galleries; a three-slide track preloads the neighbours for instant swiping.
 */
export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [dx, setDx] = useState(0); // live horizontal swipe offset (px)
  const [anim, setAnim] = useState(false);
  // zoom state for the current photo
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [zAnim, setZAnim] = useState(false);

  const reduced = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const pan = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const swipe = useRef<{ x: number } | null>(null);
  const moved = useRef(false);
  const lastTap = useRef(0);
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animating = useRef(false);
  const dxR = useRef(0); // synchronous mirror of the swipe offset
  // latest zoom values for use inside pointer handlers
  const sR = useRef(scale);
  sR.current = scale;

  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;
  const zoomed = scale > 1.02;

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const go = useCallback(
    (dir: -1 | 1) => {
        if (animating.current) return; // ignore input mid-transition
      if (dir === -1 && !hasPrev) return;
      if (dir === 1 && !hasNext) return;
      // leaving this photo — drop any zoom so the next one starts fit-to-screen
      setScale(1);
      setTx(0);
      setTy(0);
      if (reduced.current) {
        onIndex(index + dir);
        setDx(0);
        return;
      }
      const w = window.innerWidth;
      animating.current = true;
      setAnim(true);
      setDx(dir === 1 ? -w : w);
      // commit on a timer rather than transitionend (which can miss when the
      // transition is enabled in the same frame as the transform change)
      if (navTimer.current) clearTimeout(navTimer.current);
      navTimer.current = setTimeout(() => {
        onIndex(index + dir);
        setAnim(false);
        setDx(0);
        animating.current = false;
        navTimer.current = null;
      }, 300);
    },
    [hasPrev, hasNext, index, onIndex],
  );

  // clear a pending navigation timer if the lightbox unmounts mid-transition
  useEffect(() => {
    return () => {
      if (navTimer.current) clearTimeout(navTimer.current);
    };
  }, []);

  // keyboard: arrows navigate, Esc closes, Tab trapped
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "Tab") {
        const focusables = overlayRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled])",
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  function twoFingerDist() {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    setAnim(false);
    setZAnim(false);
    if (pointers.current.size === 2) {
      pinch.current = { dist: twoFingerDist(), scale: sR.current };
      swipe.current = null;
      pan.current = null;
    } else if (pointers.current.size === 1) {
      if (sR.current > 1.02) pan.current = { x: e.clientX, y: e.clientY, tx, ty };
      else swipe.current = { x: e.clientX };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2 && pinch.current) {
      moved.current = true;
      setScale(clamp((pinch.current.scale * twoFingerDist()) / pinch.current.dist, 1, MAX_SCALE));
    } else if (pointers.current.size === 1 && pan.current) {
      const dxp = e.clientX - pan.current.x;
      const dyp = e.clientY - pan.current.y;
      if (Math.abs(dxp) > 4 || Math.abs(dyp) > 4) moved.current = true;
      const maxX = ((sR.current - 1) * window.innerWidth) / 2;
      const maxY = ((sR.current - 1) * window.innerHeight) / 2;
      setTx(clamp(pan.current.tx + dxp, -maxX, maxX));
      setTy(clamp(pan.current.ty + dyp, -maxY, maxY));
    } else if (pointers.current.size === 1 && swipe.current) {
      let d = e.clientX - swipe.current.x;
      if (Math.abs(d) > 6) moved.current = true;
      if ((d > 0 && !hasPrev) || (d < 0 && !hasNext)) d *= 0.25;
      dxR.current = d;
      setDx(d);
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    const tapOnImg =
      !moved.current && (e.target as HTMLElement)?.tagName === "IMG";
    const wasSwipe = swipe.current !== null;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size > 0) return;

    // snap zoom back to 1 when it has drifted below threshold
    if (sR.current <= 1.02) {
      setZAnim(true);
      setScale(1);
      setTx(0);
      setTy(0);
    }

    // commit a swipe only when not zoomed — read the ref, not the async state
    if (wasSwipe && sR.current <= 1.02) {
      const w = window.innerWidth;
      const d = dxR.current;
      if (d <= -w * SWIPE_THRESHOLD && hasNext) go(1);
      else if (d >= w * SWIPE_THRESHOLD && hasPrev) go(-1);
      else {
        setAnim(true);
        setDx(0);
      }
    } else if (wasSwipe) {
      setDx(0);
    }
    dxR.current = 0;

    // double-tap to toggle zoom
    if (tapOnImg) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setZAnim(true);
        if (sR.current > 1.02) {
          setScale(1);
          setTx(0);
          setTy(0);
        } else {
          setScale(2.5);
          setTx(0);
          setTy(0);
        }
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }

    swipe.current = null;
    pan.current = null;
  }

  // a plain tap on the dark area (not the photo, not a control) closes
  function onClick(e: React.MouseEvent) {
    if (moved.current) return;
    const t = e.target as HTMLElement;
    if (t.tagName === "IMG" || t.closest("button")) return;
    onClose();
  }

  const current = items[index];
  const curTransform = `translate(${tx}px, ${ty}px) scale(${scale})`;

  return (
    <div
      ref={overlayRef}
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${items.length}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
    >
      <div
        className="lb-track"
        style={{
          transform: `translateX(${zoomed ? 0 : dx}px)`,
          transition: anim ? "transform 0.3s cubic-bezier(0.2,0.7,0.2,1)" : "none",
        }}
      >
        {hasPrev && (
          <div className="lb-slide lb-prev">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lbSrc(items[index - 1].src)} data-orig={items[index - 1].src} alt="" draggable={false} decoding="async" onError={fallbackToOriginal} />
          </div>
        )}
        <div className="lb-slide lb-cur">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lbSrc(current.src)}
            data-orig={current.src}
            alt={current.alt}
            draggable={false}
            decoding="async"
            onError={fallbackToOriginal}
            style={{
              transform: curTransform,
              transition: zAnim ? "transform 0.25s ease" : "none",
              cursor: zoomed ? "grab" : "auto",
            }}
          />
        </div>
        {hasNext && (
          <div className="lb-slide lb-next">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lbSrc(items[index + 1].src)} data-orig={items[index + 1].src} alt="" draggable={false} decoding="async" onError={fallbackToOriginal} />
          </div>
        )}
      </div>

      <button
        ref={closeRef}
        type="button"
        className="lb-close"
        aria-label="Close"
        onClick={onClose}
      >
        ✕
      </button>

      <button
        type="button"
        className="lb-arrow lb-left"
        aria-label="Previous photo"
        disabled={!hasPrev}
        onClick={() => go(-1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="lb-arrow lb-right"
        aria-label="Next photo"
        disabled={!hasNext}
        onClick={() => go(1)}
      >
        ›
      </button>

      <div className="lb-foot">
        <span className="lb-count">
          {index + 1} / {items.length}
        </span>
        {current.caption && <span className="lb-cap">{current.caption}</span>}
      </div>
    </div>
  );
}
