'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StorefrontShell } from '@/components/storefront-shell'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/account')
  }

  return (
    <StorefrontShell>
      <div className="mx-auto flex max-w-md flex-col px-5 py-16">
        <h1 className="font-serif text-4xl tracking-tight text-ink">Set a new password</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">New Password</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3.5 font-semibold text-white transition hover:bg-[#192c22] disabled:opacity-50">
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </StorefrontShell>
  )
}
