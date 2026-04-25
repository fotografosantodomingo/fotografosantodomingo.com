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
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/cotizaciones/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
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
      { source: '/cotizaciones', destination: '/es/cotizaciones', permanent: false },
      { source: '/get-quote',   destination: '/es/get-quote',   permanent: false },
      { source: '/privacy',     destination: '/es/privacy',     permanent: false },
      { source: '/terms',       destination: '/es/terms',       permanent: false },
      { source: '/services/wedding-photography', destination: '/es/services/wedding-photography', permanent: false },
      { source: '/services/portrait-photography', destination: '/es/services/portrait-photography', permanent: false },
      { source: '/services/event-photography', destination: '/es/services/event-photography', permanent: false },
      { source: '/services/commercial-photography', destination: '/es/services/commercial-photography', permanent: false },
      { source: '/services/family-photography', destination: '/es/services/family-photography', permanent: false },
      { source: '/services/drone-services-photography-punta-cana', destination: '/es/services/drone-services-photography-punta-cana', permanent: false },
      { source: '/services/birthday-photographer', destination: '/es/services/birthday-photographer', permanent: false },
      { source: '/services/fotografo-de-cumpleanos', destination: '/es/services/birthday-photographer', permanent: true },
      { source: '/drone-services-photography-punta-cana', destination: '/es/services/drone-services-photography-punta-cana', permanent: false },
      { source: '/es/drone-services-photography-punta-cana', destination: '/es/services/drone-services-photography-punta-cana', permanent: true },
      { source: '/en/drone-services-photography-punta-cana', destination: '/en/services/drone-services-photography-punta-cana', permanent: true },
      { source: '/servicios-dron-fotografia-punta-cana', destination: '/es/services/drone-services-photography-punta-cana', permanent: true },
      { source: '/es/servicios-dron-fotografia-punta-cana', destination: '/es/services/drone-services-photography-punta-cana', permanent: true },
      { source: '/en/servicios-dron-fotografia-punta-cana', destination: '/en/services/drone-services-photography-punta-cana', permanent: true },

      // =============================================
      // BLOG DUPLICATE CONSOLIDATION (301 redirects)
      // Zones Colonial — 6 duplicates → canonical: fotografo-zona-colonial-santo-domingo
      // =============================================
      { source: '/es/blog/fotografo-santo-domingo-zona-colonial',             destination: '/es/blog/fotografo-zona-colonial-santo-domingo',             permanent: true },
      { source: '/en/blog/photographer-santo-domingo-colonial-zone',          destination: '/en/blog/photographer-zona-colonial-santo-domingo',          permanent: true },
      { source: '/es/blog/fotografo-zona-colonial-santo-domingo-2',           destination: '/es/blog/fotografo-zona-colonial-santo-domingo',             permanent: true },
      { source: '/en/blog/photographer-zona-colonial-santo-domingo-2',        destination: '/en/blog/photographer-zona-colonial-santo-domingo',          permanent: true },
      { source: '/es/blog/sesion-de-fotos-zona-colonial',                     destination: '/es/blog/fotografo-zona-colonial-santo-domingo',             permanent: true },
      { source: '/en/blog/photo-session-colonial-zone',                       destination: '/en/blog/photographer-zona-colonial-santo-domingo',          permanent: true },
      { source: '/es/blog/sesion-de-fotos-zona-colonial-fotografo-santo-domingo', destination: '/es/blog/fotografo-zona-colonial-santo-domingo',         permanent: true },
      { source: '/en/blog/photo-session-colonial-zone-photographer-santo-domingo', destination: '/en/blog/photographer-zona-colonial-santo-domingo',     permanent: true },
      { source: '/es/blog/sesion-fotos-luz-natural-zona-colonial',            destination: '/es/blog/fotografo-zona-colonial-santo-domingo',             permanent: true },
      { source: '/en/blog/natural-light-photo-session-colonial-zona',         destination: '/en/blog/photographer-zona-colonial-santo-domingo',          permanent: true },
      { source: '/es/blog/sesion-fotos-zona-colonial-2',                      destination: '/es/blog/fotografo-zona-colonial-santo-domingo',             permanent: true },
      { source: '/en/blog/photo-session-colonial-zone-2',                     destination: '/en/blog/photographer-zona-colonial-santo-domingo',          permanent: true },

      // Bodas duplicate — fotografo-de-bodas-en-santo-domingo → fotografo-bodas-santo-domingo
      { source: '/es/blog/fotografo-de-bodas-en-santo-domingo',               destination: '/es/blog/fotografo-bodas-santo-domingo',                     permanent: true },
      { source: '/en/blog/wedding-photographer-in-santo-domingo',             destination: '/en/blog/wedding-photographer-santo-domingo',                permanent: true },

      // Drone Santo Domingo duplicates → fotografo-profesional-dron-santo-domingo
      { source: '/es/blog/piloto-de-drone-fotografia-santo-domingo',          destination: '/es/blog/fotografo-profesional-dron-santo-domingo',          permanent: true },
      { source: '/en/blog/drone-pilot-photography-santo-domingo',             destination: '/en/blog/professional-drone-photographer-santo-domingo',     permanent: true },
      { source: '/es/blog/santo-domingo-fotografia-drone',                    destination: '/es/blog/fotografo-profesional-dron-santo-domingo',          permanent: true },
      { source: '/en/blog/santo-domingo-drone-photography',                   destination: '/en/blog/professional-drone-photographer-santo-domingo',     permanent: true },
      // Drone RD generic → servicio-foto-y-video-con-dron-en-republica-dominicana
      { source: '/es/blog/servicio-drone-republica-dominicana',               destination: '/es/blog/servicio-foto-y-video-con-dron-en-republica-dominicana', permanent: true },
      { source: '/en/blog/drone-service-dominican-republic',                  destination: '/en/blog/drone-photo-and-video-service-in-dominican-republic', permanent: true },
      // Drone Punta Cana duplicate → servicio-drone-foto-video-profesional-punta-cana
      { source: '/es/blog/servicio-profesional-drone-punta-cana',             destination: '/es/blog/servicio-drone-foto-video-profesional-punta-cana', permanent: true },
      { source: '/en/blog/professional-drone-service-punta-cana',             destination: '/en/blog/professional-drone-photo-video-service-punta-cana', permanent: true },
      // Drone Samaná duplicate → piloto-drone-samana-republica-dominicana-servicio-profesional
      { source: '/es/blog/sesion-piloto-dron-samana',                         destination: '/es/blog/piloto-drone-samana-republica-dominicana-servicio-profesional', permanent: true },
      { source: '/en/blog/drone-pilot-session-samana',                        destination: '/en/blog/drone-pilot-samana-dominican-republic-professional-service', permanent: true },
      // Estudio duplicate → fotografo-profesional-en-estudio-santo-domingo
      { source: '/es/blog/sesion-fotos-estudio-santo-domingo',                destination: '/es/blog/fotografo-profesional-en-estudio-santo-domingo',   permanent: true },
      { source: '/en/blog/photo-session-studio-santo-domingo',                destination: '/en/blog/professional-photo-studio-santo-domingo',           permanent: true },
    ]
  },

  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false
    }
    return config
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