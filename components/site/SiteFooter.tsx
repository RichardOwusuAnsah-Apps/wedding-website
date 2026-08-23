import { Monogram } from "@/components/ui/Monogram";
import { getSettings } from "@/lib/queries";
import { publicImageUrl } from "@/lib/storage";

/** Site footer — monogram, names, hashtag, location, and the credit lines. */
export async function SiteFooter() {
  const s = await getSettings();
  const names = s.couple_names || "Richie & Shula";
  const location = s.hero_location || "Maryland, USA";
  const hashtag = s.hashtag || "#ShulasealedtheAnsah";
  // Use the couple's uploaded monogram (same as the landing page / top nav),
  // falling back to the "RS" placeholder when none has been uploaded.
  const monogramSrc = s.monogram_path
    ? publicImageUrl("gallery", s.monogram_path)
    : undefined;

  return (
    <footer className="site-footer">
      <Monogram src={monogramSrc} />
      <div className="script">{names}</div>
      <div className="footer-tag">{hashtag}</div>
      {location && <div className="meta">{location}</div>}
      <p className="footer-credit" style={{ marginTop: 26 }}>
        © Richard and Shulamite 2026
      </p>
      <p className="footer-credit">Made with love, made by the groom.</p>
    </footer>
  );
}
