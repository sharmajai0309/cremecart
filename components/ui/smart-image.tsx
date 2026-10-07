import type { CSSProperties } from 'react'
import NextImage from 'next/image'

// Renders through next/image when the source is a local path or a host we've
// allow-listed in next.config.mjs (Unsplash, Supabase Storage, avatars).
// Anything else — e.g. an arbitrary URL an admin pasted into the hero field —
// falls back to a plain <img>, because next/image hard-errors on unconfigured
// remote hosts and would otherwise 500 the page.
const ALLOWED_HOSTS = ['images.unsplash.com', 'ui-avatars.com']

function canOptimize(src: string): boolean {
  if (!src) return false
  if (src.startsWith('/')) return true
  try {
    const url = new URL(src)
    return ALLOWED_HOSTS.includes(url.hostname) || url.hostname.endsWith('.supabase.co')
  } catch {
    return false
  }
}

type Props = {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  className?: string
  style?: CSSProperties
  priority?: boolean
}

export function SmartImage({ src, alt, fill, width, height, sizes, className, style, priority }: Props) {
  if (!canOptimize(src)) {
    const fallbackStyle: CSSProperties = fill
      ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }
      : (style ?? {})
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} style={fallbackStyle} loading={priority ? 'eager' : 'lazy'} />
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      className={className}
      style={style}
      priority={priority}
    />
  )
}
