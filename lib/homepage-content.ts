// Homepage content that admins can edit from the admin panel (stored as JSONB
// on the site_settings singleton). Components read `settings.<field> ?? DEFAULT_*`
// so the page still renders correctly before/without the columns being set.

export type HeroStat = { value: string; label: string }
export type DeliveryOption = { title: string; text: string; cta: string }
export type TrustBadge = { title: string; text: string }
export type GiftingCollection = {
  title: string
  text: string
  image: string
  price: string
  tag: string
  meta: string
  href: string
}

export const DEFAULT_HERO_STATS: HeroStat[] = [
  { value: '100%', label: 'Freshly baked at dawn' },
  { value: '4.9★', label: '18,000+ celebrations' },
  { value: '60m', label: 'Chilled express courier' },
]

export const DEFAULT_DELIVERY_OPTIONS: DeliveryOption[] = [
  { title: '60-Min Express', text: 'Fresh bento, tea cakes and selected cheesecakes dispatched straight from our oven hubs.', cta: 'Instant Dispatch' },
  { title: 'Same-Day Evening', text: 'Order before 4:00 PM for flawless dinner-party and sunset anniversary surprises.', cta: 'By 8:00 PM Today' },
  { title: 'Exact 2-Hour Slot', text: 'Lock in an accurate 2-hour window up to 30 days ahead for venue party setups.', cta: 'Pre-Schedule Slot' },
  { title: 'Midnight Surprise', text: 'Delivered at the stroke of 11:59 PM to usher in birthdays with champagne elegance.', cta: '11:45 PM – 12:15 AM' },
]

export const DEFAULT_TRUST_BADGES: TrustBadge[] = [
  { title: '100% Freshly Baked', text: 'Batched daily at 5:00 AM. Zero premixes, preservatives, or artificial palm oils.' },
  { title: 'Cold-Chain Temperature Lock', text: 'Transported strictly at 4°C in shock-absorbent caskets so frosting never melts.' },
  { title: 'Single-Origin Terroir', text: 'Pure French Valrhona cocoa, Tahitian vanilla bean, and Grade-A Kashmiri saffron.' },
  { title: 'Handcrafted by Masters', text: 'Trained by Ferrandi and Le Cordon Bleu pastry virtuosos right here in India.' },
]

export const DEFAULT_GIFTING_COLLECTIONS: GiftingCollection[] = [
  {
    title: 'The Connoisseur Keepsake Box',
    text: 'Includes a custom petite bento cake, 8 Parisian macarons, and 9 Belgian single-origin truffles.',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=1000&q=85',
    price: '₹3,450', tag: 'Signature Hamper', meta: 'Complete Hamper', href: '/hampers',
  },
  {
    title: 'Artisanal Tea-Time Platter',
    text: '12 French Canelés de Bordeaux, browned-butter madeleines, and roasted pistachio financiers.',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1000&q=85',
    price: '₹2,650', tag: 'High-Tea Platter', meta: 'Serves 6–8', href: '/hampers',
  },
  {
    title: 'Celebration Royale Hamper',
    text: 'A wild berry torte, twin crystal coupes, and a hand-poured Tahitian vanilla celebration candle.',
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1000&q=85',
    price: '₹4,200', tag: 'VIP Milestone', meta: 'Exclusive Edition', href: '/hampers',
  },
]

export type HomepageContent = {
  hero_stats: HeroStat[]
  delivery_options: DeliveryOption[]
  trust_badges: TrustBadge[]
  gifting_collections: GiftingCollection[]
}

// Tolerates null / malformed JSON from the DB by falling back to defaults.
export function asArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback
}
