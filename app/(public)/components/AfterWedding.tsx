import { SectionHead } from "@/components/ui/SectionHead";
import type { Photo } from "@/lib/types";
import { PhotoGallery } from "@/components/site/PhotoGallery";

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
  const hasDate = Number.isFinite(target);
  const open = hasDate ? Date.now() >= target : false;
  const opensLabel = hasDate
    ? `Opens after ${new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(target)}`
    : "Opens after the wedding";

  return (
    <section className="after" id="after">
      <div className="wrap">
        <SectionHead eyebrow="After the celebration" title="Share Your Photos">
          {open
            ? "Relive the day with us — moments captured throughout the celebration."
            : "Captured a moment from our day? This gallery opens after the wedding, with photos and videos from the celebration."}
        </SectionHead>

        {!open ? (
          <div className="after-locked reveal">{opensLabel}</div>
        ) : photos.length === 0 ? (
          <div className="after-locked reveal">Photos coming soon</div>
        ) : (
          <PhotoGallery photos={photos} altFallback="Wedding photo" />
        )}
      </div>
    </section>
  );
}
