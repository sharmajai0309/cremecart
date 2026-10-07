'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { createProduct, updateProduct, type ProductInput } from '../../actions'
import { ImageUploader } from './image-uploader'
import { VariantsEditor } from './variants-editor'

type Variant = { id: string; weight: string; price_multiplier: number; serves: string; sort_order: number }
type EditableProduct = ProductInput & { id?: string; variants?: Variant[] }

const DELIVERY_TYPES = [
  { value: 'same-day', label: 'Same Day' },
  { value: '60-min', label: '60 Minute' },
  { value: 'midnight', label: 'Midnight' },
  { value: 'fixed-time', label: 'Fixed Time' },
]

const EMPTY: EditableProduct = {
  name: '',
  slug: '',
  sku: '',
  description: '',
  category: '',
  base_price: 0,
  sale_price: null,
  default_weight: '0.5 kg',
  flavors: [],
  eggless_available: true,
  eggless_price_premium: 50,
  stock: 10,
  images: [],
  ingredients: [],
  allergens: [],
  shelf_life: '',
  bestseller: false,
  is_active: true,
  delivery_eligibility: ['same-day'],
  variants: [],
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function ProductForm({ product, categories, onClose }: { product?: EditableProduct; categories: string[]; onClose: () => void }) {
  const [form, setForm] = useState<EditableProduct>(product ?? { ...EMPTY, category: categories[0] ?? '' })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = Boolean(form.id)

  function submit() {
    setError(null)
    startTransition(async () => {
      try {
        const payload: ProductInput = {
          name: form.name,
          slug: form.slug || slugify(form.name),
          sku: form.sku,
          description: form.description,
          category: form.category,
          base_price: form.base_price,
          sale_price: form.sale_price,
          default_weight: form.default_weight,
          flavors: form.flavors,
          eggless_available: form.eggless_available,
          eggless_price_premium: form.eggless_price_premium,
          stock: form.stock,
          images: form.images,
          ingredients: form.ingredients,
          allergens: form.allergens,
          shelf_life: form.shelf_life,
          bestseller: form.bestseller,
          is_active: form.is_active,
          delivery_eligibility: form.delivery_eligibility,
        }
        if (isEdit && form.id) {
          await updateProduct(form.id, payload)
        } else {
          await createProduct(payload)
        }
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  function toggleDeliveryType(value: string) {
    setForm(f => ({
      ...f,
      delivery_eligibility: f.delivery_eligibility.includes(value)
        ? f.delivery_eligibility.filter(v => v !== value)
        : [...f.delivery_eligibility, value],
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="space-y-4">
          <Field label="Name">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="SKU">
            <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} rows={2} />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
              {categories.length === 0 && <option value="">No categories yet — add one first</option>}
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Base Price (₹)">
              <input type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: Number(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="Sale Price (₹, optional)">
              <input type="number" value={form.sale_price ?? ''} onChange={e => setForm({ ...form, sale_price: e.target.value ? Number(e.target.value) : null })} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Default Weight">
              <input value={form.default_weight} onChange={e => setForm({ ...form, default_weight: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Stock">
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className={inputCls} />
            </Field>
          </div>
          <Field label="Flavors (comma separated)">
            <input value={form.flavors.join(', ')} onChange={e => setForm({ ...form, flavors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className={inputCls} />
          </Field>
          <Field label="Ingredients (comma separated)">
            <input value={form.ingredients.join(', ')} onChange={e => setForm({ ...form, ingredients: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className={inputCls} />
          </Field>
          <Field label="Allergens (comma separated)">
            <input value={form.allergens.join(', ')} onChange={e => setForm({ ...form, allergens: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className={inputCls} />
          </Field>
          <Field label="Shelf Life">
            <input value={form.shelf_life} onChange={e => setForm({ ...form, shelf_life: e.target.value })} placeholder="e.g. 3 Days" className={inputCls} />
          </Field>

          <ImageUploader images={form.images} onChange={images => setForm({ ...form, images })} />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.eggless_available} onChange={e => setForm({ ...form, eggless_available: e.target.checked })} />
              Eggless available
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.bestseller} onChange={e => setForm({ ...form, bestseller: e.target.checked })} />
              Bestseller
            </label>
          </div>
          {form.eggless_available && (
            <Field label="Eggless Price Premium (₹)">
              <input type="number" value={form.eggless_price_premium} onChange={e => setForm({ ...form, eggless_price_premium: Number(e.target.value) })} className={inputCls} />
            </Field>
          )}

          <Field label="Delivery Options">
            <div className="flex flex-wrap gap-3">
              {DELIVERY_TYPES.map(dt => (
                <label key={dt.value} className="flex items-center gap-1.5 text-sm text-gray-700">
                  <input type="checkbox" checked={form.delivery_eligibility.includes(dt.value)} onChange={() => toggleDeliveryType(dt.value)} />
                  {dt.label}
                </label>
              ))}
            </div>
          </Field>

          {isEdit && form.id && (
            <VariantsEditor productId={form.id} variants={form.variants ?? []} />
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {isEdit ? 'Done' : 'Cancel'}
          </button>
          <button onClick={submit} disabled={isPending || !form.name || !form.sku} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
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
