'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createCoupon, deleteCoupon, updateCoupon, type CouponInput } from '../../actions'

type Coupon = Omit<CouponInput, 'discount_type'> & { id: string; discount_type: string }

export function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const [adding, setAdding] = useState(false)

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500">Create and manage discount codes.</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Add Coupon
        </button>
      </div>

      {adding && <NewCouponForm onDone={() => setAdding(false)} />}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Code</th>
              <th className="px-6 py-4 font-semibold">Discount</th>
              <th className="px-6 py-4 font-semibold">Min Order</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {coupons.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No coupons yet.</td></tr>
            )}
            {coupons.map(c => <CouponRow key={c.id} coupon={c} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CouponRow({ coupon }: { coupon: Coupon }) {
  const [isPending, startTransition] = useTransition()

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 font-medium text-gray-900">{coupon.code}</td>
      <td className="px-6 py-4">{coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}</td>
      <td className="px-6 py-4">₹{coupon.min_order_amount}</td>
      <td className="px-6 py-4">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => updateCoupon(coupon.id, { is_active: !coupon.is_active }))}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium disabled:opacity-50 ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {coupon.is_active ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => deleteCoupon(coupon.id))}
          className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}

function NewCouponForm({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState('')
  const [type, setType] = useState<'percent' | 'flat'>('percent')
  const [value, setValue] = useState(10)
  const [minOrder, setMinOrder] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Code</label>
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Type</label>
        <select value={type} onChange={e => setType(e.target.value as 'percent' | 'flat')} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="percent">Percent</option>
          <option value="flat">Flat</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Value</label>
        <input type="number" value={value} onChange={e => setValue(Number(e.target.value))} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Min Order (₹)</label>
        <input type="number" value={minOrder} onChange={e => setMinOrder(Number(e.target.value))} className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <button
        disabled={isPending || !code}
        onClick={() => startTransition(async () => {
          try {
            await createCoupon({ code, discount_type: type, discount_value: value, min_order_amount: minOrder, max_discount: null, is_active: true, expires_at: null })
            onDone()
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create coupon')
          }
        })}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        Add
      </button>
      <button onClick={onDone} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  )
}
