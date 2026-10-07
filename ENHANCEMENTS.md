# CrèmeCart — Enhancement Backlog

Improvement ideas for the **admin panel** and the **storefront / homepage**.
Ordered roughly by impact within each section.

Legend: 🔴 high impact / likely bug or risk · 🟡 worthwhile · 🟢 polish

---

## ✅ Implemented (2026-10-07)

- **Server-rendered public data** — home, shop and PDP are now Server Components
  (`lib/queries.server.ts`), so crawlers get full HTML instead of client-fetched
  skeletons.
- **`next/image`** via `components/ui/smart-image.tsx` (with a safe fallback for
  arbitrary admin-pasted URLs); `images.unoptimized` removed, `remotePatterns` added.
- **Metadata / OG / JSON-LD / `sitemap.ts` / `robots.ts`**; canonical URLs from
  `NEXT_PUBLIC_SITE_URL`; Product + WebSite structured data.
- **`typescript.ignoreBuildErrors` removed**; added a `typecheck` script. The
  build now enforces types.
- **Checkout**: delivery date + slot picker, gift options (recipient + message),
  address prefill for signed-in users, upsell suggestions, and **online payments
  (Razorpay)** alongside COD.
- **PDP "Buy Now"** now goes straight to checkout (was just add-to-cart).
- **Server-side search** (`/api/search`) wired into the debounced header search.
- **PLP filters with URL state** (`?category=&flavor=&price=&sort=&q=`), filtered
  server-side and shareable.
- **Homepage personalization** — "Delivering to {city} · {pincode}" from the
  visitor's location.
- **Admin-picked bestsellers** — `site_settings.featured_product_ids` + picker in
  the Homepage admin form.
- **Server-side wishlist** (`wishlist_items`) synced two-way with localStorage.
- **Occasion + city SEO landing pages** (`/occasions/[slug]`, `/cake-delivery/[city]`).
- **Review photos + rating breakdown** on the PDP; photo upload in the review form.
- **Admin authorization fixed** — `proxy.ts` (Next 16's renamed middleware) now
  requires the `role:admin` claim or an `ADMIN_EMAILS` match, **and** every admin
  action and CSV export route re-checks via `requireAdmin()` (defense in depth).
- **Photo-cake images upload to Storage** (`app/photo-cakes/actions.ts`); the cart
  holds the public URL, not a base64 blob.
- **Migrations 0015–0019 applied** to the live database.
- **Admin Orders & Products: server-side search + pagination**
  (`listOrdersPaged` / `listProductsPaged`, URL-state filters via GET forms);
  the dashboard now loads only the 5 most recent orders.
- **Premium homepage redesign implemented** from the Stitch "Editorial
  Patisserie" design (`components/home/home-content.tsx` + `mobile-home.tsx`),
  wired to live data, with Playfair Display + Plus Jakarta Sans and the new
  surface palette.
- **Shell restyled** (`components/storefront-shell.tsx`) — marquee announcement,
  translucent sticky header + location row, 4-column footer, and a
  Home/Cakes/Gifting/Cart/Profile mobile tab bar.
- **Homepage content is admin-editable** — hero + stats, delivery-option cards,
  trust badges and gifting collections (migration `0020`, JSONB on
  `site_settings`) alongside the existing products/prices, coupons, cities and
  theme.
- **Editorial theme applied site-wide** — the new fonts + warm palette now cover
  every public page (admin unchanged); brand accent set to `#a03f30`.
- **Whole palette made themeable** — surface/line/ink tokens became CSS variables
  (`0021`) set by `ThemeProvider` and editable in the admin Theme panel, and the
  ~30 storefront files were refactored onto `bg-surface` / `border-line` /
  `text-ink` utilities.
- **Hero video support** — optional clip (`site_settings.hero_video_url`, migration
  `0022`) renders a **full-bleed background hero**: autoplay/muted/loop, poster =
  hero image, image fallback under `prefers-reduced-motion`. A landscape clip is
  recommended.
- **"Crafted Layer by Layer" scroll animation** — 240-frame cake assembly
  (`public/frames/frame_001.jpg…frame_240.jpg`, 24 fps, 1024×576) drawn to a
  `<canvas>`, scroll-pinned (`360vh`), eagerly preloaded on mount, reversible,
  reduced-motion/mobile aware (`components/cake/cake-assembly-scroll.tsx`, `crafted`
  homepage section). Motion is direct 1:1 with cross-blended frames, and a corner
  banner masks the AI source watermark.
- **Smooth scroll (Lenis)** — eased wheel/trackpad/touch scrolling site-wide
  (`components/smooth-scroll.tsx` in the root layout) so the scroll animation and
  the whole site feel premium instead of stepped.

---

## A. Admin panel (remaining)

### A1. Security & access
- ✅ Role gate in `proxy.ts` **and** a `requireAdmin()` guard on every admin
  action + CSV export route (defense in depth).
- **Still to do:** real **staff accounts/roles** if a second person ever needs access.
- **Audit log** of admin actions (generalize `inventory_transactions`).
- **Server-side schema validation** (Zod) on action inputs.

### A2. Orders 🔴
- ✅ Search (order no / name / phone) + status filter + pagination (`listOrdersPaged`).
- **Still:** status timeline UI rendering `order_status_history` (written, never shown).
- **Full status set** — DB enum allows `confirmed`/`baking`/`ready`/`refunded`
  that the UI never exposes.
- **Payment status + refunds**; the new `payment_status`/`payment_reference`
  fields have no admin UI yet.
- **Print invoice / packing slip**, **bulk actions**, surface `admin_notes`, and
  let admins set `delivery_date`/`delivery_slot`.

### A3. Dashboard 🟡
- ✅ Loads only the 5 most recent orders (`listRecentOrders`) instead of all orders.
- **Still:** date-range selector, period-over-period comparison, conversion funnel,
  top products/cities, and an **actionable** notification bell (the `/admin`
  header bell is still decorative).

### A4. Products & catalog 🟡
- ✅ Search (name / SKU) + category filter + pagination (`listProductsPaged`).
- **Still:** duplicate / bulk edit / bulk import; multi-image drag-reorder;
  per-variant stock; SEO fields; scheduled publish.

### A5. Inventory 🟡
- Restock flow with target qty; per-product reorder threshold (still hard-coded
  `< 5`); low-stock digest.

### A6. Customers 🟡
- Export the customer list; customer detail (LTV, tags, block); move the JS
  aggregation in `listCustomers()` to a SQL view.

### A7. Coupons 🟡
- Usage limits, start date, **delivery-fee coupon type** (free delivery is still
  faked as flat ₹49), auto-apply, eligible-products scoping.

### A8. Locations & delivery 🟡
- Bulk pincode import, clone zone, per-zone cutoffs/time windows and per-capability
  fees (schema stores one `delivery_fee` per pincode today).

### A9. Reviews / messages / newsletter 🟢
- Reply to reviews, approval queue, verified badge; message reply/archive;
  newsletter import/export + campaign send.

### A10. Cross-cutting 🟢
- Consistent loading/empty/error states (some forms use `alert()`); image lifecycle
  cleanup + alt text; responsive admin sidebar.
- Make admin pages `force-dynamic` so the CMS never serves build-time data.
  ✅ Done (as a side effect of the `requireAdmin()` guard).

---

## B. Storefront / homepage (remaining)

### B1. Performance & SEO
- ✅ Server components, `next/image`, metadata/JSON-LD/sitemap/robots, build types.
- **Still:** LCP/image `sizes` tuning and streaming with `<Suspense>`/`loading.tsx`.

### B2. Search & discovery 🟡
- ✅ Server-side search + URL-state PLP filters.
- **Still:** fuzzy matching, recent searches, richer no-results, rating/delivery
  filters.

### B3. Homepage 🟡
- ✅ **Redesigned** to the Stitch "Editorial Patisserie" layout, wired to live
  data (hero, categories, bestseller rail, new arrivals, cities, delivery,
  bespoke, gifting, trust, offers, reviews, newsletter).
- ✅ **Dedicated mobile layout** (`components/home/mobile-home.tsx`) matching the
  Stitch "mobile_tab" screen, shown below 768px.
- ✅ **Shell restyled** — marquee announcement, translucent sticky header with
  location row + express pill, 4-column footer, and a Home/Cakes/Gifting/Cart/
  Profile mobile tab bar.
- ✅ **Homepage content is admin-editable** — hero + stats, delivery cards, trust
  badges, gifting collections (plus products/prices, coupons, cities, theme).
- ✅ City/pincode personalization, admin-picked bestsellers.
- **Still:** recently-viewed / "buy again" rails, offer countdowns, lazy-loading
  below-the-fold sections; a few section eyebrows/headings plus the
  bespoke-banner and newsletter copy remain hardcoded.

### B4. Cart & checkout 🔴
- ✅ Online payments, delivery slot picker, address prefill, gift options, upsells,
  Buy Now fix.
- **Still:** abandoned-cart capture, richer upsell logic, saved-card/UPI recall,
  email/SMS order notifications.

### B5. Accounts & wishlist 🟡
- ✅ Server-side wishlist sync.
- **Still:** share-wishlist; verify the review form is discoverable from `/account`.

### B6. Content & trust 🟢
- ✅ Occasion + city landing pages, review photos + rating breakdown.
- **Still:** newsletter double opt-in + unsubscribe; analytics events for the
  admin funnel; review pagination.

### B7. Accessibility & mobile 🟢
- Alt text/focus/`aria` pass; sticky mobile add-to-cart; verify bottom-nav spacing.

---

## C. Cross-cutting

- **Single lockfile** (remove one of `package-lock.json` / `pnpm-lock.yaml`).
- **Delete dead code** — `mockProducts`, `mockLocations` in `lib/data.ts`.
- ✅ Photo-cake base64 moved to Storage.
- **Error tracking** (Sentry) and **CI** (typecheck + build) before launch.
