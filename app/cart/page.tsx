'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Minus, Plus, Tag, Trash2, X } from 'lucide-react'
import { useStore } from '@/lib/store'
import { StorefrontShell } from '@/components/storefront-shell'
import { validateCoupon } from './actions'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, couponCode, couponDiscount, setCoupon, clearCoupon } = useStore()
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const delivery = 0 // Mock delivery, can be dynamic later based on delivery type
  const discount = Math.min(couponDiscount, subtotal)
  const total = subtotal + delivery - discount

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    setApplying(true)
    setCouponError(null)
    const result = await validateCoupon(couponInput, subtotal)
    setApplying(false)
    if (!result.valid) {
      setCouponError(result.message)
      return
    }
    setCoupon(result.code, result.discount)
    setCouponInput('')
  }

  return (
    <StorefrontShell>
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-16">
        <Link href="/shop" className="flex items-center gap-2 text-sm text-ink-soft">
          <ArrowLeft className="h-4 w-4" /> Continue shopping
        </Link>
        <h1 className="mt-8 font-serif text-4xl">Your cart</h1>
        
        {cart.length === 0 ? (
          <div className="mt-12 text-center">
            <h2 className="text-xl font-medium text-ink">Your cart is empty</h2>
            <p className="mt-2 text-ink-soft">Looks like you haven't added any cakes yet.</p>
            <Link href="/shop" className="mt-6 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-white">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex gap-4">
                    <img src={item.image} alt={item.name} className="h-28 w-28 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="flex justify-between gap-4">
                        <div>
                          <h2 className="font-medium">{item.name}</h2>
                          <p className="mt-1 text-sm text-ink-soft">
                            {item.weight} · {item.isEggless ? 'Eggless' : 'With Egg'}
                            {item.message ? ` · Msg: "${item.message}"` : ''}
                          </p>
                          {item.deliverySlot && <p className="mt-1 text-xs font-semibold text-accent">Delivery: {item.deliverySlot}</p>}
                        </div>
                        <button onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                          <Trash2 className="h-4 w-4 text-ink-soft hover:text-accent" />
                        </button>
                      </div>
                      <div className="mt-5 flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-lg border border-line px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} aria-label="Decrease quantity" className="rounded p-0.5 transition-transform duration-100 active:scale-90"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-4 text-center text-sm tabular-nums">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity" className="rounded p-0.5 transition-transform duration-100 active:scale-90"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <b>₹{item.price * item.quantity}</b>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <aside className="h-fit rounded-2xl bg-surface-container p-6">
              <h2 className="font-serif text-2xl">Order summary</h2>

              <div className="mt-5">
                {couponCode ? (
                  <div className="animate-in fade-in zoom-in-95 duration-200 flex items-center justify-between rounded-xl border border-primary bg-white px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-primary"><Tag className="h-4 w-4" /> {couponCode} applied</span>
                    <button onClick={clearCoupon} aria-label="Remove coupon" className="transition-transform duration-150 active:scale-90"><X className="h-4 w-4 text-ink-soft hover:text-accent" /></button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        className="w-full rounded-xl border border-line-strong bg-white px-4 py-2.5 text-sm outline-none focus:border-accent"
                      />
                      <button onClick={handleApplyCoupon} disabled={applying} className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-transform duration-150 active:scale-[0.97] disabled:opacity-50">
                        {applying ? '…' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="mt-2 text-xs text-accent">{couponError}</p>}
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary"><span>Coupon discount</span><span>-₹{discount}</span></div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  {delivery === 0 ? <span className="text-primary">Free</span> : <span>₹{delivery}</span>}
                </div>
                {subtotal < 999 && (
                   <p className="text-xs text-accent">You're ₹{999 - subtotal} away from free delivery!</p>
                )}
                <div className="border-t border-line-strong pt-3">
                  <div className="flex justify-between text-base font-semibold"><span>Total</span><span>₹{total}</span></div>
                </div>
              </div>
              <Link href="/checkout" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-[#192c22]">
                Proceed to checkout <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
              <p className="mt-4 flex items-center gap-2 text-xs text-ink-soft">
                <Check className="h-3.5 w-3.5 text-primary" /> Secure checkout · Freshness guaranteed
              </p>
            </aside>
          </div>
        )}
      </section>
    </StorefrontShell>
  )
}
