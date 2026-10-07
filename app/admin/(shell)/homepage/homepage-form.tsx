'use client'

import { useState, useTransition } from 'react'
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { updateSiteSettings, uploadSiteAsset, type SiteSettingsInput } from '../../actions'

export function HomepageForm({ settings, products }: { settings: SiteSettingsInput; products: { id: string; name: string }[] }) {
  const [form, setForm] = useState({ ...settings, featured_product_ids: settings.featured_product_ids ?? [] })
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [productQuery, setProductQuery] = useState('')

  async function handleImageUpload(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      alert('That image is larger than 8MB. Please choose a smaller file.')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const url = await uploadSiteAsset(formData)
      setForm((prev) => ({ ...prev, hero_image_url: url }))
    } catch (err) {
      console.error('Failed to upload hero image:', err)
      alert(err instanceof Error ? err.message : 'Could not upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function submit() {
    setSaved(false)
    startTransition(async () => {
      await updateSiteSettings(form)
      setSaved(true)
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Content</h1>
        <p className="text-sm text-gray-500">Edit the announcement bar, hero banner, and every content block on the homepage. Product prices, categories, coupons, locations and reviews are managed in their own sections.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Field label="Announcement bar text">
            <input value={form.announcement_text} onChange={e => setForm({ ...form, announcement_text: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Hero heading">
            <input value={form.hero_heading} onChange={e => setForm({ ...form, hero_heading: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Hero subtitle">
            <textarea value={form.hero_subtitle} onChange={e => setForm({ ...form, hero_subtitle: e.target.value })} rows={2} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CTA button text">
              <input value={form.hero_cta_text} onChange={e => setForm({ ...form, hero_cta_text: e.target.value })} className={inputCls} />
            </Field>
            <Field label="CTA link">
              <input value={form.hero_cta_link} onChange={e => setForm({ ...form, hero_cta_link: e.target.value })} className={inputCls} />
            </Field>
          </div>

          {/* Hero Image with Live Preview and Direct Upload */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <label className="mb-2 block text-sm font-medium text-gray-800">Hero Banner Image</label>
            <p className="mb-2 text-xs text-gray-500">The hero shows your whole image without cropping (fit: contain), so use a clean, well-lit photo. This preview matches the desktop hero (square frame).</p>
            {form.hero_image_url ? (
              <div className="relative mb-3 overflow-hidden rounded-lg border border-gray-200 bg-white aspect-square max-h-64">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.hero_image_url} alt="Hero banner preview" className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="mb-3 flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-400">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-1 text-xs">No hero image uploaded</p>
                </div>
              </div>
            )}

            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {uploading ? (<><Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> Uploading…</>) : (<><Upload className="h-4 w-4 text-gray-500" /> Upload Image from Device</>)}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file) }} />
            </label>

            <div className="mt-3">
              <label className="mb-1 block text-xs text-gray-500">Or enter image URL directly:</label>
              <input value={form.hero_image_url} onChange={e => setForm({ ...form, hero_image_url: e.target.value })} placeholder="https://..." className={inputCls} />
            </div>
          </div>

          {/* Hero video (optional) */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <label className="mb-1 block text-sm font-medium text-gray-800">Hero Video URL (optional)</label>
            <p className="mb-2 text-xs text-gray-500">A short, silent, looping clip (<strong>landscape works best</strong>). It renders as a full-bleed background hero. Serve it from <code>/public</code> (e.g. <code>/hero-video.mp4</code>) or a hosted URL. When set, the video replaces the hero image (which becomes the poster &amp; fallback).</p>
            <input value={form.hero_video_url ?? ''} onChange={e => setForm({ ...form, hero_video_url: e.target.value || null })} placeholder="/hero-video.mp4 or https://…" className={inputCls} />
          </div>

          {/* Featured bestsellers picker */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <label className="mb-1 block text-sm font-medium text-gray-800">Featured bestsellers on the homepage</label>
            <p className="mb-3 text-xs text-gray-500">Pick products for the “India’s favourite cakes” / “Guest Favorites” rail. Leave empty to automatically show the newest cakes.</p>
            <input value={productQuery} onChange={e => setProductQuery(e.target.value)} placeholder="Search products…" className={inputCls} />
            <div className="mt-3 max-h-56 space-y-1 overflow-auto rounded-lg border border-gray-200 bg-white p-2">
              {products
                .filter(p => p.name.toLowerCase().includes(productQuery.toLowerCase()))
                .map(p => {
                  const checked = form.featured_product_ids.includes(p.id)
                  return (
                    <label key={p.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setForm(prev => ({
                          ...prev,
                          featured_product_ids: checked ? prev.featured_product_ids.filter(id => id !== p.id) : [...prev.featured_product_ids, p.id],
                        }))}
                      />
                      {p.name}
                    </label>
                  )
                })}
            </div>
            <p className="mt-2 text-xs text-gray-500">{form.featured_product_ids.length} selected</p>
          </div>

          {/* Hero stats */}
          <RepeatableList
            label="Hero stats"
            hint="The 3 quick stats under the hero (value + label)."
            items={form.hero_stats}
            fields={[{ key: 'value', label: 'Value (e.g. 4.9★)' }, { key: 'label', label: 'Label' }]}
            onChange={items => setForm({ ...form, hero_stats: items })}
          />

          {/* Delivery options */}
          <RepeatableList
            label="Delivery option cards"
            hint="The delivery guarantee cards. Icons cycle automatically."
            items={form.delivery_options}
            fields={[{ key: 'title', label: 'Title' }, { key: 'text', label: 'Description', textarea: true }, { key: 'cta', label: 'Timing / CTA' }]}
            onChange={items => setForm({ ...form, delivery_options: items })}
          />

          {/* Trust badges */}
          <RepeatableList
            label="Trust badges"
            hint="The reassurance badges row."
            items={form.trust_badges}
            fields={[{ key: 'title', label: 'Title' }, { key: 'text', label: 'Description', textarea: true }]}
            onChange={items => setForm({ ...form, trust_badges: items })}
          />

          {/* Gifting collections */}
          <RepeatableList
            label="Gifting collections"
            hint="The curated gifting cards — title, copy, image, price, tag, meta and link are all editable."
            items={form.gifting_collections}
            fields={[
              { key: 'title', label: 'Title' },
              { key: 'text', label: 'Description', textarea: true },
              { key: 'image', label: 'Image URL' },
              { key: 'price', label: 'Price (e.g. ₹3,450)' },
              { key: 'tag', label: 'Tag (e.g. Signature Hamper)' },
              { key: 'meta', label: 'Meta (e.g. Serves 6–8)' },
              { key: 'href', label: 'Link (e.g. /hampers)' },
            ]}
            onChange={items => setForm({ ...form, gifting_collections: items })}
          />

          {saved && <p className="text-sm font-medium text-green-600">✓ Saved — live on the homepage now.</p>}
          <button onClick={submit} disabled={isPending || uploading} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

type FieldDef<T> = { key: keyof T & string; label: string; textarea?: boolean }

function RepeatableList<T extends Record<string, string>>({
  label, hint, items, fields, onChange,
}: {
  label: string
  hint?: string
  items: T[]
  fields: FieldDef<T>[]
  onChange: (items: T[]) => void
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <label className="mb-1 block text-sm font-medium text-gray-800">{label}</label>
      {hint && <p className="mb-3 text-xs text-gray-500">{hint}</p>}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">#{i + 1}</span>
              <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-xs text-red-600 hover:underline">Remove</button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map(f => (
                <div key={f.key} className={f.textarea ? 'sm:col-span-2' : undefined}>
                  <label className="mb-0.5 block text-xs text-gray-500">{f.label}</label>
                  {f.textarea
                    ? <textarea value={item[f.key] ?? ''} onChange={e => onChange(items.map((it, idx) => idx === i ? { ...it, [f.key]: e.target.value } : it))} rows={2} className={inputCls} />
                    : <input value={item[f.key] ?? ''} onChange={e => onChange(items.map((it, idx) => idx === i ? { ...it, [f.key]: e.target.value } : it))} className={inputCls} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, Object.fromEntries(fields.map(f => [f.key, ''])) as T])}
        className="mt-3 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        + Add item
      </button>
    </div>
  )
}
