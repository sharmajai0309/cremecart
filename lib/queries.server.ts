import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { mapProduct, mapLocation } from '@/lib/supabase/mappers'
import type { Product, Location } from '@/lib/data'

// Server-side mirror of lib/queries.ts. Public pages are Server Components and
// fetch through here (via the cookie-scoped Supabase client) so the catalog is
// rendered on the server for SEO and first paint, instead of by the browser.

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .in('id', ids)
    .eq('is_active', true)
  if (error) throw new Error(error.message)
  // Preserve the caller's ordering (used for admin-picked bestsellers).
  const byId = new Map((data ?? []).map((p: any) => [p.id, mapProduct(p)]))
  return ids.map(id => byId.get(id)).filter((p): p is Product => Boolean(p))
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapProduct(data) : null
}

export async function getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('category', category)
    .eq('is_active', true)
    .neq('id', excludeId)
    .limit(4)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getNewArrivals(limit = 4): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getProductReviews(productId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('id, customer_name, rating, comment, images, created_at')
    .eq('product_id', productId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getDeliveryZoneForPincode(pincode: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*, locations(*)')
    .eq('pincode', pincode.trim())
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data || !data.locations || !(data.locations as any).is_active) return null
  return data
}

export async function getSiteSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
  if (error) throw new Error(error.message)
  return data
}

export async function getFeaturedCategories(): Promise<{ name: string; count: number; image: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('category, images').eq('is_active', true)
  if (error) throw new Error(error.message)

  const byCategory = new Map<string, { count: number; image: string }>()
  for (const p of data ?? []) {
    const existing = byCategory.get(p.category)
    if (existing) existing.count += 1
    else byCategory.set(p.category, { count: 1, image: p.images?.[0] ?? '' })
  }
  return Array.from(byCategory.entries()).map(([name, v]) => ({ name, ...v }))
}

export async function getTopReviews(limit = 6) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('id, customer_name, rating, comment, created_at, products(name, slug, images)')
    .eq('is_hidden', false)
    .gte('rating', 4)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getActiveCoupons() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('coupons')
    .select('code, discount_type, discount_value, min_order_amount')
    .eq('is_active', true)
    .order('discount_value', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getServiceableCities(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('locations').select('city').eq('is_active', true).order('city')
  if (error) throw new Error(error.message)
  return (data ?? []).map(l => l.city)
}

export async function getLocations(): Promise<Location[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('locations')
    .select('*, delivery_zones(*)')
    .eq('is_active', true)
    .order('city')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapLocation)
}

export async function getActiveProductSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)
  if (error) throw new Error(error.message)
  return data ?? []
}
