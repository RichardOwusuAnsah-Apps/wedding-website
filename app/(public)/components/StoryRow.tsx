"use client";

import { useState } from "react";
import Image from "next/image";
import type { StoryChapter } from "@/lib/types";
import { publicImageUrl } from "@/lib/storage";
import { focalStyle } from "@/lib/image";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/**
 * One timeline chapter. Desktop: full side-by-side text always visible (the
 * Read more button is CSS-hidden). Phone: text clamps to ~4 lines to match the
 * photo height, and "Read more" reflows the chapter to full width (full text in
 * the DOM the whole time — accessible, SEO-friendly).
 */
export function StoryRow({ c, i }: { c: StoryChapter; i: number }) {
  const [open, setOpen] = useState(false);
  const textLeft = i % 2 === 0; // chapter 1: text left / photo right

  return (
    <div
      className={`s-row${textLeft ? "" : " s-rev"}${open ? " s-open" : ""}`}
    >
      <div className="s-cell s-photo reveal">
        <div className="s-frame">
          <div className="s-img">
            {c.photo_path ? (
              <Image
                src={publicImageUrl("gallery", c.photo_path)}
                alt={c.title}
                fill
                sizes="(max-width: 600px) 45vw, 300px"
                style={focalStyle(c)}
              />
            ) : (
              <span className="s-ornament" aria-hidden>
                ❧
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="s-medallion reveal" aria-hidden>
        <svg className="s-ring" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="34" />
        </svg>
        <b>{ROMAN[i] ?? String(i + 1)}</b>
      </div>

      <div className="s-cell s-text reveal">
        {c.eyebrow && <span className="eyebrow">{c.eyebrow}</span>}
        <h3>{c.title}</h3>
        {c.body && <p className="s-body">{c.body}</p>}
        <button
          type="button"
          className="s-toggle"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Show less ⌃" : "Read more ⌄"}
        </button>
      </div>
    </div>
  );
}
