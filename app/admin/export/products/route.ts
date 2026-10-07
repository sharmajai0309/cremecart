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
  const { data: products, error } = await supabase
    .from('products')
    .select('sku, name, category, base_price, sale_price, stock, rating, review_count, is_active')
    .order('name')

  if (error) return new Response(error.message, { status: 500 })

  const csv = toCsv(products)
  return csvResponse(csv, `products-${new Date().toISOString().slice(0, 10)}.csv`)
}
