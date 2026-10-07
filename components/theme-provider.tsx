'use client'

import { useEffect } from 'react'
import { getSiteSettings } from '@/lib/queries'
import { FONT_PAIRINGS } from '@/lib/fonts'

// Applies the admin-controlled theme (colors, font pairing) to the live
// site by overriding the CSS custom properties every component already
// reads through (--primary, --accent, --font-heading) — no per-component
// changes needed beyond the one-time hex-to-token refactor.
export function ThemeProvider() {
  useEffect(() => {
    getSiteSettings().then(settings => {
      const root = document.documentElement
      if (settings.primary_color) root.style.setProperty('--primary', settings.primary_color)
      if (settings.accent_color) root.style.setProperty('--accent', settings.accent_color)

      // Themeable surface / ink palette (admin → Theme).
      const surfaces: [string, string | null][] = [
        ['--surface', settings.surface_color],
        ['--surface-low', settings.surface_low_color],
        ['--surface-container', settings.surface_container_color],
        ['--surface-high', settings.surface_high_color],
        ['--surface-highest', settings.surface_highest_color],
        ['--line', settings.line_color],
        ['--line-strong', settings.line_strong_color],
        ['--ink', settings.ink_color],
        ['--ink-variant', settings.ink_variant_color],
        ['--ink-soft', settings.ink_soft_color],
      ]
      for (const [name, value] of surfaces) if (value) root.style.setProperty(name, value)

      const pairing = FONT_PAIRINGS.find(f => f.id === settings.font_pairing) ?? FONT_PAIRINGS[0]
      root.style.setProperty('--font-heading', pairing.heading)
      document.body.style.fontFamily = pairing.body

      if (pairing.googleFontUrl && !document.getElementById('theme-google-font')) {
        const link = document.createElement('link')
        link.id = 'theme-google-font'
        link.rel = 'stylesheet'
        link.href = pairing.googleFontUrl
        document.head.appendChild(link)
      }
    }).catch(console.error)
  }, [])

  return null
}
