import { createAdminClient } from '@/lib/supabase/server'
import { csvResponse, toCsv } from '@/lib/csv'
import { requireAdmin } from '@/lib/auth/admin'

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return new Response('Unauthorized', { status: 401 })
  }
  const supabase = createAdminClient()
  const { data: orders, error } = await supabase
    .from('orders')
    .select('order_number, status, payment_status, customer_name, customer_phone, customer_email, subtotal, delivery_fee, discount_amount, total_amount, coupon_code, created_at')
    .order('created_at', { ascending: false })

  if (error) return new Response(error.message, { status: 500 })

  const csv = toCsv(orders)
  return csvResponse(csv, `orders-${new Date().toISOString().slice(0, 10)}.csv`)
}
