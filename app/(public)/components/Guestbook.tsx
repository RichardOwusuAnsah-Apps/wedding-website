import { SectionHead } from "@/components/ui/SectionHead";
import type { GuestbookEntry } from "@/lib/types";

export function Guestbook({ wishes }: { wishes: GuestbookEntry[] }) {
  return (
    <section id="guestbook">
      <div className="wrap">
        <SectionHead eyebrow="Leave us a note" title="Guestbook">
          Words of love, blessings and well-wishes from our people.
        </SectionHead>

        {wishes.length === 0 ? (
          <p className="wishes-empty reveal">
            No wishes yet — be the first to leave one.
          </p>
        ) : (
          <div className="wishes reveal">
            {wishes.map((w) => (
              <div className="wish" key={w.id}>
                <p>&ldquo;{w.message}&rdquo;</p>
                <span>— {w.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Submission form is wired in Phase 4 (public writes). */}
        <div className="center" style={{ marginTop: 30 }}>
          <button className="nav-rsvp reveal" type="button" disabled>
            Sign the guestbook
          </button>
        </div>
      </div>
    </section>
  );
}
