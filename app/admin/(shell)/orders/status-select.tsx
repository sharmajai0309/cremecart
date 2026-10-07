'use client'

import { useTransition } from 'react'
import { updateOrderStatus } from '../../actions'

const STATUS_STYLES: Record<string, string> = {
  delivered: 'bg-green-100 text-green-800 border-green-200',
  preparing: 'bg-orange-100 text-orange-800 border-orange-200',
  out_for_delivery: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function StatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateOrderStatus(orderId, e.target.value))}
      className={`rounded-full border px-3 py-1 text-xs font-semibold outline-none disabled:opacity-50 ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )
}
