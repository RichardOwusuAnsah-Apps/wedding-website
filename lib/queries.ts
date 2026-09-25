import { createClient } from "@/lib/supabase/server";
import type {
  EventRow,
  Faq,
  FamilyGroup,
  GuestbookEntry,
  Hotel,
  PartyMember,
  Photo,
  RegistryItem,
  Settings,
  StoryChapter,
  Vendor,
  Venue,
} from "@/lib/types";

/**
 * Typed read helpers for the public site. All run on the server with the anon
 * client; RLS allows public SELECT on these content tables. Each returns [] (or
 * {} for settings) on error so a single failing table never blanks the page.
 */

async function selectAll<T>(
  table: string,
  order: { column: string; ascending?: boolean } = { column: "sort_order" },
): Promise<T[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(order.column, { ascending: order.ascending ?? true });
  if (error) {
    console.error(`[queries] ${table}:`, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

export async function getSettings(): Promise<Settings> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("settings").select("key,value");
  if (error) {
    console.error("[queries] settings:", error.message);
    return {};
  }
  return Object.fromEntries(
    (data ?? []).map((r) => [r.key as string, (r.value as string) ?? ""]),
  );
}

export const getStoryChapters = () =>
  selectAll<StoryChapter>("story_chapters");
export const getEvents = () => selectAll<EventRow>("events");
export const getWeddingParty = () => selectAll<PartyMember>("wedding_party");
export const getVenues = () => selectAll<Venue>("venues");
export const getHotels = () => selectAll<Hotel>("hotels");

/**
 * Which hotels have a photo, as a set of hotel ids.
 *
 * The hotels table has no photo column, so a hotel's picture is stored by
 * convention at `gallery/hotels/<hotel id>.webp`. Listing the folder is one
 * cheap metadata call and means a hotel without a picture renders its plain
 * panel instead of a broken image. If a photo_path column is ever added,
 * this can go and the path can come off the row.
 */
export async function getHotelPhotoIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("gallery")
    .list("hotels", { limit: 200 });
  if (error) {
    console.error("[queries] hotel photos:", error.message);
    return new Set();
  }
  return new Set(
    (data ?? [])
      .filter((f) => f.id !== null && f.name.endsWith(".webp"))
      .map((f) => f.name.replace(/\.webp$/, "")),
  );
}
export const getFamilyGroups = () => selectAll<FamilyGroup>("family_groups");
export const getVendors = () => selectAll<Vendor>("vendors");
export const getRegistryItems = () =>
  selectAll<RegistryItem>("registry_items");
export const getFaqs = () => selectAll<Faq>("faqs");

export async function getPhotos(
  gallery: "pre_wedding" | "post_wedding",
): Promise<Photo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("gallery", gallery)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[queries] photos:", error.message);
    return [];
  }
  return (data ?? []) as Photo[];
}

/** All admin-chosen "featured" photos for the hero frames (they rotate). */
export async function getFeaturedPhotos(): Promise<Photo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[queries] featured photos:", error.message);
    return [];
  }
  return (data ?? []) as Photo[];
}

/** Approved guestbook wishes, newest first (RLS already hides pending rows). */
export async function getApprovedGuestbook(): Promise<GuestbookEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guestbook")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[queries] guestbook:", error.message);
    return [];
  }
  return (data ?? []) as GuestbookEntry[];
}
