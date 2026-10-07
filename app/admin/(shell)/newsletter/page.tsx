import { listNewsletterSubscribers } from '../../actions'
import { NewsletterManager } from './newsletter-manager'

export default async function AdminNewsletterPage() {
  const subscribers = await listNewsletterSubscribers()
  return <NewsletterManager subscribers={subscribers} />
}
