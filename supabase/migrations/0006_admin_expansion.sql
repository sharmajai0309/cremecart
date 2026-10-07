-- Homepage content the admin can edit without a full page builder.
create table site_settings (
  id int primary key default 1,
  announcement_text text not null default 'Fresh cakes delivered today · Free delivery on orders over ₹999',
  hero_heading text not null default 'What will you celebrate today?',
  hero_subtitle text not null default 'Freshly baked cakes, thoughtful gifts and desserts delivered when you need them.',
  hero_cta_text text not null default 'Shop cakes',
  hero_cta_link text not null default '/shop',
  hero_image_url text not null default '/cremecart-hero.png',
  updated_at timestamptz not null default now(),
  check (id = 1)
);
insert into site_settings (id) values (1);

alter table site_settings enable row level security;
create policy "public read site settings" on site_settings for select using (true);

-- Inventory: stock actually moves on sale now (it never did before), with
-- every change — sale, manual adjustment — logged for a real audit trail.
create table inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  quantity_change int not null,
  type text not null check (type in ('sale', 'adjustment', 'restock')),
  order_id uuid references orders(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);
create index on inventory_transactions(product_id);

alter table inventory_transactions enable row level security;
-- No public policies: only the secret key (admin CRUD) and the
-- SECURITY DEFINER decrement_stock() function below ever write here.

-- Runs as the function owner so it can update `products` (anon/authenticated
-- have no UPDATE policy there) and log the transaction atomically. Stock is
-- clamped at 0 so concurrent orders can't drive it negative.
create or replace function decrement_stock(p_product_id uuid, p_quantity int, p_order_id uuid) returns void
language plpgsql security definer as $$
begin
  update products set stock = greatest(stock - p_quantity, 0) where id = p_product_id;
  insert into inventory_transactions (product_id, quantity_change, type, order_id)
  values (p_product_id, -p_quantity, 'sale', p_order_id);
end;
$$;

grant execute on function decrement_stock(uuid, int, uuid) to anon, authenticated;

-- Reviews moderation: hidden reviews stay in the table but count toward
-- neither the storefront list nor the aggregated product rating.
alter table reviews add column is_hidden boolean not null default false;

create or replace function update_product_rating() returns trigger
language plpgsql security definer as $$
declare
  pid uuid := coalesce(new.product_id, old.product_id);
  cnt int := (select count(*) from reviews where product_id = pid and is_hidden = false);
begin
  if cnt > 0 then
    update products set
      rating = (select round(avg(rating)::numeric, 1) from reviews where product_id = pid and is_hidden = false),
      review_count = cnt
    where id = pid;
  end if;
  return null;
end;
$$;

-- Hiding/unhiding a review only fires UPDATE, which the original trigger
-- (insert/delete only) never covered — ratings wouldn't recompute on moderation.
create trigger reviews_update_product_rating_on_update
after update of is_hidden on reviews
for each row execute function update_product_rating();
