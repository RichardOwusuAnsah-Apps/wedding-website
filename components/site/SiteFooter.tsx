import { Monogram } from "@/components/ui/Monogram";
import { getSettings } from "@/lib/queries";
import { publicImageUrl } from "@/lib/storage";
import { weddingDateParts } from "@/lib/format";
import { isSectionVisible } from "@/lib/sections";

// The footer's "Explore" links mirror the top nav's routes (hash sections on
// the single public page). Sections the couple has hidden are filtered out
// below so the footer never points at something removed from the site.
const FOOTER_LINKS: [href: string, label: string][] = [
  ["#story", "Our Story"],
  ["#celebrations", "Celebrations"],
  ["#party", "Wedding Party"],
  ["#gallery", "Gallery"],
  ["#travel", "Travel"],
  ["#registry", "Registry"],
  ["#guestbook", "Guestbook"],
  ["#faq", "FAQ"],
];

/** Site footer — three-column identity / explore / the-day, then a credit bar. */
export async function SiteFooter() {
  const s = await getSettings();
  const names = s.couple_names || "Richie & Shula";
  const location = s.hero_location || "Maryland, USA";
  const hashtag = s.hashtag || "#ShulasealedtheAnsah";
  const date = weddingDateParts(s.wedding_date || "");
  const monogramSrc = s.monogram_path
    ? publicImageUrl("gallery", s.monogram_path)
    : undefined;

  // Drop links to sections hidden from the public site (matches the nav).
  const hidden = [
    !isSectionVisible(s, "hotels") && "#travel",
    !isSectionVisible(s, "registry") && "#registry",
    !isSectionVisible(s, "faq") && "#faq",
  ].filter(Boolean) as string[];
  const links = FOOTER_LINKS.filter(([href]) => !hidden.includes(href));

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          {/* Identity */}
          <div className="footer-identity">
            <Monogram src={monogramSrc} className="footer-mono" />
            <div className="footer-names">{names}</div>
            <div className="footer-tag">{hashtag}</div>
          </div>

          {/* Explore */}
          <nav className="footer-col footer-explore" aria-label="Footer">
            <h2 className="footer-head">Explore</h2>
            <ul className="footer-links">
              {links.map(([href, label]) => (
                <li key={href}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* The Day */}
          <div className="footer-col footer-day">
            <h2 className="footer-head">The Day</h2>
            {date && <p className="footer-day-line">{date.weekday}</p>}
            {date && <p className="footer-day-line">{date.long}</p>}
            {location && <p className="footer-day-line">{location}</p>}
            <a href="#rsvp" className="footer-rsvp">
              RSVP
            </a>
          </div>
        </div>

        <div className="footer-divider" aria-hidden="true" />

        <div className="footer-bottom">
          <span>© Richard and Shulamite 2026</span>
          <span>Made with love, made by the groom.</span>
        </div>
      </div>
    </footer>
  );
}
