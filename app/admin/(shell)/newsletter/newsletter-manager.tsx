'use client'

import { useTransition } from 'react'
import { Download, Trash2 } from 'lucide-react'
import { deleteNewsletterSubscriber } from '../../actions'

type Subscriber = { id: string; email: string; created_at: string }

export function NewsletterManager({ subscribers }: { subscribers: Subscriber[] }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500">{subscribers.length} people signed up from the homepage.</p>
        </div>
        <a href="/admin/export/newsletter" className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Subscribed</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subscribers.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">No subscribers yet.</td></tr>
            )}
            {subscribers.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{s.email}</td>
                <td className="px-6 py-4">{new Date(s.created_at).toLocaleDateString('en-IN')}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    disabled={isPending}
                    onClick={() => startTransition(() => deleteNewsletterSubscriber(s.id))}
                    className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
