import { getSalesBreakdown } from '../../actions'

function BreakdownTable({ title, rows }: { title: string; rows: { label: string; revenue: number }[] }) {
  const max = Math.max(...rows.map(r => r.revenue), 1)
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(row => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-700">{row.label}</span>
                <span className="font-medium text-gray-900">₹{row.revenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(row.revenue / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default async function AdminSalesPage() {
  const breakdown = await getSalesBreakdown()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
        <p className="text-sm text-gray-500">Where your revenue is actually coming from.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <BreakdownTable title="By Category" rows={breakdown.byCategory} />
        <BreakdownTable title="By City" rows={breakdown.byCity} />
        <BreakdownTable title="By Payment Method" rows={breakdown.byPaymentMethod} />
      </div>
    </div>
  )
}
