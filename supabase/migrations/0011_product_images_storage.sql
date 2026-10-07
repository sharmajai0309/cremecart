-- Bucket itself is created via the Admin Storage API (not SQL) in this
-- migration's companion setup step. These policies just govern who can
-- read/write objects inside it once it exists.

create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

-- No insert/update/delete policies for anon/authenticated: uploads and
-- deletes only ever go through the admin server action using the secret
-- key, which bypasses storage RLS entirely (same pattern as every other
-- admin mutation in this app).
