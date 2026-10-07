import { getSiteSettings } from '../../actions'
import { ThemeManager } from './theme-manager'

export default async function AdminThemePage() {
  const settings = await getSiteSettings()
  return (
    <ThemeManager
      settings={{
        primary_color: settings.primary_color,
        accent_color: settings.accent_color,
        font_pairing: settings.font_pairing,
        logo_url: settings.logo_url,
        homepage_sections: settings.homepage_sections as { key: string; visible: boolean }[],
        surface_color: settings.surface_color,
        surface_low_color: settings.surface_low_color,
        surface_container_color: settings.surface_container_color,
        surface_high_color: settings.surface_high_color,
        surface_highest_color: settings.surface_highest_color,
        line_color: settings.line_color,
        line_strong_color: settings.line_strong_color,
        ink_color: settings.ink_color,
        ink_variant_color: settings.ink_variant_color,
        ink_soft_color: settings.ink_soft_color,
      }}
    />
  )
}
