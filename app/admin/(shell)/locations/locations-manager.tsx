'use client'

import { useState, useTransition } from 'react'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import {
  createDeliveryZone,
  createLocation,
  deleteDeliveryZone,
  toggleLocationActive,
  updateDeliveryZone,
  type DeliveryZoneInput,
} from '../../actions'

type Zone = DeliveryZoneInput & { id: string }
type Location = { id: string; city: string; state: string; is_active: boolean; delivery_zones: Zone[] }

const CAPABILITIES: { key: keyof Omit<DeliveryZoneInput, 'location_id' | 'pincode' | 'delivery_fee'>; label: string }[] = [
  { key: 'same_day_available', label: 'Same Day' },
  { key: 'sixty_minute_available', label: '60 Minute' },
  { key: 'midnight_available', label: 'Midnight' },
  { key: 'fixed_time_available', label: 'Fixed Time' },
]

export function LocationsManager({ locations }: { locations: Location[] }) {
  const [addingCity, setAddingCity] = useState(false);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Location & Delivery Engine</h1>
          <p className="text-sm text-gray-500">Configure serviceable cities, pincodes, and delivery capabilities.</p>
        </div>
        <button
          onClick={() => setAddingCity(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add City
        </button>
      </div>

      {addingCity && <NewCityForm onDone={() => setAddingCity(false)} />}

      <div className="grid gap-6 lg:grid-cols-2">
        {locations.map(loc => <CityCard key={loc.id} location={loc} />)}
      </div>
    </div>
  )
}

function NewCityForm({ onDone }: { onDone: () => void }) {
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [isPending, startTransition] = useTransition()

  return (
    <div className="mb-6 flex items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-gray-700">City</label>
        <input value={city} onChange={e => setCity(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-gray-700">State</label>
        <input value={state} onChange={e => setState(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <button
        disabled={isPending || !city}
        onClick={() => startTransition(async () => { await createLocation(city, state); onDone() })}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        Add
      </button>
      <button onClick={onDone} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
    </div>
  )
}

function CityCard({ location }: { location: Location }) {
  const [isPending, startTransition] = useTransition()
  const [addingZone, setAddingZone] = useState(false)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
            <MapPin className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{location.city}</h2>
            <p className="text-sm text-gray-500">{location.state}</p>
          </div>
        </div>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => toggleLocationActive(location.id, !location.is_active))}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium disabled:opacity-50 ${location.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {location.is_active ? 'Active' : 'Inactive'}
        </button>
      </div>

      <h3 className="mb-2 text-sm font-medium text-gray-700">Pincodes & Capabilities ({location.delivery_zones.length})</h3>
      <div className="space-y-2">
        {location.delivery_zones.map(zone => <ZoneRow key={zone.id} zone={zone} />)}
      </div>

      {addingZone ? (
        <NewZoneForm locationId={location.id} onDone={() => setAddingZone(false)} />
      ) : (
        <button
          onClick={() => setAddingZone(true)}
          className="mt-3 rounded-md border border-dashed border-gray-300 bg-white px-2 py-1 text-xs text-indigo-600 hover:border-indigo-500"
        >
          <Plus className="mr-1 inline h-3 w-3" /> Add Pincode
        </button>
      )}
    </div>
  )
}

function ZoneRow({ zone }: { zone: Zone }) {
  const [isPending, startTransition] = useTransition()
  const [fee, setFee] = useState(zone.delivery_fee)

  function toggle(key: (typeof CAPABILITIES)[number]['key']) {
    startTransition(() => updateDeliveryZone(zone.id, { [key]: !zone[key] }))
  }

  function handleFeeBlur() {
    if (fee !== zone.delivery_fee) {
      startTransition(() => updateDeliveryZone(zone.id, { delivery_fee: Number(fee) }))
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
      <span className="text-sm font-semibold text-gray-900">{zone.pincode}</span>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span>₹</span>
        <input
          type="number"
          min="0"
          value={fee}
          disabled={isPending}
          onChange={(e) => setFee(Number(e.target.value))}
          onBlur={handleFeeBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleFeeBlur()}
          className="w-16 rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-800 bg-white"
          title="Delivery fee (editable)"
        />
        <span>fee</span>
      </div>
      <div className="ml-auto flex flex-wrap gap-2">
        {CAPABILITIES.map(cap => (
          <label key={cap.key} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              disabled={isPending}
              checked={Boolean(zone[cap.key])}
              onChange={() => toggle(cap.key)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            {cap.label}
          </label>
        ))}
        <button
          disabled={isPending}
          onClick={() => startTransition(() => deleteDeliveryZone(zone.id))}
          className="text-red-500 hover:text-red-700 disabled:opacity-50"
          title="Delete pincode"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function NewZoneForm({ locationId, onDone }: { locationId: string; onDone: () => void }) {
  const [pincode, setPincode] = useState('')
  const [fee, setFee] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="mt-3 flex flex-wrap items-end gap-2 rounded-md border border-gray-200 bg-white p-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Pincode</label>
        <input value={pincode} onChange={e => setPincode(e.target.value)} className="w-32 rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Delivery Fee</label>
        <input type="number" value={fee} onChange={e => setFee(Number(e.target.value))} className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
      </div>
      <button
        disabled={isPending || !pincode}
        onClick={() => startTransition(async () => {
          try {
            await createDeliveryZone({
              location_id: locationId,
              pincode,
              delivery_fee: fee,
              same_day_available: true,
              sixty_minute_available: false,
              midnight_available: false,
              fixed_time_available: false,
            })
            onDone()
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to add pincode')
          }
        })}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        Add
      </button>
      <button onClick={onDone} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  )
}
