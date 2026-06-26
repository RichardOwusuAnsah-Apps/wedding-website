// Config-driven admin CRUD. Each resource maps a table to its editable fields;
// ResourceManager renders list + forms from this, and the server actions use it
// to whitelist tables/columns. Plain module — safe to import on client + server.

export type FieldType = "text" | "textarea" | "number" | "select" | "image";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  bucket?: string; // for image fields
  aspect?: number; // for image fields — crop frame width/height (e.g. 3/4)
}

export interface ResourceDef {
  slug: string; // /admin/<slug>
  table: string;
  title: string; // page heading
  singular: string; // "Chapter", "Event", ...
  titleField: string; // field shown as each row's heading
  fields: FieldDef[];
}

const SORT: FieldDef = { name: "sort_order", label: "Sort order", type: "number" };

export const RESOURCES: Record<string, ResourceDef> = {
  story: {
    slug: "story",
    table: "story_chapters",
    title: "Our Story",
    singular: "Chapter",
    titleField: "title",
    fields: [
      { name: "eyebrow", label: "Eyebrow (small label)", type: "text" },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body", label: "Body", type: "textarea" },
      SORT,
    ],
  },
  events: {
    slug: "events",
    table: "events",
    title: "The Celebrations",
    singular: "Event",
    titleField: "title",
    fields: [
      { name: "day_label", label: "Day label", type: "text", placeholder: "Day One" },
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "side_color",
        label: "Colour",
        type: "select",
        options: [
          { value: "burgundy", label: "Burgundy (Traditional)" },
          { value: "teal", label: "Teal (White Wedding)" },
        ],
      },
      { name: "event_date", label: "Date", type: "text", placeholder: "Friday, 23 October 2026" },
      { name: "event_time", label: "Time", type: "text" },
      { name: "venue_name", label: "Venue", type: "text" },
      { name: "attire", label: "Attire", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      SORT,
    ],
  },
  party: {
    slug: "party",
    table: "wedding_party",
    title: "Wedding Party",
    singular: "Person",
    titleField: "name",
    fields: [
      {
        name: "side",
        label: "Side",
        type: "select",
        required: true,
        options: [
          { value: "groom", label: "Groom's side" },
          { value: "bride", label: "Bride's side" },
        ],
      },
      {
        name: "group_key",
        label: "Group",
        type: "select",
        required: true,
        options: [
          { value: "trad_men", label: "Traditional Wedding Men" },
          { value: "groomsmen", label: "Groomsmen & Best Man" },
          { value: "trad_ladies", label: "Traditional Wedding Ladies" },
          { value: "bridesmaids", label: "Bridesmaids & Maids of Honour" },
        ],
      },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text", placeholder: "Best Man" },
      {
        name: "photo_path",
        label: "Photo",
        type: "image",
        bucket: "party-photos",
        aspect: 3 / 4,
      },
      SORT,
    ],
  },
  venues: {
    slug: "venues",
    table: "venues",
    title: "Venues",
    singular: "Venue",
    titleField: "name",
    fields: [
      {
        name: "kind",
        label: "Kind",
        type: "select",
        options: [
          { value: "engagement", label: "Engagement" },
          { value: "ceremony", label: "Ceremony" },
          { value: "reception", label: "Reception" },
        ],
      },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "address", label: "Address", type: "text" },
      { name: "map_url", label: "Map link (Google Maps URL)", type: "text" },
      { name: "time_note", label: "Time note", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" },
      SORT,
    ],
  },
  hotels: {
    slug: "hotels",
    table: "hotels",
    title: "Travel & Stay",
    singular: "Hotel / item",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      {
        name: "tier",
        label: "Tier",
        type: "select",
        options: [
          { value: "Recommended", label: "Recommended" },
          { value: "Mid-range", label: "Mid-range" },
          { value: "Getting here", label: "Getting here" },
        ],
      },
      { name: "address", label: "Address", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" },
      { name: "booking_url", label: "Booking link", type: "text" },
      SORT,
    ],
  },
  family: {
    slug: "family",
    table: "family_groups",
    title: "Family",
    singular: "Family",
    titleField: "surname",
    fields: [
      {
        name: "side",
        label: "Side",
        type: "select",
        required: true,
        options: [
          { value: "groom", label: "Groom's family" },
          { value: "bride", label: "Bride's family" },
        ],
      },
      { name: "surname", label: "Family name", type: "text" },
      { name: "members", label: "Members (one per line)", type: "textarea" },
      SORT,
    ],
  },
  vendors: {
    slug: "vendors",
    table: "vendors",
    title: "Our Vendors",
    singular: "Vendor",
    titleField: "name",
    fields: [
      { name: "category", label: "Category", type: "text", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "url", label: "Link", type: "text" },
      SORT,
    ],
  },
  registry: {
    slug: "registry",
    table: "registry_items",
    title: "Registry & Gifts",
    singular: "Item",
    titleField: "title",
    fields: [
      { name: "icon", label: "Icon (emoji)", type: "text", placeholder: "🏡" },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "url", label: "Link", type: "text" },
      SORT,
    ],
  },
  faq: {
    slug: "faq",
    table: "faqs",
    title: "FAQ",
    singular: "Question",
    titleField: "question",
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "textarea" },
      SORT,
    ],
  },
};

export const RESOURCE_BY_TABLE: Record<string, ResourceDef> = Object.fromEntries(
  Object.values(RESOURCES).map((r) => [r.table, r]),
);
