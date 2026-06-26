import Image from "next/image";
import type { StoryChapter } from "@/lib/types";
import { publicImageUrl } from "@/lib/storage";
import { focalStyle } from "@/lib/image";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function PhotoBlock({ c }: { c: StoryChapter }) {
  return (
    <div className="s-cell s-photo reveal">
      <div className="s-frame">
        <div className="s-img">
          {c.photo_path ? (
            <Image
              src={publicImageUrl("gallery", c.photo_path)}
              alt={c.title}
              fill
              sizes="(max-width: 760px) 80vw, 300px"
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
  );
}

function TextBlock({ c }: { c: StoryChapter }) {
  return (
    <div className="s-cell s-text reveal">
      {c.eyebrow && <span className="eyebrow">{c.eyebrow}</span>}
      <h3>{c.title}</h3>
      {c.body && <p>{c.body}</p>}
    </div>
  );
}

function Medallion({ i }: { i: number }) {
  return (
    <div className="s-medallion reveal" aria-hidden>
      <svg className="s-ring" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r="34" />
      </svg>
      <b>{ROMAN[i] ?? String(i + 1)}</b>
    </div>
  );
}

export function Story({ chapters }: { chapters: StoryChapter[] }) {
  return (
    <section className="story" id="story">
      <span className="s-rings" aria-hidden />
      <div className="wrap">
        <div className="s-head reveal">
          <span className="eyebrow">How it began</span>
          <h2>Our Story</h2>
          <p>
            Two paths, one beautiful destination. Here is the story that brought
            us together.
          </p>
          <div className="s-flourish">
            <span />
          </div>
        </div>

        <div className="s-timeline">
          {chapters.map((c, i) => (
            // chapter 1 (i=0): text left / photo right; then alternate
            <div className={`s-row${i % 2 === 0 ? "" : " s-rev"}`} key={c.id}>
              <PhotoBlock c={c} />
              <Medallion i={i} />
              <TextBlock c={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
