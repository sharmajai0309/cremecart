-- Signed-in customers get a server-side wishlist so it follows them across
-- devices. Guests keep using the localStorage wishlist in lib/store.ts; the
-- account/wishlist UI merges the two.
create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index on wishlist_items(user_id);

alter table wishlist_items enable row level security;

create policy "users manage own wishlist" on wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
