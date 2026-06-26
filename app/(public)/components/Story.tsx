import type { StoryChapter } from "@/lib/types";
import { StoryRow } from "./StoryRow";

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
            <StoryRow key={c.id} c={c} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
