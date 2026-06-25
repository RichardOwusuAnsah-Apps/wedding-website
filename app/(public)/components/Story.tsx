import { SectionHead } from "@/components/ui/SectionHead";
import type { StoryChapter } from "@/lib/types";

export function Story({ chapters }: { chapters: StoryChapter[] }) {
  return (
    <section className="story" id="story">
      <div className="wrap">
        <SectionHead eyebrow="How it began" title="Our Story">
          Two paths, one beautiful destination. Here is the story that brought us
          together.
        </SectionHead>
        <div className="timeline">
          {chapters.map((c) => (
            <div className="chapter reveal" key={c.id}>
              {c.eyebrow && <div className="yr">{c.eyebrow}</div>}
              <h3>{c.title}</h3>
              {c.body && <p>{c.body}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
