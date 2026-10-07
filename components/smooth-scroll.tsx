'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

// Global smooth scrolling (Lenis). Smooths wheel / trackpad / touch so the
// scroll-driven cake animation inherits continuous, premium motion instead of
// discrete wheel steps. `respectReducedMotion` (Lenis default) keeps native 1:1
// scroll when the user prefers reduced motion.
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, lerp: 0.08, smoothWheel: true })
    return () => lenis.destroy()
  }, [])

  return null
}
