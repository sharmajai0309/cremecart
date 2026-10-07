import type { MetadataRoute } from 'next'
import { getActiveProductSlugs, getServiceableCities } from '@/lib/queries.server'
import { OCCASIONS } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, cities] = await Promise.all([
    getActiveProductSlugs().catch(() => []),
    getServiceableCities().catch(() => []),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/shop',
    '/offers',
    '/desserts',
    '/hampers',
    '/delivery',
    '/contact',
    '/about',
    '/faq',
    '/photo-cakes',
    '/make-your-own-hamper',
    '/personalise',
    '/track-order',
  ].map(route => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))

  return [
    ...staticRoutes,
    ...OCCASIONS.map(o => ({
      url: `${SITE_URL}/occasions/${o.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...products.map(p => ({
      url: `${SITE_URL}/p/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...cities.map(city => ({
      url: `${SITE_URL}/cake-delivery/${encodeURIComponent(city)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
