'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StorefrontShell } from '@/components/storefront-shell'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/account')
    router.refresh()
  }

  return (
    <StorefrontShell>
      <div className="mx-auto flex max-w-md flex-col px-5 py-16">
        <h1 className="font-serif text-4xl tracking-tight text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-soft">Sign in to see your orders, addresses and wishlist.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
          </div>
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs font-semibold text-accent">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3.5 font-semibold text-white transition hover:bg-[#192c22] disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          New here? <Link href="/signup" className="font-semibold text-accent">Create an account</Link>
        </p>
      </div>
    </StorefrontShell>
  )
}
