-- ============================================================================
-- Richie & Shula — Seed data (Phase 1)
-- Run AFTER schema.sql, in the Supabase SQL editor.
-- Idempotent: settings upsert by key; every other block only seeds when its
-- table is still empty, so re-running won't duplicate or clobber admin edits.
-- Rows marked [Placeholder] / TBA are meant to be replaced by Richie in /admin.
-- ============================================================================

-- ---- settings (real values + a few placeholders) ----
insert into settings (key, value) values
  ('couple_names',   'Richie & Shula'),
  ('wedding_date',   '2026-10-24T14:00:00'),
  ('hashtag',        '#RichieAndShula2026'),
  ('tagline',        'Timeless · Elegant · Effortless'),
  ('rsvp_deadline',  '2026-09-24'),
  ('livestream_url', ''),
  ('hero_location',  'Maryland, USA'),
  ('registry_note',  'Your presence is the greatest gift. If you wish to bless us further, a few options are below.')
on conflict (key) do update set value = excluded.value;

-- ---- Our Story chapters (REAL, approved copy — seed verbatim) ----
insert into story_chapters (eyebrow, title, body, sort_order)
select * from (values
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
 'That is the heartbeat of Rich and Shula''s story. It did not begin with a rush. It began with grace, grew through service, and deepened through consistency. What started as partners in ministry became friendship, then companionship, and now, an answered prayer in motion. As they look toward 2026, they are not just planning a wedding. They are honoring a journey that has already proven something powerful: the best love is not only felt, it is built.', 6)
) as v(eyebrow, title, body, sort_order)
where not exists (select 1 from story_chapters);

-- ---- events (the two celebrations — placeholder details) ----
insert into events (day_label, title, side_color, event_date, event_time, venue_name, attire, description, sort_order)
select * from (values
('Day One', 'Traditional Ceremony', 'burgundy', '2026-10-24', '11:00 AM', '[Venue TBA]', 'Traditional / Cultural attire',
 '[Placeholder] Join us for our traditional ceremony as two families become one.', 1),
('Day Two', 'The White Wedding', 'teal', '2026-10-25', '2:00 PM', '[Venue TBA]', 'Formal — black tie optional',
 '[Placeholder] A white wedding celebration and reception to follow.', 2)
) as v(day_label, title, side_color, event_date, event_time, venue_name, attire, description, sort_order)
where not exists (select 1 from events);

-- ---- wedding party (placeholders across all four groups) ----
insert into wedding_party (side, group_key, name, role, sort_order)
select * from (values
('groom', 'trad_men',    '[Name TBA]',        'Traditional', 1),
('groom', 'trad_men',    '[Name TBA]',        'Traditional', 2),
('groom', 'groomsmen',   '[Best Man TBA]',    'Best Man',    1),
('groom', 'groomsmen',   '[Name TBA]',        'Groomsman',   2),
('bride', 'trad_ladies', '[Name TBA]',        'Traditional', 1),
('bride', 'trad_ladies', '[Name TBA]',        'Traditional', 2),
('bride', 'bridesmaids', '[Maid of Honour]',  'Maid of Honour', 1),
('bride', 'bridesmaids', '[Maid of Honour]',  'Maid of Honour', 2),
('bride', 'bridesmaids', '[Name TBA]',        'Bridesmaid',  3)
) as v(side, group_key, name, role, sort_order)
where not exists (select 1 from wedding_party);

-- ---- venues (placeholders) ----
insert into venues (kind, name, address, map_url, time_note, notes, sort_order)
select * from (values
('engagement', '[Engagement Venue TBA]', '[Address TBA]', '', '', '[Placeholder]', 1),
('ceremony',   '[Ceremony Venue TBA]',   '[Address TBA]', '', '', '[Placeholder]', 2),
('reception',  '[Reception Venue TBA]',  '[Address TBA]', '', '', '[Placeholder]', 3)
) as v(kind, name, address, map_url, time_note, notes, sort_order)
where not exists (select 1 from venues);

-- ---- hotels / travel (placeholders) ----
insert into hotels (name, tier, address, notes, booking_url, sort_order)
select * from (values
('[Recommended Hotel TBA]', 'Recommended', '[Address TBA]', '[Booking code TBA]', '', 1),
('[Mid-range Hotel TBA]',   'Mid-range',   '[Address TBA]', '[Placeholder]', '', 2),
('Getting here',            'Getting here', '', 'Nearest airport: [TBA]. [Placeholder travel notes].', '', 3)
) as v(name, tier, address, notes, booking_url, sort_order)
where not exists (select 1 from hotels);

-- ---- family groups (placeholders) ----
insert into family_groups (side, surname, members, sort_order)
select * from (values
('groom', '[Groom''s Family TBA]', E'[Member name]\n[Member name]', 1),
('bride', '[Bride''s Family TBA]', E'[Member name]\n[Member name]', 2)
) as v(side, surname, members, sort_order)
where not exists (select 1 from family_groups);

-- ---- vendors (placeholders) ----
insert into vendors (category, name, url, sort_order)
select * from (values
('Photography', '[Vendor TBA]', '', 1),
('Catering',    '[Vendor TBA]', '', 2),
('Decor',       '[Vendor TBA]', '', 3),
('Music / DJ',  '[Vendor TBA]', '', 4)
) as v(category, name, url, sort_order)
where not exists (select 1 from vendors);

-- ---- registry items (placeholders — the three planned options) ----
insert into registry_items (icon, title, description, url, sort_order)
select * from (values
('🏠', 'Home Registry',  '[Placeholder] A registry for our new home.', '', 1),
('✈️', 'Honeymoon Fund', '[Placeholder] Help us toward our honeymoon.',  '', 2),
('📱', 'Mobile Money',   '[Placeholder] Mobile money details.',          '', 3)
) as v(icon, title, description, url, sort_order)
where not exists (select 1 from registry_items);

-- ---- faqs (placeholders) ----
insert into faqs (question, answer, sort_order)
select * from (values
('What should I wear?', '[Placeholder] See the Colours & Dress Code section above.', 1),
('Can I bring a guest?', '[Placeholder] Please refer to your invitation; indicate party size in your RSVP.', 2),
('Where should I stay?', '[Placeholder] See Travel & Stay for recommended hotels.', 3),
('Is there parking?', '[Placeholder] Details to come.', 4)
) as v(question, answer, sort_order)
where not exists (select 1 from faqs);
