import Link from 'next/link'
import { ArrowUpRight, AlertTriangle, Clock, IndianRupee, Package, ShoppingBag, Truck } from 'lucide-react'
import { getDashboardStats, getRevenueTrend, listRecentOrders } from '../actions'
import { RevenueChart } from './revenue-chart'
import { RealtimeRefresher } from '../realtime-refresher'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_STYLES: Record<string, string> = {
  delivered: 'bg-green-100 text-green-800',
  preparing: 'bg-orange-100 text-orange-800',
  out_for_delivery: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  pending: 'bg-gray-100 text-gray-800',
}

export default async function AdminDashboard() {
  const [stats, recentOrders, revenueTrend] = await Promise.all([getDashboardStats(), listRecentOrders(5), getRevenueTrend(14)])

  const cards = [
    { name: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString('en-IN')}`, icon: IndianRupee },
    { name: 'Orders Today', value: String(stats.todayOrders), icon: ShoppingBag },
    { name: 'Pending Orders', value: String(stats.pendingOrders), icon: Truck },
    { name: 'Low Stock Items', value: String(stats.lowStock.length), icon: AlertTriangle },
  ]

  return (
    <div className="space-y-8">
      <RealtimeRefresher tables={['orders']} />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview Dashboard</h1>
        <p className="text-sm text-gray-500">Monitor your bakery operations and performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Revenue (last 14 days)</h2>
        </div>
        <div className="p-6">
          <RevenueChart data={revenueTrend} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View All</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.length === 0 && (
              <p className="px-6 py-10 text-center text-sm text-gray-400">No orders yet.</p>
            )}
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.order_number} · {order.customer_name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
           <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid gap-4">
            <Link href="/admin/products" className="flex items-center justify-between w-full rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:bg-gray-50 transition">
              <span className="font-medium text-gray-900">Add New Product</span>
              <ArrowUpRight className="h-5 w-5 text-gray-400" />
            </Link>
            <Link href="/admin/locations" className="flex items-center justify-between w-full rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:bg-gray-50 transition">
              <span className="font-medium text-gray-900">Update Delivery Zones</span>
              <ArrowUpRight className="h-5 w-5 text-gray-400" />
            </Link>
            <Link href="/admin/orders" className="flex items-center justify-between w-full rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:bg-gray-50 transition">
              <span className="font-medium text-gray-900">Manage Orders</span>
              <ArrowUpRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
