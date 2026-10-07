'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronDown, ChevronRight, Heart, MapPin, Star } from 'lucide-react'
import { deliveryCapabilities } from '@/lib/data'
import type { Product } from '@/lib/data'
import { getDeliveryZoneForPincode } from '@/lib/queries'
import { useStore } from '@/lib/store'
import { useToastStore } from '@/lib/toast-store'
import { ProductCard } from '@/components/ui/ProductCard'
import { SmartImage } from '@/components/ui/smart-image'

export type Review = {
  id: string
  customer_name: string
  rating: number
  comment: string
  images: string[] | null
}

type DeliveryZone = Awaited<ReturnType<typeof getDeliveryZoneForPincode>>

const ZONE_CAPABILITY_FIELD: Record<string, keyof NonNullable<DeliveryZone>> = {
  'same-day': 'same_day_available',
  '60-min': 'sixty_minute_available',
  'midnight': 'midnight_available',
  'fixed-time': 'fixed_time_available',
}

export function ProductDetail({
  product,
  reviews,
  related,
}: {
  product: Product
  reviews: Review[]
  related: Product[]
}) {
  const router = useRouter()
  const { toggleWishlist, wishlist, addToCart, pincode, setPincode } = useStore()
  const { showToast } = useToastStore()
  const [addState, setAddState] = useState<'idle' | 'added'>('idle')

  const [weight, setWeight] = useState(product.defaultWeight)
  const [isEggless, setIsEggless] = useState(false)
  const [flavor, setFlavor] = useState(product.flavors[0] ?? '')
  const [message, setMessage] = useState('')
  const [deliveryType, setDeliveryType] = useState('same-day')
  const [showPincodeInput, setShowPincodeInput] = useState(false)
  const [tempPincode, setTempPincode] = useState(pincode)
  const [zone, setZone] = useState<DeliveryZone>(null)
  const [zoneChecked, setZoneChecked] = useState(false)

  useEffect(() => {
    if (!pincode) {
      setZone(null)
      setZoneChecked(false)
      return
    }
    getDeliveryZoneForPincode(pincode).then(z => { setZone(z); setZoneChecked(true) }).catch(console.error)
  }, [pincode])

  const isLiked = wishlist.includes(product.id)
  const currentWeightOpt = product.availableWeights.find(w => w.weight === weight)
  const basePrice = product.salePrice || product.basePrice
  const weightPrice = Math.round(basePrice * (currentWeightOpt?.priceMultiplier || 1))
  const finalPrice = weightPrice + (isEggless ? product.egglessPricePremium : 0)

  const cartItem = {
    id: `${product.id}-${Date.now()}`,
    productId: product.id,
    name: product.name,
    price: finalPrice,
    quantity: 1,
    weight,
    isEggless,
    flavor,
    message,
    image: product.images[0],
    deliveryType,
  }

  const handleAddToCart = () => {
    addToCart(cartItem)
    setAddState('added')
    showToast(`${product.name} added to cart`)
    setTimeout(() => setAddState('idle'), 1200)
  }

  const handleBuyNow = () => {
    addToCart(cartItem)
    router.push('/checkout')
  }

  const handleToggleWishlist = () => {
    toggleWishlist(product.id)
    showToast(isLiked ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handlePincodeSubmit = () => {
    setPincode(tempPincode)
    setShowPincodeInput(false)
  }

  const ratingBreakdown = [5, 4, 3, 2, 1].map(n => ({
    stars: n,
    count: reviews.filter(r => r.rating === n).length,
  }))

  return (
    <div className="mx-auto max-w-[1360px] px-5 py-6 sm:px-8 lg:px-16">
      <nav className="flex items-center gap-2 text-xs text-ink-soft">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-black">Cakes</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container">
            <SmartImage src={product.images[0] ?? ''} alt={product.name} fill priority sizes="(max-width:1024px) 100vw, 55vw" className="object-cover" />
          </div>
        </div>

        {/* Configuration Panel */}
        <div>
          <div className="flex items-center justify-between">
            {product.bestseller && (
              <span className="rounded-full bg-[#ffdad4] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#400200]">Best Seller</span>
            )}
            <button aria-label="Add to wishlist" onClick={handleToggleWishlist} className="rounded-full bg-surface-container p-2.5 text-ink-variant transition-all duration-150 ease-out hover:bg-line active:scale-90">
              <Heart className={`h-4 w-4 transition-transform duration-150 ${isLiked ? 'scale-110 fill-accent text-accent' : ''}`} />
            </button>
          </div>

          <h1 className="mt-4 font-serif text-3xl font-medium tracking-tight text-ink">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-[#d8943d] text-[#d8943d]" />
              <span className="font-bold text-ink">{product.rating}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span>{product.reviewCount} Reviews</span>
            <span className="text-gray-300">|</span>
            <span className="uppercase text-ink-soft">SKU: {product.sku}</span>
          </div>

          <div className="mt-5 border-b border-t border-line py-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-ink">₹{finalPrice}</span>
              {product.salePrice && <span className="text-sm text-ink-soft line-through">₹{Math.round(product.basePrice * (currentWeightOpt?.priceMultiplier || 1))}</span>}
            </div>
            <p className="mt-1 text-xs text-ink-soft">Prices include applicable taxes</p>
          </div>

          {/* Config: Weight */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Select Weight</h3>
              <span className="text-xs text-ink-soft">Serves {currentWeightOpt?.serves}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.availableWeights.map((w) => (
                <button
                  key={w.weight}
                  onClick={() => setWeight(w.weight)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${weight === w.weight ? 'border-primary bg-surface-high text-primary' : 'border-line-strong text-ink-soft hover:border-ink-soft'}`}
                >
                  {w.weight}
                </button>
              ))}
            </div>
          </div>

          {/* Config: Eggless */}
          {product.egglessAvailable && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-ink">Cake Type</h3>
              <div className="flex gap-2">
                <button onClick={() => setIsEggless(false)} className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${!isEggless ? 'border-primary bg-surface-high text-primary' : 'border-line-strong text-ink-soft'}`}>With Egg</button>
                <button onClick={() => setIsEggless(true)} className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${isEggless ? 'border-primary bg-surface-high text-primary' : 'border-line-strong text-ink-soft'}`}>
                  Eggless <span className="text-xs text-accent">(+₹{product.egglessPricePremium})</span>
                </button>
              </div>
            </div>
          )}

          {/* Config: Flavor (if multiple) */}
          {product.flavors.length > 1 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-ink">Flavour</h3>
              <div className="flex flex-wrap gap-2">
                {product.flavors.map(f => (
                  <button key={f} onClick={() => setFlavor(f)} className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${flavor === f ? 'border-primary bg-surface-high text-primary' : 'border-line-strong text-ink-soft'}`}>{f}</button>
                ))}
              </div>
            </div>
          )}

          {/* Config: Message */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Message on Cake</h3>
              <span className="text-xs text-ink-soft">{message.length} / 25</span>
            </div>
            <input
              type="text"
              maxLength={25}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a sweet wish..."
              className="mt-3 w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>

          {/* Delivery Section */}
          <div className="mt-8 rounded-2xl bg-surface p-5 border border-line">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Deliver to</h3>
              {showPincodeInput ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={tempPincode} onChange={e => setTempPincode(e.target.value)} maxLength={6} className="w-24 rounded border px-2 py-1 text-sm outline-none" placeholder="Pincode" />
                  <button onClick={handlePincodeSubmit} className="text-xs font-bold text-accent">Save</button>
                </div>
              ) : (
                <button onClick={() => setShowPincodeInput(true)} className="text-xs font-bold text-accent underline">
                  {pincode || 'Enter Pincode'}
                </button>
              )}
            </div>

            {pincode && zoneChecked && !zone && (
              <p className="mb-3 text-xs font-medium text-accent">We don't deliver to {pincode} yet — showing standard options only.</p>
            )}

            <div className="space-y-3">
              {product.deliveryEligibility
                .filter((type) => !zone || zone[ZONE_CAPABILITY_FIELD[type]])
                .map((type) => {
                  const info = deliveryCapabilities[type as keyof typeof deliveryCapabilities]
                  if (!info) return null
                  const fee = zone ? Number(zone.delivery_fee) : info.fee
                  return (
                    <label key={type} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${deliveryType === type ? 'border-primary bg-white' : 'border-line bg-white/50 hover:border-line-strong'}`}>
                      <input type="radio" name="delivery" checked={deliveryType === type} onChange={() => setDeliveryType(type)} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-semibold text-ink">{info.title}</span>
                          <span className="text-sm font-semibold text-ink">{fee === 0 ? 'Free' : `+₹${fee}`}</span>
                        </div>
                        <p className="mt-1 text-xs text-ink-soft">{info.description}</p>
                      </div>
                    </label>
                  )
                })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={addState === 'added'}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-4 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.98] ${addState === 'added' ? 'border-primary bg-primary text-white' : 'border-primary text-primary hover:bg-surface-high'}`}
            >
              {addState === 'added' ? (<><Check className="h-4 w-4" /> Added</>) : 'Add to Cart'}
            </button>
            <button onClick={handleBuyNow} className="flex-1 rounded-xl bg-primary py-4 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-[#192c22] active:scale-[0.98]">Buy Now</button>
          </div>

          {/* Info accordions */}
          <div className="mt-10 space-y-4">
            <details className="group border-b border-line pb-4">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-ink">
                Description <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-ink-soft">{product.description}</p>
            </details>
            <details className="group border-b border-line pb-4">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-ink">
                Ingredients & Allergens <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </summary>
              <div className="mt-3 text-sm text-ink-soft">
                <p><strong>Ingredients:</strong> {product.ingredients.join(', ')}</p>
                <p className="mt-2"><strong>Allergens:</strong> {product.allergens.join(', ')}</p>
              </div>
            </details>
            <details className="group border-b border-line pb-4" open={reviews.length > 0}>
              <summary className="flex cursor-pointer items-center justify-between font-medium text-ink">
                Reviews ({reviews.length}) <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </summary>
              <div className="mt-3 space-y-4">
                {reviews.length > 0 && (
                  <div className="space-y-1.5 rounded-xl bg-surface p-4">
                    {ratingBreakdown.map(({ stars, count }) => (
                      <div key={stars} className="flex items-center gap-2 text-xs text-ink-soft">
                        <span className="w-3 font-medium">{stars}</span>
                        <Star className="h-3 w-3 fill-[#d8943d] text-[#d8943d]" />
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                          <div className="h-full rounded-full bg-[#d8943d]" style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} />
                        </div>
                        <span className="w-4 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
                {reviews.length === 0 ? (
                  <p className="text-sm text-ink-soft">No reviews yet.</p>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="border-b border-surface-container pb-3 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? 'fill-[#d8943d] text-[#d8943d]' : 'text-line-strong'}`} />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-ink">{r.customer_name}</span>
                      </div>
                      {r.comment && <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>}
                      {r.images && r.images.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {r.images.map((src, i) => (
                            <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg bg-surface-container">
                              <SmartImage src={src} alt={`Review photo ${i + 1}`} fill sizes="64px" className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-line pt-10">
          <h2 className="font-serif text-2xl text-ink">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
