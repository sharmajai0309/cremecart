'use client'

import { useState } from 'react'
import Link from 'next/link'
import { StorefrontShell } from '@/components/storefront-shell'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  return (
    <StorefrontShell>
      <div className="mx-auto flex max-w-md flex-col px-5 py-16">
        <h1 className="font-serif text-4xl tracking-tight text-ink">Reset your password</h1>
        <p className="mt-2 text-sm text-ink-soft">We'll email you a link to set a new password.</p>

        {sent ? (
          <p className="mt-8 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            Check your inbox — a password reset link has been sent to {email}.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3.5 font-semibold text-white transition hover:bg-[#192c22] disabled:opacity-50">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-soft">
          <Link href="/login" className="font-semibold text-accent">Back to sign in</Link>
        </p>
      </div>
    </StorefrontShell>
  )
}
