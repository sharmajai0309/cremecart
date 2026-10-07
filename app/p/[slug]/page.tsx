import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StorefrontShell } from '@/components/storefront-shell'
import { ProductDetail } from '@/components/product/product-detail'
import { getProductBySlug, getProductReviews, getRelatedProducts } from '@/lib/queries.server'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug).catch(() => null)
  if (!product) return { title: 'Cake not found' }
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/p/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      url: `/p/${product.slug}`,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
      type: 'website',
    },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug).catch(() => null)
  if (!product) notFound()

  const [reviews, related] = await Promise.all([
    getProductReviews(product.id).catch(() => []),
    getRelatedProducts(product.category, product.id).catch(() => []),
  ])

  const price = product.salePrice || product.basePrice
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    category: product.category,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'INR',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/p/${product.slug}`,
    },
    ...(product.reviewCount > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount } }
      : {}),
  }

  return (
    <StorefrontShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product} reviews={reviews} related={related} />
    </StorefrontShell>
  )
}
