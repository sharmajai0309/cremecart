'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { adjustStock } from '../../actions'

type Product = { id: string; name: string; sku: string; stock: number; images: string[] }

function statusFor(stock: number) {
  if (stock === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-800' }
  if (stock < 5) return { label: 'Critical', cls: 'bg-red-100 text-red-800' }
  if (stock < 15) return { label: 'Low', cls: 'bg-orange-100 text-orange-800' }
  return { label: 'Healthy', cls: 'bg-green-100 text-green-800' }
}

export function InventoryManager({ products }: { products: Product[] }) {
  const [adjusting, setAdjusting] = useState<Product | null>(null)

  const lowStockCount = products.filter(p => p.stock < 15 && p.stock > 0).length
  const outOfStockCount = products.filter(p => p.stock === 0).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-sm text-gray-500">Stock levels across the active catalog.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total SKUs', value: products.length },
          { label: 'Low Stock', value: lowStockCount },
          { label: 'Out of Stock', value: outOfStockCount },
          { label: 'Total Units', value: products.reduce((s, p) => s + p.stock, 0) },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">SKU</th>
              <th className="px-6 py-4 font-semibold">Available</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(p => {
              const status = statusFor(p.stock)
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover border border-gray-200" />
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{p.sku}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{p.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.cls}`}>{status.label}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setAdjusting(p)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {adjusting && <AdjustStockModal product={adjusting} onClose={() => setAdjusting(null)} />}
    </div>
  )
}

function AdjustStockModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [delta, setDelta] = useState(0)
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function submit() {
    setError(null)
    startTransition(async () => {
      try {
        await adjustStock(product.id, delta, notes)
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to adjust stock')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Adjust Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-4 text-sm text-gray-500">{product.name} — currently {product.stock} in stock</p>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <label className="mb-1 block text-sm font-medium text-gray-700">Quantity change (+/-)</label>
        <input type="number" value={delta} onChange={e => setDelta(Number(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <p className="mt-1 text-xs text-gray-400">New stock will be {Math.max(0, product.stock + delta)}</p>

        <label className="mb-1 mt-4 block text-sm font-medium text-gray-700">Reason</label>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Restocked, damaged, recount" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={isPending || delta === 0} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {isPending ? 'Saving…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}
