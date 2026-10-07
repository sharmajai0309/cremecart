'use server'

import crypto from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { placeOrder, type PlaceOrderInput } from './actions'

const KEY_ID = process.env.RAZORPAY_KEY_ID
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

// Creates the DB order (prices re-verified by placeOrder) plus a matching
// Razorpay order, and returns what the browser needs to open Razorpay Checkout.
// The customer-facing "pay online" option is only shown when
// NEXT_PUBLIC_RAZORPAY_KEY_ID is set, but the server still guards on its own
// secret being present.
export async function createRazorpayOrder(input: PlaceOrderInput) {
  if (!KEY_ID || !KEY_SECRET) throw new Error('Online payments are not configured.')

  const order = await placeOrder({ ...input, paymentMethod: 'razorpay' })

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(order.total * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { order_number: order.orderNumber },
    }),
  })
  if (!res.ok) throw new Error('Could not start the payment. Please try again.')

  const rzp = (await res.json()) as { id: string }
  const supabase = createAdminClient()
  await supabase.from('orders').update({ payment_reference: rzp.id }).eq('id', order.orderId)

  return { orderNumber: order.orderNumber, total: order.total, razorpayOrderId: rzp.id, keyId: KEY_ID }
}

// Verifies the checkout callback signature with the same HMAC scheme Razorpay
// documents, then marks the order paid. Never trusts the client's word alone.
export async function verifyRazorpayPayment(input: {
  orderNumber: string
  razorpayOrderId: string
  razorpayPaymentId: string
  signature: string
}) {
  if (!KEY_SECRET) throw new Error('Online payments are not configured.')

  const expected = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest('hex')

  if (expected !== input.signature) throw new Error('Payment verification failed.')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: 'paid', payment_reference: input.razorpayPaymentId })
    .eq('order_number', input.orderNumber)
  if (error) throw new Error(error.message)
}
