import { useEffect, useState } from 'react'
import { MapPin, X, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { getLocations } from '@/lib/queries'
import type { Location } from '@/lib/data'

export function LocationSelector({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { location, setLocation, pincode, setPincode } = useStore()
  const [inputPincode, setInputPincode] = useState(pincode)
  const [message, setMessage] = useState('')
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    if (isOpen) getLocations().then(setLocations).catch(console.error)
  }, [isOpen])

  if (!isOpen) return null

  const checkPincode = () => {
    const foundLocation = locations.find(loc => loc.pincodes.includes(inputPincode))
    if (foundLocation) {
      setLocation(foundLocation.city)
      setPincode(inputPincode)
      setMessage(`Great! We deliver to ${inputPincode} (${foundLocation.city})`)
      setTimeout(() => {
        onClose()
        setMessage('')
      }, 1500)
    } else {
      setMessage('Sorry, we do not deliver to this pincode yet.')
    }
  }

  const selectCity = (city: string) => {
    setLocation(city)
    setPincode('') // Clear pincode when city changes
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-serif text-xl font-semibold text-ink">Delivering to...</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-black">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-ink-variant">Enter Pincode</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                <input 
                  type="text" 
                  value={inputPincode}
                  onChange={(e) => setInputPincode(e.target.value)}
                  placeholder="e.g. 110001" 
                  maxLength={6}
                  className="w-full rounded-xl border border-line-strong py-2.5 pl-9 pr-4 text-sm outline-none focus:border-accent"
                />
              </div>
              <button 
                onClick={checkPincode}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent"
              >
                Check
              </button>
            </div>
            {message && (
              <p className={`mt-2 text-xs font-medium ${message.includes('Great') ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-ink-variant">Or choose a city</label>
            <div className="grid grid-cols-2 gap-3">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => selectCity(loc.city)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                    location === loc.city 
                      ? 'border-primary bg-surface-high' 
                      : 'border-line hover:border-line-strong hover:bg-surface'
                  }`}
                >
                  <span className="text-sm font-medium text-ink">{loc.city}</span>
                  {location === loc.city && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
