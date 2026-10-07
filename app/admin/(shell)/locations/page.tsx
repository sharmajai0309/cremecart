import { listLocations } from '../../actions'
import { LocationsManager } from './locations-manager'

export default async function AdminLocationsPage() {
  const locations = await listLocations()
  return <LocationsManager locations={locations} />
}
