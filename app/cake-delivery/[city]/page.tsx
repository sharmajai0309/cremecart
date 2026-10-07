import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StorefrontShell } from '@/components/storefront-shell'
import { ProductCard } from '@/components/ui/ProductCard'
import { getProducts, getServiceableCities } from '@/lib/queries.server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  const name = decodeURIComponent(city)
  return {
    title: `Cake Delivery in ${name}`,
    description: `Order freshly baked cakes online with same-day and midnight delivery in ${name}. Eggless, photo and designer cakes available.`,
    alternates: { canonical: `/cake-delivery/${encodeURIComponent(name)}` },
  }
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const name = decodeURIComponent(city)

  const cities = await getServiceableCities().catch(() => [])
  const match = cities.find(c => c.toLowerCase() === name.toLowerCase())
  if (!match) notFound()

  const products = await getProducts().catch(() => [])

  return (
    <StorefrontShell
      title={`Cake delivery in ${match}`}
      subtitle={`Freshly baked cakes, delivered across ${match}. Choose same-day, midnight or a fixed one-hour slot at checkout.`}
    >
      <div className="mx-auto max-w-[1360px] px-5 pb-20 sm:px-8 lg:px-16">
        {products.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-soft">Our cake menu is being updated — please check back shortly.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-7">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </StorefrontShell>
  )
}
