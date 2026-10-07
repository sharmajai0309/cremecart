import { listInventory } from '../../actions'
import { InventoryManager } from './inventory-manager'

export default async function AdminInventoryPage() {
  const products = await listInventory()
  return <InventoryManager products={products} />
}
