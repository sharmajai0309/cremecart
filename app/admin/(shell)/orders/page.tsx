import { Download } from 'lucide-react'
import { listOrdersPaged } from '../../actions'
import { OrderRow } from './order-row'
import { RealtimeRefresher } from '../../realtime-refresher'
import { Pagination } from '@/components/admin/pagination'

const STATUS_OPTIONS = ['all', 'pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''
  const status = typeof sp.status === 'string' ? sp.status : 'all'
  const page = Number(typeof sp.page === 'string' ? sp.page : '1') || 1

  const { orders, total, pageSize } = await listOrdersPaged({ q, status, page, pageSize: 20 })

  return (
    <div>
      <RealtimeRefresher tables={['orders', 'order_items']} />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">Search, filter and track customer orders.</p>
        </div>
        <a href="/admin/export/orders" className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>

      <form method="get" action="/admin/orders" className="mb-4 flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={q}
          type="text"
          placeholder="Search order no, name or phone…"
          className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <select name="status" defaultValue={status} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Search</button>
        {(q || status !== 'all') && <a href="/admin/orders" className="text-sm text-gray-500 hover:text-gray-700">Clear</a>}
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Order</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date & Slot</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No orders match.</td>
                </tr>
              )}
              {orders.map(order => <OrderRow key={order.id} order={order} />)}
            </tbody>
          </table>
        </div>
        <Pagination
          basePath="/admin/orders"
          searchParams={{ q: q || undefined, status: status !== 'all' ? status : undefined }}
          page={page}
          pageSize={pageSize}
          total={total}
        />
      </div>
    </div>
  )
}
