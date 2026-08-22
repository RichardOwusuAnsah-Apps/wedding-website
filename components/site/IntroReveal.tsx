"use client";

import { useEffect, useState } from "react";
import { optimizedImageUrl } from "@/lib/storage";

// Cinematic intro: gallery photos rush toward the viewer one after another —
// each starts tiny (far away), zooms up as if thrown at you, then vanishes as
// the next follows. When the sequence ends the dark overlay fades out to reveal
// the landing page. Plays on every full load / refresh.

const MAX = 6; // how many photos to fling
const DUR = 660; // ms each photo is in flight
const STAGGER = 340; // ms between one photo starting and the next
const FADE = 550; // ms overlay takes to fade away at the end

/** One flung photo. Tries the fast optimized URL, falls back to the original. */
function IntroPhoto({ src, index }: { src: string; index: number }) {
  const [current, setCurrent] = useState(() => optimizedImageUrl(src, 720));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt=""
      className="intro-pop"
      onError={() => {
        if (current !== src) setCurrent(src); // optimizer failed -> original
      }}
      style={{
        animationDelay: `${index * STAGGER}ms`,
        animationDuration: `${DUR}ms`,
        // slight alternating tilt so each throw feels alive
        ["--introRot" as string]: `${index % 2 === 0 ? -7 : 7}deg`,
      }}
    />
  );
}

export function IntroReveal({ images }: { images: string[] }) {
  const pics = images.slice(0, MAX);
  const [done, setDone] = useState(false); // start the overlay fade
  const [gone, setGone] = useState(false); // remove from the DOM entirely

  useEffect(() => {
    if (pics.length === 0) {
      setGone(true);
      return;
    }
    // Respect users who ask for reduced motion — skip the flourish.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setGone(true);
      return;
    }

    const total = (pics.length - 1) * STAGGER + DUR;
    document.body.style.overflow = "hidden"; // no scrolling behind the intro
    const t1 = setTimeout(() => setDone(true), total);
    const t2 = setTimeout(() => setGone(true), total + FADE);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = "";
    };
  }, [pics.length]);

  if (gone || pics.length === 0) return null;

  return (
    <div className={`intro-overlay${done ? " intro-out" : ""}`} aria-hidden="true">
      {pics.map((src, i) => (
        <IntroPhoto key={i} src={src} index={i} />
      ))}
    </div>
  );
}
