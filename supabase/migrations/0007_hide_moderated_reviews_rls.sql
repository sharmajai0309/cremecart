-- The original public policy let anyone SELECT any review regardless of
-- is_hidden; hiding only worked because the app happened to filter client
-- side. Enforce it at the database level too.
drop policy "public read reviews" on reviews;
create policy "public read visible reviews" on reviews for select using (is_hidden = false);
