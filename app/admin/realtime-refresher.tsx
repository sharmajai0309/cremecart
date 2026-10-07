'use client'

import { useRealtimeRefresh } from '@/lib/useRealtimeRefresh'

// Invisible — just wires up the live-refresh subscription for whichever
// tables matter on the page it's dropped into.
export function RealtimeRefresher({ tables }: { tables: string[] }) {
  useRealtimeRefresh(tables)
  return null
}
