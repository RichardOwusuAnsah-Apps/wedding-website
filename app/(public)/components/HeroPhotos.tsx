"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/types";
import { publicImageUrl, optimizedImageUrl } from "@/lib/storage";
import { FramedPhoto } from "@/components/site/FramedPhoto";

const SLOTS = ["hp1", "hp2", "hp3", "hp4"] as const;
const ROTATE_MS = 20000;
const SLOT_PX = 384;

/**
 * Four tilted "hanging" hero frames. When more than four photos are featured
 * the set rotates: every 20s the window slides forward by one — the corner-1
 * photo leaves, the others shift toward it, and the next featured photo enters
 * at corner 4 (each corner cross-fades). Loops forever. With four or fewer
 * featured photos it stays static (nothing new to cycle in).
 */
export function HeroPhotos({ photos }: { photos: Photo[] }) {
  const n = photos.length;
  const rotates = n > SLOTS.length;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!rotates) return;
    const id = setInterval(() => setTick((t) => t + 1), ROTATE_MS);
    return () => clearInterval(id);
  }, [rotates]);

  // preload the photo about to enter so its cross-fade is instant
  useEffect(() => {
    if (!rotates) return;
    const next = photos[(tick + SLOTS.length) % n];
    if (next) {
      const img = new window.Image();
      img.src = optimizedImageUrl(
        publicImageUrl("gallery", next.storage_path),
        SLOT_PX,
      );
    }
  }, [rotates, tick, photos, n]);

  return (
    <>
      {SLOTS.map((slot, i) => {
        const photo = n > 0 ? photos[(tick + i) % n] : undefined;
        return (
          <div className={`hphoto ${slot}`} key={slot} aria-hidden="true">
            <div className="frame">
              <div className="inner">
                {photo ? (
                  <HeroSlotPhoto photo={photo} />
                ) : (
                  <>
                    <span className="cam">❧</span>
                    <small>Your photo</small>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

/** One corner's photo, cross-fading whenever the rotation swaps it out. */
function HeroSlotPhoto({ photo }: { photo: Photo }) {
  const [layers, setLayers] = useState<{ photo: Photo; key: number }[]>(() => [
    { photo, key: 0 },
  ]);
  const keyRef = useRef(0);
  const curId = useRef(photo.id);

  useEffect(() => {
    if (photo.id === curId.current) return;
    curId.current = photo.id;
    keyRef.current += 1;
    const entry = { photo, key: keyRef.current };
    setLayers((prev) => [...prev, entry]); // new fades in on top of the old
    const t = setTimeout(() => setLayers([entry]), 900); // then drop the old
    return () => clearTimeout(t);
  }, [photo]);

  return (
    <>
      {layers.map((l, i) => (
        <div
          key={l.key}
          className="hero-slot-layer"
          style={
            i === layers.length - 1 && layers.length > 1
              ? { animation: "heroSlotIn 0.85s ease forwards" }
              : undefined
          }
        >
          <FramedPhoto
            src={publicImageUrl("gallery", l.photo.storage_path)}
            alt=""
            crop={l.photo}
            sizePx={SLOT_PX}
          />
        </div>
      ))}
    </>
  );
}
