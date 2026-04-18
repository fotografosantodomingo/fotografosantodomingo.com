import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fotografo Santo Domingo | Babula Shots',
  description: 'Fotografía profesional en Santo Domingo y República Dominicana',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  metadataBase: new URL('https://www.fotografosantodomingo.com'),
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let locale = 'es'

  try {
    const detectedLocale = await getLocale()
    locale = detectedLocale === 'en' ? 'en' : 'es'
  } catch {
    // Keep a safe default for non-localized routes (e.g. /admin)
    locale = 'es'
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          type="text/javascript"
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          async
        />
      </head>
      <body className={inter.className}>
        {/* Anti-FOUC: read localStorage and apply theme class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.add('light-mode');}catch(e){}})();`,
          }}
        />
        <Script
          id="tawkto-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: 'var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();',
          }}
        />
        <Script
          id="tawkto-widget"
          strategy="afterInteractive"
          src="https://embed.tawk.to/662b0680a0c6737bd1308ff1/1hsc12p8m"
          crossOrigin="anonymous"
        />
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics />
        )}
        <Analytics />
        {children}
      </body>
    </html>
  )
}
