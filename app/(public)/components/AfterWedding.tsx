import Image from "next/image";
import { SectionHead } from "@/components/ui/SectionHead";
import type { Photo } from "@/lib/types";
import { publicImageUrl } from "@/lib/storage";
import { focalStyle } from "@/lib/image";

/**
 * Post-wedding gallery. A simple date gate hides it until the wedding date
 * passes; afterwards it shows photos where gallery = 'post_wedding'.
 * Public uploads are intentionally not offered (Richie uploads via admin).
 */
export function AfterWedding({
  weddingDate,
  photos,
}: {
  weddingDate: string;
  photos: Photo[];
}) {
  const target = new Date(weddingDate).getTime();
  const open = Number.isFinite(target) ? Date.now() >= target : false;

  return (
    <section className="after" id="after">
      <div className="wrap">
        <SectionHead eyebrow="After the celebration" title="Share Your Photos">
          {open
            ? "Relive the day with us — moments captured throughout the celebration."
            : "Captured a moment from our day? This gallery opens after the wedding, with photos and videos from the celebration."}
        </SectionHead>

        {!open ? (
          <div className="after-locked reveal">Opens after 24 October 2026</div>
        ) : photos.length === 0 ? (
          <div className="after-locked reveal">Photos coming soon</div>
        ) : (
          <div className="grid-photos reveal">
            {photos.map((p) => (
              <div className="ph" key={p.id}>
                <Image
                  src={publicImageUrl("gallery", p.storage_path)}
                  alt={p.caption ?? "Wedding photo"}
                  fill
                  sizes="(max-width: 900px) 50vw, 25vw"
                  style={focalStyle(p)}
                />
                {p.caption && <span className="lbl">{p.caption}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
