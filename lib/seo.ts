// Static occasion landing pages. Each maps to a storefront category filter
// (when it has one) so /occasions/birthday can reuse the same catalog data as
// /shop?category=... while giving search engines a themed, keyword-rich page.
export type Occasion = {
  slug: string
  label: string
  heading: string
  description: string
  category?: string
}

export const OCCASIONS: Occasion[] = [
  {
    slug: 'birthday',
    label: 'Birthday Cakes',
    heading: 'Birthday cakes, delivered fresh',
    description: 'Make their day unforgettable with a freshly baked birthday cake. Same-day and midnight delivery available in most cities.',
    category: 'Classic Cakes',
  },
  {
    slug: 'anniversary',
    label: 'Anniversary Cakes',
    heading: 'Anniversary cakes for the one you love',
    description: 'Celebrate your milestone with a premium anniversary cake, hand-finished and delivered right on time.',
    category: 'Designer Cakes',
  },
  {
    slug: 'wedding',
    label: 'Wedding Cakes',
    heading: 'Wedding cakes & celebration desserts',
    description: 'Elegant, show-stopping cakes for engagements, weddings and receptions — made to order.',
    category: 'Designer Cakes',
  },
  {
    slug: 'baby-shower',
    label: 'Baby Shower Cakes',
    heading: 'Baby shower cakes to welcome the little one',
    description: 'Soft pastels, sweet messages and gentle flavours for a baby shower worth remembering.',
    category: 'Theme Cakes',
  },
  {
    slug: 'congratulations',
    label: 'Congratulations Cakes',
    heading: 'Congratulations cakes for every win',
    description: 'New job, new home, graduation — say congratulations with a cake that says it all.',
    category: 'Classic Cakes',
  },
  {
    slug: 'farewell',
    label: 'Farewell Cakes',
    heading: 'Farewell cakes to send them off sweetly',
    description: 'Send off a colleague, friend or loved one with a cake they will remember.',
    category: 'Classic Cakes',
  },
]

export function getOccasion(slug: string): Occasion | undefined {
  return OCCASIONS.find(o => o.slug === slug.toLowerCase())
}
