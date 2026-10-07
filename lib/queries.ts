import { createClient } from '@/lib/supabase/client'
import type { Product, Location } from '@/lib/data'
import { mapProduct, mapLocation } from '@/lib/supabase/mappers'

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getDeliveryZoneForPincode(pincode: string) {
  const supabase = createClient()
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
  const supabase = createClient()
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
  if (error) throw new Error(error.message)
  return data
}

export async function getProductReviews(productId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('id, customer_name, rating, comment, created_at')
    .eq('product_id', productId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
  const supabase = createClient()
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

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapProduct(data) : null
}

export async function getServiceableCities(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('locations').select('city').eq('is_active', true).order('city')
  if (error) throw new Error(error.message)
  return (data ?? []).map(l => l.city)
}

export async function getFeaturedCategories(): Promise<{ name: string; count: number; image: string }[]> {
  const supabase = createClient()
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

export async function getNewArrivals(limit = 4): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getTopReviews(limit = 6) {
  const supabase = createClient()
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
  const supabase = createClient()
  const { data, error } = await supabase
    .from('coupons')
    .select('code, discount_type, discount_value, min_order_amount')
    .eq('is_active', true)
    .order('discount_value', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function subscribeToNewsletter(email: string) {
  const supabase = createClient()
  const { error } = await supabase.from('newsletter_subscribers').insert({ email })
  if (error) {
    if (error.code === '23505') throw new Error("You're already subscribed!")
    throw new Error(error.message)
  }
}

export async function getLocations(): Promise<Location[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('locations')
    .select('*, delivery_zones(*)')
    .eq('is_active', true)
    .order('city')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapLocation)
}
