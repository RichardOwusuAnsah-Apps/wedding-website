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
import { publicImageUrl } from "@/lib/storage";
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

  return (
    <>
      <Hero
        coupleNames={settings.couple_names || ""}
        tagline={settings.tagline || ""}
        location={settings.hero_location || ""}
        targetIso={weddingDate}
        monogramSrc={monogramSrc}
        featured={featured}
      />
      <ThreadDivider className="reveal" />

      <Story chapters={chapters} />
      <ThreadDivider className="reveal" />

      <Celebrations events={events} />
      <ThreadDivider className="reveal" />

      <Party members={party} />
      <Gallery photos={preWedding} />
      <ThreadDivider className="reveal" />

      <Travel hotels={hotels} />
      <ThreadDivider className="reveal" />

      <Vendors vendors={vendors} />
      <Rsvp deadlineNote={deadlineNote} />
      <ThreadDivider className="reveal" />

      <Registry items={registry} note={settings.registry_note} />
      <AfterWedding weddingDate={weddingDate} photos={postWedding} />
      <Guestbook wishes={wishes} />
      <Faq faqs={faqs} />
    </>
  );
}
