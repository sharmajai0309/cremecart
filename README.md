<div align="center">

# 🍰 CrèmeCart

**A premium cake & gifting e-commerce platform — storefront + admin CMS, built on Next.js 16 & Supabase.**

Freshly baked cakes, thoughtful gifting, and a scroll-driven “how it’s made” experience.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%C2%B7%20Auth%20%C2%B7%20Storage%20%C2%B7%20Realtime-3ECF8E?logo=supabase)
![License](https://img.shields.io/badge/license-proprietary-lightgrey)

</div>

---

## ✨ Highlights

- **Editorial storefront** — premium warm palette (Playfair Display + Plus Jakarta Sans), sticky header with mega-menu, global search, location selector and a mobile tab bar.
- **“Crafted Layer by Layer”** — a scroll-pinned, `<canvas>`-driven cake-assembly sequence (240 frames) that builds as you scroll and **reverses** when you scroll up. No video element, no player UI.
- **Hero reel** — optional full-bleed background video with the hero image as poster/fallback.
- **Full admin CMS** — products, variants, categories, inventory, orders, customers, sales, reviews, coupons, delivery zones, homepage content, theme, messages and newsletter — all persisted in Supabase.
- **Admin-driven theming** — colours, surface palette, fonts and logo are editable in `/admin` and applied live site-wide via CSS variables.
- **Customer accounts** — Supabase Auth, saved addresses, order history and a server-synced wishlist.
- **Checkout** — server-recomputed pricing (never trusts the client), coupons, delivery date/slot, gift options, upsells and optional **Razorpay** online payments (COD fallback).
- **SEO-ready** — server-rendered catalog, per-page metadata, Product/WebSite JSON-LD, `sitemap.xml` and `robots.txt`.
- **Polished motion** — Lenis smooth scrolling, cross-blended scroll animation, `prefers-reduced-motion` fallbacks.
- **Quality gate** — strict TypeScript enforced at build time (`pnpm typecheck` + `next build`).

## 📸 Preview

> Drop screenshots/GIFs into `public/preview/` and reference them here for the GitHub showcase:
>
> ```md
> ![Homepage](./public/preview/home.png)
> ![Crafted Layer by Layer](./public/preview/crafted.gif)
> ![Shop](./public/preview/shop.png)
> ![Admin dashboard](./public/preview/admin.png)
> ```

## 🧱 Tech stack

| Concern | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router, RSC + Server Actions) |
| UI runtime | **React 19** |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS v4** · shadcn/`@base-ui` primitives |
| Fonts | Playfair Display + Plus Jakarta Sans |
| State | **Zustand 5** (persisted) |
| Backend | **Supabase** — Postgres, Auth, Storage, Realtime |
| Payments | **Razorpay** (optional) · COD |
| Smooth scroll | **Lenis** |
| Icons | lucide-react |
| Analytics | Vercel Analytics |

## 🚀 Getting started

### 1. Install
```bash
pnpm install      # or npm install
```

### 2. Environment (`.env.local`, git-ignored)
```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...          # server only — bypasses RLS
DATABASE_URL=postgresql://...              # for migrations / psql
ADMIN_EMAILS=owner@example.com             # who may reach /admin

# optional
NEXT_PUBLIC_SITE_URL=https://your-domain   # canonical URLs, sitemap, JSON-LD
RAZORPAY_KEY_ID= / RAZORPAY_KEY_SECRET= / NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

### 3. Database — apply migrations in order, then seed
```bash
supabase/migrations/0001_init.sql … 0022_hero_video.sql
supabase/seed.sql            # catalog + locations
supabase/seed_demo_data.sql  # optional demo orders/customers
```

### 4. Run
```bash
pnpm dev      # http://localhost:3000   ·  admin at /admin
pnpm typecheck
pnpm build && pnpm start
```

## ☁️ Deploy on Vercel

Connect the repo, then add these in **Vercel → Project → Settings → Environment
Variables** (enable for Production **and** Preview). `NEXT_PUBLIC_*` values are inlined
at **build time**, so redeploy after changing them.

| Variable | Scope | Required | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | ✅ | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | ✅ | anon / publishable key |
| `SUPABASE_SECRET_KEY` | **Secret (server)** | ✅ | service-role key — **bypasses RLS**. Mark *Sensitive*. |
| `ADMIN_EMAILS` | Server | ✅ | comma-separated admins allowed into `/admin` |
| `NEXT_PUBLIC_SITE_URL` | Public | recommended | `https://your-domain` (canonical URLs, sitemap, OG) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public | optional | only if you enable online payments |
| `RAZORPAY_KEY_ID` | Secret | optional | Razorpay key id (server-side order creation) |
| `RAZORPAY_KEY_SECRET` | Secret | optional | Razorpay secret (signature verification) |

> `DATABASE_URL` is **not needed on Vercel** — it's only for running the SQL migrations
> (locally / CI). Admin login accounts live in Supabase Auth, not env vars. Never prefix
> a secret with `NEXT_PUBLIC_`.

## 🗺️ Routes

**Storefront:** `/` · `/shop` · `/p/[slug]` · `/cart` · `/checkout` · `/account` · `/wishlist` · `/track-order` · `/offers` · `/photo-cakes` · `/make-your-own-hamper` · `/personalise` · `/desserts` · `/hampers` · `/delivery` · `/about` · `/contact` · `/faq` · `/occasions/[slug]` · `/cake-delivery/[city]` · `/login` · `/signup` · `/forgot-password` · `/reset-password`

**Admin (`/admin`):** dashboard · orders · products (+ variants & images) · categories · inventory · customers · sales · reviews · locations/zones · coupons · homepage content · theme · messages · newsletter · CSV exports.
API: `GET /api/search`.

## 📁 Project structure

```
app/                 # routes (App Router)
  admin/             #   admin CMS (gated by proxy.ts)
  api/search/        #   server-side catalog search
components/
  home/              #   homepage sections (desktop + mobile)
  cake/              #   scroll-driven cake-assembly canvas
  shop/ product/ ui/ admin/
  storefront-shell.tsx  theme-provider.tsx  smooth-scroll.tsx
lib/
  queries.server.ts  queries.ts  supabase/  store.ts  catalog.ts  seo.ts ...
public/
  frames/            #   240 cake-assembly frames
proxy.ts             # Next 16 middleware (admin auth gate)
supabase/migrations/ # 0001 … 0022
```

## 🛠 Admin panel

Every piece of storefront content is admin-editable: hero copy/image/video, hero stats, delivery cards, trust badges, gifting collections, products & prices, categories, coupons, serviceable cities, homepage section order, theme (colours + fonts + logo), reviews moderation, customer messages and newsletter subscribers — plus CSV exports for orders/products/newsletter.

> `/admin` is gated in `proxy.ts` (role/allow-list) and each server action re-checks with `requireAdmin()`.

## 📚 Documentation

- **[`DOCUMENTATION.md`](./DOCUMENTATION.md)** — full technical documentation (architecture, data model, flows, deployment).
- **[`AI_HANDOFF.md`](./AI_HANDOFF.md)** — handoff notes for contributors / AI agents.
- **[`ENHANCEMENTS.md`](./ENHANCEMENTS.md)** — roadmap & backlog.

## 🗺️ Status

Storefront and admin CMS are feature-complete for a first launch. Remaining before go-live is mostly polish: real-device QA (iOS Safari), a testimonials/marketing pass, and CI (typecheck + build). See `ENHANCEMENTS.md`.

## 📄 License

Proprietary — © CrèmeCart. All rights reserved. (Update this section for your intended licence.)
# cremecart
