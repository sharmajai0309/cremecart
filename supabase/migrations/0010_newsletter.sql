create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;
create policy "public can subscribe" on newsletter_subscribers for insert with check (true);
-- No public SELECT: only the admin (secret key) reads the list.
