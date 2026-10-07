'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Box, CheckCircle2, ChevronRight, Gift, PackageOpen, ShoppingBag, Sparkles } from 'lucide-react'
import { StorefrontShell } from '@/components/storefront-shell'
import { useStore } from '@/lib/store'
import { CUSTOM_HAMPER_PRODUCT_ID, HAMPER_BOXES as boxes, HAMPER_TREATS as treats } from '@/lib/composite-offerings'

export default function HamperBuilderPage() {
  const [step, setStep] = useState(1)
  const [selectedBox, setSelectedBox] = useState<(typeof boxes)[number]>(boxes[0])
  const [selectedTreats, setSelectedTreats] = useState<string[]>([])
  const [message, setMessage] = useState('')

  const { addToCart } = useStore()

  const treatsTotal = selectedTreats.reduce((sum, id) => sum + (treats.find(t => t.id === id)?.price || 0), 0)
  const finalPrice = selectedBox.price + treatsTotal

  const toggleTreat = (id: string) => {
    if (selectedTreats.includes(id)) {
      setSelectedTreats(selectedTreats.filter(t => t !== id))
    } else {
      setSelectedTreats([...selectedTreats, id])
    }
  }

  const handleAddToCart = () => {
    addToCart({
      id: `hamper-${Date.now()}`,
      productId: CUSTOM_HAMPER_PRODUCT_ID,
      name: 'Custom Gift Hamper',
      price: finalPrice,
      quantity: 1,
      weight: 'Custom',
      isEggless: false,
      message,
      image: selectedBox.image,
      hamperBoxId: selectedBox.id,
      hamperTreatIds: selectedTreats,
    })
    setStep(4) // Success step
  }

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-16">
        <Link href="/shop" className="mb-8 flex items-center gap-2 text-sm text-ink-soft"><ArrowLeft className="h-4 w-4" /> Back</Link>
        
        <div className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Gifting Made Personal</p>
          <h1 className="font-serif text-4xl tracking-tight text-ink">Build Your Hamper</h1>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium sm:gap-6">
            <span className={step >= 1 ? 'text-accent' : 'text-ink-soft'}>1. Box</span>
            <ChevronRight className="h-3 w-3 text-line-strong" />
            <span className={step >= 2 ? 'text-accent' : 'text-ink-soft'}>2. Treats</span>
            <ChevronRight className="h-3 w-3 text-line-strong" />
            <span className={step >= 3 ? 'text-accent' : 'text-ink-soft'}>3. Message</span>
          </div>
        </div>

        {step === 1 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {boxes.map(box => (
              <div 
                key={box.id} 
                onClick={() => { setSelectedBox(box); setStep(2) }}
                className={`group cursor-pointer overflow-hidden rounded-2xl border-2 transition ${selectedBox.id === box.id ? 'border-accent shadow-md' : 'border-transparent hover:border-line'}`}
              >
                <img src={box.image} alt={box.name} className="h-64 w-full object-cover" />
                <div className="bg-white p-5 text-center">
                  <h3 className="font-semibold text-ink">{box.name}</h3>
                  <p className="mt-1 text-sm text-ink-soft">₹{box.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-medium">Select Treats & Gifts</h2>
              <span className="text-sm text-ink-soft">{selectedTreats.length} selected</span>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {treats.map(treat => (
                <div 
                  key={treat.id} 
                  onClick={() => toggleTreat(treat.id)}
                  className={`cursor-pointer overflow-hidden rounded-2xl border-2 transition ${selectedTreats.includes(treat.id) ? 'border-primary shadow-sm' : 'border-line'}`}
                >
                  <div className="relative">
                    <img src={treat.image} alt={treat.name} className="aspect-square w-full object-cover" />
                    {selectedTreats.includes(treat.id) && (
                      <div className="absolute right-2 top-2 rounded-full bg-primary p-1"><CheckCircle2 className="h-4 w-4 text-white" /></div>
                    )}
                  </div>
                  <div className="bg-white p-4 text-center">
                    <h3 className="text-sm font-semibold">{treat.name}</h3>
                    <p className="mt-1 text-xs text-ink-soft">₹{treat.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={() => setStep(1)} className="rounded-xl border border-line-strong px-6 py-3 text-sm font-semibold">Back</button>
              <button onClick={() => setStep(3)} disabled={selectedTreats.length === 0} className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white disabled:opacity-50">Next Step</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-xl font-medium">Add a personal touch</h2>
              <textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Write your gift message here..."
                className="h-40 w-full resize-none rounded-xl border border-line-strong p-4 text-sm outline-none focus:border-accent"
              />
              <div className="mt-10 flex gap-4">
                <button onClick={() => setStep(2)} className="rounded-xl border border-line-strong px-6 py-3 text-sm font-semibold">Back</button>
                <button onClick={handleAddToCart} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white">Add Hamper to Cart</button>
              </div>
            </div>
            
            <div className="rounded-2xl bg-surface p-6 border border-line">
              <h3 className="mb-4 font-serif text-xl">Your Hamper Summary</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-line pb-4">
                  <span className="font-medium">{selectedBox.name}</span>
                  <span>₹{selectedBox.price}</span>
                </div>
                {selectedTreats.map(id => {
                  const treat = treats.find(t => t.id === id)
                  return (
                    <div key={id} className="flex justify-between text-ink-soft">
                      <span>{treat?.name}</span>
                      <span>₹{treat?.price}</span>
                    </div>
                  )
                })}
                <div className="border-t border-line pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{finalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#d2e8d8]">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-serif text-4xl">Hamper Added!</h2>
            <p className="mt-3 text-ink-soft">Your custom gift hamper has been added to your cart.</p>
            <div className="mt-8 flex gap-4">
              <Link href="/shop" className="rounded-xl border border-line-strong px-6 py-3 font-semibold">Keep Shopping</Link>
              <Link href="/cart" className="rounded-xl bg-primary px-6 py-3 font-semibold text-white">View Cart</Link>
            </div>
          </div>
        )}

      </div>
    </StorefrontShell>
  )
}
