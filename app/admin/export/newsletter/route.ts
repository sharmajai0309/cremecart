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
  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('email, created_at')
    .order('created_at', { ascending: false })

  if (error) return new Response(error.message, { status: 500 })

  const csv = toCsv(subscribers)
  return csvResponse(csv, `newsletter-${new Date().toISOString().slice(0, 10)}.csv`)
}
