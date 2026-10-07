'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StorefrontShell } from '@/components/storefront-shell'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    // No session means the project requires email confirmation first.
    if (!data.session) {
      setConfirmationSent(true)
      return
    }
    router.push('/account')
    router.refresh()
  }

  if (confirmationSent) {
    return (
      <StorefrontShell>
        <div className="mx-auto flex max-w-md flex-col px-5 py-16">
          <h1 className="font-serif text-4xl tracking-tight text-ink">Check your email</h1>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            We've sent a confirmation link to <b>{email}</b>. Click it to activate your account, then{' '}
            <Link href="/login" className="font-semibold text-accent">sign in</Link>.
          </p>
        </div>
      </StorefrontShell>
    )
  }

  return (
    <StorefrontShell>
      <div className="mx-auto flex max-w-md flex-col px-5 py-16">
        <h1 className="font-serif text-4xl tracking-tight text-ink">Create an account</h1>
        <p className="mt-2 text-sm text-ink-soft">Track orders, save addresses and build a wishlist.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Full Name</label>
            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Mobile Number</label>
            <input type="tel" required maxLength={10} value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3.5 font-semibold text-white transition hover:bg-[#192c22] disabled:opacity-50">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account? <Link href="/login" className="font-semibold text-accent">Sign in</Link>
        </p>
      </div>
    </StorefrontShell>
  )
}
