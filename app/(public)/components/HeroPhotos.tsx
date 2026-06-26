import Image from "next/image";
import type { Photo } from "@/lib/types";
import { publicImageUrl } from "@/lib/storage";
import { focalStyle } from "@/lib/image";

const SLOTS = ["hp1", "hp2", "hp3", "hp4"] as const;

/**
 * Four tilted "hanging" frames, one per hero corner. Fills slots from the
 * admin-chosen featured photos (in sort order); empty slots show an elegant
 * placeholder frame. Decorative — the accessible copies live in the gallery.
 * Fade-in + hover-straighten + reduced-motion are all handled in CSS.
 */
export function HeroPhotos({ photos }: { photos: Photo[] }) {
  return (
    <>
      {SLOTS.map((slot, i) => {
        const photo = photos[i];
        return (
          <div className={`hphoto ${slot}`} key={slot} aria-hidden="true">
            <div className="frame">
              <div className="inner">
                {photo ? (
                  <Image
                    src={publicImageUrl("gallery", photo.storage_path)}
                    alt=""
                    fill
                    sizes="138px"
                    style={focalStyle(photo)}
                  />
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
