-- Reviews are only insertable for order items whose order has been
-- delivered, enforced in the RLS check itself (not just in app code).
-- products.rating/review_count stay denormalized via trigger so existing
-- display code (ProductCard, PDP) needs no changes.

create table reviews (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null unique references order_items(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now()
);
create index on reviews(product_id);

alter table reviews enable row level security;

create policy "public read reviews" on reviews for select using (true);

create policy "reviewable only after delivery" on reviews for insert with check (
  exists (
    select 1 from order_items oi
    join orders o on o.id = oi.order_id
    where oi.id = order_item_id and o.status = 'delivered'
  )
);

create or replace function update_product_rating() returns trigger
language plpgsql security definer as $$
declare
  pid uuid := coalesce(new.product_id, old.product_id);
begin
  update products set
    rating = coalesce((select round(avg(rating)::numeric, 1) from reviews where product_id = pid), 0),
    review_count = (select count(*) from reviews where product_id = pid)
  where id = pid;
  return null;
end;
$$;

create trigger reviews_update_product_rating
after insert or delete on reviews
for each row execute function update_product_rating();
