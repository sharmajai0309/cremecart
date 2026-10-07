import Link from 'next/link'
import { listCustomers } from '../../actions'

export default async function AdminCustomersPage() {
  const customers = await listCustomers()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500">Everyone who has placed an order, ranked by total spend.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Orders</th>
              <th className="px-6 py-4 font-semibold">Total Spend</th>
              <th className="px-6 py-4 font-semibold">AOV</th>
              <th className="px-6 py-4 font-semibold">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No customers yet.</td></tr>
            )}
            {customers.map(c => (
              <tr key={c.phone} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/admin/customers/${c.phone}`} className="font-medium text-indigo-600 hover:underline">{c.name}</Link>
                  <p className="text-xs text-gray-500">{c.phone}{c.email && ` · ${c.email}`}</p>
                </td>
                <td className="px-6 py-4">{c.orders}</td>
                <td className="px-6 py-4 font-medium text-gray-900">₹{c.totalSpend.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">₹{Math.round(c.totalSpend / c.orders).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">{new Date(c.lastOrder).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
