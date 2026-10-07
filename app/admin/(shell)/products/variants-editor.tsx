'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createVariant, deleteVariant, updateVariant } from '../../actions'

type Variant = { id: string; weight: string; price_multiplier: number; serves: string; sort_order: number }

export function VariantsEditor({ productId, variants }: { productId: string; variants: Variant[] }) {
  const [isPending, startTransition] = useTransition()
  const [newWeight, setNewWeight] = useState('')
  const [newMultiplier, setNewMultiplier] = useState(1)
  const [newServes, setNewServes] = useState('')

  function addVariant() {
    if (!newWeight.trim()) return
    startTransition(async () => {
      await createVariant(productId, {
        weight: newWeight,
        price_multiplier: newMultiplier,
        serves: newServes,
        sort_order: variants.length + 1,
      })
      setNewWeight('')
      setNewMultiplier(1)
      setNewServes('')
    })
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">Weight Tiers</label>
      <div className="space-y-2">
        {variants.map(v => (
          <div key={v.id} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <input
              defaultValue={v.weight}
              onBlur={e => e.target.value !== v.weight && startTransition(() => updateVariant(v.id, { weight: e.target.value }))}
              className="w-24 rounded border border-gray-200 px-2 py-1 text-sm"
              placeholder="0.5 kg"
            />
            <input
              type="number"
              step="0.1"
              defaultValue={v.price_multiplier}
              onBlur={e => Number(e.target.value) !== v.price_multiplier && startTransition(() => updateVariant(v.id, { price_multiplier: Number(e.target.value) }))}
              className="w-20 rounded border border-gray-200 px-2 py-1 text-sm"
              title="Price multiplier"
            />
            <input
              defaultValue={v.serves}
              onBlur={e => e.target.value !== v.serves && startTransition(() => updateVariant(v.id, { serves: e.target.value }))}
              className="w-20 rounded border border-gray-200 px-2 py-1 text-sm"
              placeholder="Serves"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => deleteVariant(v.id))}
              className="ml-auto rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <input value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="e.g. 1.5 kg" className="w-24 rounded border border-gray-200 px-2 py-1.5 text-sm" />
        <input type="number" step="0.1" value={newMultiplier} onChange={e => setNewMultiplier(Number(e.target.value))} className="w-20 rounded border border-gray-200 px-2 py-1.5 text-sm" title="Price multiplier" />
        <input value={newServes} onChange={e => setNewServes(e.target.value)} placeholder="Serves" className="w-20 rounded border border-gray-200 px-2 py-1.5 text-sm" />
        <button type="button" onClick={addVariant} disabled={isPending || !newWeight.trim()} className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50">
          <Plus className="h-3.5 w-3.5" /> Add tier
        </button>
      </div>
    </div>
  )
}
