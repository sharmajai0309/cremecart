import { listCategories } from '../../actions'
import { CategoriesManager } from './categories-manager'

export default async function AdminCategoriesPage() {
  const categories = await listCategories()
  return <CategoriesManager categories={categories} />
}
