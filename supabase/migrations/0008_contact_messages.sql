-- The contact page's "Send message" button previously did nothing at all.
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  order_number text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;
create policy "public can send a message" on contact_messages for insert with check (true);
-- No public SELECT: only the admin (secret key) reads these.
