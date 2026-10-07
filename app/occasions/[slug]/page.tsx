import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StorefrontShell } from '@/components/storefront-shell'
import { ProductCard } from '@/components/ui/ProductCard'
import { OCCASIONS, getOccasion } from '@/lib/seo'
import { getProducts } from '@/lib/queries.server'
import { filterAndSortProducts } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const occasion = getOccasion(slug)
    if (!occasion) return { title: 'Occasion not found' }
    return {
      title: occasion.label,
      description: occasion.description,
      alternates: { canonical: `/occasions/${occasion.slug}` },
    }
  })
}

export default async function OccasionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const occasion = getOccasion(slug)
  if (!occasion) notFound()

  const products = await getProducts().catch(() => [])
  const themed = occasion.category
    ? filterAndSortProducts(products, { category: occasion.category, flavor: 'All', price: 'All', sort: 'Recommended', q: '' })
    : []
  const shown = themed.length > 0 ? themed : products

  return (
    <StorefrontShell title={occasion.heading} subtitle={occasion.description}>
      <div className="mx-auto max-w-[1360px] px-5 pb-20 sm:px-8 lg:px-16">
        <div className="mb-10 flex flex-wrap gap-2">
          {OCCASIONS.map(o => (
            <a
              key={o.slug}
              href={`/occasions/${o.slug}`}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${o.slug === occasion.slug ? 'bg-primary text-white' : 'border border-line-strong text-ink-soft hover:bg-surface-container'}`}
            >
              {o.label}
            </a>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-soft">Cakes for this occasion are coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-7">
            {shown.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </StorefrontShell>
  )
}
