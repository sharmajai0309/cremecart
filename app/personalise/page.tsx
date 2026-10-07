import { redirect } from 'next/navigation'

// This page used to be a separate, non-functional "preview only" cake
// personaliser (its "Continue to delivery" button did nothing). /photo-cakes
// already covers personalising a cake end-to-end with real image upload and
// cart/checkout integration, so this just forwards old links there.
export default function PersonalisePage() {
  redirect('/photo-cakes')
}
