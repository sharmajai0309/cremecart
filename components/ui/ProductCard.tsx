'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Heart, Star } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useToastStore } from '@/lib/toast-store'
import { Product } from '@/lib/data'
import { SmartImage } from '@/components/ui/smart-image'

export function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, wishlist, addToCart } = useStore()
  const { showToast } = useToastStore()
  const isLiked = wishlist.includes(product.id)
  const [addState, setAddState] = useState<'idle' | 'added'>('idle')

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (addState === 'added') return
    addToCart({
      id: `${product.id}-${Date.now()}`, // Temporary unique ID for cart item
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.basePrice,
      quantity: 1,
      weight: product.defaultWeight,
      isEggless: false,
      image: product.images[0]
    })
    setAddState('added')
    showToast(`${product.name} added to cart`)
    setTimeout(() => setAddState('idle'), 1200)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleWishlist(product.id)
    showToast(isLiked ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <article className="group w-full min-w-0 transition-transform duration-200 ease-out hover:-translate-y-1.5">
      <Link href={`/p/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-[1.4rem] bg-surface-container shadow-sm transition-all duration-300 group-hover:shadow-xl">
          <SmartImage src={product.images[0] ?? ''} alt={product.name} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 300px" className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
          <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-2">
            {product.bestseller && <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink shadow-sm backdrop-blur-sm">Bestseller</span>}
            {product.egglessAvailable && <span className="rounded-full bg-[#d2e8d8]/95 px-3 py-1 text-[10px] font-bold text-[#0d1f16] shadow-sm backdrop-blur-sm">Eggless</span>}
            {product.stock > 0 && product.stock < 5 && <span className="rounded-full bg-[#ffdad4]/95 px-3 py-1 text-[10px] font-bold text-[#93000a] shadow-sm backdrop-blur-sm">Only {product.stock} left</span>}
          </div>
          <button
            type="button"
            aria-label={`Add ${product.name} to wishlist`}
            onClick={handleToggleWishlist}
            className="absolute right-3.5 top-3.5 rounded-full bg-white/90 p-2.5 text-ink-variant shadow-sm backdrop-blur-sm transition-all duration-150 ease-out hover:bg-white hover:scale-110 active:scale-90"
          >
            <Heart className={`h-4 w-4 transition-transform duration-150 ${isLiked ? 'scale-110 fill-accent text-accent' : ''}`} />
          </button>
        </div>
        <div className="pt-4 pb-1">
          <h3 className="font-serif text-lg font-medium text-ink leading-snug line-clamp-1">{product.name}</h3>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
            <Star className="h-3.5 w-3.5 fill-[#d8943d] text-[#d8943d]" />
            <b className="font-semibold text-ink">{product.rating}</b>
            <span className="text-ink-soft">({product.reviewCount})</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-semibold text-lg text-ink">₹{product.salePrice || product.basePrice}</span>
            {product.salePrice && <span className="text-xs text-ink-soft line-through">₹{product.basePrice}</span>}
          </div>
          <button
            onClick={handleQuickAdd}
            disabled={addState === 'added'}
            className={`mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all duration-200 ease-out ${
              addState === 'added'
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-line-strong text-ink hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98]'
            }`}
          >
            {addState === 'added' ? (<><Check className="h-4 w-4" /> Added to cart</>) : 'Quick add'}
          </button>
        </div>
      </Link>
    </article>
  )
}
