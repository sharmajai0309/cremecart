'use server'

import { createClient } from '@/lib/supabase/server'
import { CUSTOM_HAMPER_PRODUCT_ID, CUSTOM_PHOTO_CAKE_PRODUCT_ID, priceHamper, pricePhotoCake } from '@/lib/composite-offerings'

export type CheckoutCartItem = {
  productId: string
  weight: string
  isEggless: boolean
  flavor?: string
  message?: string
  quantity: number
  hamperBoxId?: string
  hamperTreatIds?: string[]
  image?: string
  deliveryType?: string
}

export type PlaceOrderInput = {
  cart: CheckoutCartItem[]
  customerName: string
  customerPhone: string
  customerEmail?: string
  addressLine1: string
  addressLine2?: string
  city: string
  pincode: string
  couponCode?: string
  deliveryType?: string
  deliveryDate?: string
  deliverySlot?: string
  isGift?: boolean
  giftRecipientName?: string
  giftMessage?: string
  paymentMethod?: 'cod' | 'razorpay'
  paymentReference?: string
}

const CUSTOM_PRODUCT_IDS = new Set([CUSTOM_HAMPER_PRODUCT_ID, CUSTOM_PHOTO_CAKE_PRODUCT_ID])

type OrderItemRow = {
  product_id: string | null
  product_name: string
  sku: string | null
  image: string | null
  weight: string | null
  flavor: string | null
  eggless: boolean
  message: string | null
  unit_price: number
  quantity: number
  line_total: number
}

// Prices are recomputed here — from the DB for catalog products, from the
// shared lib/composite-offerings constants for the hamper builder and photo
// cake — never trusted from the client.
export async function placeOrder(input: PlaceOrderInput) {
  if (input.cart.length === 0) throw new Error('Cart is empty')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const catalogItems = input.cart.filter(c => !CUSTOM_PRODUCT_IDS.has(c.productId))
  const customItems = input.cart.filter(c => CUSTOM_PRODUCT_IDS.has(c.productId))

  const catalogProductIds = [...new Set(catalogItems.map(c => c.productId))]
  const { data: products, error: productsError } = catalogProductIds.length > 0
    ? await supabase.from('products').select('*, product_variants(*)').in('id', catalogProductIds).eq('is_active', true)
    : { data: [], error: null }
  if (productsError) throw new Error(productsError.message)

  const { data: zone } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('pincode', input.pincode)
    .eq('is_active', true)
    .maybeSingle()

  const requestedQtyByProduct = new Map<string, number>()
  for (const item of catalogItems) {
    requestedQtyByProduct.set(item.productId, (requestedQtyByProduct.get(item.productId) ?? 0) + item.quantity)
  }
  for (const [productId, qty] of requestedQtyByProduct) {
    const product = products?.find(p => p.id === productId)
    if (product && product.stock < qty) {
      throw new Error(`Only ${product.stock} left of ${product.name} — please reduce the quantity.`)
    }
  }

  const catalogOrderItems: OrderItemRow[] = catalogItems.map(item => {
    const product = products?.find(p => p.id === item.productId)
    if (!product) throw new Error('One of the items in your cart is no longer available')

    const variant = product.product_variants.find((v: any) => v.weight === item.weight)
    const unitBase = Number(product.sale_price ?? product.base_price)
    const unitPrice = Math.round(unitBase * Number(variant?.price_multiplier ?? 1))
      + (item.isEggless ? Number(product.eggless_price_premium) : 0)

    return {
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      image: product.images?.[0] ?? null,
      weight: item.weight,
      flavor: item.flavor ?? null,
      eggless: item.isEggless,
      message: item.message ?? null,
      unit_price: unitPrice,
      quantity: item.quantity,
      line_total: unitPrice * item.quantity,
    }
  })

  // Hampers and photo cakes aren't rows in `products` — there's nothing to
  // look up, so the price comes from re-deriving it from the selection
  // (box + treats, or weight) against the same constants the storefront UI
  // uses, rather than trusting whatever price the client cart computed.
  const customOrderItems: OrderItemRow[] = customItems.map(item => {
    if (item.productId === CUSTOM_HAMPER_PRODUCT_ID) {
      const unitPrice = priceHamper(item.hamperBoxId ?? '', item.hamperTreatIds ?? [])
      return {
        product_id: null,
        product_name: 'Custom Gift Hamper',
        sku: null,
        image: item.image ?? null,
        weight: 'Custom',
        flavor: null,
        eggless: false,
        message: item.message ?? null,
        unit_price: unitPrice,
        quantity: item.quantity,
        line_total: unitPrice * item.quantity,
      }
    }
    // CUSTOM_PHOTO_CAKE_PRODUCT_ID
    const unitPrice = pricePhotoCake(item.weight)
    return {
      product_id: null,
      product_name: 'Custom Photo Cake',
      sku: null,
      image: item.image ?? null,
      weight: item.weight,
      flavor: item.flavor ?? null,
      eggless: false,
      message: item.message ?? null,
      unit_price: unitPrice,
      quantity: item.quantity,
      line_total: unitPrice * item.quantity,
    }
  })

  const orderItems = [...catalogOrderItems, ...customOrderItems]
  const subtotal = orderItems.reduce((sum, i) => sum + i.line_total, 0)
  const deliveryFee = zone ? Number(zone.delivery_fee) : (subtotal > 999 ? 0 : 49)

  let discountAmount = 0
  let appliedCouponCode: string | null = null
  if (input.couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', input.couponCode.trim())
      .eq('is_active', true)
      .maybeSingle()
    if (coupon && (!coupon.expires_at || new Date(coupon.expires_at) >= new Date()) && subtotal >= Number(coupon.min_order_amount)) {
      discountAmount = coupon.discount_type === 'percent'
        ? Math.round(subtotal * (Number(coupon.discount_value) / 100))
        : Number(coupon.discount_value)
      if (coupon.max_discount != null) discountAmount = Math.min(discountAmount, Number(coupon.max_discount))
      discountAmount = Math.min(discountAmount, subtotal)
      appliedCouponCode = coupon.code
    }
  }

  const totalAmount = subtotal + deliveryFee - discountAmount

  const orderNumber = `CC${Date.now().toString(36).toUpperCase()}`
  // Generated here (rather than via .select() after insert) because the
  // public insert policy on `orders` intentionally has no matching SELECT
  // policy — Supabase's .select() after insert reads the row back under RLS,
  // which would otherwise require exposing other customers' orders too.
  const orderId = crypto.randomUUID()

  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      order_number: orderNumber,
      user_id: user?.id ?? null,
      subtotal,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      coupon_code: appliedCouponCode,
      total_amount: totalAmount,
      payment_method: input.paymentMethod ?? 'cod',
      payment_reference: input.paymentReference ?? null,
      delivery_type: input.deliveryType ?? input.cart.find(c => c.deliveryType)?.deliveryType ?? 'same-day',
      delivery_date: input.deliveryDate || null,
      delivery_slot: input.deliverySlot || null,
      is_gift: input.isGift ?? false,
      gift_recipient_name: input.isGift ? (input.giftRecipientName || null) : null,
      gift_message: input.isGift ? (input.giftMessage || null) : null,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail || null,
      delivery_address: {
        line1: input.addressLine1,
        line2: input.addressLine2 || '',
        city: input.city,
        pincode: input.pincode,
      },
    })
  if (orderError) throw new Error(orderError.message)

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems.map(item => ({ ...item, order_id: orderId })))
  if (itemsError) throw new Error(itemsError.message)

  for (const [productId, qty] of requestedQtyByProduct) {
    await supabase.rpc('decrement_stock', { p_product_id: productId, p_quantity: qty, p_order_id: orderId })
  }

  return { orderNumber, total: totalAmount, orderId }
}
