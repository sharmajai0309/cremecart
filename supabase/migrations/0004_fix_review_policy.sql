-- The original "reviewable only after delivery" policy's subquery reads
-- orders/order_items, which have their own RLS — so under the anon/
-- authenticated role that subquery saw zero rows regardless of the real
-- data, and every review insert was rejected. A SECURITY DEFINER function
-- bypasses that nested RLS to answer the one question this check needs.

create or replace function is_order_item_delivered(item_id uuid) returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from order_items oi
    join orders o on o.id = oi.order_id
    where oi.id = item_id and o.status = 'delivered'
  );
$$;

drop policy "reviewable only after delivery" on reviews;

create policy "reviewable only after delivery" on reviews for insert
  with check (is_order_item_delivered(order_item_id));
