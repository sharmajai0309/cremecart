'use server'

import { createClient } from '@/lib/supabase/server'

export async function validateCoupon(code: string, subtotal: number) {
  const supabase = await createClient()
  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .ilike('code', code.trim())
    .eq('is_active', true)
    .maybeSingle()

  if (!coupon) return { valid: false as const, message: 'Invalid or expired coupon code.' }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false as const, message: 'This coupon has expired.' }
  }
  if (subtotal < Number(coupon.min_order_amount)) {
    return { valid: false as const, message: `Add ₹${Number(coupon.min_order_amount) - subtotal} more to use this coupon.` }
  }

  let discount = coupon.discount_type === 'percent'
    ? Math.round(subtotal * (Number(coupon.discount_value) / 100))
    : Number(coupon.discount_value)

  if (coupon.max_discount != null) discount = Math.min(discount, Number(coupon.max_discount))
  discount = Math.min(discount, subtotal)

  return { valid: true as const, code: coupon.code, discount }
}
