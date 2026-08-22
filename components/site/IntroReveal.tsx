"use client";

import { useEffect, useState } from "react";

// Cinematic intro: gallery photos rush toward the viewer one after another —
// each starts tiny (far away), zooms up as if thrown at you, then vanishes as
// the next follows. When the sequence ends the dark overlay fades out to reveal
// the landing page. Plays on every full load / refresh.

const MAX = 6; // how many photos to fling
const DUR = 640; // ms each photo is in flight
const STAGGER = 320; // ms between one photo starting and the next
const TEXT_HOLD = 2100; // ms the welcome card stays on the dark stage
const FADE = 600; // ms overlay takes to fade away at the end

export type IntroImage = { small: string; full: string };

/** One flung photo. Uses the small resized image, falls back to the original. */
function IntroPhoto({ image, index }: { image: IntroImage; index: number }) {
  const [src, setSrc] = useState(image.small);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="intro-pop"
      onError={() => {
        if (src !== image.full) setSrc(image.full);
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

export function IntroReveal({ images }: { images: IntroImage[] }) {
  const pics = images.slice(0, MAX);
  const [showText, setShowText] = useState(false); // welcome card on the stage
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

    const photosTotal = (pics.length - 1) * STAGGER + DUR;
    document.body.style.overflow = "hidden"; // no scrolling behind the intro
    const tText = setTimeout(() => setShowText(true), photosTotal);
    const tDone = setTimeout(() => setDone(true), photosTotal + TEXT_HOLD);
    const tGone = setTimeout(
      () => setGone(true),
      photosTotal + TEXT_HOLD + FADE,
    );
    return () => {
      clearTimeout(tText);
      clearTimeout(tDone);
      clearTimeout(tGone);
      document.body.style.overflow = "";
    };
  }, [pics.length]);

  if (gone || pics.length === 0) return null;

  return (
    <div className={`intro-overlay${done ? " intro-out" : ""}`} aria-hidden="true">
      {!showText &&
        pics.map((image, i) => (
          <IntroPhoto key={i} image={image} index={i} />
        ))}
      {showText && (
        <div className="intro-welcome">
          <span className="iw-eyebrow">Welcome</span>
          <h2 className="iw-title">The Richie and Shula Affair</h2>
          <div className="iw-tag">#ShulasealedtheAnsah</div>
        </div>
      )}
    </div>
  );
}
