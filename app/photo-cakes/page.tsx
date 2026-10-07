'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react'
import { StorefrontShell } from '@/components/storefront-shell'
import { useStore } from '@/lib/store'
import { useToastStore } from '@/lib/toast-store'
import { CUSTOM_PHOTO_CAKE_PRODUCT_ID, PHOTO_CAKE_WEIGHTS, pricePhotoCake } from '@/lib/composite-offerings'
import { uploadPhotoCakeImage } from './actions'

export default function PhotoCakesPage() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [weight, setWeight] = useState<string>(PHOTO_CAKE_WEIGHTS[0])
  const [flavor, setFlavor] = useState('Chocolate')
  const [message, setMessage] = useState('')
  const { addToCart } = useStore()
  const { showToast } = useToastStore()

  const finalPrice = pricePhotoCake(weight)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const localPreview = URL.createObjectURL(file)
    setPhotoPreview(localPreview)
    setPhotoUrl(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const url = await uploadPhotoCakeImage(fd)
      setPhotoUrl(url)
      setPhotoPreview(url)
      URL.revokeObjectURL(localPreview)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload the photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleAddToCart = () => {
    if (!photoUrl) return alert('Please upload a photo first!')

    addToCart({
      id: `photo-cake-${Date.now()}`,
      productId: CUSTOM_PHOTO_CAKE_PRODUCT_ID,
      name: 'Custom Photo Cake',
      price: finalPrice,
      quantity: 1,
      weight,
      isEggless: false,
      flavor,
      message,
      image: photoUrl, // hosted Storage URL, not a base64 blob
    })
    showToast('Custom photo cake added to cart')
  }

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-[1360px] px-5 py-6 sm:px-8 lg:px-16">
        <Link href="/shop" className="mb-6 flex items-center gap-2 text-sm text-ink-soft"><ArrowLeft className="h-4 w-4" /> Back to cakes</Link>
        
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
          {/* Editor Side */}
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-4xl tracking-tight text-ink">Design Your Photo Cake</h1>
              <p className="mt-2 text-ink-soft">Upload your favorite memory and we'll print it on a delicious cake.</p>
            </div>
            
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-line-strong bg-surface">
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Preview" className="h-[80%] w-[80%] object-cover shadow-xl" />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-md">
                    <label className={uploading ? 'cursor-not-allowed text-ink-soft' : 'cursor-pointer text-accent'}>
                      Change Photo
                      <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={handleFileChange} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-3 text-ink-soft hover:text-accent">
                  <div className="rounded-full bg-surface-container p-4">{uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <ImageIcon className="h-8 w-8" />}</div>
                  <span className="font-medium">{uploading ? 'Uploading…' : 'Click to upload photo'}</span>
                  <span className="text-xs text-ink-soft">PNG, JPG up to 5MB</span>
                  <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          {/* Configuration */}
          <div>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-ink">Cake Details</h2>
            <div className="mt-4 border-b border-line pb-4">
              <span className="text-3xl font-bold text-ink">₹{finalPrice}</span>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-ink">Select Weight</h3>
              <div className="flex flex-wrap gap-2">
                {PHOTO_CAKE_WEIGHTS.map(w => (
                  <button key={w} onClick={() => setWeight(w)} className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${weight === w ? 'border-primary bg-surface-high text-primary' : 'border-line-strong text-ink-soft'}`}>{w}</button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-ink">Flavour</h3>
              <div className="flex flex-wrap gap-2">
                {['Chocolate', 'Vanilla', 'Red Velvet', 'Butterscotch', 'Pineapple'].map(f => (
                  <button key={f} onClick={() => setFlavor(f)} className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${flavor === f ? 'border-primary bg-surface-high text-primary' : 'border-line-strong text-ink-soft'}`}>{f}</button>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Message on Cake</h3>
                <span className="text-xs text-ink-soft">{message.length} / 25</span>
              </div>
              <input type="text" maxLength={25} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Happy Birthday Riya" className="mt-3 w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-accent" />
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <button onClick={handleAddToCart} disabled={uploading || !photoUrl} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-semibold text-white transition hover:bg-[#192c22] disabled:opacity-50">
              {uploading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>) : photoUrl ? 'Add to Cart' : 'Upload Photo First'}
            </button>
          </div>
        </div>
      </div>
    </StorefrontShell>
  )
}
