-- Customer accounts: link orders to a signed-in user and let customers
-- manage their own saved addresses. Guest checkout still works (user_id is
-- nullable) — this only adds real data for customers who sign in.

alter table orders add column user_id uuid references auth.users(id) on delete set null;
create index on orders(user_id);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text not null default '',
  city text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index on addresses(user_id);

alter table addresses enable row level security;

create policy "users manage own addresses" on addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Signed-in customers can see their own order history (previously orders
-- had no SELECT policy at all — inserts only, for guest checkout).
create policy "users read own orders" on orders
  for select using (auth.uid() = user_id);

create policy "users read own order items" on order_items
  for select using (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );
