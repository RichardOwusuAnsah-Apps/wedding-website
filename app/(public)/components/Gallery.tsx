import { SectionHead } from "@/components/ui/SectionHead";
import type { Photo } from "@/lib/types";
import { publicImageUrl } from "@/lib/storage";
import { FramedPhoto } from "@/components/site/FramedPhoto";

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
          <div className="grid-photos reveal">
            {photos.map((p) => (
              <div className="ph" key={p.id}>
                <FramedPhoto
                  src={publicImageUrl("gallery", p.storage_path)}
                  alt={p.caption ?? "Pre-wedding photo"}
                  crop={p}
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
