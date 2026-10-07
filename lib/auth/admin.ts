import 'server-only'
import { createClient } from '@/lib/supabase/server'

// Defense-in-depth for the admin action layer. The `proxy.ts` gate already
// blocks non-admins from /admin (and from POSTing to server actions there), but
// every admin action re-checks here so that a missing proxy matcher — or a
// future direct invocation — can never reach the secret-key client.
// Mirrors the proxy rule: `role: admin` claim OR an ADMIN_EMAILS match.
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authorized')

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  const isAdmin =
    user.user_metadata?.role === 'admin' ||
    (!!user.email && adminEmails.includes(user.email.toLowerCase()))

  if (!isAdmin) throw new Error('Not authorized')
}
