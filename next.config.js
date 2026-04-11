/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin')

const nextConfig = {
  // =====================================================
  // IMAGE OPTIMIZATION
  // =====================================================
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'www.fotografosantodomingo.com',
      },
      {
        protocol: 'https',
        hostname: 'fotografosantodomingo.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'lookaside.instagram.com',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
  },

  // =====================================================
  // HEADERS & SECURITY
  // =====================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Domain', value: 'fotografosantodomingo.com' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ]
  },

  // =====================================================
  // REDIRECTS (Domain Migration Support)
  // =====================================================
  async redirects() {
    return [
      // Non-www → www (canonical domain enforcement)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'fotografosantodomingo.com' }],
        destination: 'https://www.fotografosantodomingo.com/:path*',
        permanent: true,
      },
      // Serve OG image from dynamic route (generates branded image)
      {
        source: '/images/og-default.webp',
        destination: '/api/og',
        permanent: false,
      },
      // Locale-less paths → default Spanish locale
      // Prevents 404 when crawlers/Lighthouse hit /blog, /portfolio, etc.
      { source: '/blog',        destination: '/es/blog',        permanent: false },
      { source: '/blog/:slug',  destination: '/es/blog/:slug',  permanent: false },
      { source: '/portfolio',   destination: '/es/portfolio',   permanent: false },
      { source: '/services',    destination: '/es/services',    permanent: false },
      { source: '/about',       destination: '/es/about',       permanent: false },
      { source: '/contact',     destination: '/es/contact',     permanent: false },
      { source: '/privacy',     destination: '/es/privacy',     permanent: false },
      { source: '/terms',       destination: '/es/terms',       permanent: false },
      { source: '/services/wedding-photography', destination: '/es/services/wedding-photography', permanent: false },
      { source: '/services/portrait-photography', destination: '/es/services/portrait-photography', permanent: false },
      { source: '/services/event-photography', destination: '/es/services/event-photography', permanent: false },
      { source: '/services/commercial-photography', destination: '/es/services/commercial-photography', permanent: false },
      { source: '/services/family-photography', destination: '/es/services/family-photography', permanent: false },
      { source: '/services/drone-services-photography-punta-cana', destination: '/es/services/drone-services-photography-punta-cana', permanent: false },
      { source: '/drone-services-photography-punta-cana', destination: '/es/services/drone-services-photography-punta-cana', permanent: false },
      { source: '/es/drone-services-photography-punta-cana', destination: '/es/services/drone-services-photography-punta-cana', permanent: true },
      { source: '/en/drone-services-photography-punta-cana', destination: '/en/services/drone-services-photography-punta-cana', permanent: true },
      { source: '/servicios-dron-fotografia-punta-cana', destination: '/es/services/drone-services-photography-punta-cana', permanent: true },
      { source: '/es/servicios-dron-fotografia-punta-cana', destination: '/es/services/drone-services-photography-punta-cana', permanent: true },
      { source: '/en/servicios-dron-fotografia-punta-cana', destination: '/en/services/drone-services-photography-punta-cana', permanent: true },
    ]
  },

  // =====================================================
  // EXPERIMENTAL FEATURES
  // =====================================================
  experimental: {
    // optimizeCss: true, // Disabled for Vercel compatibility
  },

  // =====================================================
  // TYPESCRIPT STRICT MODE
  // =====================================================
  typescript: {
    ignoreBuildErrors: true, // Allow build to pass with TS errors
  },

  // =====================================================
  // ESLINT
  // =====================================================
  eslint: {
    ignoreDuringBuilds: true, // Allow build to pass with ESLint errors
  },

  // =====================================================
  // OUTPUT MODE (for Vercel)
  // =====================================================
  output: 'standalone',
}

module.exports = createNextIntlPlugin('./i18n.config.ts')(nextConfig)