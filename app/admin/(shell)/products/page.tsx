import { listCategories, listProductsPaged } from '../../actions'
import { ProductsManager } from './products-manager'
import { RealtimeRefresher } from '../../realtime-refresher'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''
  const category = typeof sp.category === 'string' ? sp.category : 'all'
  const page = Number(typeof sp.page === 'string' ? sp.page : '1') || 1

  const [{ products, total, pageSize }, categories] = await Promise.all([
    listProductsPaged({ q, category, page, pageSize: 20 }),
    listCategories(),
  ])

  return (
    <>
      <RealtimeRefresher tables={['products']} />
      <ProductsManager
        products={products}
        categories={categories.map(c => c.name)}
        query={q}
        category={category}
        page={page}
        pageSize={pageSize}
        total={total}
      />
    </>
  )
}
