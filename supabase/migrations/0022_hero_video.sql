-- Optional hero video (e.g. a portrait "reel" clip). Rendered in place of the
-- hero image when set; the hero image remains the poster/fallback.
alter table site_settings add column hero_video_url text;
