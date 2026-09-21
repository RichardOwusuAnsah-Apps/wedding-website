import { Hero } from "./components/Hero";
import { Story } from "./components/Story";
import { Celebrations } from "./components/Celebrations";
import { Party } from "./components/Party";
import { Gallery } from "./components/Gallery";
import { Travel } from "./components/Travel";
import { Vendors } from "./components/Vendors";
import { Rsvp } from "./components/Rsvp";
import { Registry } from "./components/Registry";
import { AfterWedding } from "./components/AfterWedding";
import { Guestbook } from "./components/Guestbook";
import { Faq } from "./components/Faq";
import { ThreadDivider } from "@/components/ui/ThreadDivider";
import { IntroReveal } from "@/components/site/IntroReveal";
import { isSectionVisible } from "@/lib/sections";
import { isMaintenance } from "@/lib/maintenance";
import { publicImageUrl, renderImageUrl } from "@/lib/storage";
import {
  getApprovedGuestbook,
  getEvents,
  getFaqs,
  getFeaturedPhotos,
  getHotels,
  getPhotos,
  getRegistryItems,
  getSettings,
  getStoryChapters,
  getVendors,
  getWeddingParty,
} from "@/lib/queries";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export default async function Home() {
  const [
    settings,
    chapters,
    events,
    party,
    preWedding,
    hotels,
    vendors,
    registry,
    postWedding,
    wishes,
    faqs,
    featured,
  ] = await Promise.all([
    getSettings(),
    getStoryChapters(),
    getEvents(),
    getWeddingParty(),
    getPhotos("pre_wedding"),
    getHotels(),
    getVendors(),
    getRegistryItems(),
    getPhotos("post_wedding"),
    getApprovedGuestbook(),
    getFaqs(),
    getFeaturedPhotos(),
  ]);

  // Only show what the couple has actually entered — no hard-coded fallbacks,
  // so clearing a field in the admin removes it from the page.
  const weddingDate = settings.wedding_date || "";
  const monogramSrc = settings.monogram_path
    ? publicImageUrl("gallery", settings.monogram_path)
    : undefined;
  const deadlineNote = settings.rsvp_deadline
    ? `Kindly respond by ${formatDate(settings.rsvp_deadline)} so we can prepare to celebrate with you.`
    : undefined;

  // While the database is unreachable every query returns empty, which would
  // leave the page a run of headings with nothing under them. Hide a section
  // rather than show it hollow. Outside the maintenance window nothing changes:
  // each section keeps its own empty state.
  const maintenance = isMaintenance();
  const filled = (items: readonly unknown[]) => items.length > 0 || !maintenance;

  // Photos flung at the viewer during the cinematic intro (uses the gallery).
  // Small resized WebP via Supabase's transformer (originals here are 30MB+),
  // with the original as a last-resort fallback.
  const introImages = preWedding.map((p) => ({
    small: renderImageUrl("gallery", p.storage_path, {
      width: 640,
      height: 800,
      quality: 65,
    }),
    full: publicImageUrl("gallery", p.storage_path),
  }));

  return (
    <>
      <IntroReveal images={introImages} />
      <Hero
        coupleNames={settings.couple_names || ""}
        tagline={settings.tagline || ""}
        location={settings.hero_location || ""}
        targetIso={weddingDate}
        monogramSrc={monogramSrc}
        featured={featured}
      />
      <ThreadDivider className="reveal" />

      {filled(chapters) && (
        <>
          <Story chapters={chapters} />
          <ThreadDivider className="reveal" />
        </>
      )}

      {filled(events) && (
        <>
          <Celebrations events={events} />
          <ThreadDivider className="reveal" />
        </>
      )}

      {filled(party) && <Party members={party} />}
      {filled(preWedding) && (
        <>
          <Gallery photos={preWedding} />
          <ThreadDivider className="reveal" />
        </>
      )}

      {isSectionVisible(settings, "hotels") && filled(hotels) && (
        <>
          <Travel hotels={hotels} />
          <ThreadDivider className="reveal" />
        </>
      )}

      {isSectionVisible(settings, "vendors") && filled(vendors) && (
        <Vendors vendors={vendors} />
      )}
      <Rsvp deadlineNote={deadlineNote} closed={maintenance} />
      <ThreadDivider className="reveal" />

      {isSectionVisible(settings, "registry") && filled(registry) && (
        <Registry items={registry} note={settings.registry_note} />
      )}
      {!maintenance && (
        <AfterWedding weddingDate={weddingDate} photos={postWedding} />
      )}
      {filled(wishes) && <Guestbook wishes={wishes} />}
      {isSectionVisible(settings, "faq") && filled(faqs) && <Faq faqs={faqs} />}
    </>
  );
}
