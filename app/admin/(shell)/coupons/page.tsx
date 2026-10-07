import { listCoupons } from '../../actions'
import { CouponsManager } from './coupons-manager'

export default async function AdminCouponsPage() {
  const coupons = await listCoupons()
  return <CouponsManager coupons={coupons} />
}
