'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, SlidersHorizontal, X } from 'lucide-react'
import { SHOP_CATEGORIES, SHOP_FLAVORS, SHOP_SORTS, PRICE_RANGES, type ShopFilters } from '@/lib/catalog'

// All filter UI for /shop. Filtering itself happens on the server; this
// component only writes the current selection into the URL so the page
// re-renders with fresh server-rendered results.
export function ShopBrowser({
  filters,
  resultCount,
  children,
}: {
  filters: ShopFilters
  resultCount: number
  children: React.ReactNode
}) {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)

  function setParam(key: keyof ShopFilters, value: string) {
    const next: ShopFilters = { ...filters, [key]: value }
    const params = new URLSearchParams()
    if (next.category && next.category !== 'All') params.set('category', next.category)
    if (next.flavor && next.flavor !== 'All') params.set('flavor', next.flavor)
    if (next.price && next.price !== 'All') params.set('price', next.price)
    if (next.sort && next.sort !== 'Recommended') params.set('sort', next.sort)
    if (next.q) params.set('q', next.q)
    const qs = params.toString()
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false })
  }

  const prices = Object.keys(PRICE_RANGES)
  const activeFilters = [
    filters.category !== 'All' && { key: 'category' as const, label: filters.category },
    filters.flavor !== 'All' && { key: 'flavor' as const, label: filters.flavor },
    filters.price !== 'All' && { key: 'price' as const, label: filters.price },
    Boolean(filters.q) && { key: 'q' as const, label: `"${filters.q}"` },
  ].filter(Boolean) as { key: keyof ShopFilters; label: string }[]

  return (
    <>
      <section className="mx-auto max-w-[1360px] px-5 pb-8 pt-10 sm:px-8 lg:px-16">
        <Link href="/" className="mb-4 flex items-center gap-2 text-sm text-ink-soft hover:text-black">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <h1 className="font-serif text-4xl tracking-tight lg:text-5xl">
          {filters.q ? `Results for “${filters.q}”` : 'Shop Our Cakes'}
        </h1>

        <div className="mt-8 flex overflow-x-auto pb-4 no-scrollbar gap-2">
          {SHOP_CATEGORIES.map((item) => (
            <button
              key={item}
              onClick={() => setParam('category', item)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${filters.category === item ? 'bg-primary text-white' : 'border border-line-strong text-ink-soft hover:bg-surface-container'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 pb-20 sm:px-8 lg:px-16">
        {activeFilters.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setParam(f.key, 'All')}
                className="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-xs font-medium text-ink hover:bg-line"
              >
                {f.label} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
        <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 font-medium text-ink lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <span className="hidden text-sm text-ink-soft lg:block">Showing {resultCount} results</span>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-soft">Sort by:</span>
            <select value={filters.sort} onChange={(e) => setParam('sort', e.target.value)} className="bg-transparent font-medium text-ink outline-none cursor-pointer">
              {SHOP_SORTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className={`space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div>
              <h3 className="mb-4 font-semibold text-ink">Flavour</h3>
              <div className="space-y-3">
                {['All', ...SHOP_FLAVORS].map((f) => (
                  <label key={f} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="flavor" checked={filters.flavor === f} onChange={() => setParam('flavor', f)} className="h-4 w-4 accent-primary" />
                    <span className="text-sm text-ink-soft group-hover:text-black">{f}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-line pt-8">
              <h3 className="mb-4 font-semibold text-ink">Price Range</h3>
              <div className="space-y-3">
                {['All', ...prices].map((p) => (
                  <label key={p} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="price" checked={filters.price === p} onChange={() => setParam('price', p)} className="h-4 w-4 accent-primary" />
                    <span className="text-sm text-ink-soft group-hover:text-black">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-line pt-8">
              <h3 className="mb-4 font-semibold text-ink">Dietary</h3>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={filters.category === 'Eggless'} onChange={(e) => setParam('category', e.target.checked ? 'Eggless' : 'All')} className="h-4 w-4 rounded border-line-strong accent-primary" />
                <span className="text-sm text-ink-soft group-hover:text-black">100% Eggless Only</span>
              </label>
            </div>
          </aside>

          {children}
        </div>
      </section>
    </>
  )
}
