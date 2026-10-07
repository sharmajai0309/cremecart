import { listReviewsAdmin } from '../../actions'
import { ReviewsManager } from './reviews-manager'

export default async function AdminReviewsPage() {
  const reviews = await listReviewsAdmin()
  return <ReviewsManager reviews={reviews} />
}
