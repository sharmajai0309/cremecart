'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store'

// Two-way sync between the localStorage wishlist (used by guests) and the
// `wishlist_items` table (signed-in customers), so a saved cake follows the
// account across devices. Mounted once inside StorefrontShell.
export function WishlistSync() {
  const setWishlist = useStore(s => s.setWishlist)
  const serverIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()
    let unsubscribe: (() => void) | null = null
    let cancelled = false

    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      const { data: rows } = await supabase.from('wishlist_items').select('product_id')
      const ids = (rows ?? []).map(r => r.product_id)
      serverIds.current = new Set(ids)

      // Merge anything saved as a guest into the account's list.
      const local = useStore.getState().wishlist
      setWishlist(Array.from(new Set([...local, ...ids])))

      const toInsert = local.filter(id => !serverIds.current.has(id))
      if (toInsert.length > 0) {
        const { error } = await supabase
          .from('wishlist_items')
          .insert(toInsert.map(product_id => ({ user_id: user.id, product_id })))
        if (!error) toInsert.forEach(id => serverIds.current.add(id))
      }

      unsubscribe = useStore.subscribe((state, prev) => {
        if (state.wishlist === prev.wishlist) return
        const added = state.wishlist.filter(id => !serverIds.current.has(id))
        const removed = Array.from(serverIds.current).filter(id => !state.wishlist.includes(id))
        if (added.length > 0) {
          supabase
            .from('wishlist_items')
            .insert(added.map(product_id => ({ user_id: user.id, product_id })))
            .then(({ error }) => { if (!error) added.forEach(id => serverIds.current.add(id)) })
        }
        if (removed.length > 0) {
          supabase
            .from('wishlist_items')
            .delete()
            .eq('user_id', user.id)
            .in('product_id', removed)
            .then(({ error }) => { if (!error) removed.forEach(id => serverIds.current.delete(id)) })
        }
      })
    })()

    return () => {
      cancelled = true
      if (unsubscribe) unsubscribe()
    }
  }, [setWishlist])

  return null
}
