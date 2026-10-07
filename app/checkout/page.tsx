'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, CreditCard, Gift, MapPin, Plus, ShieldCheck, Smartphone } from 'lucide-react'
import { useStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { getProducts } from '@/lib/queries'
import type { Product } from '@/lib/data'
import { placeOrder } from './actions'
import { createRazorpayOrder, verifyRazorpayPayment } from './payment-actions'

const DELIVERY_SLOTS = [
  'Same day (as soon as possible)',
  '7 AM – 9 AM',
  '9 AM – 11 AM',
  '11 AM – 1 PM',
  '1 PM – 3 PM',
  '3 PM – 5 PM',
  '5 PM – 7 PM',
  '7 PM – 9 PM',
  'Midnight (11 PM – 12 AM)',
]

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) return resolve()
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load the payment window.'))
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const { cart, clearCart, couponCode, couponDiscount, addToCart } = useStore()
  const router = useRouter()
  const [step, setStep] = useState(1)

  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [pincode, setPincode] = useState('')
  const [city, setCity] = useState('')

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [deliveryDate, setDeliveryDate] = useState(today)
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0])

  const [isGift, setIsGift] = useState(false)
  const [giftRecipientName, setGiftRecipientName] = useState('')
  const [giftMessage, setGiftMessage] = useState('')

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod')
  const [upsells, setUpsells] = useState<Product[]>([])
  const [isPlacing, setIsPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const delivery = subtotal > 999 ? 0 : 49
  const discount = Math.min(couponDiscount, subtotal)
  const total = subtotal + delivery - discount

  // Prefill from the signed-in customer's saved default address.
  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const meta = user.user_metadata ?? {}
        const fullName = (meta.full_name as string) || ''
        setFirstName(fullName.split(' ')[0] ?? '')
        setLastName(fullName.split(' ').slice(1).join(' '))
        setPhone((meta.phone as string) ?? '')
        setEmail(user.email ?? '')

        const { data: addr } = await supabase
          .from('addresses')
          .select('*')
          .order('is_default', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (addr) {
          setAddressLine1(a => a || addr.line1)
          setAddressLine2(a => a || addr.line2)
          setCity(c => c || addr.city)
          setPincode(p => p || addr.pincode)
          setPhone(p => p || addr.phone)
          if (!meta.full_name) {
            setFirstName(fullName.split(' ')[0] ?? addr.full_name.split(' ')[0] ?? '')
            setLastName(fullName.split(' ').slice(1).join(' ') || addr.full_name.split(' ').slice(1).join(' '))
          }
        }
      } catch {
        // prefill is best-effort
      }
    })()
  }, [])

  // A couple of quick upsells the customer can add without leaving checkout.
  useEffect(() => {
    getProducts().then(list => setUpsells(list.slice(0, 6))).catch(() => {})
  }, [])

  const cartProductIds = new Set(cart.map(c => c.productId))
  const upsellSuggestions = upsells.filter(p => !cartProductIds.has(p.id)).slice(0, 2)

  function buildInput() {
    return {
      cart: cart.map(item => ({
        productId: item.productId,
        weight: item.weight,
        isEggless: item.isEggless,
        flavor: item.flavor,
        message: item.message,
        quantity: item.quantity,
        hamperBoxId: item.hamperBoxId,
        hamperTreatIds: item.hamperTreatIds,
        image: item.image,
        deliveryType: item.deliveryType,
      })),
      customerName: `${firstName} ${lastName}`.trim(),
      customerPhone: phone,
      customerEmail: email || undefined,
      addressLine1,
      addressLine2,
      city,
      pincode,
      couponCode: couponCode ?? undefined,
      deliveryDate: deliveryDate || undefined,
      deliverySlot: deliverySlot || undefined,
      isGift,
      giftRecipientName: isGift ? giftRecipientName : undefined,
      giftMessage: isGift ? giftMessage : undefined,
    }
  }

  async function handlePlaceOrder() {
    setError(null)
    setIsPlacing(true)
    try {
      if (paymentMethod === 'razorpay') {
        const created = await createRazorpayOrder(buildInput())
        await loadRazorpay()
        await new Promise<void>((resolve, reject) => {
          const rzp = new (window as any).Razorpay({
            key: RAZORPAY_KEY,
            amount: Math.round(created.total * 100),
            currency: 'INR',
            name: 'CrèmeCart',
            description: `Order ${created.orderNumber}`,
            order_id: created.razorpayOrderId,
            prefill: { name: `${firstName} ${lastName}`.trim(), contact: phone, email },
            theme: { color: '#2f4237' },
            handler: async (response: any) => {
              try {
                await verifyRazorpayPayment({
                  orderNumber: created.orderNumber,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                })
                clearCart()
                router.push(`/track-order?order=${created.orderNumber}`)
                resolve()
              } catch (e) {
                reject(e)
              }
            },
            modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) },
          })
          rzp.open()
        })
      } else {
        const result = await placeOrder({ ...buildInput(), paymentMethod: 'cod' })
        clearCart()
        router.push(`/track-order?order=${result.orderNumber}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not place order. Please try again.')
      setIsPlacing(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-5 text-center">
        <h1 className="font-serif text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-ink-soft">Add some delicious cakes before checking out.</p>
        <Link href="/shop" className="mt-6 rounded-xl bg-primary px-6 py-3 font-medium text-white">Return to Shop</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-line bg-white px-5 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/cart" className="flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Link>
          <span className="font-serif text-xl font-semibold text-primary">Crème<span className="text-accent">Cart</span></span>
          <div className="flex items-center gap-1 text-xs text-primary"><ShieldCheck className="h-4 w-4" /> Secure</div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* Step 1: Contact */}
            <section className={`rounded-2xl border p-6 ${step === 1 ? 'border-primary bg-white shadow-sm' : 'border-line bg-surface'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${step === 1 ? 'bg-primary text-white' : step > 1 ? 'bg-primary text-white' : 'bg-line text-ink-soft'}`}>
                    {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
                  </div>
                  <h2 className={`text-lg font-medium ${step >= 1 ? 'text-black' : 'text-ink-soft'}`}>Contact Details</h2>
                </div>
                {step > 1 && <button onClick={() => setStep(1)} className="text-sm font-medium text-accent">Edit</button>}
              </div>

              {step === 1 && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink-soft">Mobile Number</label>
                    <div className="flex rounded-xl border border-line-strong focus-within:border-accent">
                      <span className="flex items-center bg-surface-container px-4 text-sm text-ink-soft">+91</span>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} maxLength={10} placeholder="10-digit mobile number" className="w-full bg-transparent px-4 py-3 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink-soft">Email (optional — for order updates)</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-line-strong px-4 py-3 outline-none focus:border-accent" />
                  </div>
                  <button onClick={() => setStep(2)} disabled={phone.length < 10} className="w-full rounded-xl bg-primary py-3.5 font-semibold text-white disabled:opacity-50">
                    Continue to Address
                  </button>
                </div>
              )}
              {step > 1 && <p className="mt-2 pl-11 text-sm text-ink-soft">+91 {phone}</p>}
            </section>

            {/* Step 2: Address + schedule + gift */}
            <section className={`rounded-2xl border p-6 ${step === 2 ? 'border-primary bg-white shadow-sm' : 'border-line bg-surface'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${step === 2 ? 'bg-primary text-white' : step > 2 ? 'bg-primary text-white' : 'bg-line text-ink-soft'}`}>
                    {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
                  </div>
                  <h2 className={`text-lg font-medium ${step >= 2 ? 'text-black' : 'text-ink-soft'}`}>Delivery Address</h2>
                </div>
                {step > 2 && <button onClick={() => setStep(2)} className="text-sm font-medium text-accent">Edit</button>}
              </div>

              {step === 2 && (
                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" className="rounded-xl border border-line-strong px-4 py-3 outline-none focus:border-accent" />
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" className="rounded-xl border border-line-strong px-4 py-3 outline-none focus:border-accent" />
                  </div>
                  <input type="text" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="House/Flat No, Building Name" className="w-full rounded-xl border border-line-strong px-4 py-3 outline-none focus:border-accent" />
                  <input type="text" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Street Address, Area" className="w-full rounded-xl border border-line-strong px-4 py-3 outline-none focus:border-accent" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} maxLength={6} placeholder="Pincode" className="rounded-xl border border-line-strong px-4 py-3 outline-none focus:border-accent" />
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="rounded-xl border border-line-strong px-4 py-3 outline-none focus:border-accent" />
                  </div>

                  {/* Delivery schedule */}
                  <div className="rounded-xl border border-line bg-surface p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"><MapPin className="h-4 w-4 text-accent" /> Delivery date & time</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input type="date" min={today} value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="rounded-lg border border-line-strong px-3 py-2.5 text-sm outline-none focus:border-accent" />
                      <select value={deliverySlot} onChange={e => setDeliverySlot(e.target.value)} className="rounded-lg border border-line-strong px-3 py-2.5 text-sm outline-none focus:border-accent">
                        {DELIVERY_SLOTS.map(slot => <option key={slot}>{slot}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Gift options */}
                  <div className="rounded-xl border border-line bg-surface p-4">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={isGift} onChange={e => setIsGift(e.target.checked)} className="h-4 w-4 accent-primary" />
                      <span className="flex items-center gap-2 text-sm font-semibold text-ink"><Gift className="h-4 w-4 text-accent" /> Send as a gift (hide prices on the slip)</span>
                    </label>
                    {isGift && (
                      <div className="mt-3 space-y-3">
                        <input type="text" value={giftRecipientName} onChange={e => setGiftRecipientName(e.target.value)} placeholder="Recipient's name" className="w-full rounded-lg border border-line-strong px-3 py-2.5 text-sm outline-none focus:border-accent" />
                        <textarea value={giftMessage} onChange={e => setGiftMessage(e.target.value)} rows={2} maxLength={200} placeholder="Gift message to print on the card" className="w-full rounded-lg border border-line-strong px-3 py-2.5 text-sm outline-none focus:border-accent" />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setStep(3)}
                    disabled={!firstName || !addressLine1 || pincode.length < 6 || !city}
                    className="w-full rounded-xl bg-primary py-3.5 font-semibold text-white disabled:opacity-50"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}
              {step > 2 && <p className="mt-2 pl-11 text-sm text-ink-soft">{addressLine1}, {addressLine2}, {city} {pincode} · {deliveryDate} {deliverySlot}{isGift && ' · Gift'}</p>}
            </section>

            {/* Step 3: Payment */}
            <section className={`rounded-2xl border p-6 ${step === 3 ? 'border-primary bg-white shadow-sm' : 'border-line bg-surface'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${step === 3 ? 'bg-primary text-white' : 'bg-line text-ink-soft'}`}>3</div>
                <h2 className={`text-lg font-medium ${step === 3 ? 'text-black' : 'text-ink-soft'}`}>Payment Method</h2>
              </div>

              {step === 3 && (
                <div className="mt-6 space-y-4">
                  <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${paymentMethod === 'cod' ? 'border-primary bg-surface-high' : 'border-line-strong'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-4 w-4 accent-primary" />
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                    <CreditCard className="h-5 w-5 text-ink-soft" />
                  </label>

                  {RAZORPAY_KEY && (
                    <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${paymentMethod === 'razorpay' ? 'border-primary bg-surface-high' : 'border-line-strong'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="h-4 w-4 accent-primary" />
                        <span className="font-medium">Pay Online (UPI / Card)</span>
                      </div>
                      <Smartphone className="h-5 w-5 text-ink-soft" />
                    </label>
                  )}
                  {!RAZORPAY_KEY && <p className="text-xs text-ink-soft">Online payments (UPI / Card) are coming soon.</p>}

                  {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacing}
                    className="mt-2 w-full rounded-xl bg-accent py-4 text-lg font-bold text-white shadow-lg shadow-accent/20 transition-all duration-200 ease-out hover:bg-accent active:scale-[0.99] disabled:opacity-50"
                  >
                    {isPlacing ? 'Placing order…' : paymentMethod === 'razorpay' ? `Pay ₹${total}` : `Place Order · ₹${total}`}
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Summary */}
          <aside>
            <div className="sticky top-6 rounded-2xl bg-surface-container p-6">
              <h3 className="font-serif text-xl font-medium">Order Summary</h3>

              <div className="mt-6 space-y-4 border-b border-line-strong pb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">{item.name}</h4>
                        <span className="text-sm font-medium">₹{item.price * item.quantity}</span>
                      </div>
                      <p className="text-xs text-ink-soft">Qty: {item.quantity} · {item.weight}</p>
                      {item.message && <p className="mt-1 text-[10px] italic text-ink-soft">"{item.message}"</p>}
                    </div>
                  </div>
                ))}
              </div>

              {upsellSuggestions.length > 0 && (
                <div className="mt-6 border-b border-line-strong pb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-ink-soft">Make it extra special</h4>
                  <div className="mt-3 space-y-2">
                    {upsellSuggestions.map(p => (
                      <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white/70 p-2.5">
                        <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-ink-soft">₹{p.salePrice || p.basePrice}</p>
                        </div>
                        <button
                          onClick={() => addToCart({
                            id: `${p.id}-${Date.now()}`,
                            productId: p.id,
                            name: p.name,
                            price: p.salePrice || p.basePrice,
                            quantity: 1,
                            weight: p.defaultWeight,
                            isEggless: false,
                            image: p.images[0],
                          })}
                          className="flex items-center gap-1 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-white"
                        >
                          <Plus className="h-3 w-3" /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-ink-soft"><span>Item Total</span><span>₹{subtotal}</span></div>
                {couponCode && discount > 0 && (
                  <div className="flex justify-between text-primary"><span>Coupon ({couponCode})</span><span>-₹{discount}</span></div>
                )}
                <div className="flex justify-between text-ink-soft">
                  <span>Delivery Fee</span>
                  {delivery === 0 ? <span className="text-primary font-medium">Free</span> : <span>₹{delivery}</span>}
                </div>
                <div className="border-t border-line-strong pt-4 flex justify-between text-lg font-bold">
                  <span>To Pay</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
