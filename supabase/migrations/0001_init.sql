-- CrèmeCart V1 schema: catalog, locations/delivery, orders.
-- Every write outside checkout (product/location/order-status changes) goes
-- through the secret-key server client and bypasses RLS by design.

create extension if not exists pgcrypto;

-- ============================================================
-- CATALOG
-- ============================================================

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  slug text unique not null,
  sku text unique not null,
  name text not null,
  description text not null default '',
  category text not null, -- denormalized label, matches storefront filters
  subcategories text[] not null default '{}',
  base_price numeric(10,2) not null,
  sale_price numeric(10,2),
  default_weight text not null,
  flavors text[] not null default '{}',
  eggless_available boolean not null default false,
  eggless_price_premium numeric(10,2) not null default 0,
  stock int not null default 0,
  images text[] not null default '{}',
  ingredients text[] not null default '{}',
  allergens text[] not null default '{}',
  shelf_life text not null default '',
  bestseller boolean not null default false,
  is_active boolean not null default true,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  delivery_eligibility text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  weight text not null,
  price_multiplier numeric(6,3) not null default 1,
  serves text not null default '',
  sort_order int not null default 0
);
create index on product_variants(product_id);

-- ============================================================
-- LOCATIONS & DELIVERY
-- ============================================================

create table locations (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  state text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table delivery_zones (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  pincode text not null unique,
  delivery_fee numeric(10,2) not null default 0,
  same_day_available boolean not null default false,
  sixty_minute_available boolean not null default false,
  midnight_available boolean not null default false,
  fixed_time_available boolean not null default false,
  is_active boolean not null default true
);
create index on delivery_zones(location_id);

-- ============================================================
-- ORDERS
-- ============================================================

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'pending'
    check (status in ('pending','confirmed','preparing','baking','ready','out_for_delivery','delivered','cancelled','refunded')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  payment_method text not null default 'cod',
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null,
  coupon_code text,
  delivery_type text,
  delivery_date date,
  delivery_slot text,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  delivery_address jsonb not null,
  customer_notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  sku text,
  image text,
  weight text,
  flavor text,
  eggless boolean not null default false,
  message text,
  unit_price numeric(10,2) not null,
  quantity int not null default 1,
  line_total numeric(10,2) not null
);
create index on order_items(order_id);

create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  notes text,
  created_at timestamptz not null default now()
);
create index on order_status_history(order_id);

-- ============================================================
-- COUPONS
-- ============================================================

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'percent' check (discount_type in ('percent','flat')),
  discount_value numeric(10,2) not null,
  min_order_amount numeric(10,2) not null default 0,
  max_discount numeric(10,2),
  is_active boolean not null default true,
  expires_at timestamptz
);

-- ============================================================
-- RLS
-- ============================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table locations enable row level security;
alter table delivery_zones enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
alter table coupons enable row level security;

-- Public (anon) read access to the live catalog and delivery map only.
create policy "public read active categories" on categories for select using (true);
create policy "public read active products" on products for select using (is_active = true);
create policy "public read variants" on product_variants for select using (true);
create policy "public read active locations" on locations for select using (is_active = true);
create policy "public read active zones" on delivery_zones for select using (is_active = true);
create policy "public read active coupons" on coupons for select using (is_active = true);

-- Guest checkout: anyone can create an order + its items, nobody can read,
-- update or delete them via the public key (admin reads/writes use the
-- secret key, which bypasses RLS).
create policy "public can place orders" on orders for insert with check (true);
create policy "public can add order items" on order_items for insert with check (true);

-- No public policies at all on order_status_history: only the secret key
-- (bypasses RLS) ever touches it.
