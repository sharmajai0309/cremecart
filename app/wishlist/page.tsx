'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react'
import { StorefrontShell } from '@/components/storefront-shell'
import { getProducts } from '@/lib/queries'
import { useStore } from '@/lib/store'
import type { Product } from '@/lib/data'
import { ProductCard } from '@/components/ui/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/ProductGridSkeleton'

export default function WishlistPage() {
  const { wishlist } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error).finally(() => setLoading(false))
  }, [])

  const savedProducts = products.filter(p => wishlist.includes(p.id))

  return (
    <StorefrontShell title="Your wishlist" subtitle="Cakes you've saved for the next celebration.">
      <section className="mx-auto max-w-[1360px] px-5 pb-20 sm:px-8 lg:px-16">
        {loading ? (
          <ProductGridSkeleton />
        ) : savedProducts.length === 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 mt-4 duration-300 rounded-3xl border border-dashed border-line-strong bg-white px-6 py-16 text-center">
            <Heart className="mx-auto h-9 w-9 text-accent" />
            <h2 className="mt-5 font-serif text-2xl">A little empty, for now.</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink-soft">Save cakes you love and come back when the next celebration calls.</p>
            <Link href="/shop" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform duration-150 active:scale-[0.98]">
              <ShoppingBag className="h-4 w-4" /> Find a cake
            </Link>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {savedProducts.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>
    </StorefrontShell>
  )
}
