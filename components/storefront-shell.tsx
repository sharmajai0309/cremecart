'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Cake, Gift, Heart, Home, MapPin, Menu, Phone, Search, ShoppingBag, Store, UserRound, X, Zap } from 'lucide-react'
import { useStore } from '@/lib/store'
import { getSiteSettings } from '@/lib/queries'
import { SmartImage } from '@/components/ui/smart-image'
import { WishlistSync } from '@/components/wishlist-sync'
import { MegaMenu } from './ui/MegaMenu'
import { LocationSelector } from './ui/LocationSelector'

const DEFAULT_ANNOUNCEMENT = 'Fresh cakes delivered today · Free delivery over ₹999 · Delhi NCR, Mumbai, Bengaluru'

type SearchResult = { id: string; slug: string; name: string; category: string; image: string; price: number }

export function StorefrontShell({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [announcement, setAnnouncement] = useState(DEFAULT_ANNOUNCEMENT)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const { location, cart } = useStore()
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    getSiteSettings().then(s => { setAnnouncement(s.announcement_text); setLogoUrl(s.logo_url) }).catch(console.error)
  }, [])

  // Debounced server-side search so results come from the whole catalog, not
  // just whatever the browser happened to load.
  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setSearchResults([])
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then(r => r.json())
        .then(d => setSearchResults(d.results ?? []))
        .catch(() => {})
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-surface text-ink pb-16 md:pb-0">
      <LocationSelector isOpen={locationOpen} onClose={() => setLocationOpen(false)} />
      <WishlistSync />

      {/* Marquee announcement */}
      <div className="overflow-hidden bg-primary py-1.5 text-white">
        <div className="marquee-track text-[11px] font-bold uppercase tracking-widest">
          {[0, 1].map(k => (
            <span key={k} className="mx-4 inline-flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#fe8672]" />
              {announcement}
              <span className="mx-4 inline-block h-1.5 w-1.5 rounded-full bg-[#fe8672]" />
              Handcrafted Patisserie · Artisanal Gifting
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 shadow-[0_4px_20px_rgba(25,44,34,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1360px] items-center gap-4 px-5 py-2.5 sm:px-8 lg:px-16">
          <button className="xl:hidden" aria-label="Open menu" onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false) }}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2">
            {logoUrl
              ? <SmartImage src={logoUrl} alt="CrèmeCart" width={140} height={36} className="h-8 w-auto object-contain" />
              : <span className="font-serif text-2xl font-semibold leading-none tracking-tight text-primary">Crème<span className="text-accent">Cart</span></span>}
          </Link>

          <MegaMenu />

          <div className="ml-auto flex items-center gap-1 text-ink-variant">
            <button aria-label="Search" onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false) }} className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-high">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/wishlist" aria-label="Wishlist" className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-high sm:flex">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href="/cart" aria-label="Shopping cart" className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-high">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{cartCount}</span>}
            </Link>
            <Link href="/account" aria-label="Account" className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <UserRound className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>

        {(menuOpen || searchOpen) && (
          <div className="border-t border-line bg-surface px-5 py-4 sm:px-8 lg:px-16">
            <div className="mx-auto max-w-[1360px]">
              {searchOpen ? (
                <div>
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-line-strong bg-white px-5 py-3 text-sm outline-none focus:border-accent"
                    placeholder="Search cakes, flavours, gifts or occasions"
                  />
                  {searchQuery.trim() && (
                    <div className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
                      {searchResults.length === 0 ? (
                        <p className="px-4 py-4 text-sm text-ink-soft">No cakes found for “{searchQuery}”.</p>
                      ) : (
                        searchResults.map(p => (
                          <Link
                            key={p.id}
                            href={`/p/${p.slug}`}
                            onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-low"
                          >
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                              <SmartImage src={p.image} alt={p.name} fill sizes="40px" className="object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-ink">{p.name}</p>
                              <p className="text-xs text-ink-soft">{p.category}</p>
                            </div>
                            <span className="font-semibold text-ink">₹{p.price}</span>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-variant">
                  <Link href="/shop">All cakes</Link>
                  <Link href="/shop?category=Bento Cakes">Bento cakes</Link>
                  <Link href="/shop?category=Eggless">Eggless cakes</Link>
                  <Link href="/hampers">Gifting</Link>
                  <Link href="/offers">Offers</Link>
                  <Link href="/track-order">Track order</Link>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-line bg-surface-low">
          <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-3 px-5 py-2 text-[13px] sm:px-8 lg:px-16">
            <button onClick={() => setLocationOpen(true)} className="flex items-center gap-1.5 text-ink-variant">
              <MapPin className="h-4 w-4 text-accent" />
              <span>Delivering to <b className="font-semibold text-primary">{location}</b></span>
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => setLocationOpen(true)} className="font-medium text-accent hover:underline">Change</button>
              <span className="ml-3 hidden items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-primary shadow-sm sm:flex">
                <Zap className="h-3.5 w-3.5 text-accent" /> 60-min express active
              </span>
            </div>
          </div>
        </div>
      </header>

      {title && (
        <div className="mx-auto max-w-[1360px] px-5 pb-6 pt-10 sm:px-8 lg:px-16">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.25em] text-accent">CrèmeCart</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-primary md:text-6xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-ink-variant">{subtitle}</p>}
        </div>
      )}

      {children}

      {/* Footer */}
      <footer className="mt-16 w-full bg-surface-low pt-14 text-ink-variant">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Luxury Artisanal Patisserie</span>
              </div>
              <span className="font-serif text-2xl font-semibold text-primary">Crème<span className="text-accent">Cart</span></span>
              <p className="text-sm leading-relaxed">Hand-whipped French entremets and artisanal Indian confections, boxed in silk-finish keepsakes and delivered in climate-guarded vans.</p>
              <div className="flex flex-col gap-2 text-sm">
                <p className="flex items-center gap-2"><Store /> Flagship Ateliers: Mehrauli (Delhi) &amp; Bandra (Mumbai)</p>
                <p className="flex items-center gap-2"><Phone className="h-[18px] w-[18px] text-accent" /> Concierge: +91 11 4084 9200</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-serif text-[18px] font-semibold text-primary">Shop &amp; Categories</h4>
              <div className="grid gap-2.5 text-sm">
                <Link href="/shop" className="hover:text-primary">All cakes</Link>
                <Link href="/shop?category=Bento Cakes" className="hover:text-primary">Bento cakes</Link>
                <Link href="/shop?category=Cheesecakes" className="hover:text-primary">Artisanal cheesecakes</Link>
                <Link href="/shop?category=Eggless" className="hover:text-primary">Eggless &amp; gluten-free</Link>
                <Link href="/hampers" className="hover:text-primary">Luxury gifting hampers</Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-serif text-[18px] font-semibold text-primary">Gifting &amp; Occasions</h4>
              <div className="grid gap-2.5 text-sm">
                <Link href="/occasions/birthday" className="hover:text-primary">Birthday cakes</Link>
                <Link href="/occasions/anniversary" className="hover:text-primary">Anniversary cakes</Link>
                <Link href="/occasions/wedding" className="hover:text-primary">Wedding ateliers</Link>
                <Link href="/make-your-own-hamper" className="hover:text-primary">Build your own hamper</Link>
                <Link href="/photo-cakes" className="hover:text-primary">Photo cakes</Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-serif text-[18px] font-semibold text-primary">Experience &amp; Care</h4>
              <div className="grid gap-2.5 text-sm">
                <Link href="/delivery" className="hover:text-primary">Same-day delivery terms</Link>
                <Link href="/track-order" className="hover:text-primary">Track your order</Link>
                <Link href="/faq" className="hover:text-primary">Cake care &amp; FAQs</Link>
                <Link href="/about" className="hover:text-primary">Our story</Link>
                <Link href="/contact" className="hover:text-primary">Contact concierge</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-line py-5 text-xs text-ink-soft md:flex-row">
            <span className="flex items-center gap-1.5">Crafted with love for Indian celebrations · © {new Date().getFullYear()} CrèmeCart Patisserie Pvt Ltd.</span>
            <div className="flex items-center gap-5">
              <span className="font-semibold text-primary">INR (₹)</span>
              <Link href="/privacy" className="hover:text-primary">Privacy</Link>
              <Link href="/terms" className="hover:text-primary">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-line bg-surface/95 pb-safe backdrop-blur-xl md:hidden">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-primary"><Home className="h-[22px] w-[22px]" />Home</Link>
        <Link href="/shop" className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-ink-variant"><Cake className="h-[22px] w-[22px]" />Cakes</Link>
        <Link href="/hampers" className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-ink-variant"><Gift className="h-[22px] w-[22px]" />Gifting</Link>
        <Link href="/cart" className="relative flex flex-col items-center gap-0.5 text-[10px] font-medium text-ink-variant">
          <ShoppingBag className="h-[22px] w-[22px]" />
          {cartCount > 0 && <span className="absolute -right-2 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">{cartCount}</span>}
          Cart
        </Link>
        <Link href="/account" className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-ink-variant"><UserRound className="h-[22px] w-[22px]" />Profile</Link>
      </nav>
    </div>
  )
}

export function ContentPanel({ children }: { children: React.ReactNode }) { return <main className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">{children}</main> }
