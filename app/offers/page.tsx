'use client'

import { useState } from 'react'
import Link from 'next/link'
import { StorefrontShell, ContentPanel } from '@/components/storefront-shell'

const offers = [
  { code: 'SWEET10', title: '10% off your first order', detail: 'Valid on orders above ₹999', color: 'bg-surface-container' },
  { code: 'CAKEFRIEND', title: 'Free delivery on ₹999+', detail: 'Available across Delhi NCR and Bangalore', color: 'bg-line' },
  { code: 'MIDNIGHT15', title: '15% off midnight deliveries', detail: 'Make the surprise extra sweet', color: 'bg-line' },
]

export default function OffersPage() {
  const [copied, setCopied] = useState<string | null>(null)

  async function handleCopy(code: string) {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <StorefrontShell title="Sweet offers, made for sharing" subtitle="Save on cakes, gifts and the little moments worth celebrating.">
      <ContentPanel>
        <div className="grid gap-5 md:grid-cols-3">
          {offers.map((offer) => (
            <div key={offer.code} className={`${offer.color} rounded-3xl p-7`}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Limited offer</p>
              <h2 className="mt-10 font-serif text-3xl">{offer.title}</h2>
              <p className="mt-3 text-sm text-ink-soft">{offer.detail}</p>
              <div className="mt-7 flex items-center justify-between rounded-xl bg-white/70 px-4 py-3">
                <code className="font-semibold">{offer.code}</code>
                <button onClick={() => handleCopy(offer.code)} className="text-xs font-bold text-accent">
                  {copied === offer.code ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <Link href="/shop" className="mt-5 inline-block rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">Shop now</Link>
            </div>
          ))}
        </div>
      </ContentPanel>
    </StorefrontShell>
  )
}
