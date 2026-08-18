import { SectionHead } from "@/components/ui/SectionHead";
import type { Photo } from "@/lib/types";
import { PhotoGallery } from "@/components/site/PhotoGallery";

export function Gallery({ photos }: { photos: Photo[] }) {
  return (
    <section className="gallery" id="gallery">
      <div className="wrap">
        <SectionHead eyebrow="Moments" title="Pre-Wedding Photos">
          A glimpse of our journey so far, captured in our engagement shoot.
        </SectionHead>
        {photos.length === 0 ? (
          <p className="gallery-empty reveal">
            Our engagement photos will appear here soon.
          </p>
        ) : (
          <PhotoGallery photos={photos} altFallback="Pre-wedding photo" />
        )}
      </div>
    </section>
  );
}
