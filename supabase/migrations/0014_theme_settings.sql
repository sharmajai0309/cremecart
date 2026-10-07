-- Extends the existing site_settings singleton (already used for homepage
-- hero content) with brand/theme fields and a homepage section order, so
-- "change the theme" has somewhere real to write to.

alter table site_settings
  add column primary_color text not null default '#2f4237',
  add column accent_color text not null default '#c85d4b',
  add column font_pairing text not null default 'serif-classic',
  add column logo_url text,
  add column homepage_sections jsonb not null default '[
    {"key": "hero", "visible": true},
    {"key": "categories", "visible": true},
    {"key": "bestsellers", "visible": true},
    {"key": "newArrivals", "visible": true},
    {"key": "cities", "visible": true},
    {"key": "delivery", "visible": true},
    {"key": "personalise", "visible": true},
    {"key": "collections", "visible": true},
    {"key": "trustBadges", "visible": true},
    {"key": "offers", "visible": true},
    {"key": "reviews", "visible": true},
    {"key": "newsletter", "visible": true}
  ]'::jsonb;
