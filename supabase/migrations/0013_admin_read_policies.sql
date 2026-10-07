-- Supabase Realtime filters postgres_changes events through RLS for the
-- CONNECTING client's own session — the admin's browser authenticates as a
-- normal `authenticated` user (via Supabase Auth), not the secret key. The
-- existing "users read own orders" policy would silently drop every event
-- for orders that aren't the admin's own, which breaks live order
-- notifications. These policies recognize the admin account via the
-- `role: admin` JWT user_metadata claim already set on it.

create policy "admin reads all orders" on orders
  for select using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

create policy "admin reads all order items" on order_items
  for select using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

create policy "admin reads all products" on products
  for select using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
