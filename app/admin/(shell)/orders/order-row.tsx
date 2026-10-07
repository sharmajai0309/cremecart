'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { StatusSelect } from './status-select'

type OrderItem = {
  product_name: string
  quantity: number
  unit_price: number
  line_total: number
  weight: string | null
  flavor: string | null
  eggless: boolean
  message: string | null
}

type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  total_amount: number
  subtotal: number
  delivery_fee: number
  discount_amount: number
  coupon_code: string | null
  status: string
  delivery_date: string | null
  delivery_slot: string | null
  delivery_type: string | null
  delivery_address: unknown
  customer_notes: string | null
  admin_notes: string | null
  created_at: string
  order_items: OrderItem[]
}

export function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const address = order.delivery_address as { line1?: string; line2?: string; city?: string; pincode?: string } | null

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 font-medium text-gray-900">{order.order_number}</td>
        <td className="px-6 py-4">
          <p className="font-medium text-gray-900">{order.customer_name}</p>
          <p className="text-xs text-gray-500">{order.order_items.length} item(s)</p>
        </td>
        <td className="px-6 py-4">
          <p>{order.delivery_date ?? new Date(order.created_at).toLocaleDateString('en-IN')}</p>
          <p className="text-xs text-indigo-600 font-medium">{order.delivery_slot ?? order.delivery_type ?? '—'}</p>
        </td>
        <td className="px-6 py-4 font-medium text-gray-900">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
        <td className="px-6 py-4">
          <StatusSelect orderId={order.id} status={order.status} />
        </td>
        <td className="px-6 py-4 text-right">
          <button onClick={() => setExpanded(!expanded)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title={expanded ? 'Hide details' : 'View details'}>
            {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-6 py-5">
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Items</h4>
                <div className="space-y-2">
                  {order.order_items.map((item, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium text-gray-900">{item.product_name} × {item.quantity}</p>
                      <p className="text-xs text-gray-500">
                        {[item.weight, item.flavor, item.eggless ? 'Eggless' : null].filter(Boolean).join(' · ')}
                        {item.message && ` · "${item.message}"`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Customer & Delivery</h4>
                <p className="text-sm text-gray-700">{order.customer_phone}{order.customer_email && ` · ${order.customer_email}`}</p>
                {address && (
                  <p className="mt-1 text-sm text-gray-700">{address.line1}, {address.line2}<br />{address.city} {address.pincode}</p>
                )}
                {order.customer_notes && <p className="mt-2 text-sm text-gray-500">Note: {order.customer_notes}</p>}
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Payment</h4>
                <p className="text-sm text-gray-700">Subtotal: ₹{Number(order.subtotal).toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-700">Delivery: ₹{Number(order.delivery_fee).toLocaleString('en-IN')}</p>
                {order.discount_amount > 0 && <p className="text-sm text-gray-700">Discount ({order.coupon_code}): -₹{Number(order.discount_amount).toLocaleString('en-IN')}</p>}
                {order.admin_notes && <p className="mt-2 text-sm text-gray-500">Admin note: {order.admin_notes}</p>}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
