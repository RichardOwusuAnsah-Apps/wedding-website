import { Hero } from "./components/Hero";
import { Story } from "./components/Story";
import { Celebrations } from "./components/Celebrations";
import { Party } from "./components/Party";
import { Gallery } from "./components/Gallery";
import { Venues } from "./components/Venues";
import { Travel } from "./components/Travel";
import { Family } from "./components/Family";
import { Vendors } from "./components/Vendors";
import { DressCode } from "./components/DressCode";
import { Rsvp } from "./components/Rsvp";
import { Registry } from "./components/Registry";
import { AfterWedding } from "./components/AfterWedding";
import { Guestbook } from "./components/Guestbook";
import { Faq } from "./components/Faq";
import { ThreadDivider } from "@/components/ui/ThreadDivider";
import {
  getApprovedGuestbook,
  getEvents,
  getFamilyGroups,
  getFaqs,
  getHotels,
  getPhotos,
  getRegistryItems,
  getSettings,
  getStoryChapters,
  getVendors,
  getVenues,
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
    venues,
    hotels,
    families,
    vendors,
    registry,
    postWedding,
    wishes,
    faqs,
  ] = await Promise.all([
    getSettings(),
    getStoryChapters(),
    getEvents(),
    getWeddingParty(),
    getPhotos("pre_wedding"),
    getVenues(),
    getHotels(),
    getFamilyGroups(),
    getVendors(),
    getRegistryItems(),
    getPhotos("post_wedding"),
    getApprovedGuestbook(),
    getFaqs(),
  ]);

  const weddingDate = settings.wedding_date || "2026-10-24T14:00:00";
  const deadlineNote = settings.rsvp_deadline
    ? `Kindly respond by ${formatDate(settings.rsvp_deadline)} so we can prepare to celebrate with you.`
    : undefined;

  return (
    <>
      <Hero
        coupleNames={settings.couple_names || "Richie & Shula"}
        tagline={settings.tagline || "Timeless · Elegant · Effortless"}
        location={settings.hero_location || "Maryland, USA"}
        targetIso={weddingDate}
      />

      <Story chapters={chapters} />
      <ThreadDivider className="reveal" />

      <Celebrations events={events} />
      <ThreadDivider className="reveal" />

      <Party members={party} />
      <Gallery photos={preWedding} />
      <ThreadDivider className="reveal" />

      <Venues venues={venues} />
      <Travel hotels={hotels} />
      <ThreadDivider className="reveal" />

      <Family groups={families} />
      <Vendors vendors={vendors} />
      <DressCode />
      <Rsvp deadlineNote={deadlineNote} />
      <ThreadDivider className="reveal" />

      <Registry items={registry} note={settings.registry_note} />
      <AfterWedding weddingDate={weddingDate} photos={postWedding} />
      <Guestbook wishes={wishes} />
      <Faq faqs={faqs} />
    </>
  );
}
