'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Award, Cake, CheckCircle2, Clock, Copy, Heart, Leaf, MapPin,
  Moon, Plus, Snowflake, Star, Sun, Zap,
} from 'lucide-react'
import { StorefrontShell } from '@/components/storefront-shell'
import { SmartImage } from '@/components/ui/smart-image'
import { MobileHome } from '@/components/home/mobile-home'
import { CakeAssemblyScroll } from '@/components/cake/cake-assembly-scroll'
import {
  DEFAULT_DELIVERY_OPTIONS, DEFAULT_GIFTING_COLLECTIONS, DEFAULT_HERO_STATS, DEFAULT_TRUST_BADGES,
  type DeliveryOption, type GiftingCollection, type HeroStat, type TrustBadge,
} from '@/lib/homepage-content'
import { subscribeToNewsletter } from '@/lib/queries'
import type { Product } from '@/lib/data'
import { useStore } from '@/lib/store'
import { useToastStore } from '@/lib/toast-store'

export type HomeSettings = {
  hero_image_url: string | null
  hero_heading: string | null
  hero_subtitle: string | null
  hero_cta_link: string | null
  hero_cta_text: string | null
  hero_video_url?: string | null
  homepage_sections: HomepageSection[] | null
  hero_stats?: HeroStat[] | null
  delivery_options?: DeliveryOption[] | null
  trust_badges?: TrustBadge[] | null
  gifting_collections?: GiftingCollection[] | null
} | null

type HomepageSection = { key: string; visible: boolean }
type Category = { name: string; count: number; image: string }
type TopReview = { id: string; customer_name: string; rating: number; comment: string; products?: { name?: string } | null }
type ActiveCoupon = { code: string; discount_type: string; discount_value: number; min_order_amount: number }

const DEFAULT_SECTION_ORDER: HomepageSection[] = [
  { key: 'hero', visible: true },
  { key: 'categories', visible: true },
  { key: 'bestsellers', visible: true },
  { key: 'newArrivals', visible: true },
  { key: 'crafted', visible: true },
  { key: 'cities', visible: true },
  { key: 'delivery', visible: true },
  { key: 'personalise', visible: true },
  { key: 'collections', visible: true },
  { key: 'trustBadges', visible: true },
  { key: 'offers', visible: true },
  { key: 'reviews', visible: true },
  { key: 'newsletter', visible: true },
]

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=85'

const DELIVERY_ICONS = [Zap, Sun, Clock, Moon]
const DELIVERY_TONES = ['bg-[#ffdad4] text-[#400200]', 'bg-[#d2e8d8] text-[#0d1f16]', 'bg-surface-highest text-[#192c22]', 'dark']
const TRUST_ICONS = [Leaf, Snowflake, Award, Heart]

// Italicise the word "celebrate" inside the hero heading without duplicating it.
function renderHeading(text: string, emClass = 'text-accent') {
  return text.split(/(celebrate)/i).map((part, i) =>
    /^celebrate$/i.test(part)
      ? <em key={i} className={`font-normal italic ${emClass}`}>{part}</em>
      : <span key={i}>{part}</span>
  )
}

export function HomeContent({
  settings,
  bestsellers,
  categories,
  newArrivals,
  topReviews,
  coupons,
  cities,
}: {
  settings: HomeSettings
  bestsellers: Product[]
  categories: Category[]
  newArrivals: Product[]
  topReviews: TopReview[]
  coupons: ActiveCoupon[]
  cities: string[]
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false)
  const [newsletterDone, setNewsletterDone] = useState(false)
  const [newsletterError, setNewsletterError] = useState<string | null>(null)
  const { addToCart, toggleWishlist, wishlist, location, pincode } = useStore()
  const { showToast } = useToastStore()
  const railRef = useRef<HTMLDivElement>(null)
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(m.matches)
    const onChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [])

  const heroVideo = settings?.hero_video_url || null
  const showVideo = Boolean(heroVideo) && !prefersReduced

  // Admin-editable content (with code defaults as fallback).
  const heroStats = settings?.hero_stats ?? DEFAULT_HERO_STATS
  const deliveryList = settings?.delivery_options ?? DEFAULT_DELIVERY_OPTIONS
  const trustList = settings?.trust_badges ?? DEFAULT_TRUST_BADGES
  const giftingList = settings?.gifting_collections ?? DEFAULT_GIFTING_COLLECTIONS
  const heroCoupon = coupons[0]?.code

  const heroProduct = bestsellers[0]
  const heroImage = settings?.hero_image_url || heroProduct?.images[0] || FALLBACK_IMG
  const heroName = heroProduct?.name || 'Fig & Mascarpone Gateau'
  const heroPrice = heroProduct ? (heroProduct.salePrice || heroProduct.basePrice) : 2800
  const deliveringTo = pincode ? `${location} (${pincode})` : location

  function scrollRail(dir: number) {
    railRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' })
  }

  async function handleCopyCoupon(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      showToast(`Coupon ${code} copied`)
      setTimeout(() => setCopiedCode(null), 1600)
    } catch {
      showToast('Could not copy — please copy manually')
    }
  }

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNewsletterError(null)
    setNewsletterSubmitting(true)
    try {
      await subscribeToNewsletter(newsletterEmail)
      setNewsletterDone(true)
      showToast('Subscribed — welcome to the Crème Club!')
    } catch (err) {
      setNewsletterError(err instanceof Error ? err.message : 'Could not subscribe. Please try again.')
    } finally {
      setNewsletterSubmitting(false)
    }
  }

  function quickAdd(product: Product) {
    addToCart({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.basePrice,
      quantity: 1,
      weight: product.defaultWeight,
      isEggless: false,
      image: product.images[0],
    })
    showToast(`${product.name} added to cart`)
  }

  const eyebrow = 'text-[11px] font-bold uppercase tracking-[0.25em] text-accent'
  const cardShadow = 'shadow-[0_10px_30px_-18px_rgba(25,44,34,0.35)]'

  const sectionRenderers: Record<string, React.ReactNode> = {
    hero: showVideo ? (
      <section className="relative isolate w-full overflow-hidden bg-[#0f1b15]">
        <video src={heroVideo!} poster={heroImage} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0f1b15]/92 via-[#0f1b15]/65 to-[#0f1b15]/25" />
        <div className="relative mx-auto flex min-h-[520px] max-w-[1360px] flex-col justify-center px-5 py-20 sm:px-8 lg:min-h-[640px] lg:px-16 lg:py-28">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fe8672]/70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#fe8672]" /></span>
              Earliest delivery: today, 3:30 PM
              <span className="text-white/40">·</span>
              <span className="text-[#ffdad4]">{deliveringTo}</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#ffdad4]">Bespoke Patisserie &amp; Gifting</span>
            <h1 className="mt-2 font-serif text-[38px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[56px] lg:text-[68px]">
              {renderHeading(settings?.hero_heading || 'What will you celebrate today?', 'text-[#ffdad4]')}
            </h1>
            <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-white/80">
              {settings?.hero_subtitle || 'Handcrafted artisanal cakes and exquisite confections, baked fresh at dawn and hand-delivered in temperature-guarded luxury boxes.'}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={settings?.hero_cta_link || '/shop'} className="group flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-[15px] font-semibold text-white shadow-lg transition hover:bg-[#233328]">
                {settings?.hero_cta_text || 'Shop cakes'} <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/delivery" className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-[15px] font-semibold text-white backdrop-blur-md transition hover:bg-white/20">
                <Zap className="h-4 w-4 text-[#ffdad4]" /> Explore 60-min delivery
              </Link>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-6">
              {heroStats.map((stat, i) => (
                <div key={`${stat.label}-${i}`}>
                  <p className="font-serif text-[22px] font-semibold text-white">{stat.value}</p>
                  <p className="text-[13px] text-white/65">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Small chip in the corner — doubles as a real promo code, and hides any
            source watermark on the clip. Move via the bottom/right classes. */}
        <div className="absolute bottom-4 right-4 z-20">
          <button
            type="button"
            onClick={() => heroCoupon && handleCopyCoupon(heroCoupon)}
            className="flex items-center gap-2.5 rounded-2xl bg-white/95 px-5 py-3 text-[13px] font-semibold text-primary shadow-xl backdrop-blur transition hover:bg-white"
            title={heroCoupon ? `Copy code ${heroCoupon}` : 'CrèmeCart Atelier'}
          >
            <span aria-hidden className="text-base text-accent">✦</span>
            {heroCoupon ? (
              <>
                <span>Use code</span>
                <b className="font-mono text-[14px] tracking-wider">{copiedCode === heroCoupon ? 'Copied!' : heroCoupon}</b>
                <Copy className="h-4 w-4 text-ink-soft" />
              </>
            ) : (
              <span className="font-serif text-[15px]">CrèmeCart Atelier</span>
            )}
          </button>
        </div>
      </section>
    ) : (
      <section className="relative w-full overflow-hidden px-5 pt-6 pb-14 sm:px-8 lg:px-16 lg:pb-20">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Narrative column */}
          <div className="z-10 flex flex-col items-start gap-5 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-high px-4 py-1.5 text-[12px] font-semibold text-primary shadow-sm transition hover:bg-surface-highest">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
              <span>Earliest delivery slot: today, 3:30 PM</span>
              <span className="text-line-strong">·</span>
              <span className="font-medium text-accent">{deliveringTo}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className={eyebrow}>Bespoke Patisserie &amp; Gifting</span>
              <h1 className="mt-1 font-serif text-[38px] leading-[1.08] font-semibold tracking-tight text-primary sm:text-[52px] lg:text-[64px]">
                {renderHeading(settings?.hero_heading || 'What will you celebrate today?')}
              </h1>
            </div>

            <p className="max-w-xl text-[17px] leading-relaxed text-ink-variant">
              {settings?.hero_subtitle || 'Handcrafted artisanal cakes and exquisite confections, baked fresh at dawn and hand-delivered in temperature-guarded luxury boxes.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href={settings?.hero_cta_link || '/shop'} className="group flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-[15px] font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-6px_rgba(47,66,55,0.4)]">
                {settings?.hero_cta_text || 'Shop cakes'}
                <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/delivery" className="flex items-center gap-1.5 rounded-full bg-surface-high px-7 py-3.5 text-[15px] font-semibold text-primary transition hover:bg-surface-highest">
                <Zap className="h-4 w-4 text-accent" /> Explore 60-min delivery
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4 text-ink-variant">
              {heroStats.map((stat, i) => (
                <div key={`${stat.label}-${i}`}>
                  <p className="font-serif text-[22px] font-semibold text-primary">{stat.value}</p>
                  <p className="text-[13px] text-ink-soft">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual column */}
          <div className="relative mt-6 lg:col-span-5 lg:mt-0">
            <div className={`group relative mx-auto w-full overflow-hidden rounded-[2rem] bg-surface-low ${cardShadow}`}>
              <div className="relative h-[420px] w-full sm:h-[520px]">
                <SmartImage src={heroImage} alt={heroName} fill priority sizes="(max-width:1024px) 100vw, 480px" className="object-contain" />
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-md backdrop-blur-md">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Signature Heritage Cake</span>
                  <span className="font-serif text-[18px] font-semibold text-primary">{heroName}</span>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-[12px] font-semibold text-white">₹{heroPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="absolute right-4 top-4 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-white/95 p-1 text-center shadow-sm backdrop-blur">
                <span className="text-[10px] font-bold uppercase leading-tight text-accent">Artisanal</span>
                <span className="text-[9px] text-primary">Batch #42</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    ),

    categories: categories.length > 0 ? (
      <section className="w-full bg-surface px-5 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-8">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div className="flex flex-col gap-1">
              <span className={eyebrow}>The Patisserie Edit</span>
              <h2 className="font-serif text-[32px] font-semibold tracking-tight text-primary lg:text-[40px]">Shop by Category</h2>
              <p className="text-[15px] text-ink-variant">From intimate tea celebrations to grand multi-tiered centerpieces.</p>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-1 self-start text-[15px] font-semibold text-primary transition-colors hover:text-accent md:self-auto">
              Explore all cakes <ArrowRight className="h-[18px] w-[18px]" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.name} href={`/shop?category=${encodeURIComponent(cat.name)}`} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="relative aspect-square w-full overflow-hidden bg-surface-high">
                  {cat.image && <SmartImage src={cat.image} alt={cat.name} fill sizes="(max-width:768px) 50vw, 16vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />}
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-primary backdrop-blur-sm">{cat.count} Items</span>
                </div>
                <div className="flex items-center justify-between p-3.5">
                  <span className="truncate text-[15px] font-semibold text-primary transition-colors group-hover:text-accent">{cat.name}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-soft transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    bestsellers: bestsellers.length > 0 ? (
      <section className="w-full bg-surface-low px-5 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className={eyebrow}>Signature Recipes</span>
              <h2 className="font-serif text-[32px] font-semibold tracking-tight text-primary lg:text-[40px]">Our Signature Bestsellers</h2>
              <p className="text-[15px] text-ink-variant">Churned in small batches with single-origin Valrhona and cultured butter.</p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button aria-label="Previous" onClick={() => scrollRail(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm transition hover:bg-surface-high"><ArrowRight className="h-5 w-5 rotate-180" /></button>
              <button aria-label="Next" onClick={() => scrollRail(1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm transition hover:bg-surface-high"><ArrowRight className="h-5 w-5" /></button>
            </div>
          </div>
          <div ref={railRef} className="flex snap-x gap-4 overflow-x-auto pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {bestsellers.map((product) => (
              <div key={product.id} className="flex w-[280px] shrink-0 snap-start flex-col rounded-2xl bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="relative h-[220px] w-full overflow-hidden rounded-2xl bg-surface-container">
                  <Link href={`/p/${product.slug}`}><SmartImage src={product.images[0] ?? ''} alt={product.name} fill sizes="280px" className="object-cover" /></Link>
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-white">{product.bestseller ? 'Bestseller' : 'Chef Special'}</span>
                  <button aria-label="Save to wishlist" onClick={() => toggleWishlist(product.id)} className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-primary backdrop-blur transition hover:text-accent">
                    <Heart className={`h-[18px] w-[18px] ${wishlist.includes(product.id) ? 'fill-accent text-accent' : ''}`} />
                  </button>
                </div>
                <div className="flex flex-col gap-1 pt-3">
                  <div className="flex items-center gap-1.5 text-[12px] text-accent">
                    <Star className="h-[15px] w-[15px] fill-[#d8943d] text-[#d8943d]" />
                    <span className="font-bold text-ink">{product.rating}</span>
                    <span className="text-ink-soft">({product.reviewCount} reviews)</span>
                  </div>
                  <h3 className="truncate font-serif text-[18px] font-semibold text-primary">{product.name}</h3>
                  <p className="truncate text-[13px] text-ink-soft">{(product.flavors[0] && product.flavors.join(', ')) || product.category}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div>
                    {product.salePrice && <span className="text-[12px] text-ink-soft line-through">₹{product.basePrice.toLocaleString('en-IN')}</span>}
                    <p className="font-serif text-[20px] font-bold text-primary">₹{(product.salePrice || product.basePrice).toLocaleString('en-IN')}</p>
                  </div>
                  <button onClick={() => quickAdd(product)} className="flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-accent">
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    newArrivals: newArrivals.length > 0 ? (
      <section className="w-full bg-surface-container px-5 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-8">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Atelier Releases
              </div>
              <h2 className="font-serif text-[32px] font-semibold tracking-tight text-primary lg:text-[40px]">New at the Atelier this Week</h2>
              <p className="text-[15px] text-ink-variant">Limited seasonal arrivals inspired by exotic florals and fruits.</p>
            </div>
            <span className="self-start text-[11px] font-bold uppercase tracking-widest text-ink-soft md:self-auto">Drop 03 · Spring Editions</span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {newArrivals.slice(0, 3).map((product) => (
              <div key={product.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-highest">
                  <Link href={`/p/${product.slug}`}><SmartImage src={product.images[0] ?? ''} alt={product.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" /></Link>
                  <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[12px] font-semibold text-white">Limited Season</span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-5">
                  <h3 className="font-serif text-[20px] font-semibold text-primary">{product.name}</h3>
                  <p className="text-[14px] text-ink-variant">{product.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="font-serif text-[20px] font-bold text-primary">₹{(product.salePrice || product.basePrice).toLocaleString('en-IN')}</span>
                    <Link href={`/p/${product.slug}`} className="rounded-full bg-surface-high px-4 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary hover:text-white">View</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    crafted: <CakeAssemblyScroll frameCount={240} />,

    cities: cities.length > 0 ? (
      <section className="w-full bg-surface px-5 py-6 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-4 rounded-2xl bg-surface-low p-4 lg:flex-row">
          <div className="flex shrink-0 items-center gap-2 text-primary">
            <MapPin className="h-5 w-5 text-accent" />
            <span className="text-[15px] font-bold uppercase tracking-wide">Now Delivering In:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {cities.slice(0, 5).map((city, i) => (
              <Link key={city} href={`/cake-delivery/${encodeURIComponent(city)}`} className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold shadow-sm transition ${i === 0 ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-surface-highest'}`}>
                <span className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-[#ffdad4]' : 'bg-accent'}`} />
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    delivery: (
      <section className="w-full bg-surface px-5 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-8">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-1 text-center">
            <span className={eyebrow}>Precision Logistics</span>
            <h2 className="font-serif text-[32px] font-semibold tracking-tight text-primary lg:text-[40px]">Celebrations on Your Schedule</h2>
            <p className="text-[15px] text-ink-variant">Every delivery is protected by thermal temperature-lock boxes and personal white-glove concierges.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {deliveryList.map(({ title, text, cta }, i) => {
              const Icon = DELIVERY_ICONS[i % DELIVERY_ICONS.length]
              const tone = DELIVERY_TONES[i % DELIVERY_TONES.length]
              const dark = tone === 'dark'
              return (
                <div key={`${title}-${i}`} className={`flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${dark ? 'bg-primary text-white' : 'bg-surface-low hover:bg-surface-container'}`}>
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${dark ? 'bg-accent text-white' : tone}`}><Icon className="h-6 w-6" /></div>
                  <h3 className={`mb-1 font-serif text-[18px] font-semibold ${dark ? 'text-white' : 'text-primary'}`}>{title}</h3>
                  <p className={`mb-4 text-[13px] leading-relaxed ${dark ? 'text-[#99aea0]' : 'text-ink-variant'}`}>{text}</p>
                  <span className={`mt-auto flex items-center gap-1 text-[13px] font-bold ${dark ? 'text-[#ffdad4]' : 'text-accent'}`}>{cta} <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    ),

    personalise: (
      <section className="w-full px-5 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 overflow-hidden rounded-[2rem] bg-surface-container shadow-lg lg:grid-cols-12">
          <div className="flex flex-col justify-center gap-5 p-8 md:p-12 lg:col-span-7 lg:p-16">
            <div className="flex flex-col gap-1">
              <span className={eyebrow}>Bespoke Studio</span>
              <h2 className="font-serif text-[32px] font-semibold leading-tight tracking-tight text-primary lg:text-[48px]">
                A cake with your <em className="font-normal italic text-accent">story</em> written on it.
              </h2>
            </div>
            <p className="max-w-lg text-[17px] leading-relaxed text-ink-variant">
              Upload your cherished photograph, specify custom sponge notes, and let our resident decorators hand-pipe your heartfelt message in edible gold calligraphy.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Photo cake transfer', 'Custom gold piped message', 'Vintage Lambeth ruffles', 'Eggless / Gluten-free bases'].map((f) => (
                <span key={f} className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-primary shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> {f}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link href="/photo-cakes" className="group flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-accent">
                Launch Bespoke Cake Builder <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
              </Link>
              <span className="text-[13px] text-ink-soft">Lead time: 4 hours</span>
            </div>
          </div>
          <div className="relative min-h-[320px] lg:col-span-5 lg:min-h-full">
            <SmartImage src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=1000&q=85" alt="Bespoke personalised cake" fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
            <div className="absolute bottom-6 left-6 rounded-full bg-white/90 px-4 py-2 text-[13px] font-semibold text-primary shadow-sm backdrop-blur">
              Custom 30th Birthday Gateau · By Atelier Chef Mehra
            </div>
          </div>
        </div>
      </section>
    ),

    collections: (
      <section className="w-full bg-surface px-5 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-8">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <span className={eyebrow}>Epicurean Hampers</span>
              <h2 className="font-serif text-[32px] font-semibold tracking-tight text-primary lg:text-[40px]">Curated Gifting &amp; Keepsakes</h2>
              <p className="text-[15px] text-ink-variant">Tied with French grosgrain ribbon in linen keepsake boxes for grand milestones.</p>
            </div>
            <Link href="/hampers" className="inline-flex items-center gap-1 self-start text-[15px] font-semibold text-primary transition-colors hover:text-accent md:self-auto">
              View gifting catalog <ArrowRight className="h-[18px] w-[18px]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {giftingList.map((h) => (
              <div key={h.title} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container">
                  <SmartImage src={h.image} alt={h.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[12px] font-semibold text-white">{h.tag}</span>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-5">
                  <h3 className="font-serif text-[20px] font-semibold text-primary">{h.title}</h3>
                  <p className="text-[14px] text-ink-variant">{h.text}</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div>
                      <span className="text-[12px] text-ink-soft">{h.meta}</span>
                      <p className="font-serif text-[20px] font-bold text-primary">{h.price}</p>
                    </div>
                    <Link href={h.href} className="rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-accent">Gift This Box</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    trustBadges: (
      <section className="w-full bg-surface-low px-5 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {trustList.map(({ title, text }, i) => {
            const Icon = TRUST_ICONS[i % TRUST_ICONS.length]
            return (
              <div key={`${title}-${i}`} className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm"><Icon className="h-5 w-5" /></div>
                <div className="flex flex-col">
                  <h4 className="text-[15px] font-bold text-primary">{title}</h4>
                  <p className="text-[13px] text-ink-variant">{text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    ),

    offers: coupons.length > 0 ? (
      <section className="w-full bg-surface px-5 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-8">
          <div className="flex flex-col gap-1">
            <span className={eyebrow}>Sweet Privileges</span>
            <h2 className="font-serif text-[32px] font-semibold tracking-tight text-primary lg:text-[40px]">Atelier Celebration Offers</h2>
            <p className="text-[15px] text-ink-variant">Apply these exclusive tokens at checkout to sweeten your milestone.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {coupons.slice(0, 3).map((c) => (
              <div key={c.code} className="flex flex-col justify-between gap-4 rounded-2xl border-2 border-dashed border-line-strong bg-surface-low p-6">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-[#ffdad4] px-2.5 py-1 text-[11px] font-bold text-[#400200]">{c.discount_type === 'percent' ? `${c.discount_value}% Off` : `₹${c.discount_value} Off`}</span>
                  <Cake className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-[20px] font-semibold text-primary">{c.discount_type === 'percent' ? `${c.discount_value}% off your cake` : `₹${c.discount_value} off your cake`}</h3>
                  <p className="text-[13px] text-ink-variant">Valid on eligible celebration cakes{c.min_order_amount ? ` over ₹${Number(c.min_order_amount).toLocaleString('en-IN')}` : ''}.</p>
                </div>
                <div className="flex items-center justify-between rounded-full bg-white p-2">
                  <code className="px-3 text-[15px] font-bold tracking-wider text-primary">{c.code}</code>
                  <button onClick={() => handleCopyCoupon(c.code)} className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent">
                    <Copy className="h-3.5 w-3.5" /> {copiedCode === c.code ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    reviews: topReviews.length > 0 ? (
      <section className="w-full bg-surface-container px-5 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-8">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <span className={eyebrow}>Celebrant Voices</span>
              <h2 className="font-serif text-[32px] font-semibold tracking-tight text-primary lg:text-[40px]">Loved by Celebrants Across India</h2>
              <p className="text-[15px] text-ink-variant">Over 18,000 birthdays, anniversaries, and grand proposals made unforgettable.</p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 shadow-sm md:self-auto">
              <div className="flex text-[#d8943d]">{[1, 2, 3, 4, 5].map(n => <Star key={n} className="h-[18px] w-[18px] fill-[#d8943d]" />)}</div>
              <span className="text-[13px] font-bold text-primary">4.9 / 5 Overall</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {topReviews.slice(0, 3).map((r) => (
              <div key={r.id} className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
                <div className="flex flex-col gap-3">
                  <div className="flex text-[#d8943d]">{[1, 2, 3, 4, 5].map(n => <Star key={n} className={`h-4 w-4 ${n <= r.rating ? 'fill-[#d8943d]' : 'text-surface-highest'}`} />)}</div>
                  {r.comment && <p className="text-[15px] italic leading-relaxed text-ink">“{r.comment}”</p>}
                </div>
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffdad4] font-bold text-[#400200]">{r.customer_name.charAt(0).toUpperCase()}</div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-primary">{r.customer_name}</span>
                      {r.products?.name && <span className="text-[12px] text-ink-soft">Ordered: {r.products.name}</span>}
                    </div>
                  </div>
                  <CheckCircle2 className="h-[18px] w-[18px] text-primary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    newsletter: (
      <section className="w-full bg-surface px-5 py-16 sm:px-8 lg:px-16">
        <div className="relative mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-8 overflow-hidden rounded-[2rem] bg-primary p-8 text-white shadow-xl md:p-14 lg:flex-row lg:p-16">
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-primary opacity-40 blur-3xl" />
          <div className="z-10 flex max-w-xl flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#ffdad4]">Atelier Private Registry</span>
            <h2 className="font-serif text-[32px] font-semibold tracking-tight text-white lg:text-[48px]">Join the Crème Club</h2>
            <p className="text-[17px] leading-relaxed text-[#99aea0]">Receive seasonal collection previews, secret midnight tasting drops, and ₹250 off your inaugural celebration order.</p>
          </div>
          <div className="z-10 w-full shrink-0 lg:w-auto">
            {newsletterDone ? (
              <p className="text-[17px] font-medium text-[#d2e8d8]">You're in — welcome to the Crème Club!</p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex max-w-md flex-col items-stretch gap-2.5 sm:flex-row">
                <input type="email" required value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="Enter your email address..." className="w-full rounded-full bg-white px-6 py-3.5 text-[15px] text-ink shadow-sm outline-none placeholder:text-ink-soft focus:ring-2 focus:ring-[#ffdad4] sm:w-80" />
                <button type="submit" disabled={newsletterSubmitting} className="shrink-0 rounded-full bg-accent px-8 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-accent disabled:opacity-50">
                  {newsletterSubmitting ? 'Joining…' : 'Get Invited'}
                </button>
              </form>
            )}
            {newsletterError && <p className="mt-2 text-[13px] text-[#ffdad4]">{newsletterError}</p>}
            <p className="mt-2 text-[12px] text-[#99aea0]">Zero marketing spam. Only thoughtful culinary announcements. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    ),
  }

  const sectionOrder = settings?.homepage_sections ?? DEFAULT_SECTION_ORDER

  return (
    <StorefrontShell>
      <main className="w-full bg-surface">
        {/* Mobile (< md): dedicated mobile design */}
        <div className="md:hidden">
          <MobileHome
            settings={settings}
            bestsellers={bestsellers}
            categories={categories}
            newArrivals={newArrivals}
            topReviews={topReviews}
            coupons={coupons}
            cities={cities}
          />
        </div>

        {/* Desktop / tablet (>= md) */}
        <div className="hidden flex-col md:flex">
          {sectionOrder.filter(s => s.visible).map(s => (
            <div key={s.key}>{sectionRenderers[s.key]}</div>
          ))}
        </div>
      </main>
    </StorefrontShell>
  )
}
