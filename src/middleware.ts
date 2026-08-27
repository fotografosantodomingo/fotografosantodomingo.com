import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es',
  localeDetection: false,
})

/**
 * Security headers for every real page response.
 *
 * public/_headers covers genuinely static files (llms.txt, robots.txt,
 * sitemaps, images) fine, but this deployment runs on @cloudflare/next-on-pages
 * in "Advanced Mode" (a single _worker.js) — Cloudflare Pages does not apply
 * _headers to routes the Worker itself renders, which is every SSR'd page.
 * Middleware is the one mechanism that reliably runs for those routes on
 * this adapter (same reason the admin auth check below already lives here),
 * so it's the actual place these headers take effect for real pages.
 *
 * No Content-Security-Policy here deliberately — a CSP tight enough to
 * matter can silently break Stripe Checkout, GA/GTM, or the Supabase client
 * if the allowlist is wrong, and that hasn't been tested yet.
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  return response
}

async function adminMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Allow the login page through without auth
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    return applySecurityHeaders(await adminMiddleware(request))
  }

  return applySecurityHeaders(intlMiddleware(request))
}

export const config = {
  matcher: ['/', '/(es|en)/:path*', '/admin', '/admin/:path*'],
}