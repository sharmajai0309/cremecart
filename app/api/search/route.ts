import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/queries.server'

export const dynamic = 'force-dynamic'

// Server-side catalog search for the storefront header. Replaces the old
// client-side filter that only searched the products already loaded in memory.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim().toLowerCase()
  if (q.length < 2) return NextResponse.json({ results: [] })

  const products = await getProducts().catch(() => [])
  const results = products
    .filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.flavors.some(f => f.toLowerCase().includes(q))
    )
    .slice(0, 6)
    .map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      image: p.images[0] ?? '',
      price: p.salePrice || p.basePrice,
    }))

  return NextResponse.json({ results })
}
