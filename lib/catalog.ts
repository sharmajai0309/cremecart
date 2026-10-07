import type { Product } from '@/lib/data'

// Shared by the /shop Server Component (which does the actual filtering) and
// the client filter UI (which needs the same option labels). Filtering is
// driven entirely by the URL so results are shareable and crawlable.

export const PRICE_RANGES: Record<string, [number, number]> = {
  'Under ₹500': [0, 500],
  '₹500 - ₹999': [500, 999],
  'Above ₹1000': [1000, Infinity],
}

export const SHOP_CATEGORIES = ['All', 'Classic Cakes', 'Gourmet Cakes', 'Eggless', 'Photo Cakes']
export const SHOP_FLAVORS = ['Chocolate', 'Vanilla', 'Red Velvet', 'Butterscotch', 'Fruit', 'Coffee']
export const SHOP_SORTS = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Customer Rating']

export type ShopFilters = {
  category: string
  flavor: string
  price: string
  sort: string
  q: string
}

export function parseShopFilters(sp: Record<string, string | string[] | undefined>): ShopFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? 'All'
  return {
    category: one(sp.category),
    flavor: one(sp.flavor),
    price: one(sp.price),
    sort: one(sp.sort),
    q: (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? '',
  }
}

export function filterAndSortProducts(products: Product[], f: ShopFilters): Product[] {
  let list = [...products]

  if (f.q.trim()) {
    const q = f.q.trim().toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.flavors.some(fl => fl.toLowerCase().includes(q))
    )
  }
  if (f.flavor !== 'All') list = list.filter(p => p.flavors.includes(f.flavor))
  if (f.category === 'Eggless') list = list.filter(p => p.egglessAvailable)
  else if (f.category !== 'All') list = list.filter(p => p.category.toLowerCase().includes(f.category.toLowerCase()))
  if (f.price !== 'All' && PRICE_RANGES[f.price]) {
    const [min, max] = PRICE_RANGES[f.price]
    list = list.filter(p => {
      const price = p.salePrice || p.basePrice
      return price >= min && price <= max
    })
  }

  if (f.sort === 'Price: Low to High') list.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice))
  else if (f.sort === 'Price: High to Low') list.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice))
  else if (f.sort === 'Customer Rating') list.sort((a, b) => b.rating - a.rating)

  return list
}
