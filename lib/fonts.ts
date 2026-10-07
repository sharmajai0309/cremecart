// A small curated set of font pairings — not a free-text font picker, so
// the admin can't accidentally pick something illegible or unavailable.
// "Classic Serif" needs no network request (system fonts only); the other
// two load a single Google Fonts stylesheet on demand.
export const FONT_PAIRINGS = [
  {
    id: 'serif-classic',
    label: 'Editorial (default)',
    heading: "'Playfair Display', Georgia, 'Times New Roman', serif",
    body: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  },
  {
    id: 'elegant-display',
    label: 'Elegant Display',
    heading: "'Playfair Display', Georgia, serif",
    body: "'Lato', Arial, sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Lato:wght@400;500&display=swap',
  },
  {
    id: 'modern-sans',
    label: 'Modern Sans',
    heading: "'Poppins', Arial, sans-serif",
    body: "'Inter', Arial, sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500&display=swap',
  },
] as const

export type FontPairingId = (typeof FONT_PAIRINGS)[number]['id']
