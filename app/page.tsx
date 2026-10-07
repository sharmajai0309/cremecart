import type { Metadata } from 'next'
import { HomeContent, type HomeSettings } from '@/components/home/home-content'
import {
  asArray, DEFAULT_DELIVERY_OPTIONS, DEFAULT_GIFTING_COLLECTIONS, DEFAULT_HERO_STATS, DEFAULT_TRUST_BADGES,
  type DeliveryOption, type GiftingCollection, type HeroStat, type TrustBadge,
} from '@/lib/homepage-content'
import {
  getActiveCoupons,
  getFeaturedCategories,
  getNewArrivals,
  getProducts,
  getProductsByIds,
  getServiceableCities,
  getSiteSettings,
  getTopReviews,
} from '@/lib/queries.server'

// Data is admin-editable and must be fresh per request; rendering on the server
// (rather than in the browser) gives crawlers full HTML for SEO.
export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    title: 'CrèmeCart — Made for moments that matter',
    description: 'Freshly baked cakes, thoughtful gifts and desserts delivered when you need them.',
    url: '/',
    siteName: 'CrèmeCart',
    type: 'website',
  },
}

type HomepageSection = { key: string; visible: boolean }

export default async function HomePage() {
  const [settings, products, categories, newArrivals, topReviews, coupons, cities] = await Promise.all([
    getSiteSettings().catch(() => null),
    getProducts().catch(() => []),
    getFeaturedCategories().catch(() => []),
    getNewArrivals(4).catch(() => []),
    getTopReviews(6).catch(() => []),
    getActiveCoupons().catch(() => []),
    getServiceableCities().catch(() => []),
  ])

  // Admin-picked bestsellers (site_settings.featured_product_ids) win; fall back
  // to the automatic catalog order when none are set.
  const featuredIds = (settings?.featured_product_ids as string[] | undefined) ?? []
  const featured = featuredIds.length > 0 ? await getProductsByIds(featuredIds).catch(() => []) : []
  const bestsellers = featured.length > 0 ? featured : products

  const homeSettings: HomeSettings = settings
    ? {
        hero_image_url: settings.hero_image_url,
        hero_heading: settings.hero_heading,
        hero_subtitle: settings.hero_subtitle,
        hero_cta_link: settings.hero_cta_link,
        hero_cta_text: settings.hero_cta_text,
        hero_video_url: settings.hero_video_url,
        homepage_sections: Array.isArray(settings.homepage_sections)
          ? (settings.homepage_sections as unknown as HomepageSection[])
          : null,
        hero_stats: asArray<HeroStat>(settings.hero_stats, DEFAULT_HERO_STATS),
        delivery_options: asArray<DeliveryOption>(settings.delivery_options, DEFAULT_DELIVERY_OPTIONS),
        trust_badges: asArray<TrustBadge>(settings.trust_badges, DEFAULT_TRUST_BADGES),
        gifting_collections: asArray<GiftingCollection>(settings.gifting_collections, DEFAULT_GIFTING_COLLECTIONS),
      }
    : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CrèmeCart',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeContent
        settings={homeSettings}
        bestsellers={bestsellers}
        categories={categories}
        newArrivals={newArrivals}
        topReviews={topReviews}
        coupons={coupons}
        cities={cities}
      />
    </>
  )
}
