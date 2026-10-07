'use client'

import { useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, Loader2, Upload, X } from 'lucide-react'
import { updateThemeSettings, updateHomepageSections, uploadSiteAsset, type HomepageSection } from '../../actions'
import { FONT_PAIRINGS } from '@/lib/fonts'

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  categories: 'Shop by Category',
  bestsellers: "India's Favourite Cakes",
  newArrivals: 'New This Week',
  crafted: 'Crafted Layer by Layer (scroll animation)',
  cities: 'Serviceable Cities Strip',
  delivery: 'Delivery Options',
  personalise: 'Personalise a Cake',
  collections: 'Gifting Collections',
  trustBadges: 'Trust Badges',
  offers: 'Offers Banner',
  reviews: 'Customer Reviews',
  newsletter: 'Newsletter Signup',
}

type Settings = {
  primary_color: string
  accent_color: string
  font_pairing: string
  logo_url: string | null
  homepage_sections: HomepageSection[]
  surface_color: string
  surface_low_color: string
  surface_container_color: string
  surface_high_color: string
  surface_highest_color: string
  line_color: string
  line_strong_color: string
  ink_color: string
  ink_variant_color: string
  ink_soft_color: string
}

type ColorKey =
  | 'primary_color' | 'accent_color'
  | 'surface_color' | 'surface_low_color' | 'surface_container_color'
  | 'surface_high_color' | 'surface_highest_color'
  | 'line_color' | 'line_strong_color'
  | 'ink_color' | 'ink_variant_color' | 'ink_soft_color'

const SURFACE_FIELDS: { key: ColorKey; label: string }[] = [
  { key: 'surface_color', label: 'Surface (page background)' },
  { key: 'surface_low_color', label: 'Surface low (section band)' },
  { key: 'surface_container_color', label: 'Surface container' },
  { key: 'surface_high_color', label: 'Surface high' },
  { key: 'surface_highest_color', label: 'Surface highest' },
  { key: 'line_color', label: 'Border / line' },
  { key: 'line_strong_color', label: 'Border strong' },
  { key: 'ink_color', label: 'Text (ink)' },
  { key: 'ink_variant_color', label: 'Text variant' },
  { key: 'ink_soft_color', label: 'Text soft / muted' },
]

export function ThemeManager({ settings }: { settings: Settings }) {
  const [form, setForm] = useState(settings)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sections, setSections] = useState<HomepageSection[]>(settings.homepage_sections)
  const [sectionsSaved, setSectionsSaved] = useState(false)

  function saveTheme() {
    setSaved(false)
    startTransition(async () => {
      await updateThemeSettings({
        primary_color: form.primary_color,
        accent_color: form.accent_color,
        font_pairing: form.font_pairing,
        logo_url: form.logo_url,
        surface_color: form.surface_color,
        surface_low_color: form.surface_low_color,
        surface_container_color: form.surface_container_color,
        surface_high_color: form.surface_high_color,
        surface_highest_color: form.surface_highest_color,
        line_color: form.line_color,
        line_strong_color: form.line_strong_color,
        ink_color: form.ink_color,
        ink_variant_color: form.ink_variant_color,
        ink_soft_color: form.ink_soft_color,
      })
      setSaved(true)
    })
  }

  async function handleLogoUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const url = await uploadSiteAsset(formData)
      setForm({ ...form, logo_url: url })
    } finally {
      setUploading(false)
    }
  }

  function moveSection(index: number, direction: -1 | 1) {
    const next = [...sections]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setSections(next)
  }

  function toggleSection(index: number) {
    const next = [...sections]
    next[index] = { ...next[index], visible: !next[index].visible }
    setSections(next)
  }

  function saveSections() {
    setSectionsSaved(false)
    startTransition(async () => {
      await updateHomepageSections(sections)
      setSectionsSaved(true)
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Theme & Branding</h1>
        <p className="text-sm text-gray-500">Colors, fonts and logo apply to the live storefront immediately on save.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Brand Colors</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })} className="h-10 w-12 cursor-pointer rounded border border-gray-300" />
                <input value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.accent_color} onChange={e => setForm({ ...form, accent_color: e.target.value })} className="h-10 w-12 cursor-pointer rounded border border-gray-300" />
                <input value={form.accent_color} onChange={e => setForm({ ...form, accent_color: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <h2 className="mb-4 mt-6 text-lg font-semibold text-gray-900">Surfaces &amp; Text</h2>
          <p className="mb-3 text-xs text-gray-500">These drive the whole storefront&rsquo;s backgrounds, borders and text. Apply to the live site on save.</p>
          <div className="grid grid-cols-2 gap-4">
            {SURFACE_FIELDS.map(f => (
              <div key={f.key}>
                <label className="mb-1 block text-sm font-medium text-gray-700">{f.label}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="h-10 w-12 cursor-pointer rounded border border-gray-300" />
                  <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
            ))}
          </div>

          <h2 className="mb-4 mt-6 text-lg font-semibold text-gray-900">Typography</h2>
          <label className="mb-1 block text-sm font-medium text-gray-700">Font Pairing</label>
          <select value={form.font_pairing} onChange={e => setForm({ ...form, font_pairing: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            {FONT_PAIRINGS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>

          <h2 className="mb-4 mt-6 text-lg font-semibold text-gray-900">Logo</h2>
          {form.logo_url ? (
            <div className="flex items-center gap-3">
              <img src={form.logo_url} alt="Logo" className="h-12 rounded border border-gray-200 bg-gray-50 px-2" />
              <button onClick={() => setForm({ ...form, logo_url: null })} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:underline">
                <X className="h-3.5 w-3.5" /> Remove, use text logo
              </button>
            </div>
          ) : (
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Uploading…' : 'Upload logo image'}
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
            </label>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button onClick={saveTheme} disabled={isPending} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {isPending ? 'Saving…' : 'Save Theme'}
            </button>
            {saved && <p className="text-sm text-green-600">Saved — live on the storefront now.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">Homepage Sections</h2>
          <p className="mb-4 text-sm text-gray-500">Show, hide and reorder sections on the homepage.</p>
          <div className="space-y-2">
            {sections.map((s, i) => (
              <div key={s.key} className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                <label className="flex flex-1 items-center gap-2 text-sm text-gray-800">
                  <input type="checkbox" checked={s.visible} onChange={() => toggleSection(i)} />
                  {SECTION_LABELS[s.key] ?? s.key}
                </label>
                <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button onClick={saveSections} disabled={isPending} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {isPending ? 'Saving…' : 'Save Layout'}
            </button>
            {sectionsSaved && <p className="text-sm text-green-600">Saved — live on the homepage now.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
