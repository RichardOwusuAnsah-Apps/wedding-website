"use client";

import { useEffect, useState } from "react";
import type { Photo } from "@/lib/types";
import { publicImageUrl } from "@/lib/storage";
import { FramedPhoto } from "@/components/site/FramedPhoto";
import { Lightbox, type LightboxItem } from "@/components/site/Lightbox";

const PHONE_COLS = [1, 2, 3, 4];
const LAPTOP_COLS = [2, 3, 4, 5];
const PHONE_DEFAULT = 2;
const LAPTOP_DEFAULT = 3;

/**
 * A gallery grid with two viewer controls, reused by the pre- and post-wedding
 * sections: a segmented "photos per row" toggle (1–4 on phones, 2–5 on laptops)
 * and a fullscreen Lightbox opened by tapping any tile. Tiles stay uniform
 * squares cropped to their saved focal point; the lightbox shows the whole photo.
 */
export function PhotoGallery({
  photos,
  altFallback,
}: {
  photos: Photo[];
  altFallback: string;
}) {
  // start with the laptop default; correct to the phone default after mount
  const [isPhone, setIsPhone] = useState(false);
  const [cols, setCols] = useState(LAPTOP_DEFAULT);
  const [userPicked, setUserPicked] = useState(false);
  const [openAt, setOpenAt] = useState<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => {
      setIsPhone(mq.matches);
      // only steer the default until the viewer picks a value themselves
      setCols((c) => (userPicked ? clampToDevice(c, mq.matches) : mq.matches ? PHONE_DEFAULT : LAPTOP_DEFAULT));
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [userPicked]);

  const options = isPhone ? PHONE_COLS : LAPTOP_COLS;
  const gap = isPhone ? 10 : 18;

  const items: LightboxItem[] = photos.map((p) => ({
    src: publicImageUrl("gallery", p.storage_path),
    caption: p.caption,
    alt: p.caption ?? altFallback,
  }));

  return (
    <>
      <div className="col-control reveal" role="group" aria-label="Photos per row">
        <span className="col-label">Per row</span>
        {options.map((n) => (
          <button
            key={n}
            type="button"
            className={`col-seg${cols === n ? " active" : ""}`}
            aria-pressed={cols === n}
            onClick={() => {
              setCols(n);
              setUserPicked(true);
            }}
          >
            {n}
          </button>
        ))}
      </div>

      <div
        className="grid-photos reveal"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gap}px` }}
      >
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className="ph ph-tap"
            aria-label={`Open photo ${i + 1}${p.caption ? `: ${p.caption}` : ""}`}
            onClick={() => setOpenAt(i)}
          >
            <FramedPhoto
              src={publicImageUrl("gallery", p.storage_path)}
              alt={p.caption ?? altFallback}
              crop={p}
            />
            {p.caption && <span className="lbl">{p.caption}</span>}
          </button>
        ))}
      </div>

      {openAt !== null && (
        <Lightbox
          items={items}
          index={openAt}
          onIndex={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </>
  );
}

function clampToDevice(c: number, phone: boolean): number {
  const opts = phone ? PHONE_COLS : LAPTOP_COLS;
  return Math.min(Math.max(c, opts[0]), opts[opts.length - 1]);
}
