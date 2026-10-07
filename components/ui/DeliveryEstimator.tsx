'use client'

import { useState } from 'react'
import {
  MapPin,
  Clock,
  Zap,
  Truck,
  Moon,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { getDeliveryZoneForPincode, getLocations } from '@/lib/queries'
import { useStore } from '@/lib/store'
import { useToastStore } from '@/lib/toast-store'

interface DeliveryEstimatorProps {
  className?: string
  compact?: boolean
}

type EstimateResult = {
  serviceable: true
  pincode: string
  city: string
  state: string
  deliveryFee: number
  fastestEstimate: string
  subtext: string
  capabilities: {
    key: string
    label: string
    icon: typeof Zap
    badgeColor: string
  }[]
} | {
  serviceable: false
  pincode: string
  availableCities: string[]
}

export function DeliveryEstimator({ className = '', compact = false }: DeliveryEstimatorProps) {
  const { pincode: storePincode, location: storeLocation, setPincode, setLocation } = useStore()
  const { showToast } = useToastStore()

  const [input, setInput] = useState(storePincode || '')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<EstimateResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleCheck(targetPincode?: string) {
    const raw = (targetPincode ?? input).trim()
    if (!raw) {
      setErrorMsg('Please enter a pincode or area')
      return
    }

    setErrorMsg('')
    setChecking(true)

    try {
      // 1. Direct query to active delivery zones in Supabase (joined with locations)
      const zone = await getDeliveryZoneForPincode(raw)

      if (zone && zone.locations && zone.locations.is_active) {
        const city = zone.locations.city
        const state = zone.locations.state || ''
        const fee = Number(zone.delivery_fee) || 0

        const caps = []
        let fastest = 'Standard Delivery (Next Day)'
        let subtext = 'Freshly baked and safely delivered.'

        if (zone.sixty_minute_available) {
          fastest = '⚡ Delivery in ~60 Minutes'
          subtext = 'Express 60-min delivery available for selected cakes!'
          caps.push({
            key: '60min',
            label: '60-Min Express',
            icon: Zap,
            badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          })
        }

        if (zone.same_day_available) {
          if (!zone.sixty_minute_available) {
            fastest = '🚚 Same-Day Delivery (Today)'
            subtext = 'Order now to get it delivered today!'
          }
          caps.push({
            key: 'sameday',
            label: 'Same Day',
            icon: Truck,
            badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
          })
        }

        if (zone.fixed_time_available) {
          caps.push({
            key: 'fixed',
            label: '1-Hr Slot',
            icon: Clock,
            badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
          })
        }

        if (zone.midnight_available) {
          caps.push({
            key: 'midnight',
            label: 'Midnight 11 PM-12 AM',
            icon: Moon,
            badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
          })
        }

        setPincode(raw)
        setLocation(city)
        showToast(`Delivering to ${city} (${raw})`)

        setResult({
          serviceable: true,
          pincode: raw,
          city,
          state,
          deliveryFee: fee,
          fastestEstimate: fastest,
          subtext,
          capabilities: caps,
        })
        return
      }

      // 2. If not found by direct pincode, check if user typed a city name
      const allLocations = await getLocations()
      const cityMatch = allLocations.find(
        (l) => l.city.toLowerCase().includes(raw.toLowerCase()) && l.serviceable
      )

      if (cityMatch && cityMatch.pincodes.length > 0) {
        // Automatically check the first pincode of that city
        const samplePincode = cityMatch.pincodes[0]
        setInput(samplePincode)
        await handleCheck(samplePincode)
        return
      }

      // 3. Not serviceable
      const activeCityNames = allLocations.filter((l) => l.serviceable).map((l) => l.city)
      setResult({
        serviceable: false,
        pincode: raw,
        availableCities: activeCityNames.length > 0 ? activeCityNames : ['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad'],
      })
    } catch (err) {
      console.error('Error checking delivery estimator:', err)
      setErrorMsg('Could not verify pincode. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  function handleReset() {
    setResult(null)
    setInput('')
    setErrorMsg('')
  }

  return (
    <div className={`w-full max-w-lg ${className}`}>
      {/* If result is not showing, render input box */}
      {!result ? (
        <div>
          <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-lg shadow-[#737874]/10 border border-line">
            <MapPin className="ml-3 h-5 w-5 text-accent shrink-0" />
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCheck()
                }
              }}
              maxLength={10}
              placeholder="Enter area or pincode (e.g. 110001)"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-ink placeholder:text-ink-soft outline-none"
            />
            <button
              type="button"
              onClick={() => handleCheck()}
              disabled={checking}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white transition hover:bg-accent disabled:opacity-50"
            >
              {checking ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking…
                </>
              ) : (
                'Check'
              )}
            </button>
          </div>
          {errorMsg && <p className="mt-2 text-xs font-medium text-red-600 pl-3">{errorMsg}</p>}
        </div>
      ) : result.serviceable ? (
        /* SERVICEABLE RESULT CARD */
        <div className="rounded-3xl border border-emerald-200 bg-white/95 p-5 sm:p-6 shadow-xl shadow-emerald-950/5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-line">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Serviceable Location</p>
                <h4 className="font-serif text-lg font-semibold text-ink">
                  {result.city} {result.state && `· ${result.state}`} ({result.pincode})
                </h4>
              </div>
            </div>
            <button
              onClick={handleReset}
              title="Check another pincode"
              className="flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink transition"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Change
            </button>
          </div>

          {/* Delivery estimate highlight */}
          <div className="mt-4 rounded-2xl bg-surface-low p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent shrink-0" />
                <span className="font-serif text-base font-bold text-ink">
                  {result.fastestEstimate}
                </span>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                {result.deliveryFee === 0 ? 'FREE Delivery' : `₹${result.deliveryFee} fee`}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-soft pl-6">{result.subtext}</p>
          </div>

          {/* Available Delivery Modes */}
          {result.capabilities.length > 0 && (
            <div className="mt-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-2">
                Available Delivery Modes:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.capabilities.map((cap) => {
                  const Icon = cap.icon
                  return (
                    <span
                      key={cap.key}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cap.badgeColor}`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {cap.label}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="mt-5 flex items-center justify-between gap-3 pt-2">
            <a
              href="/shop"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#192c22]"
            >
              Shop Cakes for {result.city} <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ) : (
        /* NOT SERVICEABLE CARD */
        <div className="rounded-3xl border border-amber-200 bg-white/95 p-5 shadow-xl shadow-amber-950/5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <XCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Not Serviceable Yet</p>
                <h4 className="font-serif text-base font-semibold text-ink">
                  We don't deliver to {result.pincode} yet
                </h4>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Try another
            </button>
          </div>

          <div className="mt-3 rounded-xl bg-surface p-3 text-xs text-ink-soft">
            <p className="font-medium">Currently delivering freshly baked cakes across:</p>
            <p className="mt-1 font-semibold text-ink">{result.availableCities.join(' · ')}</p>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white transition hover:bg-[#192c22]"
            >
              Try Another Pincode
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
