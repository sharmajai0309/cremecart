'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'

// Requires both the order number AND the phone used to place it, so an
// order can't be looked up by guessing/enumerating order numbers alone.
export async function trackOrder(orderNumber: string, phone: string) {
  const supabase = createAdminClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('order_number, status, delivery_date, delivery_slot, delivery_type, created_at, order_items(id, product_id, product_name, quantity, reviews(id))')
    .eq('order_number', orderNumber.trim().toUpperCase())
    .eq('customer_phone', phone.trim())
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!order) return null

  return order
}

// The insert-only RLS policy on `reviews` already requires the order to be
// delivered, so this is safe even though it uses the anon-scoped client.
export async function submitReview(
  orderItemId: string,
  productId: string,
  customerName: string,
  rating: number,
  comment: string,
  images: string[] = []
) {
  const supabase = await createClient()
  const { error } = await supabase.from('reviews').insert({
    order_item_id: orderItemId,
    product_id: productId,
    customer_name: customerName || 'Anonymous',
    rating,
    comment,
    images,
  })
  if (error) throw new Error(error.message)
}

// Review photos are uploaded with the secret-key client (same pattern as
// product images) and stored under a `reviews/` prefix in the existing public
// `product-images` bucket — only the public URL is saved on the review row.
export async function uploadReviewImage(formData: FormData) {
  const supabase = createAdminClient()
  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  const ext = file.name.split('.').pop()
  const path = `reviews/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}
