import { getSiteSettings, listProducts } from '../../actions'
import { HomepageForm } from './homepage-form'
import {
  asArray,
  DEFAULT_DELIVERY_OPTIONS,
  DEFAULT_GIFTING_COLLECTIONS,
  DEFAULT_HERO_STATS,
  DEFAULT_TRUST_BADGES,
  type DeliveryOption,
  type GiftingCollection,
  type HeroStat,
  type TrustBadge,
} from '@/lib/homepage-content'

export default async function AdminHomepagePage() {
  const [settings, products] = await Promise.all([getSiteSettings(), listProducts()])

  const initial = {
    announcement_text: settings.announcement_text,
    hero_heading: settings.hero_heading,
    hero_subtitle: settings.hero_subtitle,
    hero_cta_text: settings.hero_cta_text,
    hero_cta_link: settings.hero_cta_link,
    hero_image_url: settings.hero_image_url,
    hero_video_url: settings.hero_video_url,
    featured_product_ids: settings.featured_product_ids ?? [],
    hero_stats: asArray<HeroStat>(settings.hero_stats, DEFAULT_HERO_STATS),
    delivery_options: asArray<DeliveryOption>(settings.delivery_options, DEFAULT_DELIVERY_OPTIONS),
    trust_badges: asArray<TrustBadge>(settings.trust_badges, DEFAULT_TRUST_BADGES),
    gifting_collections: asArray<GiftingCollection>(settings.gifting_collections, DEFAULT_GIFTING_COLLECTIONS),
  }

  return (
    <HomepageForm
      settings={initial}
      products={products.map(p => ({ id: p.id, name: p.name }))}
    />
  )
}
