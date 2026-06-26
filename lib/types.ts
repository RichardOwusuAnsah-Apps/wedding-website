// Row types mirroring supabase/schema.sql

export type Settings = Record<string, string>;

export interface StoryChapter {
  id: string;
  eyebrow: string | null;
  title: string;
  body: string | null;
  sort_order: number;
}

export interface EventRow {
  id: string;
  day_label: string | null;
  title: string;
  side_color: string | null; // 'burgundy' | 'teal'
  event_date: string | null;
  event_time: string | null;
  venue_name: string | null;
  attire: string | null;
  description: string | null;
  sort_order: number;
}

export interface PartyMember {
  id: string;
  side: string; // 'groom' | 'bride'
  group_key: string; // 'trad_men' | 'groomsmen' | 'trad_ladies' | 'bridesmaids'
  name: string;
  role: string | null;
  photo_path: string | null;
  sort_order: number;
  focal_x: number;
  focal_y: number;
  zoom: number;
}

export interface Venue {
  id: string;
  kind: string | null;
  name: string;
  address: string | null;
  map_url: string | null;
  time_note: string | null;
  notes: string | null;
  sort_order: number;
}

export interface Hotel {
  id: string;
  name: string;
  tier: string | null;
  address: string | null;
  notes: string | null;
  booking_url: string | null;
  sort_order: number;
}

export interface FamilyGroup {
  id: string;
  side: string;
  surname: string | null;
  members: string | null; // newline-separated
  sort_order: number;
}

export interface Vendor {
  id: string;
  category: string;
  name: string;
  url: string | null;
  sort_order: number;
}

export interface RegistryItem {
  id: string;
  icon: string | null;
  title: string;
  description: string | null;
  url: string | null;
  sort_order: number;
}

export interface Photo {
  id: string;
  gallery: string; // 'pre_wedding' | 'post_wedding'
  storage_path: string;
  caption: string | null;
  sort_order: number;
  is_featured: boolean; // shown in the hero "hanging photos"
  focal_x: number; // crop focal point X (0–100)
  focal_y: number; // crop focal point Y (0–100)
  zoom: number; // crop zoom (1–3)
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string | null;
  sort_order: number;
}

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  status: string; // 'pending' | 'approved'
  created_at: string;
}
