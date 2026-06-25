import { Monogram } from "@/components/ui/Monogram";
import { getSettings } from "@/lib/queries";
import { weddingDateParts } from "@/lib/format";

/** Site footer — monogram, names, date/location, hashtag (all from settings). */
export async function SiteFooter() {
  const s = await getSettings();
  const names = s.couple_names || "Richie & Shula";
  const location = s.hero_location || "Maryland, USA";
  const hashtag = s.hashtag || "";
  const date = weddingDateParts(s.wedding_date || "2026-10-24T14:00:00");

  const meta = [date?.compact, location, hashtag].filter(Boolean).join("  ·  ");

  return (
    <footer className="site-footer">
      <Monogram />
      <div className="script">{names}</div>
      <div className="meta">{meta}</div>
      <p style={{ opacity: 0.55, fontSize: ".85rem", marginTop: 26 }}>
        Made with love.
      </p>
    </footer>
  );
}
