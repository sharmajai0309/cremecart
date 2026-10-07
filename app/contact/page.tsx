'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle, Phone } from 'lucide-react'
import { submitContactMessage } from './actions'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSending(true)
    try {
      await submitContactMessage({ name, email, orderNumber, message })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface text-ink">
      <header className="border-b border-line bg-white px-5 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold text-primary">Crème<span className="text-accent">Cart</span></Link>
          <Link href="/" className="text-sm text-ink-soft">Back home</Link>
        </div>
      </header>
      <section className="mx-auto grid max-w-5xl gap-12 px-5 py-16 md:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-accent">We're here</p>
          <h1 className="mt-3 font-serif text-5xl">Let's talk cake.</h1>
          <p className="mt-5 leading-7 text-ink-soft">Questions about an order, a custom cake or the perfect surprise? Our little cake desk is ready.</p>
          <div className="mt-10 space-y-5 text-sm">
            <p className="flex items-center gap-3"><Mail className="h-5 w-5 text-accent" /> hello@cremecart.com</p>
            <p className="flex items-center gap-3"><Phone className="h-5 w-5 text-accent" /> +91 800 123 4567</p>
            <p className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-accent" /> Chat with us, 9 AM–9 PM</p>
          </div>
        </div>

        {sent ? (
          <div className="flex items-center justify-center rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-line">
            <div>
              <h2 className="font-serif text-2xl">Message sent!</h2>
              <p className="mt-2 text-sm text-ink-soft">We'll get back to you at {email} soon.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-line">
            <h2 className="font-serif text-2xl">Send a note</h2>
            {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
            </div>
            <input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="Order number (optional)" className="mt-4 w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
            <textarea required value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help?" rows={5} className="mt-4 w-full resize-none rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
            <button type="submit" disabled={sending} className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-50">
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
