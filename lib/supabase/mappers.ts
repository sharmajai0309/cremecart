import type { Product, Location } from '@/lib/data'

// Maps the real Supabase schema onto the exact Product/Location shapes the
// storefront components were already built against (lib/data.ts), so
// ProductCard, the PDP, shop and home pages need no changes beyond swapping
// their data source. Shared by both the browser (lib/queries.ts) and server
// (lib/queries.server.ts) query modules.

export function mapProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    description: row.description,
    category: row.category,
    subcategories: row.subcategories ?? undefined,
    basePrice: Number(row.base_price),
    salePrice: row.sale_price != null ? Number(row.sale_price) : undefined,
    defaultWeight: row.default_weight,
    availableWeights: (row.product_variants ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((v: any) => ({ weight: v.weight, priceMultiplier: Number(v.price_multiplier), serves: v.serves })),
    flavors: row.flavors ?? [],
    egglessAvailable: row.eggless_available,
    egglessPricePremium: Number(row.eggless_price_premium),
    stock: row.stock,
    images: row.images ?? [],
    ingredients: row.ingredients ?? [],
    allergens: row.allergens ?? [],
    shelfLife: row.shelf_life,
    bestseller: row.bestseller,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    deliveryEligibility: row.delivery_eligibility ?? [],
  }
}

export function mapLocation(row: any): Location {
  const zones = row.delivery_zones ?? []
  const capabilities = new Set<string>()
  for (const z of zones) {
    if (z.same_day_available) capabilities.add('same-day')
    if (z.sixty_minute_available) capabilities.add('60-min')
    if (z.midnight_available) capabilities.add('midnight')
    if (z.fixed_time_available) capabilities.add('fixed-time')
  }
  return {
    id: row.id,
    city: row.city,
    state: row.state,
    pincodes: zones.map((z: any) => z.pincode),
    serviceable: row.is_active,
    capabilities: Array.from(capabilities),
  }
}
