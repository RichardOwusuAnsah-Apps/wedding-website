import Image from "next/image";
import { SectionHead } from "@/components/ui/SectionHead";
import type { Photo } from "@/lib/types";
import { publicImageUrl } from "@/lib/storage";

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
            {photos.map((p, i) => (
              <div className={`ph${i % 5 === 0 ? " tall" : ""}`} key={p.id}>
                <Image
                  src={publicImageUrl("gallery", p.storage_path)}
                  alt={p.caption ?? "Pre-wedding photo"}
                  fill
                  sizes="(max-width: 900px) 50vw, 25vw"
                  style={{ objectFit: "cover" }}
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
