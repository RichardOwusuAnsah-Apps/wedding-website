# Richie & Shula — Wedding Website Build Plan

**A complete engineering spec for Claude Code.**
Hand Claude Code this file together with `wedding-website-mockup.html` (the visual reference). Build the sections to match that mockup's palette, typography, and layout exactly, then port it into a real Next.js app backed by Supabase.

---

## 1. Overview

A single elegant, premium wedding website for **Richie & Shula**, wedding date **24.10.2026**, in Maryland, USA. Brand: interlocked **RS** monogram, tagline **"Timeless · Elegant · Effortless"**, colours **gold / teal blue / burgundy** on warm ivory.

The site has two surfaces:

1. **Public site** — the wedding website guests visit (single long scroll + a few sub-pages).
2. **Private admin dashboard** — only Richie logs in. He manages *all* content here: text, events, the wedding party, and **every photo**. Guests and the wedding party do **not** upload anything. People send Richie their photos; he uploads them through the admin.

This means: no public file uploads, no photo moderation queue, no per-guest accounts. The only writes the public can make are **RSVP submissions** and **guestbook messages** (the latter held for Richie's approval).

---

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Server Components for the public site (fast, SEO-friendly). |
| Styling | **Tailwind CSS** | Encode the mockup palette/type as Tailwind tokens (Section 4). |
| Backend / DB | **Supabase (Postgres + Auth + Storage)** | One project. |
| Auth | **Supabase Auth (email + password)** | Single admin = Richie. Public signups **disabled**. |
| Images | **next/image** | Optimise + lazy-load all photos. |
| Animation | **CSS transitions + IntersectionObserver** (or Framer Motion if preferred) | Match the mockup's scroll-reveal + countdown. Respect `prefers-reduced-motion`. |
| Email (optional) | **Resend** | Notify Richie by email on each new RSVP. Skippable — RSVPs are always viewable in the admin. |
| Hosting | **Vercel** | Connect the GitHub repo; add a custom domain. |

---

## 3. Information architecture

### Public site (`/`)
One long scroll with anchored sections, plus a sticky nav and an RSVP CTA:

1. **Hero** — RS monogram, tagline, names, date, location, live countdown.
2. **Our Story** — vertical timeline with the gold "thread" (chapters managed in admin).
3. **The Celebrations** — two cards: **Traditional Ceremony** (Day One) and **The White Wedding** (Day Two). No "knocking" copy — that's already done.
4. **The Wedding Party** — tabbed: **Groom's Side** and **Bride's Side**.
   - Groom's Side: **Traditional Wedding Men**, then **Groomsmen & Best Man** (one Best Man).
   - Bride's Side: **Traditional Wedding Ladies**, then **Bridesmaids & Maids of Honour** (two Maids of Honour).
   - Each person is a portrait card (photo uploaded by Richie). No public "add photo" tile in the real build.
5. **Pre-Wedding Photos** — gallery (admin-uploaded).
6. **Venues** — cards with address + map link (engagement / ceremony / reception).
7. **Travel & Stay** — recommended hotels + airport/getting-here info.
8. **Family** — the two families.
9. **Our Vendors** — credit grid.
10. **Colours & Dress Code** — palette swatches + guidance.
11. **RSVP** — public form (writes to DB).
12. **Registry & Gifts** — home registry, honeymoon fund, mobile money.
13. **Share Your Photos / After the Wedding** — gallery that opens after the wedding (admin-uploaded). A simple date gate hides it until the wedding date.
14. **Guestbook** — public can submit a wish (held for approval); approved wishes display.
15. **FAQ** — accordion.
16. **Footer** — monogram, names, date, hashtag.

### Admin (`/admin`, auth-protected)
Dashboard + a CRUD screen for each content type. See Section 6.

---

## 4. Design system (port from the mockup)

Use the mockup as the source of truth. Encode these as Tailwind theme tokens and `@font-face` via `next/font/google`.

**Colours**
```
burgundy        #5A1B2E
burgundy-deep   #3F121F
teal            #0E5A5E
teal-deep       #093E42
gold            #C49A48
gold-light      #E2C588
ivory           #F8F3EA   (page background)
sand            #EFE5D3
ink             #241A1C   (body text)
muted           #7A6A64
```

**Typography**
- Display headings: **Cormorant Garamond** (500/600).
- Body copy: **EB Garamond**.
- Labels / nav / buttons / eyebrows: **Jost** (uppercase, letter-spaced).
- Script flourish (monogram, names in footer): **Tangerine**.

**Signature motifs**
- **Gold thread divider** — the small woven gold band between sections (see `.thread` in the mockup).
- **RS monogram** — render the real exported logo, not a font. See Section 9 (assets). Use it in the hero, footer, and favicon.
- **Two-ceremony colour split** — burgundy = Traditional, teal = White Wedding.

**Quality floor:** responsive to mobile, visible keyboard focus states, `prefers-reduced-motion` respected, semantic headings, alt text on every photo.

---

## 5. Data model (Supabase / Postgres)

Run this SQL in the Supabase SQL editor. Public can **read** content and **insert** RSVPs + guestbook entries. Everything else requires an authenticated session (Richie).

```sql
-- ========== CONTENT TABLES ==========

create table settings (
  key text primary key,
  value text
);
-- seed: couple_names, wedding_date, hashtag, tagline, rsvp_deadline,
--       livestream_url, hero_location, registry_note

create table story_chapters (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  title text not null,
  body text,
  sort_order int default 0
);

create table events (
  id uuid primary key default gen_random_uuid(),
  day_label text,                 -- 'Day One'
  title text not null,            -- 'Traditional Ceremony'
  side_color text default 'burgundy', -- 'burgundy' | 'teal'
  event_date text,
  event_time text,
  venue_name text,
  attire text,
  description text,
  sort_order int default 0
);

create table wedding_party (
  id uuid primary key default gen_random_uuid(),
  side text not null,             -- 'groom' | 'bride'
  group_key text not null,        -- 'trad_men' | 'groomsmen' | 'trad_ladies' | 'bridesmaids'
  name text not null,
  role text,                      -- 'Best Man', 'Maid of Honour', 'Groomsman', ...
  photo_path text,                -- storage path in 'party-photos'
  sort_order int default 0
);

create table venues (
  id uuid primary key default gen_random_uuid(),
  kind text,                      -- 'engagement' | 'ceremony' | 'reception'
  name text not null,
  address text,
  map_url text,
  time_note text,
  notes text,
  sort_order int default 0
);

create table hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text,                      -- 'Recommended', 'Mid-range', 'Getting here'
  address text,
  notes text,
  booking_url text,
  sort_order int default 0
);

create table family_groups (
  id uuid primary key default gen_random_uuid(),
  side text not null,             -- 'groom' | 'bride'
  surname text,
  members text,                   -- newline-separated, or jsonb if preferred
  sort_order int default 0
);

create table vendors (
  id uuid primary key default gen_random_uuid(),
  category text not null,         -- 'Photography', 'Catering', ...
  name text not null,
  url text,
  sort_order int default 0
);

create table registry_items (
  id uuid primary key default gen_random_uuid(),
  icon text,                      -- emoji or icon key
  title text not null,
  description text,
  url text,
  sort_order int default 0
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  gallery text not null,          -- 'pre_wedding' | 'post_wedding'
  storage_path text not null,     -- path in 'gallery' bucket
  caption text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text,
  sort_order int default 0
);

-- ========== PUBLIC-WRITE TABLES ==========

create table rsvps (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  attending boolean,
  events_attending text,          -- 'traditional' | 'white' | 'both'
  party_size int default 1,
  meal_preference text,
  message text,
  created_at timestamptz default now()
);

create table guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  status text default 'pending',  -- 'pending' | 'approved'
  created_at timestamptz default now()
);
```

### Row Level Security

```sql
-- Enable RLS on every table
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

-- PUBLIC READ on content tables (repeat for each content table)
create policy "public read" on settings for select using (true);
-- ...repeat the same select-using-(true) policy for: story_chapters, events,
--    wedding_party, venues, hotels, family_groups, vendors, registry_items, photos, faqs

-- GUESTBOOK: public reads only APPROVED rows; public can insert (defaults to pending)
create policy "read approved" on guestbook for select using (status = 'approved');
create policy "public insert"  on guestbook for insert with check (status = 'pending');

-- RSVP: public can insert; only admin reads
create policy "public insert" on rsvps for insert with check (true);

-- ADMIN (any authenticated user = Richie) can do everything (repeat per table)
create policy "admin all" on settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- ...repeat "admin all" for every table above (incl. rsvps + guestbook).
```

> **Note for Claude Code:** generate the repeated policies for all tables — the comments above mark where to expand. Keep public write limited to `rsvps.insert` and `guestbook.insert`.

### Storage buckets
- **`party-photos`** — portrait photos of the wedding party. Public read.
- **`gallery`** — pre-wedding and post-wedding photos. Public read.

Both buckets: **public SELECT**, **authenticated INSERT/UPDATE/DELETE only**. Configure via Supabase Storage policies. In Next config, add the Supabase storage hostname to `images.remotePatterns`.

### Seed: Our Story chapters

This is the final, approved story copy. Seed it verbatim into `story_chapters` (it is the real content, not placeholder). `eyebrow` = the small label above each title; `title` = the chapter heading; `body` = the full paragraph.

```sql
insert into story_chapters (eyebrow, title, body, sort_order) values
('2024 · The first meeting', 'A sincere compliment',
 'In 2024, in the most fitting place for a story rooted in purpose, Richard and Shula''s paths crossed at the Church of Pentecost, Maryland Central Assembly. It was not a dramatic entrance or a loud moment that started it all. It was something quieter, something that felt simple, but somehow carried weight. During the annual Christmas Convention, after church one evening, Richard noticed Shula in a dress that was modest, effortless, and striking in the way true elegance always is. He walked up to her for one reason only: to say what he genuinely saw. Just a sincere compliment, no performance, no agenda. That brief conversation became the first page of a story neither of them could predict.', 1),

('That same night', 'The words that stayed',
 'Later, Shula would admit something that still makes them smile. That same night, when she got home, she told her sister that a guy at church had said she looked amazing even though she felt she had dressed in the simplest way. It left a mark. Not because it was flattering, but because it was honest. It was the kind of moment that feels small in the room, but grows bigger in the heart. Sometimes God starts a thing quietly, then lets time reveal how loud it really is.', 2),

('Five months of patience', 'Admired from afar',
 'And then came the surprising part: nothing happened quickly. They did not exchange contacts that night. Life kept moving. For more than five months, Richard barely got the chance to speak with Shula again. He would see her and admire her from afar, with the kind of respect that does not rush what it cannot yet hold. Looking back now, that season feels meaningful. It taught patience. It protected the beginning. It let the story start with honor instead of impulse.', 3),

('Side by side in service', 'Where leadership became the bridge',
 'Their real closeness began through service. When Richard was appointed to assist as an assistant youth leader, Shula was the main youth leader, and suddenly "seeing" each other became "working" with each other. Leadership became the bridge. Responsibility became the meeting point. In those moments, they discovered something rare: they did not just get along, they aligned. They could plan together, carry tasks together, solve problems together, and still laugh like friends in the middle of it all.', 4),

('Generation of Grace', 'Built one rehearsal at a time',
 'Around that same season, the youth choir was birthed, Generation of Grace. Richard joined a few weeks after it was established, and the rehearsals became their rhythm. Almost every weekend brought practice, planning, teamwork, and those conversations that always started as normal and somehow turned unforgettable by evening. The funniest moments were not staged. They were the natural result of two people becoming comfortable, building trust one rehearsal at a time, one voice note at a time, one inside joke at a time, until "youth leaders" quietly turned into "best friends," and then, without force, into something deeper.', 5),

('Toward 2026', 'An answered prayer in motion',
 'That is the heartbeat of Rich and Shula''s story. It did not begin with a rush. It began with grace, grew through service, and deepened through consistency. What started as partners in ministry became friendship, then companionship, and now, an answered prayer in motion. As they look toward 2026, they are not just planning a wedding. They are honoring a journey that has already proven something powerful: the best love is not only felt, it is built.', 6);
```

> **Naming note:** the story prose intentionally uses **Richard / Rich**, while the site branding (monogram, footer, hashtag) uses **Richie**. This is deliberate — keep both as written.

---

## 6. Admin dashboard (Richie only)

Route group `/admin`, protected by middleware that redirects unauthenticated users to `/admin/login`. **Disable public signup** in Supabase Auth; create Richie's account manually in the Supabase dashboard.

Screens (each = list view + create/edit form):

| Route | Manages |
|---|---|
| `/admin` | Dashboard: counts (RSVPs, pending guestbook), quick links. |
| `/admin/settings` | Names, date, tagline, hashtag, RSVP deadline, livestream URL, location. |
| `/admin/story` | Story chapters (reorder via `sort_order`). |
| `/admin/events` | The two celebrations. |
| `/admin/party` | Wedding party. Filter by side + group. **Upload a photo per person** to `party-photos`; store the returned path. |
| `/admin/gallery` | Pre-wedding + post-wedding photos. **Multi-file upload** to `gallery`; set captions + order. |
| `/admin/venues` | Venues. |
| `/admin/hotels` | Hotels / travel. |
| `/admin/family` | Family groups. |
| `/admin/vendors` | Vendors. |
| `/admin/registry` | Registry items. |
| `/admin/faq` | FAQ entries. |
| `/admin/rsvps` | Read-only list of RSVPs + CSV export. |
| `/admin/guestbook` | Approve / unapprove / delete wishes. |

**Photo upload flow (admin):** file input → upload to the relevant Supabase bucket using the authenticated client → save `storage_path` to the row → preview via the public URL. Support replacing and deleting a photo. Show upload progress and a clear error message on failure.

---

## 7. Public behaviours / acceptance criteria

- **Hero countdown** ticks to `settings.wedding_date` (default `2026-10-24T14:00:00`). Stops gracefully at zero.
- **Wedding party tabs** switch between Groom's and Bride's side; people render in `sort_order`. Missing photo → elegant monogram-initials placeholder (as in the mockup).
- **RSVP form** validates name, posts to `rsvps`, shows a success state, (optionally) triggers a Resend email to Richie. Never expose other people's RSVPs publicly.
- **Guestbook** form posts as `pending`; only `approved` wishes show publicly. A "Sign the guestbook" action opens the form.
- **After-the-wedding gallery** is hidden (or shows a "coming soon" state) until the wedding date passes, then displays `gallery` photos where `gallery = 'post_wedding'`.
- **Maps** use the venue `map_url` (Google Maps link) — no API key needed.
- **SEO/meta:** title, description, and an Open Graph image (use the RS monogram on burgundy). Favicon = RS monogram.
- **Accessibility:** every photo has alt text; nav is keyboard-navigable; reduced motion respected.

---

## 8. Repo structure (suggested)

```
wedding-site/
├─ app/
│  ├─ (public)/
│  │  ├─ page.tsx                 # the long-scroll home
│  │  └─ components/              # Hero, Story, Celebrations, Party, Gallery, RSVP, ...
│  ├─ admin/
│  │  ├─ login/page.tsx
│  │  ├─ layout.tsx               # admin shell + auth guard
│  │  ├─ page.tsx                 # dashboard
│  │  ├─ party/ ... settings/ ... # one folder per content type
│  ├─ api/rsvp/route.ts           # (optional) Resend notification
│  ├─ layout.tsx                  # fonts, metadata
│  └─ globals.css
├─ lib/
│  ├─ supabase/server.ts          # @supabase/ssr server client
│  ├─ supabase/client.ts          # browser client
│  └─ queries.ts                  # typed fetch helpers per table
├─ components/ui/                 # Monogram, ThreadDivider, SectionHead, ...
├─ middleware.ts                  # protect /admin
├─ public/                        # rs-logo.svg, favicon, og-image
├─ supabase/schema.sql            # the SQL from Section 5
├─ tailwind.config.ts             # palette + font tokens
└─ .env.local
```

### Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only — never expose to the client
NEXT_PUBLIC_SITE_URL=
ADMIN_EMAIL=                      # Richie's email
RESEND_API_KEY=                   # optional
```

---

## 9. Assets checklist (Richie provides)

- **`rs-logo.svg`** — the real RS monogram exported from your brand board (transparent SVG preferred; PNG fallback). Used in hero, footer, favicon, OG image. *This is what makes the monogram pixel-perfect instead of an approximation.*
- Final **names, date, venues, hotel names + booking codes, vendor names, family surnames/members, registry links, mobile-money details, livestream link** — to replace the placeholders.
- Photos (whenever ready) for the wedding party, pre-wedding gallery, and later the post-wedding gallery.

---

## 10. Build phases (work in order)

**Phase 0 — Setup.** Scaffold Next.js + TypeScript + Tailwind. Create the Supabase project. Add env vars. Install `@supabase/ssr`, `@supabase/supabase-js`. Configure `next/font` for the four typefaces and the Tailwind palette tokens from Section 4.
*Done when:* app runs locally, Tailwind tokens resolve, Supabase clients connect.

**Phase 1 — Database.** Run `schema.sql`. Add RLS policies for every table. Create the two storage buckets with public-read / authenticated-write policies. Seed `settings`, the six **Our Story** chapters (real copy in Section 5), and placeholder rows for the rest.
*Done when:* anon key can read content, cannot write content; authenticated session can write.

**Phase 2 — Design primitives.** Build `Monogram`, `ThreadDivider`, `SectionHead`, `Countdown`, and the layout shell + sticky nav, all matching the mockup.
*Done when:* a blank page renders the hero with monogram, tagline, names, date, and a ticking countdown.

**Phase 3 — Public site.** Build every section (Section 3) as Server Components reading from Supabase via `lib/queries.ts`. Match the mockup's styling exactly. Wire the wedding-party tabs and FAQ accordion as small client components.
*Done when:* the full public page renders real data and is responsive to mobile.

**Phase 4 — Public writes.** RSVP form → `rsvps` insert + success state. Guestbook form → `guestbook` insert (pending). Public guestbook list shows approved only.
*Done when:* a submitted RSVP appears in the DB; a submitted wish stays hidden until approved.

**Phase 5 — Auth + admin shell.** Login page, `middleware.ts` guarding `/admin`, sign-out. Confirm public signup is disabled and Richie's account exists.
*Done when:* `/admin` is unreachable without login; Richie can log in.

**Phase 6 — Admin CRUD + uploads.** Build each admin screen (Section 6) with create/edit/delete, ordering, and photo upload to the correct bucket. RSVP list with CSV export. Guestbook approve/delete.
*Done when:* Richie can manage all content and photos end-to-end with no code changes.

**Phase 7 — Email (optional).** `/api/rsvp` sends a Resend notification to `ADMIN_EMAIL` on new RSVP.
*Done when:* a test RSVP emails Richie.

**Phase 8 — Polish.** SEO/meta, OG image, favicon (RS), reduced-motion pass, focus states, alt text, Lighthouse check.
*Done when:* Lighthouse ≥ 90 on performance + accessibility; looks right on phone and desktop.

**Phase 9 — Deploy.** Push to GitHub, import to Vercel, add env vars, connect the custom domain. Verify the live site and a real RSVP.
*Done when:* the site is live on the wedding domain.

---

## 11. Future / optional (not now)

- Live-stream embed on the day (YouTube/Vimeo) driven by `settings.livestream_url`.
- Optionally open the post-wedding gallery to guest uploads later (would add a moderation queue).
- Light/dark or per-section ambient motion.
- Multi-language (English / Twi) toggle.

---

## 12. How to start with Claude Code

1. Put this file and `wedding-website-mockup.html` in the repo root.
2. Tell Claude Code: *"Read `wedding-site-build-plan.md` and `wedding-website-mockup.html`. The mockup is the visual reference; the plan is the spec. Start at Phase 0 and stop after each phase for me to review."*
3. Create the Supabase project first and paste its URL + anon key into `.env.local` so Phase 1 can run.
4. Work phase by phase — don't let it skip ahead. Review the public site (Phases 3–4) before building the admin (Phases 5–6).
