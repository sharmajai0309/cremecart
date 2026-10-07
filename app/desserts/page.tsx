'use client'

import { useEffect, useState } from 'react'
import { StorefrontShell, ContentPanel } from '@/components/storefront-shell'
import { getProducts } from '@/lib/queries'
import type { Product } from '@/lib/data'
import { ProductCard } from '@/components/ui/ProductCard'

const FILTERS = ['All desserts', 'Brownies', 'Cheesecakes', 'Jar desserts', 'Pastries']

export default function DessertsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState('All desserts')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All desserts'
    ? products
    : products.filter(p => p.category.toLowerCase().includes(filter.toLowerCase()))

  return (
    <StorefrontShell title="Desserts & sweet treats" subtitle="Brownies, cheesecakes, jar desserts and little bites for every craving.">
      <ContentPanel>
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map((x) => (
            <button
              key={x}
              onClick={() => setFilter(x)}
              className={`rounded-full border px-4 py-2 text-sm transition ${filter === x ? 'border-primary bg-primary text-white' : 'border-line-strong text-ink-soft hover:bg-surface-container'}`}
            >
              {x}
            </button>
          ))}
        </div>
        {loading ? (
          <p className="py-16 text-center text-sm text-ink-soft">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-soft">No {filter.toLowerCase()} available right now.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </ContentPanel>
    </StorefrontShell>
  )
}
