"use client";

import { useEffect } from "react";

/**
 * Adds the `.in` class to every `.reveal` element as it scrolls into view
 * (IntersectionObserver), matching the mockup's scroll-reveal. Mounted once in
 * the public layout. prefers-reduced-motion is handled in CSS (always visible).
 */
export function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal:not(.in)"),
    );
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
