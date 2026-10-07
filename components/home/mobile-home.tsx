'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Award, Check, CheckCircle2, Clock, Copy, Heart, Leaf, MapPin,
  Moon, Plus, Snowflake, Star, Sun, Zap,
} from 'lucide-react'
import { SmartImage } from '@/components/ui/smart-image'
import { CakeAssemblyScroll } from '@/components/cake/cake-assembly-scroll'
import { subscribeToNewsletter } from '@/lib/queries'
import {
  DEFAULT_DELIVERY_OPTIONS, DEFAULT_GIFTING_COLLECTIONS, DEFAULT_TRUST_BADGES,
  type DeliveryOption, type GiftingCollection, type TrustBadge,
} from '@/lib/homepage-content'
import type { Product } from '@/lib/data'
import { useStore } from '@/lib/store'
import { useToastStore } from '@/lib/toast-store'

// Mobile-only home layout, matching the Stitch "mobile_tab" screen export.
// Rendered under `md:hidden` by HomeContent; the desktop layout takes over at
// ≥768px. Self-contained — it reads/writes the same store + Supabase helpers as
// the desktop sections, so no feature is duplicated or lost.

type HomeSettings = {
  hero_image_url: string | null
  hero_heading: string | null
  hero_subtitle: string | null
  hero_cta_link: string | null
  hero_cta_text: string | null
  hero_video_url?: string | null
  delivery_options?: DeliveryOption[] | null
  trust_badges?: TrustBadge[] | null
  gifting_collections?: GiftingCollection[] | null
} | null

type Category = { name: string; count: number; image: string }
type TopReview = { id: string; customer_name: string; rating: number; comment: string; products?: { name?: string } | null }
type ActiveCoupon = { code: string; discount_type: string; discount_value: number; min_order_amount: number }

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=85'

const DELIVERY_ICONS = [Zap, Sun, Clock, Moon]
const DELIVERY_TONES = ['bg-[#ffdad4] text-[#400200]', 'bg-[#d2e8d8] text-[#0d1f16]', 'bg-surface-highest text-[#192c22]', 'bg-[#ffdad4] text-[#400200]']
const TRUST_ICONS = [Leaf, Award, Snowflake, Heart]

export function MobileHome({
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
  const { addToCart, toggleWishlist, wishlist, location, pincode } = useStore()
  const { showToast } = useToastStore()
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(m.matches)
    const onChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [])
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const heroImage = settings?.hero_image_url || bestsellers[0]?.images[0] || FALLBACK_IMG
  const deliveringTo = pincode ? `${location} (${pincode})` : location
  const heroVideo = settings?.hero_video_url || null
  const showVideo = Boolean(heroVideo) && !prefersReduced

  const deliveryList = settings?.delivery_options ?? DEFAULT_DELIVERY_OPTIONS
  const trustList = settings?.trust_badges ?? DEFAULT_TRUST_BADGES
  const giftingList = settings?.gifting_collections ?? DEFAULT_GIFTING_COLLECTIONS
  const gift = giftingList[0]

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
    setJustAdded(product.id)
    showToast(`${product.name} added to cart`)
    setTimeout(() => setJustAdded((id) => (id === product.id ? null : id)), 1400)
  }

  async function copyCoupon(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      showToast(`Coupon ${code} copied`)
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1600)
    } catch {
      showToast('Could not copy — please copy manually')
    }
  }

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await subscribeToNewsletter(email)
      setDone(true)
      showToast('Subscribed — welcome to the Epicurean Circle!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not subscribe. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const eyebrow = 'text-[11px] font-bold uppercase tracking-[0.2em] text-accent'
  const rail = 'flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col gap-4 px-5 pb-6 pt-2">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-high px-3 py-1 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className={eyebrow}>Handcrafted in {location}</span>
          </div>
          <h1 className="font-serif text-[28px] font-semibold leading-[1.12] tracking-tight text-primary">
            {settings?.hero_heading || 'What will you celebrate today?'}
          </h1>
          <p className="text-[15px] text-ink-variant">{settings?.hero_subtitle || 'Artisanal cakes baked fresh to order and chauffeured in 60 mins.'}</p>
        </div>

        <Link href={settings?.hero_cta_link || '/shop'} className="relative block w-full overflow-hidden rounded-2xl bg-surface-low shadow-sm">
          <div className={showVideo ? 'relative aspect-video w-full' : 'relative aspect-square w-full'}>
            {showVideo ? (
              <video src={heroVideo!} poster={heroImage} autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
            ) : (
              <SmartImage src={heroImage} alt="Handcrafted celebration cake" fill priority sizes="100vw" className="object-contain" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#192c22]/60 via-transparent to-transparent" />
          </div>
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-2xl bg-white/95 p-2.5 shadow-md backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ffdad4] text-[#400200]"><Clock className="h-4 w-4" /></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Fastest Slot</span>
                <span className="text-[13px] font-bold text-primary">Earliest delivery: today 3:30 PM</span>
              </div>
            </div>
            <span className="text-[13px] font-semibold text-accent">Reserve</span>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <Link href={settings?.hero_cta_link || '/shop'} className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-white shadow-sm transition active:scale-[0.98]">
            <Plus className="h-[18px] w-[18px]" /> {settings?.hero_cta_text || 'Shop cakes'}
          </Link>
          <Link href="/delivery" className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-surface-high text-[15px] font-semibold text-primary transition active:scale-[0.98]">
            <Zap className="h-[18px] w-[18px] text-accent" /> 60-min delivery
          </Link>
        </div>
      </section>

      {/* Categories — circular rail */}
      {categories.length > 0 && (
        <section className="bg-surface-low py-4">
          <div className="mb-3 flex items-center justify-between px-5">
            <div>
              <span className={eyebrow}>Pâtisserie Menu</span>
              <h2 className="font-serif text-[22px] font-semibold text-primary">Curated Selections</h2>
            </div>
            <Link href="/shop" className="text-[12px] font-semibold text-primary underline underline-offset-4">All ({categories.reduce((n, c) => n + c.count, 0)})</Link>
          </div>
          <div className={rail}>
            {categories.slice(0, 10).map((c) => (
              <Link key={c.name} href={`/shop?category=${encodeURIComponent(c.name)}`} className="group flex min-w-[76px] flex-col items-center gap-2">
                <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full bg-white p-0.5 shadow-sm transition-transform group-active:scale-95">
                  {c.image && <SmartImage src={c.image} alt={c.name} fill sizes="72px" className="rounded-full object-cover" />}
                </div>
                <span className="w-[76px] truncate text-center text-[12px] font-semibold text-primary">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bestsellers rail */}
      {bestsellers.length > 0 && (
        <section className="py-5">
          <div className="mb-3 flex items-center justify-between px-5">
            <div>
              <span className={eyebrow}>Iconic Signatures</span>
              <h2 className="font-serif text-[22px] font-semibold text-primary">Guest Favorites</h2>
            </div>
            <span className="flex items-center gap-0.5 text-[12px] text-ink-variant">Swipe <ArrowRight className="h-4 w-4" /></span>
          </div>
          <div className={rail}>
            {bestsellers.map((p) => (
              <div key={p.id} className="flex min-w-[220px] max-w-[220px] flex-col justify-between rounded-2xl bg-white p-2.5 shadow-sm">
                <div className="relative mb-2.5 aspect-square w-full overflow-hidden rounded-2xl bg-surface-low">
                  <Link href={`/p/${p.slug}`}><SmartImage src={p.images[0] ?? ''} alt={p.name} fill sizes="220px" className="object-cover" /></Link>
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">{p.bestseller ? 'Bestseller' : p.egglessAvailable ? 'Eggless' : 'Artisanal'}</span>
                  <button aria-label="Wishlist" onClick={() => toggleWishlist(p.id)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-primary backdrop-blur">
                    <Heart className={`h-4 w-4 ${wishlist.includes(p.id) ? 'fill-accent text-accent' : ''}`} />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-[15px] w-[15px] fill-[#d8943d] text-[#d8943d]" />
                    <span className="text-[12px] font-bold text-ink">{p.rating}</span>
                    <span className="text-[11px] text-ink-soft">({p.reviewCount})</span>
                  </div>
                  <h3 className="truncate font-serif text-[18px] font-semibold text-primary">{p.name}</h3>
                  <p className="line-clamp-1 text-[13px] text-ink-variant">{(p.flavors[0] && p.flavors.join(', ')) || p.category}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-[14px] font-bold text-primary">₹{(p.salePrice || p.basePrice).toLocaleString('en-IN')}</span>
                  <button onClick={() => quickAdd(p)} className="flex h-8 items-center gap-1 rounded-full bg-accent px-3.5 text-[13px] font-semibold text-white transition active:scale-95">
                    {justAdded === p.id ? (<><Check className="h-3.5 w-3.5" /> Added</>) : (<><Plus className="h-3.5 w-3.5" /> Add</>)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New this week */}
      {newArrivals.length > 0 && (
        <section className="bg-surface-container py-5">
          <div className="mb-3 flex items-center justify-between px-5">
            <div>
              <span className={eyebrow}>Seasonal Patisserie</span>
              <h2 className="font-serif text-[22px] font-semibold text-primary">New This Week</h2>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Limited</span>
          </div>
          <div className={rail}>
            {newArrivals.slice(0, 4).map((p) => (
              <div key={p.id} className="flex min-w-[260px] flex-col rounded-2xl bg-white p-3 shadow-sm">
                <div className="relative mb-2 h-36 w-full overflow-hidden rounded-2xl">
                  <Link href={`/p/${p.slug}`}><SmartImage src={p.images[0] ?? ''} alt={p.name} fill sizes="260px" className="object-cover" /></Link>
                  <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-primary backdrop-blur-sm">Seasonal</span>
                </div>
                <h3 className="font-serif text-[18px] font-semibold text-primary">{p.name}</h3>
                <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-variant">{p.description}</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-[14px] font-bold text-primary">₹{(p.salePrice || p.basePrice).toLocaleString('en-IN')}</span>
                  <Link href={`/p/${p.slug}`} className="rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-white">View</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Crafted Layer by Layer — scroll-driven cake assembly */}
      <CakeAssemblyScroll frameCount={240} />

      {/* Cities */}
      {cities.length > 0 && (
        <section className="px-5 py-4">
          <div className="mb-1 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            <h3 className="text-[15px] font-bold text-primary">Now Delivering In:</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cities.slice(0, 6).map((city, i) => (
              <Link key={city} href={`/cake-delivery/${encodeURIComponent(city)}`} className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold shadow-sm ${i === 0 ? 'bg-primary text-white' : 'bg-surface-high text-primary'}`}>
                <span className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-[#ffdad4]' : 'bg-accent'}`} /> {city}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Delivery 2x2 */}
      <section className="px-5 py-4">
        <div className="mb-2">
          <span className={eyebrow}>Climate-Controlled Fleet</span>
          <h3 className="font-serif text-[22px] font-semibold text-primary">Delivery Guarantees</h3>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {deliveryList.map(({ title, text }, i) => {
            const Icon = DELIVERY_ICONS[i % DELIVERY_ICONS.length]
            const tone = DELIVERY_TONES[i % DELIVERY_TONES.length]
            return (
              <div key={`${title}-${i}`} className="flex flex-col gap-2 rounded-2xl bg-surface-low p-3.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tone}`}><Icon className="h-[18px] w-[18px]" /></div>
                <div>
                  <h4 className="text-[14px] font-bold text-primary">{title}</h4>
                  <p className="mt-0.5 text-[12px] leading-tight text-ink-variant">{text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Personalise */}
      <section className="px-5 py-4">
        <div className="flex flex-col gap-3 overflow-hidden rounded-2xl bg-primary p-4 text-white shadow-md">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
            <SmartImage src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=900&q=85" alt="Bespoke personalised cake" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#192c22]/80 via-transparent to-transparent" />
            <span className="absolute left-2.5 top-2.5 rounded-full bg-accent px-3 py-1 text-[11px] font-bold text-white">Bespoke Atelier</span>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-[22px] font-semibold text-surface">A cake with your story on it</h3>
            <p className="text-[13px] text-[#99aea0]">Customise flavours, hand-pipe personal tributes, upload photo medallions, or specify multi-tier wedding heights.</p>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Message on cake', 'Photo print', 'Eggless option'].map((f) => (
              <span key={f} className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[12px] text-white">{f}</span>
            ))}
          </div>
          <Link href="/photo-cakes" className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#fe8672] text-[15px] font-bold text-[#400200] transition active:scale-[0.98]">
            Launch Bespoke Cake Builder <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Gifting */}
      <section className="px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className={eyebrow}>Artisanal Keepsakes</span>
            <h2 className="font-serif text-[22px] font-semibold text-primary">Curated Gifting</h2>
          </div>
          <Link href="/hampers" className="text-[12px] font-semibold text-primary underline underline-offset-4">Explore</Link>
        </div>
        <div className="space-y-3 rounded-2xl bg-surface-low p-3.5 shadow-sm">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white">
            <SmartImage src={gift.image} alt={gift.title} fill sizes="100vw" className="object-cover" />
            <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-primary backdrop-blur-sm">{gift.tag}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[18px] font-semibold text-primary">{gift.title}</h3>
              <span className="text-[14px] font-bold text-primary">{gift.price}</span>
            </div>
            <p className="text-[13px] text-ink-variant">{gift.text}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link href={gift.href} className="flex h-10 items-center justify-center gap-1 rounded-full bg-surface-high text-[12px] font-semibold text-primary">Preview Box</Link>
            <Link href={gift.href} className="flex h-10 items-center justify-center gap-1 rounded-full bg-accent text-[12px] font-semibold text-white transition active:scale-95">Send as Gift</Link>
          </div>
        </div>
      </section>

      {/* Trust 2x2 */}
      <section className="bg-surface-container px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          {trustList.map(({ title, text }, i) => {
            const Icon = TRUST_ICONS[i % TRUST_ICONS.length]
            return (
              <div key={`${title}-${i}`} className="flex items-start gap-2.5 rounded-2xl bg-white p-3 shadow-sm">
                <Icon className="mt-0.5 h-[22px] w-[22px] shrink-0 text-accent" />
                <div>
                  <h4 className="text-[13px] font-bold text-primary">{title}</h4>
                  <p className="text-[12px] leading-tight text-ink-variant">{text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Offers rail */}
      {coupons.length > 0 && (
        <section className="px-5 py-5">
          <div className="mb-3">
            <span className={eyebrow}>Celebration Treats</span>
            <h2 className="font-serif text-[22px] font-semibold text-primary">Exclusive Offers</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {coupons.slice(0, 4).map((c) => (
              <div key={c.code} className="flex min-w-[240px] flex-col justify-between rounded-2xl bg-surface-low p-3.5 shadow-sm">
                <div className="space-y-1">
                  <span className="rounded-full bg-[#ffdad4] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#400200]">{c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}</span>
                  <h4 className="font-serif text-[18px] font-semibold text-primary">{c.discount_type === 'percent' ? `${c.discount_value}% off your cake` : `Flat ₹${c.discount_value} off`}</h4>
                  <p className="text-[12px] text-ink-variant">Applicable on carts{c.min_order_amount ? ` above ₹${Number(c.min_order_amount).toLocaleString('en-IN')}` : ''}</p>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2.5">
                  <span className="font-mono text-[13px] font-bold tracking-wider text-primary">{c.code}</span>
                  <button onClick={() => copyCoupon(c.code)} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[12px] font-semibold text-white transition active:scale-95">
                    {copied === c.code ? 'Copied!' : (<><Copy className="h-3 w-3" /> Copy</>)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews rail */}
      {topReviews.length > 0 && (
        <section className="bg-surface-low py-4">
          <div className="mb-3 flex items-center justify-between px-5">
            <div>
              <span className={eyebrow}>Patron Diaries</span>
              <h2 className="font-serif text-[22px] font-semibold text-primary">Words of Praise</h2>
            </div>
            <div className="flex items-center gap-1 text-accent">
              <Star className="h-4 w-4 fill-[#d8943d] text-[#d8943d]" />
              <span className="text-[12px] font-bold text-ink">4.9 / 5.0</span>
            </div>
          </div>
          <div className={rail}>
            {topReviews.slice(0, 5).map((r) => (
              <div key={r.id} className="flex min-w-[270px] flex-col justify-between space-y-2 rounded-2xl bg-white p-3.5 shadow-sm">
                <div className="space-y-1.5">
                  <div className="flex gap-0.5 text-[#d8943d]">{[1, 2, 3, 4, 5].map(n => <Star key={n} className={`h-4 w-4 ${n <= r.rating ? 'fill-[#d8943d]' : 'text-surface-highest'}`} />)}</div>
                  <p className="text-[13px] italic text-ink">“{r.comment}”</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[13px] font-bold text-primary">{r.customer_name}</span>
                  <span className="flex items-center gap-0.5 text-[10px] uppercase tracking-wider text-ink-soft"><CheckCircle2 className="h-3 w-3" /> Verified</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="px-5 py-5">
        <div className="space-y-3 rounded-2xl bg-primary p-4 text-center shadow-md">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[#ffdad4]">
            <Zap className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-[22px] font-semibold text-surface">Join the Epicurean Circle</h3>
            <p className="mx-auto max-w-[280px] text-[13px] text-[#99aea0]">Private seasonal tastings, secret menu drops, and complimentary anniversary delivery credits.</p>
          </div>
          {done ? (
            <p className="text-[15px] font-semibold text-[#d2e8d8]">You're in — welcome!</p>
          ) : (
            <form onSubmit={subscribe} className="flex flex-col gap-2 pt-1">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="h-11 rounded-full bg-white px-4 text-[13px] text-ink outline-none placeholder:text-ink-soft" />
              <button type="submit" disabled={submitting} className="h-11 rounded-full bg-[#fe8672] font-bold text-[#400200] transition active:scale-[0.98] disabled:opacity-50">
                {submitting ? 'Subscribing…' : 'Subscribe to Atelier'}
              </button>
            </form>
          )}
          {error && <p className="text-[12px] text-[#ffdad4]">{error}</p>}
          <span className="inline-block text-[10px] uppercase tracking-widest text-[#99aea0]">We respect your privacy · No spam ever</span>
        </div>
      </section>

      <div className="px-5 pb-6 text-center text-[12px] text-ink-soft">
        Delivering to <span className="font-semibold text-primary">{deliveringTo}</span>
      </div>
    </div>
  )
}
