import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCustomerOrders } from '../../../actions'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params
  const orders = await getCustomerOrders(phone)

  if (orders.length === 0) {
    return (
      <div>
        <Link href="/admin/customers" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Back</Link>
        <p className="mt-8 text-center text-gray-400">No orders found for this customer.</p>
      </div>
    )
  }

  const totalSpend = orders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  const aov = totalSpend / orders.length
  const first = orders[orders.length - 1]

  return (
    <div>
      <Link href="/admin/customers" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Back to customers</Link>

      <div className="mt-4 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{first.customer_name}</h1>
          <p className="text-sm text-gray-500">{phone}{first.customer_email && ` · ${first.customer_email}`}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Lifetime Value', value: `₹${totalSpend.toLocaleString('en-IN')}` },
          { label: 'Total Orders', value: String(orders.length) },
          { label: 'Average Order Value', value: `₹${Math.round(aov).toLocaleString('en-IN')}` },
          { label: 'First Order', value: new Date(first.created_at).toLocaleDateString('en-IN') },
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
              <th className="px-6 py-4 font-semibold">Order</th>
              <th className="px-6 py-4 font-semibold">Items</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{order.order_number}</td>
                <td className="px-6 py-4">{order.order_items.map(i => i.product_name).join(', ')}</td>
                <td className="px-6 py-4">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 capitalize">{STATUS_LABELS[order.status] ?? order.status}</td>
                <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
