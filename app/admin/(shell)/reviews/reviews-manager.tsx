'use client'

import { useTransition } from 'react'
import { Star, Trash2, Eye, EyeOff } from 'lucide-react'
import { deleteReview, toggleReviewVisibility } from '../../actions'

type Review = {
  id: string
  customer_name: string
  rating: number
  comment: string
  is_hidden: boolean
  created_at: string
  products: { name: string } | null
}

export function ReviewsManager({ reviews }: { reviews: Review[] }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500">Moderate customer reviews. Hidden reviews don't count toward the product rating.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">Rating</th>
              <th className="px-6 py-4 font-semibold">Comment</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reviews.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No reviews yet.</td></tr>
            )}
            {reviews.map(r => <ReviewRow key={r.id} review={r} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReviewRow({ review }: { review: Review }) {
  const [isPending, startTransition] = useTransition()

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 font-medium text-gray-900">{review.products?.name ?? '—'}</td>
      <td className="px-6 py-4">
        <div className="flex">
          {[1, 2, 3, 4, 5].map(n => (
            <Star key={n} className={`h-3.5 w-3.5 ${n <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
          ))}
        </div>
      </td>
      <td className="max-w-xs px-6 py-4 truncate">{review.comment || <span className="text-gray-400">—</span>}</td>
      <td className="px-6 py-4">{review.customer_name}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${review.is_hidden ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'}`}>
          {review.is_hidden ? 'Hidden' : 'Visible'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            disabled={isPending}
            onClick={() => startTransition(() => toggleReviewVisibility(review.id, !review.is_hidden))}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            title={review.is_hidden ? 'Show' : 'Hide'}
          >
            {review.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button
            disabled={isPending}
            onClick={() => startTransition(() => deleteReview(review.id))}
            className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
