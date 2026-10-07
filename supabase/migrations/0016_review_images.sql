-- Customer review photos. Images are uploaded through a server action using
-- the secret-key client (same pattern as product images), stored under the
-- existing public `product-images` bucket at a `reviews/` prefix, and only the
-- resulting public URLs are saved here.
alter table reviews add column images text[] not null default '{}';
