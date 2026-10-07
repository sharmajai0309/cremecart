import type { Metadata } from 'next'
import { StorefrontShell } from '@/components/storefront-shell'
import { ShopBrowser } from '@/components/shop/shop-browser'
import { ProductCard } from '@/components/ui/ProductCard'
import { getProducts } from '@/lib/queries.server'
import { filterAndSortProducts, parseShopFilters } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Shop Cakes',
  description: 'Browse freshly baked cakes, desserts and gift hampers. Filter by flavour, price and eggless, delivered fresh to your door.',
  alternates: { canonical: '/shop' },
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const filters = parseShopFilters(sp)
  const products = await getProducts().catch(() => [])
  const filtered = filterAndSortProducts(products, filters)

  const grid =
    filtered.length === 0 ? (
      <p className="col-span-full py-16 text-center text-sm text-ink-soft">No cakes match these filters.</p>
    ) : (
      <div className="animate-in fade-in duration-300 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:gap-7">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )

  return (
    <StorefrontShell>
      <ShopBrowser filters={filters} resultCount={filtered.length}>
        {grid}
      </ShopBrowser>
    </StorefrontShell>
  )
}
