# CrèmeCart — Full Documentation

> A premium Indian cake & gifting e-commerce platform: a Next.js 16 storefront plus a
> Supabase-backed admin CMS. This is the technical reference; see `README.md` for the
> project overview and `AI_HANDOFF.md` for a condensed handoff.

---

## 1. Overview

CrèmeCart is a production-style e-commerce app: a public storefront, customer
accounts, guest checkout, optional online payments, and a full admin CMS that mutates
live data. Two roles exist — **customers** (Supabase Auth) and **admin** (same Auth,
identified by role/allow-list) — and every piece of storefront content is editable
from the admin panel.

## 2. Tech stack

| Concern | Choice |
| --- | --- |
| Framework | **Next.js 16.3** — App Router, React Server Components, Server Actions |
| UI runtime | **React 19.2** |
| Language | **TypeScript 5.7** (strict — the build fails on type errors) |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`; theme via `@theme` in `app/globals.css`) |
| Fonts | Playfair Display (headings) + Plus Jakarta Sans (body) |
| Components | shadcn (`base-nova`) + `@base-ui/react`; icons via `lucide-react` |
| Client state | **Zustand 5** with `persist` (localStorage key `cremecart-storage`) |
| Backend | **Supabase** — Postgres, Auth, Storage, Realtime |
| Payments | **Razorpay** (optional; COD otherwise) |
| Smooth scroll | **Lenis** |
| Analytics | `@vercel/analytics` (production only) |
| Migrations | `supabase/migrations/0001…0022` |

## 3. Architecture

```
Public pages   Server Components (home, shop, PDP, occasions, city) that fetch via
               lib/queries.server.ts and render small interactive client children
Admin pages    Server Components calling server actions (secret-key client)
Data layer     lib/queries.server.ts (RSC, cookie client)
               lib/queries.ts        (browser client, for client widgets)
               lib/supabase/{client,server}.ts  ·  lib/supabase/mappers.ts
Supabase       Postgres + RLS + triggers + Storage + Realtime
```

- **`lib/supabase/client.ts`** — `createClient()` browser anon client.
- **`lib/supabase/server.ts`** — `createClient()` (cookie-scoped anon, server reads) and
  `createAdminClient()` (**secret key, bypasses RLS**; server only).
- **`lib/queries.server.ts`** — `server-only` reads used by Server Components.
  **`lib/queries.ts`** — browser reads for the few client widgets.
- **`lib/supabase/mappers.ts`** — row → `Product`/`Location` mapping shared by both.
- **`lib/composite-offerings.ts`** — single source of truth for the two “virtual”
  products (hamper builder, photo cake), imported by UI **and** checkout.

### Rendering model
- Public data pages are **Server Components** with `export const dynamic =
  'force-dynamic'` (catalog is admin-editable) so crawlers get full HTML.
- Interactivity lives in client children:
  `components/home/home-content.tsx` (desktop) + `components/home/mobile-home.tsx`
  (mobile), `components/shop/shop-browser.tsx` (URL-state filters), and
  `components/product/product-detail.tsx` (PDP).
- Admin pages are server components calling server actions.
- **`proxy.ts`** (Next 16’s renamed middleware) gates `/admin`.

## 4. Getting started

### Environment (`.env.local`, git-ignored)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...     # anon key
SUPABASE_SECRET_KEY=...                       # service-role key, SERVER ONLY
DATABASE_URL=postgresql://...                 # migrations / psql
ADMIN_EMAILS=owner@example.com                # comma-separated admin allow-list

# optional
NEXT_PUBLIC_SITE_URL=https://your-domain      # canonical URLs / sitemap / JSON-LD
RAZORPAY_KEY_ID= / RAZORPAY_KEY_SECRET= / NEXT_PUBLIC_RAZORPAY_KEY_ID=
```
Without Razorpay keys, checkout is COD-only (the online option is hidden).

### Database
Apply `supabase/migrations/0001…0022` **in order** (later files patch earlier policies
and triggers), then `supabase/seed.sql` (catalog + locations) and optionally
`supabase/seed_demo_data.sql`.

### Scripts
```
pnpm dev        # next dev
pnpm build      # next build (type-checks)
pnpm start      # next start
pnpm typecheck  # tsc --noEmit
```
> There is no lint/test script configured.

## 5. Data model

All tables have **RLS enabled**; admin mutations bypass RLS via the secret key.

| Table | Purpose |
| --- | --- |
| `categories`, `products`, `product_variants` | Catalog (`products.category` is a denormalized label matching filters) |
| `locations`, `delivery_zones` | Cities + per-pincode capability flags & fee |
| `orders`, `order_items`, `order_status_history` | Orders, line items (prices snapshotted), status audit |
| `coupons` | percent/flat, min order, max discount, expiry |
| `site_settings` | Singleton row: announcement, hero copy/image/video, theme colours, font, logo, `homepage_sections`, `featured_product_ids`, hero_stats/delivery/trust/gifting JSONB |
| `reviews` | One per delivered order item; rating/comments/`images`; `is_hidden` moderation |
| `addresses` | Saved customer addresses (owner-only) |
| `contact_messages`, `newsletter_subscribers` | Inbound messages / subscribers |
| `inventory_transactions` | Stock audit (`sale`/`adjustment`/`restock`) |
| `wishlist_items` | Per-user wishlist |

**Storage:** bucket `product-images` (public read) holds product images, brand assets,
review photos and photo-cake uploads.

**Functions (SECURITY DEFINER):** `decrement_stock`, `update_product_rating`,
`is_order_item_delivered`.

## 6. Migration index

| # | What |
| --- | --- |
| 0001 | Catalog, locations/delivery, orders, coupons, base RLS |
| 0002 | Customer auth: `orders.user_id`, `addresses`, read-own policies |
| 0003 | `reviews` + rating trigger |
| 0004 | Review insert policy fix (`is_order_item_delivered`) |
| 0005 | Rating trigger: don’t zero the baseline |
| 0006 | `site_settings`, `inventory_transactions`, `decrement_stock`, `reviews.is_hidden` |
| 0007 | Hide moderated reviews at the DB |
| 0008 | `contact_messages` |
| 0009 | Seed advertised coupons |
| 0010 | `newsletter_subscribers` |
| 0011 | `product-images` storage policies |
| 0012 | Realtime publication |
| 0013 | `role: admin` read policies (for admin realtime) |
| 0014 | Theme fields + default `homepage_sections` |
| 0015 | Gift options on orders |
| 0016 | Review images |
| 0017 | `wishlist_items` |
| 0018 | `site_settings.featured_product_ids` |
| 0019 | `orders.payment_reference` |
| 0020 | Homepage-content JSONB (hero stats, delivery, trust, gifting) |
| 0021 | Themeable surface/ink colour columns |
| 0022 | `site_settings.hero_video_url` |

## 7. Auth & authorization

Customers sign up/in via `/login`, `/signup` (browser client). Admin signs in at
`/admin/login` (server action).

**`proxy.ts`** gates `/admin/:path*`: a user is an admin when the JWT claim
`user_metadata.role === 'admin'` **or** their email is in `ADMIN_EMAILS`. Not signed in
→ `/admin/login`; signed in but not admin → `/`. Every admin server action also calls
`requireAdmin()` (defense in depth). Set `ADMIN_EMAILS` (or the `role: admin` claim)
before use, or the admin is locked out.

## 8. Key flows

**Checkout** — `app/checkout/actions.ts` `placeOrder()` recomputes all prices
server-side (catalog price × variant multiplier + eggless premium; virtual items via
`composite-offerings`), checks then decrements stock (`decrement_stock`), re-validates
coupons, and persists delivery date/slot, gift fields and payment info.

**Payments** — `app/checkout/payment-actions.ts`: `createRazorpayOrder()` creates the
DB order + a Razorpay order (REST) and stores its id; `verifyRazorpayPayment()`
verifies the HMAC signature and marks the order paid. COD by default.

**Reviews** — track order (`/track-order`) exposes a review form once delivered;
RLS only allows insertion for delivered order items; photos upload via a server action.

**Wishlist** — `components/wishlist-sync.tsx` merges the localStorage wishlist with
`wishlist_items` for signed-in users (two-way).

**Search** — `GET /api/search?q=` (server-side), debounced from the header.

**Realtime (admin)** — `lib/useRealtimeRefresh.ts` subscribes to `postgres_changes`
and debounces `router.refresh()`.

**Theming** — `components/theme-provider.tsx` sets CSS variables (`--primary`,
`--accent`, the surface/ink palette, `--font-heading`) from `site_settings`;
`app/globals.css` exposes them as Tailwind tokens.

**Smooth scroll** — `components/smooth-scroll.tsx` mounts **Lenis** in the root layout
(lerp 0.08, `respectReducedMotion`).

**Hero media** — `site_settings.hero_image_url` + optional `hero_video_url`. A video
renders as a full-bleed background (autoplay/muted/loop, poster = hero image, image
fallback under `prefers-reduced-motion`).

**“Crafted Layer by Layer”** — `components/cake/cake-assembly-scroll.tsx` renders a
240-frame cake-assembly image sequence (`public/frames/frame_001…240.jpg`) to a
`<canvas>`, pinned (`360vh` outer / `100svh` sticky), scroll-mapped **1:1** with
cross-blended frames, reversable, eagerly preloaded, with a `prefers-reduced-motion`
static fallback and a corner/caption overlay. Wired as the `crafted` section in
`homepage_sections`.

## 9. Admin panel

Sidebar: Dashboard, Orders, Products, Categories, Inventory, Customers, Sales,
Reviews, Locations, Coupons, Homepage, Theme, Messages, Newsletter. All mutations live
in `app/admin/actions.ts` (secret key). CSV exports at `app/admin/export/*`.

Admins control: products/variants/prices/images, categories, inventory + audit,
orders + status, customers, sales breakdowns, review moderation, coupons, delivery
zones, **homepage content** (hero copy/image/**video**, hero stats, delivery cards,
trust badges, gifting collections, featured bestsellers, section order), **theme**
(primary/accent + full surface/ink palette, font pairing, logo), messages, newsletter.

## 10. SEO

Per-page `metadata` + canonical URLs (`NEXT_PUBLIC_SITE_URL`), Product/WebSite
JSON-LD, `app/sitemap.ts` and `app/robots.ts`; public pages are server-rendered.

## 11. Design system

- **Fonts:** Playfair Display + Plus Jakarta Sans (Google Fonts `<link>`; pairing in
  `lib/fonts.ts`).
- **Themeable tokens (CSS variables from `site_settings`):** `primary`, `accent`,
  `surface`, `surface-low/container/high/highest`, `line`, `line-strong`, `ink`,
  `ink-variant`, `ink-soft` → Tailwind utilities `bg-surface`, `border-line`,
  `text-ink`, `text-ink-soft`, etc.
- **Container standard:** `mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16`
  (20/32/64 px side padding) used by the shell and every section so edges line up.
  Narrow focused flows (cart/checkout `5xl`, account `6xl`, track-order `3xl`) stay
  narrower by design.
- **Images:** `components/ui/smart-image.tsx` (next/image for local + allow-listed
  hosts, `<img>` fallback for arbitrary admin URLs).

## 12. Deployment

Vercel is the natural host (App Router + Vercel Analytics). Steps: connect the repo,
set the env vars below, ensure the DB has all migrations applied, and deploy.
`proxy.ts` runs at the edge for the admin gate. Rotate the service-role key and admin
password, and remove stray source media from `public/` before launch.

### Environment variables (Project → Settings → Environment Variables)

| Variable | Scope | Required | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | ✅ | used by client, server client + proxy |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | ✅ | anon / publishable key |
| `SUPABASE_SECRET_KEY` | **Secret (server)** | ✅ | service-role; `createAdminClient()` bypasses RLS |
| `ADMIN_EMAILS` | Server | ✅ | comma-separated admin allow-list (`proxy.ts`, `requireAdmin`) |
| `NEXT_PUBLIC_SITE_URL` | Public | recommended | `https://your-domain`; used by `sitemap.ts`, `robots.ts`, page metadata/JSON-LD (falls back to `http://localhost:3000`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public | optional | online payments only |
| `RAZORPAY_KEY_ID` | Secret | optional | server-side Razorpay order creation |
| `RAZORPAY_KEY_SECRET` | Secret | optional | payment signature verification |

- **Not needed on Vercel:** `DATABASE_URL` (migrations only — run them locally / in CI:
  `psql "$DATABASE_URL" -f supabase/migrations/000N_*.sql` in order).
- `NEXT_PUBLIC_*` are inlined at **build time** — redeploy after changing them.
- Never prefix a secret with `NEXT_PUBLIC_`; keep `SUPABASE_SECRET_KEY` and
  `RAZORPAY_KEY_SECRET` as *Sensitive*.

## 13. Conventions

- Server-only work: `'use server'` + `createAdminClient()`; never import the secret-key
  client into client code.
- Public reads in RSC via `lib/queries.server.ts`; interactive client widgets via
  `lib/queries.ts`.
- Money: numeric in DB, `Number(...)` out, `toLocaleString('en-IN')` for display.
- Storefront UI uses the shared theme tokens (never raw hex) so one Theme save
  re-skins the site; `/admin` is excluded (its own styling).
- After admin writes, `revalidatePath` the affected storefront paths.

## 14. Known issues / gotchas

1. Admin access requires `ADMIN_EMAILS` or the `role: admin` claim set.
2. Uploads go through Server Actions — `next.config.mjs` raises
   `experimental.serverActions.bodySizeLimit` to `8mb` (default is 1 MB).
3. A `next.config.mjs` change only takes effect after a dev-server restart.
4. `public/` should not ship unused source media (large AI source clips).
5. No lint/test/CI configured; `pnpm typecheck` + `next build` are the gate.
6. `lib/data.ts` still exports unused `mockProducts`/`mockLocations` (types remain).
7. Two lockfiles (`pnpm-lock.yaml`, `package-lock.json`) — pick one.

## 15. Roadmap

See `ENHANCEMENTS.md`. Headline items: admin list pagination/search for the remaining
sections, occasion/blog content, product video, testimonials/marketing pages, CI,
and real-device QA.
