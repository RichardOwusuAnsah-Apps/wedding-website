"use client";

import { useEffect } from "react";

/**
 * Makes an arrival at /#some-section actually land on that section.
 *
 * The browser jumps to the fragment at first paint, but this page keeps moving
 * underneath it: the cinematic intro holds `body { overflow: hidden }` for
 * several seconds, and gallery/party images finish loading afterwards. By the
 * time things settle the target has drifted, leaving the guest parked in the
 * section above it — which is what the invitation's /#rsvp link hit on phones.
 *
 * So: re-pin the target every frame until it stops moving (or we run out of
 * budget), and get out of the way the moment the guest scrolls themselves.
 */

const BUDGET_MS = 15000; // long enough to outlast the intro + image loading
const STABLE_MS = 600; // target must hold still this long before we let go
const SLOP_PX = 2; // sub-pixel rounding is not drift

/** Any of these means the guest has taken over — stop repositioning. */
const TAKEOVER = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

export function HashLanding() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;

    let frame = 0;
    let settledAt = 0;
    const started = performance.now();

    const release = () => {
      cancelAnimationFrame(frame);
      for (const type of TAKEOVER) window.removeEventListener(type, release);
    };
    // The guest is in charge the instant they touch the page.
    for (const type of TAKEOVER) {
      window.addEventListener(type, release, { passive: true });
    }

    const tick = () => {
      const now = performance.now();
      const el = document.getElementById(id);

      if (!el || now - started > BUDGET_MS) return release();

      // Scroll is locked while the intro plays — nothing we do lands yet.
      if (getComputedStyle(document.body).overflow === "hidden") {
        settledAt = 0;
        frame = requestAnimationFrame(tick);
        return;
      }

      // scrollIntoView honours scroll-margin-top; "instant" opts out of the
      // page's `scroll-behavior: smooth`, which would fight this loop.
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      const drift = el.getBoundingClientRect().top - margin;

      if (Math.abs(drift) > SLOP_PX) {
        el.scrollIntoView({ behavior: "instant" as ScrollBehavior });
        settledAt = 0;
      } else if (settledAt === 0) {
        settledAt = now;
      } else if (now - settledAt > STABLE_MS) {
        return release();
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return release;
  }, []);

  return null;
}
