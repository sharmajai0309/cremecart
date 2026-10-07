'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Scroll-driven "cake assembly" sequence. Renders a JPG image sequence to a
// <canvas> and maps scroll progress to the frame index — no <video>, no player
// UI. The section is pinned (tall outer + sticky inner) so the cake builds as you
// scroll and reverses on scroll-up.
//
// Smoothness: the scroll target is eased with a short lerp and adjacent frames are
// cross-blended (drawn one over the other) so motion feels continuous at 60fps,
// not stepped. Work only runs via requestAnimationFrame while the section nears
// the viewport.
//
// Data-driven so the admin panel can later control copy / frames / order.

export type CakeStep = { start: number; end: number; title: string; text: string; emphasis?: string }

type Cta = { label: string; href: string }

type Props = {
  title?: string
  subtitle?: string
  eyebrow?: string
  steps?: CakeStep[]
  framePath?: string
  frameExtension?: string
  frameCount?: number
  padLength?: number
  finalTitle?: string
  ctaPrimary?: Cta
  ctaSecondary?: Cta
  scrollHeightVh?: number
  /** the frame count the `steps` ranges are written against (default 120) */
  stepBaseFrames?: number
  /** label shown in the corner banner (also masks a source watermark) */
  cornerLabel?: string
}

const DEFAULT_STEPS: CakeStep[] = [
  { start: 1, end: 20, title: 'Start With the Finest', text: 'Every celebration begins with carefully baked, rich and moist cake layers.', emphasis: 'Chocolate sponge' },
  { start: 21, end: 45, title: 'Layered With Care', text: 'Smooth cream and flavorful filling are layered with precision for a balanced bite.', emphasis: 'Cream and filling' },
  { start: 46, end: 70, title: 'Finished With Rich Chocolate', text: 'Silky ganache flows over every layer, creating that signature handcrafted finish.', emphasis: 'Ganache' },
  { start: 71, end: 95, title: 'Freshly Dressed', text: 'Fresh raspberries and premium pistachios bring colour, texture and character.', emphasis: 'Raspberries + pistachios' },
  { start: 96, end: 120, title: 'Ready for Your Moment', text: 'Carefully finished. Beautifully presented. Made to be remembered.', emphasis: 'Final complete cake' },
]

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export function CakeAssemblyScroll({
  title = 'Crafted Layer by Layer',
  subtitle = 'From the first layer to the final garnish, every detail is made to celebrate the moment.',
  eyebrow = 'The CrèmeCart Atelier',
  steps = DEFAULT_STEPS,
  framePath = '/frames/frame_',
  frameExtension = '.jpg',
  frameCount = 120,
  padLength = 3,
  finalTitle = 'Made for Moments That Matter.',
  ctaPrimary = { label: 'Explore Our Cakes', href: '/shop' },
  ctaSecondary = { label: 'Create Your Own Cake', href: '/photo-cakes' },
  scrollHeightVh = 3.6,
  stepBaseFrames = 120,
  cornerLabel = 'CrèmeCart · Handcrafted Atelier',
}: Props) {
  const frameUrl = (i: number) => `${framePath}${String(i + 1).padStart(padLength, '0')}${frameExtension}`

  const sectionRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const loadedRef = useRef<boolean[]>([])
  const startedRef = useRef(false)

  // smoothing state (refs so the rAF loop never re-renders React)
  const targetRef = useRef(0)
  const displayRef = useRef(0)
  const dirtyRef = useRef(true)
  const runningRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const shownIndexRef = useRef(-1)

  const [frameIndex, setFrameIndex] = useState(0)
  const [reduced, setReduced] = useState(false)

  // Steps are authored against `stepBaseFrames` (120); map by normalized progress
  // so a denser frame set (e.g. 240) still lines up.
  const progress01 = frameCount > 1 ? frameIndex / (frameCount - 1) : 0
  const baseSpan = Math.max(1, stepBaseFrames - 1)
  // last step whose start has been reached (so there's no gap between ranges)
  const activeStep = steps.reduce((acc, s, i) => (progress01 >= (s.start - 1) / baseSpan - 0.001 ? i : acc), 0)
  const isFinal = frameIndex >= Math.round((frameCount - 1) * 0.84)

  // ---------------------------------------------------------------- helpers --
  function nearestLoaded(idx: number): HTMLImageElement | null {
    for (let i = idx; i >= 0; i--) {
      const img = imagesRef.current[i]
      if (img && loadedRef.current[i] && img.complete && img.naturalWidth) return img
    }
    for (let i = idx + 1; i < frameCount; i++) {
      const img = imagesRef.current[i]
      if (img && loadedRef.current[i] && img.complete && img.naturalWidth) return img
    }
    return null
  }

  function paintContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) {
    const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)
  }

  // Eased progress → cross-blended frame. `f` is a fractional frame index.
  function render(f: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cw = canvas.clientWidth
    const ch = canvas.clientHeight
    if (!cw || !ch) return
    const W = Math.round(cw * dpr)
    const H = Math.round(ch * dpr)
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W
      canvas.height = H
    }
    ctx.clearRect(0, 0, W, H)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    const fi = clamp(f, 0, frameCount - 1)
    const i0 = Math.floor(fi)
    const i1 = Math.min(i0 + 1, frameCount - 1)
    const t = fi - i0

    const a = nearestLoaded(i0)
    if (a) paintContain(ctx, a, W, H)
    // Blend only with the immediately-next frame when it is actually loaded —
    // never with a stale earlier frame, which would look like smearing/lag.
    if (t > 0.001 && i1 !== i0) {
      const b = imagesRef.current[i1]
      if (b && loadedRef.current[i1] && b.complete && b.naturalWidth) {
        ctx.globalAlpha = t
        paintContain(ctx, b, W, H)
        ctx.globalAlpha = 1
      }
    }
  }

  function startPreload() {
    if (startedRef.current) return
    startedRef.current = true
    let next = 0
    const CONCURRENCY = 16
    const loadNext = () => {
      if (next >= frameCount) return
      const idx = next++
      const img = new Image()
      img.decoding = 'async'
      imagesRef.current[idx] = img
      img.onload = () => {
        loadedRef.current[idx] = true
        if (idx === 0) { dirtyRef.current = true; kick() }
        loadNext()
      }
      img.onerror = () => {
        if (process.env.NODE_ENV !== 'production') console.warn(`[cake] frame missing: ${frameUrl(idx)}`)
        loadNext()
      }
      img.src = frameUrl(idx)
    }
    for (let i = 0; i < CONCURRENCY; i++) loadNext()
  }

  // The single rAF loop: recompute the target only when the scroll is dirty, then
  // ease the displayed progress toward it and repaint the blended frame.
  function loop() {
    if (dirtyRef.current) {
      dirtyRef.current = false
      const el = sectionRef.current
      if (el) {
        const total = el.offsetHeight - window.innerHeight
        const scrolled = clamp(-el.getBoundingClientRect().top, 0, Math.max(total, 1))
        targetRef.current = total > 0 ? scrolled / total : 0
      }
    }
    // Direct 1:1 mapping — no easing lag; the cake tracks the scroll exactly.
    // (Smoothness comes from the cross-blended frame, not from trailing motion.)
    const shown = targetRef.current
    displayRef.current = shown

    render(shown * (frameCount - 1))

    const si = Math.round(shown * (frameCount - 1))
    if (si !== shownIndexRef.current) {
      shownIndexRef.current = si
      setFrameIndex(si)
    }

    rafRef.current = null
    runningRef.current = false
  }

  function kick() {
    if (runningRef.current) return
    runningRef.current = true
    rafRef.current = requestAnimationFrame(loop)
  }

  // ------------------------------------------------------- reduced motion ----
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // ------------------------------------------------------ eager preload -----
  // Warm the frame cache as soon as the page mounts (non-blocking Image objects),
  // so by the time the user scrolls here the frames are already decoded — this is
  // what kills the scroll stutter (not frame density).
  useEffect(() => {
    if (reduced) return
    const w = window as unknown as { requestIdleCallback?: (cb: () => void) => number; cancelIdleCallback?: (id: number) => void }
    let id: number
    if (w.requestIdleCallback) {
      id = w.requestIdleCallback(() => startPreload())
      return () => w.cancelIdleCallback?.(id)
    }
    const t = window.setTimeout(() => startPreload(), 0)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  // --------------------------------------------------------- scroll → frame --
  useEffect(() => {
    if (reduced) return
    const onScroll = () => { dirtyRef.current = true; kick() }
    const onResize = () => { dirtyRef.current = true; kick() }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    dirtyRef.current = true
    kick()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      runningRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, frameCount])

  // ---------------------------------------------------- reduced-motion view --
  if (reduced) {
    return (
      <section aria-label={`${title}. ${subtitle}`} className="w-full bg-surface px-5 py-20 sm:px-8 lg:px-16">
        <div className="mx-auto grid max-w-[1360px] items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent">{eyebrow}</span>
            <h2 className="mt-2 font-serif text-[34px] font-semibold tracking-tight text-primary lg:text-[48px]">{title}</h2>
            <p className="mt-3 max-w-lg text-[17px] leading-relaxed text-ink-variant">{subtitle}</p>
            <p className="mt-6 font-serif text-[22px] font-semibold text-primary">{finalTitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={ctaPrimary.href} className="flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#233328]">{ctaPrimary.label} <ArrowRight className="h-[18px] w-[18px]" /></Link>
              <Link href={ctaSecondary.href} className="rounded-full border border-line-strong px-7 py-3.5 text-[15px] font-semibold text-primary transition hover:bg-surface-low">{ctaSecondary.label}</Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-video w-full max-w-[900px] overflow-hidden rounded-[2rem] border border-line/70 bg-surface-low shadow-[0_24px_60px_-30px_rgba(25,44,34,0.4)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={frameUrl(frameCount - 1)} alt="A fully assembled CrèmeCart celebration cake" className="h-full w-full object-contain" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      aria-label={`${title} — a scroll-through of how our cakes are crafted. ${subtitle}`}
      className="relative w-full"
      style={{ height: `${scrollHeightVh * 100}vh` }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden bg-surface">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_75%_10%,#fcf2ec_0%,transparent_55%)]" />

        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-1 items-center gap-5 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12 lg:px-16">
          {/* Text column (below the cake on mobile, left on desktop) */}
          <div className="order-2 lg:order-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent">{eyebrow}</span>
            <h2 className="mt-2 font-serif text-[28px] font-semibold leading-tight tracking-tight text-primary sm:text-[36px] lg:text-[48px]">{title}</h2>
            <p className="mt-2 hidden max-w-lg text-[15px] leading-relaxed text-ink-variant sm:block lg:text-[17px]">{subtitle}</p>

            {/* Step copy — all steps live in the DOM (SEO/a11y); only the active one is visible */}
            <div className="relative mt-6 min-h-[104px] lg:min-h-[132px]">
              {steps.map((s, i) => (
                <div
                  key={`${s.title}-${i}`}
                  aria-hidden={activeStep !== i}
                  className={`absolute inset-0 transition-all duration-500 ease-out ${activeStep === i ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{String(i + 1).padStart(2, '0')} — {s.emphasis}</p>
                  <h3 className="mt-1 font-serif text-[22px] font-semibold text-primary lg:text-[28px]">{s.title}</h3>
                  <p className="mt-1 max-w-md text-[15px] leading-relaxed text-ink-variant">{s.text}</p>
                </div>
              ))}
            </div>

            {/* Progress indicator */}
            <div className="mt-5 flex items-center gap-2" aria-hidden="true">
              {steps.map((s, i) => (
                <div key={`p-${i}`} className="flex items-center gap-2">
                  <span className={`text-[12px] font-bold tabular-nums transition-all duration-300 ${activeStep === i ? 'scale-110 text-accent' : 'text-ink-soft/60'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {i < steps.length - 1 && <span className={`h-px w-6 transition-colors duration-300 ${activeStep > i ? 'bg-accent' : 'bg-line-strong'}`} />}
                </div>
              ))}
            </div>

            {/* CTA — appears only near the final stage */}
            <div className={`mt-7 flex flex-wrap gap-3 transition-all duration-500 ${isFinal ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}>
              <Link href={ctaPrimary.href} className="flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-[#233328]">
                {ctaPrimary.label} <ArrowRight className="h-[18px] w-[18px]" />
              </Link>
              <Link href={ctaSecondary.href} className="rounded-full border border-line-strong px-7 py-3.5 text-[15px] font-semibold text-primary transition hover:bg-surface-low">
                {ctaSecondary.label}
              </Link>
            </div>
          </div>

          {/* Cake canvas — sleek card (top on mobile, right on desktop) */}
          <div className="order-1 w-full lg:order-2">
            <div className="relative mx-auto aspect-video w-full max-w-[900px] overflow-hidden rounded-[2rem] border border-line/70 bg-gradient-to-b from-surface-low to-surface-container shadow-[0_28px_70px_-32px_rgba(25,44,34,0.45)] ring-1 ring-white/40">
              <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />
              {/* soft inner vignette for depth */}
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[2rem] shadow-[inset_0_0_60px_rgba(25,44,34,0.06)]" />
              {/* bottom caption strip — brand line + live step counter over a soft gradient */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 bg-gradient-to-t from-[#14110f]/85 via-[#14110f]/30 to-transparent px-4 pb-2.5 pt-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ffdad4]">✦ {cornerLabel}</span>
                <span className="text-[11px] font-semibold tabular-nums text-white/90">
                  {String(activeStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')} · {steps[activeStep]?.emphasis}
                </span>
              </div>
            </div>
            <p className={`mt-3 text-center font-serif text-[16px] font-semibold text-primary transition-opacity duration-500 lg:text-[18px] ${isFinal ? 'opacity-100' : 'opacity-0'}`} aria-live="polite">
              {finalTitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
