/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Image uploads (hero, product, review, photo-cake) are sent through Server
    // Actions, which cap the request body at 1MB by default — too small for most
    // photos. Raise it so uploads work.
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ui-avatars.com', pathname: '/**' },
      // Supabase Storage public object URLs: https://<ref>.supabase.co/storage/...
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/**' },
    ],
  },
}

export default nextConfig
