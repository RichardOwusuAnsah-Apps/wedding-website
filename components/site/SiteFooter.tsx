import { Monogram } from "@/components/ui/Monogram";

/** Site footer — monogram, names, date/location, hashtag. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Monogram />
      <div className="script">Richie &amp; Shula</div>
      <div className="meta">
        24 · 10 · 2026 &nbsp;·&nbsp; Maryland, USA &nbsp;·&nbsp; #RichieAndShula2026
      </div>
      <p style={{ opacity: 0.55, fontSize: ".85rem", marginTop: 26 }}>
        Made with love.
      </p>
    </footer>
  );
}
