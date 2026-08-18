"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type LightboxItem = { src: string; caption?: string | null; alt: string };

const SWIPE_THRESHOLD = 0.18; // fraction of viewport width to commit a swipe

/**
 * Fullscreen photo viewer. The whole (uncropped) image is shown on a dark
 * backdrop; navigate by swipe (touch), on-screen arrows, or ← / → keys; close
 * with the ✕, a backdrop tap, or Esc. Stops at the first/last photo. Body
 * scroll is locked and focus is trapped while open. Reusable across galleries.
 *
 * A three-slide track (previous / current / next) gives a smooth slide and
 * preloads the neighbours so navigation feels instant. prefers-reduced-motion
 * cuts instead of sliding.
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
  const [dx, setDx] = useState(0); // live horizontal offset (px)
  const [anim, setAnim] = useState(false);
  const reduced = useRef(false);
  const drag = useRef<{ x: number; active: boolean } | null>(null);
  const moved = useRef(false); // did the last pointer interaction drag?

  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

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

  // focus the dialog on open
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (dir === -1 && !hasPrev) return;
      if (dir === 1 && !hasNext) return;
      if (reduced.current) {
        onIndex(index + dir);
        setDx(0);
        return;
      }
      const w = window.innerWidth;
      setAnim(true);
      setDx(dir === 1 ? -w : w); // slide out toward the incoming photo
    },
    [hasPrev, hasNext, index, onIndex],
  );

  // when the slide-out animation ends, commit the index and snap back
  function onTrackTransitionEnd() {
    if (!anim) return;
    if (dx < 0 && hasNext) onIndex(index + 1);
    else if (dx > 0 && hasPrev) onIndex(index - 1);
    setAnim(false);
    setDx(0);
  }

  // keyboard: arrows navigate, Esc closes, Tab is trapped
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
          'button:not([disabled])',
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

  // swipe (touch / pointer drag)
  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { x: e.clientX, active: true };
    moved.current = false;
    setAnim(false);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current?.active) return;
    let d = e.clientX - drag.current.x;
    if (Math.abs(d) > 6) moved.current = true;
    if ((d > 0 && !hasPrev) || (d < 0 && !hasNext)) d *= 0.25; // resist at ends
    setDx(d);
  }
  function onPointerUp() {
    if (!drag.current?.active) return;
    drag.current = null;
    const w = window.innerWidth;
    if (dx <= -w * SWIPE_THRESHOLD && hasNext) go(1);
    else if (dx >= w * SWIPE_THRESHOLD && hasPrev) go(-1);
    else {
      setAnim(true);
      setDx(0); // snap back
    }
  }

  // a plain tap on the dark area (not the photo, not a control) closes
  function onClick(e: React.MouseEvent) {
    if (moved.current) return;
    const t = e.target as HTMLElement;
    if (t.tagName === "IMG" || t.closest("button")) return;
    onClose();
  }

  const current = items[index];

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
          transform: `translateX(${dx}px)`,
          transition: anim ? "transform 0.3s cubic-bezier(0.2,0.7,0.2,1)" : "none",
        }}
        onTransitionEnd={onTrackTransitionEnd}
      >
        {hasPrev && (
          <div className="lb-slide lb-prev">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={items[index - 1].src} alt="" draggable={false} />
          </div>
        )}
        <div className="lb-slide lb-cur">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.src} alt={current.alt} draggable={false} />
        </div>
        {hasNext && (
          <div className="lb-slide lb-next">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={items[index + 1].src} alt="" draggable={false} />
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
