# CrèmeCart — AI / Developer Handoff

> **Status:** working Supabase-backed storefront + admin CMS, server-rendered public pages.
> **Last updated:** 2026-10-07 (second pass — server components, SEO, checkout/payments, wishlist, review photos)
> This document supersedes all earlier versions. An older version described a
> frontend-only mock-data prototype — **that is no longer true**; read this file.

CrèmeCart is a premium Indian cake & gifting e-commerce app (Bakingo-inspired)
with a public storefront, customer accounts, guest checkout, online payments,
and a full admin CMS that mutates live data.

---

## 1. Tech stack

| Concern | Choice |
|---|---|
| Framework | **Next.js 16.3.3** (App Router, RSC + Server Actions; Turbopack builds) |
| UI runtime | **React 19.2.4** |
| Language | TypeScript 5.7 (`strict`) — **the build now enforces types** |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`; tokens in `app/globals.css` via `@theme`) |
| Fonts | Playfair Display (headings) + Plus Jakarta Sans (body) via Google Fonts `<link>` in `app/layout.tsx`; `--font-heading` + body font in `globals.css`; pairing in `lib/fonts.ts` |
| Smooth scroll | **Lenis** (`autoRaf`, `respectReducedMotion`) mounted via `components/smooth-scroll.tsx` — eases wheel/trackpad/touch site-wide |
| Component primitives | shadcn (`base-nova`) + `@base-ui/react` (`components/ui/button.tsx`) |
| Icons | `lucide-react` |
| Client state | **Zustand 5** with `persist` (localStorage) |
| Backend | **Supabase** — Postgres + Auth + Storage + Realtime |
| Payments | **Razorpay** (optional; COD otherwise), via REST + `crypto` HMAC (no SDK) |
| Analytics | `@vercel/analytics` (production only) |
| Package manager | declared `pnpm@12.3.4` (⚠️ both `pnpm-lock.yaml` **and** `package-lock.json` present) |

Path alias: `@/*` → project root. Scripts: `dev`, `build`, `start`, **`typecheck`** (`tsc --noEmit`).

---

## 2. Getting started

1. **Env** — `.env.local` (git-ignored via `.env*`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...   # anon / publishable key
   SUPABASE_SECRET_KEY=...                     # service-role secret, SERVER ONLY
   DATABASE_URL=...                            # migrations/psql

   NEXT_PUBLIC_SITE_URL=https://your-domain    # used for canonical URLs / sitemap / JSON-LD
   ADMIN_EMAILS=owner@example.com              # comma-separated; admin gate fallback

   # Optional — online payments (see §8). Without these, checkout is COD-only:
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   NEXT_PUBLIC_RAZORPAY_KEY_ID=                # same value as RAZORPAY_KEY_ID
   ```

2. **Database** — apply migrations **in numeric order**, then seed:
   ```
   supabase/migrations/0001_init.sql … 0019_payments.sql
   supabase/seed.sql            # catalog + locations
   supabase/seed_demo_data.sql  # optional demo orders/customers
   ```
   > ✅ Migrations 0015–0019 were applied directly to the live database on
   > 2026-10-07 (they add gift options, review photos, the server wishlist,
   > admin-picked bestsellers and the payment reference). Apply any future
   > migrations the same way — in numeric order.

3. **Run** — `pnpm dev`. Storefront at `/`, admin at `/admin`.

---

## 3. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ Public pages   SERVER Components (app/page.tsx, shop, p/[slug],  │
│                occasions, cake-delivery) fetch via queries.server │
│                and render small interactive CLIENT components     │
├──────────────────────────────────────────────────────────────┤
│ Admin pages    SERVER Components calling server actions           │
├──────────────────────────────────────────────────────────────┤
│ Data layer     lib/queries.server.ts  (RSC, cookie client)        │
│                lib/queries.ts         (browser client)            │
│                lib/supabase/{client,server}.ts                    │
│                lib/supabase/mappers.ts (shared row → Product)      │
├──────────────────────────────────────────────────────────────┤
│ Supabase       Postgres + RLS + triggers + Storage + Realtime     │
└──────────────────────────────────────────────────────────────┘
```

- **`lib/supabase/client.ts`** — `createClient()` browser anon client.
- **`lib/supabase/server.ts`** — `createClient()` (cookie-scoped anon) and
  `createAdminClient()` (**secret key, bypasses RLS**; server-only).
- **`lib/queries.server.ts`** — `import 'server-only'`; used by public Server
  Components. **`lib/queries.ts`** — browser version for the few client widgets
  that still fetch (account, PDP delivery zone, shell settings).
- **`lib/supabase/mappers.ts`** — `mapProduct` / `mapLocation`, shared by both.
- **`lib/data.ts`** — types + static option lists only. `mockProducts` /
  `mockLocations` remain as dead code (safe to delete).
- **`lib/composite-offerings.ts`** — single source of truth for the two "virtual"
  products (hamper builder, photo cake); imported by UI **and** checkout.
- **`lib/catalog.ts`** — shared PLP filter/sort logic + option labels.
- **`lib/seo.ts`** — static occasion landing-page definitions.

### Rendering model
- **Public data pages are Server Components** with `export const dynamic =
  'force-dynamic'` (catalog is admin-editable, so always fresh; crawlers get full
  HTML). Interactivity lives in client children:
  - Home → `components/home/home-content.tsx` — implements the **Stitch
    "CrèmeCart Editorial Patisserie"** design: hero with layered visual + stats,
    6-card category grid, bestseller rail with prev/next buttons, new-arrivals
    trio, city chips, 4 delivery-option cards, bespoke banner, gifting trio,
    trust badges, offers with copy, reviews, and the "Crème Club" newsletter.
    Rendered inside `StorefrontShell`, so every interactive feature (search,
    cart/wishlist, location selector, mobile nav) still works. A **dedicated
    mobile layout** (`components/home/mobile-home.tsx`, shown `md:hidden`) matches
    the Stitch "mobile_tab" screen — compact hero, circular category rail, 2×2
    delivery and trust grids, stacked bespoke/gifting cards, rail-based offers and
    reviews, and an Epicurean Circle newsletter. Hero media:
    - If `site_settings.hero_video_url` is set, the hero is a **full-bleed
      background** — an autoplaying muted looping `<video>` fills the section
      (`object-cover`) with the headline/CTAs overlaid on a dark gradient; the hero
      image is the `poster` (and the fallback under `prefers-reduced-motion`). No
      aspect gating (which previously caused a first-paint layout flash), so use a
      landscape clip. The clip is **re-encoded with a ~7% centre crop**
      (`crop=iw*0.86:ih*0.86,scale=1280:720` via ffmpeg, audio stripped) to remove
      the AI source watermark at the edges; a **coupon chip** also sits bottom-right
      (first active coupon, click to copy) as a cover + promo.
    - Otherwise the hero image renders `object-contain` (whole image, no crop) on a
      square frame, mirroring the admin preview.
    Both fall back to the still image under `prefers-reduced-motion`. A
    **"Crafted Layer by Layer"** scroll-pinned section
    (`components/cake/cake-assembly-scroll.tsx`) renders the **240-frame** cake
    assembly (`public/frames/frame_001.jpg…frame_240.jpg`, extracted at 24 fps from
    the source video) to a `<canvas>` between "New This Week" and the cities strip
    (in both the desktop and mobile layouts). Motion is eased (a short lerp toward
    the scroll target) with adjacent frames **cross-blended** so it feels fluid, not
    stepped; step copy is mapped by normalized progress (`stepBaseFrames`), so the
    frame count can change without re-authoring the steps. A
    corner banner masks the AI source watermark and the canvas sits in a sleek
    rounded card. Desktop sections render at ≥768px and a custom `homepage_sections`
    only affects the desktop layout.
  - Shop → `components/shop/shop-browser.tsx` (URL-state filters)
  - PDP → `components/product/product-detail.tsx`
- **Images** render through `components/ui/smart-image.tsx`, which uses
  `next/image` for local paths + allow-listed hosts (Unsplash, `*.supabase.co`,
  avatars) and falls back to `<img>` for arbitrary admin-pasted URLs.
- **Storefront theme** — the Stitch "Editorial Patisserie" look is applied across
  **all public pages** (admin excluded): Playfair Display + Plus Jakarta Sans
  (global `--font-heading` / body font) and the warm surface palette
  `#fff8f5` / `#fcf2ec` / `#f6ece7` / borders `#e6e2dd` / text `#1f1b18` /
  muted `#737874`, with the brand accent set to `#a03f30`. The shared
  `StorefrontShell` header/footer/tab bar was restyled too. **Every token is
  themeable**: primary + accent + the whole surface/ink palette (`surface`,
  `surface-low`, `surface-container`, `surface-high`, `surface-highest`, `line`,
  `line-strong`, `ink`, `ink-variant`, `ink-soft`) are CSS variables set at
  runtime by `ThemeProvider` from `site_settings`, and editable in the admin
  Theme panel (migration `0021`). Components use the utilities `bg-surface`,
  `bg-surface-low`, `border-line`, `text-ink`, `text-ink-soft`, etc.
- **Smooth scroll** — `components/smooth-scroll.tsx` mounts **Lenis** in the root
  layout, easing wheel/trackpad/touch scroll site-wide so the scroll-driven cake
  section (and every page) scrolls continuously rather than in discrete wheel steps.
- **Admin pages remain server components** that call server actions.

### Client state — `lib/store.ts` (Zustand, persisted `cremecart-storage`)
`location`, `pincode`, `cart`, `wishlist` (+ `setWishlist` for sync), `coupon*`.
`components/wishlist-sync.tsx` merges the localStorage wishlist with the
`wishlist_items` table for signed-in users (two-way).

---

## 4. Directory structure (changed/added files marked ✚)

```
app/
├── page.tsx ✚ SERVER (was client) — fetches data, JSON-LD, renders HomeContent
├── sitemap.ts ✚ / robots.ts ✚
├── shop/page.tsx ✚ SERVER — URL-state filters via ShopBrowser
├── p/[slug]/page.tsx ✚ SERVER — generateMetadata + Product JSON-LD → ProductDetail
├── occasions/[slug]/page.tsx ✚  SEO landing pages (lib/seo.ts)
├── cake-delivery/[city]/page.tsx ✚  city SEO landing pages
├── api/search/route.ts ✚   server-side catalog search
├── checkout/
│   ├── page.tsx ✚ rebuilt: schedule, gift options, address prefill, upsells, payments
│   ├── actions.ts ✚ placeOrder stores scheduling/gift/payment fields
│   └── payment-actions.ts ✚ Razorpay create + verify
├── track-order/actions.ts ✚ submitReview(images) + uploadReviewImage
├── track-order/page.tsx ✚ review photo upload UI
├── admin/… (unchanged layout) ; homepage/homepage-form.tsx ✚ featured-products picker
└── (unreferenced client pages unchanged: cart, account, wishlist, photo-cakes, …)

components/
├── home/home-content.tsx ✚ (desktop sections)
├── home/mobile-home.tsx ✚ (mobile layout)
├── cake/cake-assembly-scroll.tsx ✚ (scroll-driven cake image-sequence)
├── shop/shop-browser.tsx ✚
├── product/product-detail.tsx ✚
├── admin/pagination.tsx ✚
├── ui/smart-image.tsx ✚
└── wishlist-sync.tsx ✚

lib/
├── catalog.ts ✚ · seo.ts ✚ · queries.server.ts ✚ · supabase/mappers.ts ✚

proxy.ts ✚  (was middleware.ts; Next 16 renamed it — see §7)

supabase/migrations/0015_gift_options.sql ✚ · 0016_review_images.sql ✚
                      0017_wishlist.sql ✚ · 0018_featured_products.sql ✚ · 0019_payments.sql ✚
```

---

## 5. Data model

All tables have **RLS enabled**; admin mutations bypass RLS via the secret key.

| Table | Notes |
|---|---|
| `categories`, `products`, `product_variants` | catalog (`category` denormalized text) |
| `locations`, `delivery_zones` | cities + per-pincode capability flags |
| `orders` | + ✚ `is_gift`, `gift_recipient_name`, `gift_message`, `payment_reference` |
| `order_items`, `order_status_history` | line items, status audit |
| `coupons`, `site_settings` | + ✚ `featured_product_ids uuid[]`, `hero_stats`, `delivery_options`, `trust_badges`, `gifting_collections` (JSONB, admin-editable homepage blocks), `hero_video_url`, plus the themeable colour palette (`primary_color`, `accent_color`, `surface_*`, `line_*`, `ink_*`) |
| `reviews` | + ✚ `images text[]` |
| `addresses`, `contact_messages`, `newsletter_subscribers`, `inventory_transactions` | unchanged |
| `wishlist_items` ✚ | `(user_id, product_id)` unique; owner-only RLS |

**Storage:** bucket `product-images` (public read) holds product images, brand
assets, and ✚ review photos under a `reviews/` prefix.

**Functions (SECURITY DEFINER):** `decrement_stock`, `update_product_rating`,
`is_order_item_delivered`.

---

## 6. Migration history

`0001` catalog/delivery/orders/coupons/RLS · `0002` customer auth + addresses ·
`0003` reviews + rating trigger · `0004` review RLS fix (`is_order_item_delivered`) ·
`0005` rating trigger fix · `0006` site_settings, inventory, `decrement_stock`,
`reviews.is_hidden` · `0007` hide moderated reviews at DB · `0008` contact_messages ·
`0009` advertised coupons · `0010` newsletter · `0011` storage policies ·
`0012` realtime publication · `0013` `role:admin` read policies ·
`0014` theme + homepage sections.

**New (✚, applied 2026-10-07):**
- `0015_gift_options` — `orders.is_gift / gift_recipient_name / gift_message`.
- `0016_review_images` — `reviews.images`.
- `0017_wishlist` — `wishlist_items` table + RLS.
- `0018_featured_products` — `site_settings.featured_product_ids`.
- `0019_payments` — `orders.payment_reference` (+ index).
- `0020_homepage_content` — `site_settings.hero_stats / delivery_options /
  trust_badges / gifting_collections` (JSONB; makes the remaining hardcoded
  homepage blocks editable from the admin panel).
- `0021_theme_surfaces` — `site_settings.surface_* / line_* / ink_*` colour
  columns (+ `surface-low`, `surface-high`, `surface-highest`, `line-strong`,
  `ink-variant`), so the whole neutral palette is admin-themeable.
- `0022_hero_video` — `site_settings.hero_video_url` (optional 9:16 hero reel).

---

## 7. Auth & authorization

Two audiences share **one** Supabase Auth instance: customers (`/login`, `/signup`)
and the admin (`/admin/login`).

**Admin gate — `proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`).** It
refreshes the session and requires the user to be an **admin**, recognised by:
- the JWT claim `user_metadata.role === 'admin'`, **or**
- an email listed in `ADMIN_EMAILS`.

Not-signed-in → redirected to `/admin/login`. Signed-in non-admin → redirected to
`/`. Admin on the login page → redirected to `/admin`. This closes the previous
hole where *any* signed-in customer passed the gate. Server-action POSTs to
`/admin/*` are covered by the same matcher, so the secret-key mutations are
gated too.

> Defense-in-depth is still worth adding (a `requireAdmin()` check at the action
> layer), but the gate itself is now real.

---

## 8. Key flows

### Checkout — `app/checkout/actions.ts` `placeOrder()`
Prices are **recomputed server-side**, never trusted from the client (catalog →
DB price × variant multiplier + eggless premium; virtual items → shared
constants). Stock is checked then decremented via `decrement_stock`. Coupons are
re-validated. Returns `{ orderNumber, total, orderId }` and now also persists
`delivery_date`, `delivery_slot`, `delivery_type`, gift fields, `payment_method`
and `payment_reference`.

### Payments — `app/checkout/payment-actions.ts`
- `createRazorpayOrder(input)` → calls `placeOrder({ paymentMethod: 'razorpay' })`,
  creates a Razorpay order via REST (basic auth), stores its id in
  `payment_reference`, returns `{ orderNumber, total, razorpayOrderId, keyId }`.
- `verifyRazorpayPayment(...)` → HMAC-SHA256 of `orderId|paymentId` with the
  secret; on match sets `payment_status = 'paid'`.
- The "Pay Online" option only appears when `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set;
  the server independently requires its own secret. Without keys, checkout is COD.

### PDP — `app/p/[slug]/page.tsx` + `components/product/product-detail.tsx`
Server page supplies `generateMetadata` and **Product JSON-LD**; the client
handles weight/eggless/flavour/message, pincode delivery-zone filtering, wishlist,
add-to-cart, and **Buy Now → `/checkout`** (previously it only added to cart).

### Search — `app/api/search/route.ts`
Server-side, debounced from the header (`storefront-shell.tsx`); returns up to 6
matches across name/category/flavour.

### SEO
`app/sitemap.ts` (static routes + occasions + products + cities),
`app/robots.ts` (disallows `/admin`, `/account`, `/cart`, `/checkout`, `/api`,
`/track-order`), per-page `metadata`, WebSite/Product JSON-LD, canonical URLs
from `NEXT_PUBLIC_SITE_URL`.

### Wishlist
Guests use localStorage; `components/wishlist-sync.tsx` merges with and writes to
`wishlist_items` for signed-in users.

### Realtime (admin)
`lib/useRealtimeRefresh.ts` (unchanged) subscribes to `postgres_changes` and
debounces `router.refresh()`.

---

## 9. Admin panel

Sidebar unchanged (Dashboard, Orders, Products, Categories, Inventory, Customers,
Sales, Reviews, Locations, Coupons, Homepage, Theme, Messages, Newsletter). All
mutations live in `app/admin/actions.ts` (secret-key client).

- **Orders** and **Products** lists use **server-side search + pagination**
  (`listOrdersPaged` / `listProductsPaged`, 20/page). Filters are URL state
  (`?q=&status=` for orders, `?q=&category=` for products) driven by plain GET
  forms; `components/admin/pagination.tsx` preserves the query string. The
  dashboard now fetches only the 5 most recent orders (`listRecentOrders`).
- The Homepage form can hand-pick featured bestsellers
  (`site_settings.featured_product_ids`); the homepage rail falls back to newest
  cakes when empty.
- The Homepage form also edits **hero stats, delivery-option cards, trust badges
  and gifting collections** (repeatable list editors → JSONB columns from
  `0020`). Product **prices/images** live in Products, offers in Coupons,
  cities/zones in Locations, reviews in Reviews, and colours/fonts/logo/section
  order in Theme — so the whole homepage is admin-driven. (Remaining hardcoded
  copy: a few section eyebrows/headings and the bespoke-banner + newsletter
  paragraphs.)
- The shared **`StorefrontShell` was restyled** to the editorial design: a
  marquee announcement, a translucent sticky header (logo, `MegaMenu`, search,
  wishlist, cart count, account) with a location row + "60-min express" pill, a
  4-column footer, and a mobile tab bar (Home / Cakes / Gifting / Cart / Profile).
- The **Theme** panel edits primary + accent **and the full surface/ink palette**
  (10 colour pickers, migration `0021`), font pairing, and logo — all applied
  live to every public page via CSS variables.
- The Homepage form also has a **Hero Video URL** field — set it to a clip served
  from `public/` (e.g. `/hero-video.mp4`); landscape clips render full-bleed and the
  hero image becomes the poster.
- Homepage sections include a **"Crafted Layer by Layer"** scroll animation
  (`crafted` key in `homepage_sections`, frames in `public/frames/`) — toggle and
  reorder it from the Theme panel.

---

## 10. Known issues / gotchas

1. ✅ Migrations 0015–0019 are **applied** (2026-10-07).
2. **`ADMIN_EMAILS` (or the `role:admin` claim) must be set** or the admin is
   locked out by the stricter gate. `.env.local` already lists the owner email.
3. ✅ Admin pages are now **dynamic** (the `requireAdmin()` guard reads cookies),
   so the CMS never serves build-time data and `next build` no longer needs DB
   access for them.
4. ✅ Photo-cake images upload to Storage (`app/photo-cakes/actions.ts`); the cart
   stores the public URL, not a base64 blob (verified end-to-end).
5. **`lib/data.ts`** still exports unused `mockProducts` / `mockLocations`.
6. **Two lockfiles** (`pnpm-lock.yaml`, `package-lock.json`) with `packageManager: pnpm`.
7. **Secrets** — `.env.local` holds the secret key and a plaintext admin
   email+password in comments. Git-ignored; rotate as needed.
8. **Repo context** — this project sits inside a git repo whose history/`git
   status` reference unrelated projects. Confirm the correct repo before committing.
9. **`AGENTS.md` / `CLAUDE.md`** contain no project guidance. Use this handoff.
10. **Uploads** (hero / product / review / photo-cake) are sent through Server
    Actions, which cap the request body at **1MB by default**. `next.config.mjs`
    raises this via `experimental.serverActions.bodySizeLimit` (currently
    `'8mb'`, with matching guards in the upload actions). Raise it if you need
    larger files.

---

## 11. Conventions

- Storefront containers: `mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16` (20px
  mobile / 32px tablet / 64px desktop side padding) — used by the shell header,
  location row, footer and every section so their edges line up. Narrow focused
  flows (cart, checkout, account, track-order) keep smaller max widths on purpose.
- Server-only mutations: `'use server'` + `createAdminClient()`; never import the
  secret-key client into client code.
- Public reads in RSC go through `lib/queries.server.ts`; interactive client
  widgets use `lib/queries.ts`.
- Money: numeric in DB, `Number(...)` out, `toLocaleString('en-IN')` for display.
- Images: `<SmartImage>`, `fill` inside a sized/relative container.
- Revalidate storefront paths after admin writes (`revalidatePath` in actions).

---

## 12. Suggested next steps

1. Remove dead mock data from `lib/data.ts`; consolidate to one lockfile.
2. Smoke-test the Razorpay flow once `RAZORPAY_*` keys are set; set the
   `role:admin` claim on the admin account and rotate the demo password.
3. Extend server-side search/pagination to the remaining admin lists (customers,
   reviews, messages, newsletter).
4. Optionally make the last hardcoded homepage strings admin-editable (section
   eyebrows/headings, bespoke-banner copy, newsletter copy).
5. Remaining backlog: `ENHANCEMENTS.md`.
