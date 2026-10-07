'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, ImagePlus, Loader2, MapPin, Package, Star, Truck, X } from 'lucide-react'
import { StorefrontShell } from '@/components/storefront-shell'
import { submitReview, trackOrder, uploadReviewImage } from './actions'

type Order = Awaited<ReturnType<typeof trackOrder>>

const STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2, done: () => true },
  { key: 'preparing', label: 'Baking & Packing', icon: Package, done: (s: string) => ['preparing', 'out_for_delivery', 'delivered'].includes(s) },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, done: (s: string) => ['out_for_delivery', 'delivered'].includes(s) },
  { key: 'delivered', label: 'Delivered', icon: MapPin, done: (s: string) => s === 'delivered' },
]

function TrackOrderInner() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get('order') ?? '')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState<Order>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNotFound(false)
    const result = await trackOrder(orderId, phone)
    setOrder(result)
    setNotFound(!result)
    setLoading(false)
  }

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 lg:px-16">
        <div className="text-center">
          <h1 className="font-serif text-4xl tracking-tight text-ink">Track Your Order</h1>
          <p className="mt-2 text-ink-soft">Enter your order details below to see the current status of your cake.</p>
        </div>

        {!order ? (
          <form onSubmit={handleTrack} className="mx-auto mt-10 max-w-md space-y-5 rounded-2xl border border-line bg-white p-8 shadow-sm">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Order ID</label>
              <input
                type="text"
                required
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="e.g. CC1A2B3C4"
                className="w-full rounded-xl border border-line-strong px-4 py-3 outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Mobile Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit number"
                className="w-full rounded-xl border border-line-strong px-4 py-3 outline-none focus:border-accent"
              />
            </div>
            {notFound && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                No order found with that ID and mobile number.
              </p>
            )}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3.5 font-semibold text-white transition hover:bg-[#192c22] disabled:opacity-50">
              {loading ? 'Searching…' : 'Track Order'}
            </button>
          </form>
        ) : (
          <div className="mt-10 rounded-2xl border border-line bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-6">
              <div>
                <h2 className="text-xl font-bold text-ink">Order {order.order_number}</h2>
                <p className="text-sm text-ink-soft">
                  {order.order_items.map(i => `${i.product_name} x${i.quantity}`).join(', ')}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-[#d2e8d8] text-[#0d1f16]'}`}>
                {order.status === 'cancelled' ? 'Cancelled' : 'On Time'}
              </span>
            </div>

            {order.status === 'cancelled' ? (
              <p className="mt-8 text-sm text-ink-soft">This order has been cancelled.</p>
            ) : (
              <div className="relative mt-10 pl-6">
                <div className="absolute bottom-0 left-[11px] top-2 w-[2px] bg-line-strong"></div>
                {STEPS.map((step) => {
                  const isDone = step.done(order.status)
                  return (
                    <div key={step.key} className="relative mb-8 pl-8 last:mb-0">
                      <div className={`absolute -left-[5px] top-1 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white transition-colors duration-300 ${isDone ? 'bg-primary text-white' : 'bg-surface-container text-ink-soft'}`}>
                        <step.icon className="h-4 w-4" />
                      </div>
                      <h3 className={`font-semibold transition-colors duration-300 ${isDone ? 'text-ink' : 'text-ink-soft'}`}>{step.label}</h3>
                      {!isDone && <p className="text-sm text-ink-soft">Pending</p>}
                    </div>
                  )
                })}
              </div>
            )}

            {order.status === 'delivered' && (
              <div className="mt-10 border-t border-line pt-8">
                <h3 className="font-semibold text-ink">Rate your order</h3>
                <div className="mt-4 space-y-4">
                  {order.order_items.map(item => (
                    <ReviewForm key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setOrder(null)} className="mt-10 flex items-center gap-2 text-sm font-semibold text-accent">
              <ArrowLeft className="h-4 w-4" /> Track another order
            </button>
          </div>
        )}
      </div>
    </StorefrontShell>
  )
}

type OrderItem = NonNullable<Order>['order_items'][number]

function ReviewForm({ item }: { item: OrderItem }) {
  const [submitted, setSubmitted] = useState(item.reviews != null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  if (submitted) {
    return (
      <div className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
        Thanks for reviewing <b>{item.product_name}</b>!
      </div>
    )
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const urls: string[] = []
      for (const file of Array.from(files).slice(0, 4)) {
        const fd = new FormData()
        fd.append('file', file)
        urls.push(await uploadReviewImage(fd))
      }
      setImages(prev => [...prev, ...urls].slice(0, 4))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not upload photo.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      await submitReview(item.id, item.product_id!, name, rating, comment, images)
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit review.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-sm font-medium text-ink">{item.product_name}</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
            <Star className={`h-5 w-5 ${n <= rating ? 'fill-[#d8943d] text-[#d8943d]' : 'text-line-strong'}`} />
          </button>
        ))}
      </div>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name (optional)"
        className="mt-3 w-full rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="How was the cake?"
        rows={2}
        className="mt-2 w-full rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-2">
        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line-strong px-3 py-2 text-xs font-medium text-ink-soft hover:border-accent">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {uploading ? 'Uploading…' : 'Add photos'}
          <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={e => handleFiles(e.target.files)} />
        </label>
        {images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((src, i) => (
              <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-line">
                <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={handleSubmit} disabled={saving} className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
        {saving ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderInner />
    </Suspense>
  )
}
