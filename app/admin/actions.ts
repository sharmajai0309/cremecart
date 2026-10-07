'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import type { DeliveryOption, GiftingCollection, HeroStat, TrustBadge } from '@/lib/homepage-content'

// All admin mutations go through the secret-key client, which bypasses RLS.
// Every page under app/admin/(shell) is gated by proxy.ts, and every action
// below re-checks with requireAdmin() as defense in depth.

// ---------------------------------------------------------------- orders --

export async function listOrders() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

const ORDER_STATUSES = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as const

export async function updateOrderStatus(orderId: string, status: string, notes?: string) {
  await requireAdmin()
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    throw new Error('Invalid status')
  }
  const supabase = createAdminClient()

  const { data: current } = await supabase.from('orders').select('status').eq('id', orderId).single()

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
  if (error) throw new Error(error.message)

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    from_status: current?.status ?? null,
    to_status: status,
    notes: notes ?? null,
  })

  revalidatePath('/admin/orders')
}

// -------------------------------------------------------------- products --

export async function listProducts() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export type ProductInput = {
  name: string
  slug: string
  sku: string
  description: string
  category: string
  base_price: number
  sale_price: number | null
  default_weight: string
  flavors: string[]
  eggless_available: boolean
  eggless_price_premium: number
  stock: number
  images: string[]
  ingredients: string[]
  allergens: string[]
  shelf_life: string
  bestseller: boolean
  is_active: boolean
  delivery_eligibility: string[]
}

export async function createProduct(input: ProductInput) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('products').insert(input).select('id').single()
  if (error) throw new Error(error.message)
  // Every product needs at least one weight tier for the PDP's weight
  // selector to have something to show — seed one matching default_weight,
  // admin can add more via the variants editor afterward.
  await supabase.from('product_variants').insert({
    product_id: data.id,
    weight: input.default_weight,
    price_multiplier: 1,
    serves: '',
    sort_order: 1,
  })
  revalidatePath('/admin/products')
  return data.id
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
}

// Products with existing orders are kept for order-history integrity —
// "delete" only deactivates them so they drop off the live storefront.
export async function deactivateProduct(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
}

export async function activateProduct(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('products').update({ is_active: true }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
}

// ------------------------------------------------------------- locations --

export async function listLocations() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('locations')
    .select('*, delivery_zones(*)')
    .order('city')
  if (error) throw new Error(error.message)
  return data
}

export async function createLocation(city: string, state: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('locations').insert({ city, state })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/locations')
}

export async function toggleLocationActive(id: string, isActive: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('locations').update({ is_active: isActive }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/locations')
}

export type DeliveryZoneInput = {
  location_id: string
  pincode: string
  delivery_fee: number
  same_day_available: boolean
  sixty_minute_available: boolean
  midnight_available: boolean
  fixed_time_available: boolean
}

export async function createDeliveryZone(input: DeliveryZoneInput) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('delivery_zones').insert(input)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/locations')
}

export async function updateDeliveryZone(id: string, input: Partial<DeliveryZoneInput>) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('delivery_zones').update(input).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/locations')
}

export async function deleteDeliveryZone(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('delivery_zones').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/locations')
}

// --------------------------------------------------------------- coupons --

export async function listCoupons() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('coupons').select('*').order('code')
  if (error) throw new Error(error.message)
  return data
}

export type CouponInput = {
  code: string
  discount_type: 'percent' | 'flat'
  discount_value: number
  min_order_amount: number
  max_discount: number | null
  is_active: boolean
  expires_at: string | null
}

export async function createCoupon(input: CouponInput) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('coupons').insert(input)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/coupons')
}

export async function updateCoupon(id: string, input: Partial<CouponInput>) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('coupons').update(input).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/coupons')
}

export async function deleteCoupon(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/coupons')
}

// -------------------------------------------------------------- dashboard --

export async function getDashboardStats() {
  await requireAdmin()
  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const [{ data: todayOrders }, { data: allOrders }, { data: lowStock }] = await Promise.all([
    supabase.from('orders').select('total_amount').gte('created_at', today),
    supabase.from('orders').select('total_amount, status, created_at'),
    supabase.from('products').select('id, name, stock').lt('stock', 5).eq('is_active', true),
  ])

  const todayRevenue = (todayOrders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0)
  const pendingOrders = (allOrders ?? []).filter(o => o.status === 'pending').length
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const monthlyOrders = (allOrders ?? []).filter(o => o.created_at >= monthAgo)
  const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  const aov = monthlyOrders.length ? monthlyRevenue / monthlyOrders.length : 0

  return {
    todayRevenue,
    todayOrders: (todayOrders ?? []).length,
    pendingOrders,
    monthlyRevenue,
    aov,
    lowStock: lowStock ?? [],
  }
}

export async function getRevenueTrend(days = 14) {
  await requireAdmin()
  const supabase = createAdminClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const { data } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .gte('created_at', since.toISOString())

  const byDay = new Map<string, number>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    byDay.set(d, 0)
  }
  for (const order of data ?? []) {
    const day = order.created_at.slice(0, 10)
    if (byDay.has(day)) byDay.set(day, (byDay.get(day) ?? 0) + Number(order.total_amount))
  }

  return Array.from(byDay.entries()).map(([date, revenue]) => ({ date, revenue }))
}

// ------------------------------------------------------------- customers --

export async function listCustomers() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data: orders, error } = await supabase
    .from('orders')
    .select('customer_name, customer_phone, customer_email, total_amount, created_at')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  const byPhone = new Map<string, {
    phone: string; name: string; email: string | null
    orders: number; totalSpend: number; lastOrder: string; firstOrder: string
  }>()

  for (const o of orders ?? []) {
    const existing = byPhone.get(o.customer_phone)
    if (existing) {
      existing.orders += 1
      existing.totalSpend += Number(o.total_amount)
      if (o.created_at > existing.lastOrder) existing.lastOrder = o.created_at
      if (o.created_at < existing.firstOrder) existing.firstOrder = o.created_at
    } else {
      byPhone.set(o.customer_phone, {
        phone: o.customer_phone,
        name: o.customer_name,
        email: o.customer_email,
        orders: 1,
        totalSpend: Number(o.total_amount),
        lastOrder: o.created_at,
        firstOrder: o.created_at,
      })
    }
  }

  return Array.from(byPhone.values()).sort((a, b) => b.totalSpend - a.totalSpend)
}

export async function getCustomerOrders(phone: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_phone', phone)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

// ------------------------------------------------------------- inventory --

export async function listInventory() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, stock, images')
    .eq('is_active', true)
    .order('stock', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export async function getInventoryHistory(productId: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('inventory_transactions')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)
  return data
}

export async function adjustStock(productId: string, quantityChange: number, notes: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data: product, error: fetchError } = await supabase.from('products').select('stock').eq('id', productId).single()
  if (fetchError) throw new Error(fetchError.message)

  const newStock = Math.max(0, product.stock + quantityChange)
  const { error: updateError } = await supabase.from('products').update({ stock: newStock }).eq('id', productId)
  if (updateError) throw new Error(updateError.message)

  await supabase.from('inventory_transactions').insert({
    product_id: productId,
    quantity_change: newStock - product.stock,
    type: 'adjustment',
    notes,
  })

  revalidatePath('/admin/inventory')
}

// --------------------------------------------------------------- reviews --

export async function listReviewsAdmin() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*, products(name)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function toggleReviewVisibility(id: string, isHidden: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('reviews').update({ is_hidden: isHidden }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/reviews')
}

export async function deleteReview(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/reviews')
}

// ----------------------------------------------------------------- sales --

export async function getSalesBreakdown() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('line_total, quantity, product_id, products(category)')

  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, payment_method, delivery_address')

  const byCategory = new Map<string, number>()
  for (const item of orderItems ?? []) {
    const category = (item.products as any)?.category ?? 'Uncategorized'
    byCategory.set(category, (byCategory.get(category) ?? 0) + Number(item.line_total))
  }

  const byCity = new Map<string, number>()
  const byPaymentMethod = new Map<string, number>()
  for (const order of orders ?? []) {
    const city = (order.delivery_address as any)?.city ?? 'Unknown'
    byCity.set(city, (byCity.get(city) ?? 0) + Number(order.total_amount))
    byPaymentMethod.set(order.payment_method, (byPaymentMethod.get(order.payment_method) ?? 0) + Number(order.total_amount))
  }

  return {
    byCategory: Array.from(byCategory.entries()).map(([label, revenue]) => ({ label, revenue })).sort((a, b) => b.revenue - a.revenue),
    byCity: Array.from(byCity.entries()).map(([label, revenue]) => ({ label, revenue })).sort((a, b) => b.revenue - a.revenue),
    byPaymentMethod: Array.from(byPaymentMethod.entries()).map(([label, revenue]) => ({ label, revenue })),
  }
}

// ---------------------------------------------------------- site settings --

export async function getSiteSettings() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
  if (error) throw new Error(error.message)
  return data
}

export type SiteSettingsInput = {
  announcement_text: string
  hero_heading: string
  hero_subtitle: string
  hero_cta_text: string
  hero_cta_link: string
  hero_image_url: string
  hero_video_url: string | null
  featured_product_ids: string[]
  hero_stats: HeroStat[]
  delivery_options: DeliveryOption[]
  trust_badges: TrustBadge[]
  gifting_collections: GiftingCollection[]
}

export async function updateSiteSettings(input: SiteSettingsInput) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('site_settings').update({ ...input, updated_at: new Date().toISOString() }).eq('id', 1)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/homepage')
  revalidatePath('/')
}

// ------------------------------------------------------------------ theme --

export type ThemeSettingsInput = {
  primary_color: string
  accent_color: string
  font_pairing: string
  logo_url: string | null
  surface_color: string
  surface_low_color: string
  surface_container_color: string
  surface_high_color: string
  surface_highest_color: string
  line_color: string
  line_strong_color: string
  ink_color: string
  ink_variant_color: string
  ink_soft_color: string
}

export async function updateThemeSettings(input: ThemeSettingsInput) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('site_settings').update({ ...input, updated_at: new Date().toISOString() }).eq('id', 1)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/theme')
  revalidatePath('/')
}

export type HomepageSection = { key: string; visible: boolean }

export async function updateHomepageSections(sections: HomepageSection[]) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('site_settings').update({ homepage_sections: sections, updated_at: new Date().toISOString() }).eq('id', 1)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/theme')
  revalidatePath('/')
}

export async function uploadSiteAsset(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')
  if (!file.type.startsWith('image/')) throw new Error('Please upload an image file.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Image must be 8MB or smaller.')

  const ext = file.name.split('.').pop()
  const path = `branding/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) throw new Error(uploadError.message)

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

// ------------------------------------------------------- contact messages --

export async function listContactMessages() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function markContactMessageRead(id: string, isRead: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('contact_messages').update({ is_read: isRead }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/messages')
}

export async function deleteContactMessage(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/messages')
}

// ---------------------------------------------------------- newsletter --

export async function listNewsletterSubscribers() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function deleteNewsletterSubscriber(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/newsletter')
}

// -------------------------------------------------------------- categories --

export async function listCategories() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('categories').select('*').order('sort_order')
  if (error) throw new Error(error.message)
  return data
}

export async function createCategory(name: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const { data: maxRow } = await supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle()
  const { error } = await supabase.from('categories').insert({ name, slug, sort_order: (maxRow?.sort_order ?? 0) + 1 })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

export async function renameCategory(id: string, name: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data: current, error: fetchError } = await supabase.from('categories').select('name').eq('id', id).single()
  if (fetchError) throw new Error(fetchError.message)
  const { error } = await supabase.from('categories').update({ name }).eq('id', id)
  if (error) throw new Error(error.message)
  // Keep the denormalized products.category label in sync so /shop filters
  // and the storefront keep working without every product needing a re-save.
  if (current?.name && current.name !== name) {
    await supabase.from('products').update({ category: name }).eq('category', current.name)
  }
  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
}

export async function deleteCategory(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

// --------------------------------------------------------------- variants --

export type VariantInput = { weight: string; price_multiplier: number; serves: string; sort_order: number }

export async function createVariant(productId: string, input: VariantInput) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('product_variants').insert({ ...input, product_id: productId })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
}

export async function updateVariant(id: string, input: Partial<VariantInput>) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('product_variants').update(input).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
}

export async function deleteVariant(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('product_variants').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
}

// ------------------------------------------------------- product images --

export async function uploadProductImage(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) throw new Error(uploadError.message)

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

// ---------------------------------------------------- paginated / search --

// PostgREST's .or() filter uses commas/parens as its own syntax, so strip any
// the admin typed before interpolating their text into a filter string.
function sanitizeSearch(q: string): string {
  return q.replace(/[,()%\\]/g, ' ').trim()
}

export async function listRecentOrders(limit = 5) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function listOrdersPaged(params: { q?: string; status?: string; page?: number; pageSize?: number }) {
  await requireAdmin()
  const supabase = createAdminClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = params.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('orders').select('*, order_items(*)', { count: 'exact' })
  const q = sanitizeSearch(params.q ?? '')
  if (q) {
    query = query.or(`order_number.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_name.ilike.%${q}%`)
  }
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)
  if (error) throw new Error(error.message)
  return { orders: data ?? [], total: count ?? 0, page, pageSize }
}

export async function listProductsPaged(params: { q?: string; category?: string; page?: number; pageSize?: number }) {
  await requireAdmin()
  const supabase = createAdminClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = params.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('products').select('*, product_variants(*)', { count: 'exact' })
  const q = sanitizeSearch(params.q ?? '')
  if (q) query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
  if (params.category && params.category !== 'all') query = query.eq('category', params.category)

  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)
  if (error) throw new Error(error.message)
  return { products: data ?? [], total: count ?? 0, page, pageSize }
}
