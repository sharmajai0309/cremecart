// Pricing for the two cart items that aren't rows in `products` — a
// build-your-own hamper and a custom photo cake. Both the storefront pages
// (for display) and checkout (for server-side price recomputation) import
// from here, so there's exactly one source of truth for these prices.

export const HAMPER_BOXES = [
  { id: 'box-1', name: 'Classic Kraft Box', price: 199, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=85' },
  { id: 'box-2', name: 'Premium Gold Foil Box', price: 399, image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&q=85' },
] as const

export const HAMPER_TREATS = [
  { id: 't-1', name: 'Macaron Set (4pcs)', price: 450, image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=300&q=85' },
  { id: 't-2', name: 'Gourmet Brownies', price: 350, image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=300&q=85' },
  { id: 't-3', name: 'Butter Cookies Jar', price: 299, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&q=85' },
  { id: 't-4', name: 'Artisan Chocolates', price: 599, image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=300&q=85' },
] as const

export function priceHamper(boxId: string, treatIds: string[]): number {
  const box = HAMPER_BOXES.find(b => b.id === boxId)
  if (!box) throw new Error('Invalid hamper box selected')
  const treatsTotal = treatIds.reduce((sum, id) => {
    const treat = HAMPER_TREATS.find(t => t.id === id)
    if (!treat) throw new Error('Invalid hamper treat selected')
    return sum + treat.price
  }, 0)
  return box.price + treatsTotal
}

export const PHOTO_CAKE_BASE_PRICE = 799
export const PHOTO_CAKE_WEIGHTS = ['0.5 kg', '1 kg', '1.5 kg'] as const
export const PHOTO_CAKE_WEIGHT_MULTIPLIERS: Record<string, number> = {
  '0.5 kg': 1,
  '1 kg': 1.8,
  '1.5 kg': 2.7,
}

export function pricePhotoCake(weight: string): number {
  const multiplier = PHOTO_CAKE_WEIGHT_MULTIPLIERS[weight]
  if (!multiplier) throw new Error('Invalid photo cake weight selected')
  return Math.round(PHOTO_CAKE_BASE_PRICE * multiplier)
}

export const CUSTOM_HAMPER_PRODUCT_ID = 'custom-hamper'
export const CUSTOM_PHOTO_CAKE_PRODUCT_ID = 'custom-photo-cake'
