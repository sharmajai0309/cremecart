'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Subscribes to Postgres changes on the given tables and refreshes the
// current Server Component tree when anything changes — used on admin pages
// so multiple tabs/staff see new orders and stock changes live, instead of
// only on next navigation. The actual refetch still goes through the
// server action (secret key), this just tells the page when to ask again.
export function useRealtimeRefresh(tables: string[]) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let timeout: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    const debouncedRefresh = () => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => router.refresh(), 400)
    }

    const channel = supabase.channel(`realtime:${tables.join(',')}`)

    // Realtime evaluates RLS using the JWT passed to the socket, which isn't
    // automatically in sync with the just-restored browser session unless
    // set explicitly — without this, postgres_changes events for an
    // authenticated-only policy (like the admin-read policies) never arrive.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session) supabase.realtime.setAuth(session.access_token)

      for (const table of tables) {
        channel.on('postgres_changes', { event: '*', schema: 'public', table }, debouncedRefresh)
      }
      channel.subscribe()
    })

    return () => {
      cancelled = true
      if (timeout) clearTimeout(timeout)
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(',')])
}
