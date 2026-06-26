-- ============================================================================
-- Richie & Shula — Wedding site schema
-- Run this in the Supabase SQL editor (Phase 1).
-- Idempotent-ish: safe to re-run (uses IF NOT EXISTS / OR REPLACE where it can).
-- ============================================================================

-- ========== CONTENT TABLES ==========

create table if not exists settings (
  key text primary key,
  value text
);
-- seed keys: couple_names, wedding_date, hashtag, tagline, rsvp_deadline,
--            livestream_url, hero_location, registry_note

create table if not exists story_chapters (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  title text not null,
  body text,
  sort_order int default 0
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  day_label text,                       -- 'Day One'
  title text not null,                  -- 'Traditional Ceremony'
  side_color text default 'burgundy',   -- 'burgundy' | 'teal'
  event_date text,
  event_time text,
  venue_name text,
  attire text,
  description text,
  sort_order int default 0
);

create table if not exists wedding_party (
  id uuid primary key default gen_random_uuid(),
  side text not null,                   -- 'groom' | 'bride'
  group_key text not null,              -- 'trad_men' | 'groomsmen' | 'trad_ladies' | 'bridesmaids'
  name text not null,
  role text,                            -- 'Best Man', 'Maid of Honour', ...
  photo_path text,                      -- storage path in 'party-photos'
  sort_order int default 0
);

create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  kind text,                            -- 'engagement' | 'ceremony' | 'reception'
  name text not null,
  address text,
  map_url text,
  time_note text,
  notes text,
  sort_order int default 0
);

create table if not exists hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text,                            -- 'Recommended' | 'Mid-range' | 'Getting here'
  address text,
  notes text,
  booking_url text,
  sort_order int default 0
);

create table if not exists family_groups (
  id uuid primary key default gen_random_uuid(),
  side text not null,                   -- 'groom' | 'bride'
  surname text,
  members text,                         -- newline-separated
  sort_order int default 0
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  category text not null,               -- 'Photography', 'Catering', ...
  name text not null,
  url text,
  sort_order int default 0
);

create table if not exists registry_items (
  id uuid primary key default gen_random_uuid(),
  icon text,                            -- emoji or icon key
  title text not null,
  description text,
  url text,
  sort_order int default 0
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  gallery text not null,                -- 'pre_wedding' | 'post_wedding'
  storage_path text not null,           -- path in 'gallery' bucket
  caption text,
  sort_order int default 0,
  created_at timestamptz default now()
);
-- hero "hanging photos": admin marks up to 4 gallery photos as featured
alter table photos add column if not exists is_featured boolean default false;

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text,
  sort_order int default 0
);

-- ========== PUBLIC-WRITE TABLES ==========

create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  attending boolean,
  events_attending text,                -- 'traditional' | 'white' | 'both'
  party_size int default 1,
  meal_preference text,
  message text,
  created_at timestamptz default now()
);

create table if not exists guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  status text default 'pending',        -- 'pending' | 'approved'
  created_at timestamptz default now()
);

-- ============================================================================
-- API role grants
-- PostgREST roles (anon / authenticated / service_role) need table privileges
-- to reach the tables at all; RLS (below) is what actually filters rows.
-- Normally Supabase applies these by default — set explicitly here so the
-- schema is self-contained and reproducible.
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public
  to anon, authenticated, service_role;
grant usage, select on all sequences in schema public
  to anon, authenticated, service_role;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table settings        enable row level security;
alter table story_chapters  enable row level security;
alter table events          enable row level security;
alter table wedding_party   enable row level security;
alter table venues          enable row level security;
alter table hotels          enable row level security;
alter table family_groups   enable row level security;
alter table vendors         enable row level security;
alter table registry_items  enable row level security;
alter table photos          enable row level security;
alter table faqs            enable row level security;
alter table rsvps           enable row level security;
alter table guestbook       enable row level security;

-- ---- PUBLIC READ on content tables ----
drop policy if exists "public read" on settings;
create policy "public read" on settings        for select using (true);
drop policy if exists "public read" on story_chapters;
create policy "public read" on story_chapters  for select using (true);
drop policy if exists "public read" on events;
create policy "public read" on events          for select using (true);
drop policy if exists "public read" on wedding_party;
create policy "public read" on wedding_party   for select using (true);
drop policy if exists "public read" on venues;
create policy "public read" on venues          for select using (true);
drop policy if exists "public read" on hotels;
create policy "public read" on hotels          for select using (true);
drop policy if exists "public read" on family_groups;
create policy "public read" on family_groups   for select using (true);
drop policy if exists "public read" on vendors;
create policy "public read" on vendors         for select using (true);
drop policy if exists "public read" on registry_items;
create policy "public read" on registry_items  for select using (true);
drop policy if exists "public read" on photos;
create policy "public read" on photos          for select using (true);
drop policy if exists "public read" on faqs;
create policy "public read" on faqs            for select using (true);

-- ---- GUESTBOOK: public reads only APPROVED; public can insert (pending) ----
drop policy if exists "read approved" on guestbook;
create policy "read approved" on guestbook for select
  using (status = 'approved');
drop policy if exists "public insert" on guestbook;
create policy "public insert" on guestbook for insert to anon
  with check (status = 'pending');

-- ---- RSVP: public can insert; only admin reads ----
drop policy if exists "public insert" on rsvps;
create policy "public insert" on rsvps for insert to anon
  with check (true);

-- ---- ADMIN (any authenticated user = Richie) can do everything ----
drop policy if exists "admin all" on settings;
create policy "admin all" on settings        for all to authenticated using (true) with check (true);
drop policy if exists "admin all" on story_chapters;
create policy "admin all" on story_chapters  for all to authenticated using (true) with check (true);
drop policy if exists "admin all" on events;
create policy "admin all" on events          for all to authenticated using (true) with check (true);
drop policy if exists "admin all" on wedding_party;
create policy "admin all" on wedding_party   for all to authenticated using (true) with check (true);
drop policy if exists "admin all" on venues;
create policy "admin all" on venues          for all to authenticated using (true) with check (true);
drop policy if exists "admin all" on hotels;
create policy "admin all" on hotels          for all to authenticated using (true) with check (true);
drop policy if exists "admin all" on family_groups;
create policy "admin all" on family_groups   for all to authenticated using (true) with check (true);
drop policy if exists "admin all" on vendors;
create policy "admin all" on vendors         for all to authenticated using (true) with check (true);
drop policy if exists "admin all" on registry_items;
create policy "admin all" on registry_items  for all to authenticated using (true) with check (true);
drop policy if exists "admin all" on photos;
create policy "admin all" on photos          for all to authenticated using (true) with check (true);
drop policy if exists "admin all" on faqs;
create policy "admin all" on faqs            for all to authenticated using (true) with check (true);
drop policy if exists "admin all" on rsvps;
create policy "admin all" on rsvps           for all to authenticated using (true) with check (true);
drop policy if exists "admin all" on guestbook;
create policy "admin all" on guestbook       for all to authenticated using (true) with check (true);

-- ============================================================================
-- Storage buckets — public read, authenticated write
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('party-photos', 'party-photos', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = excluded.public;

-- Public read (objects in our two buckets are publicly selectable)
drop policy if exists "public read party-photos" on storage.objects;
create policy "public read party-photos" on storage.objects for select
  using (bucket_id = 'party-photos');
drop policy if exists "public read gallery" on storage.objects;
create policy "public read gallery" on storage.objects for select
  using (bucket_id = 'gallery');

-- Authenticated write (Richie) — insert/update/delete in our buckets
drop policy if exists "auth write party-photos" on storage.objects;
create policy "auth write party-photos" on storage.objects for all to authenticated
  using (bucket_id = 'party-photos') with check (bucket_id = 'party-photos');
drop policy if exists "auth write gallery" on storage.objects;
create policy "auth write gallery" on storage.objects for all to authenticated
  using (bucket_id = 'gallery') with check (bucket_id = 'gallery');
