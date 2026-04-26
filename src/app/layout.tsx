import type { Metadata } from 'next'
import { Inter, Unbounded, JetBrains_Mono } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import './globals.css'

// Bugatti Display substitute. Geometric extended display face for the
// monumental hero scale (DESIGN.md §3 Note on Substitutes — Unbounded works
// at the token values; cap practical max at ~200px instead of 288px).
const bugattiDisplay = Unbounded({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bugatti-display',
  display: 'swap',
})

// Bugatti Monospace substitute. JetBrains Mono works at the token values
// without adjustment per DESIGN.md §3.
const bugattiMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bugatti-mono',
  display: 'swap',
})

// Body face — Inter. Used for paragraphs and inline reading copy.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

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
    <html
      lang={locale}
      className={`dark ${bugattiDisplay.variable} ${bugattiMono.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');var isLight=t==='light';d.classList.toggle('light-mode',isLight);d.classList.toggle('dark',!isLight);d.style.colorScheme=isLight?'light':'dark';}catch(e){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}})();`,
          }}
        />
        {/* Google Analytics — in <head> for verification bots; consent mode defaults to denied until user accepts */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-C59XKYJNTQ" />
        <script
          id="gtag-init"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('consent','default',{'analytics_storage':'denied'});gtag('config','G-C59XKYJNTQ');`,
          }}
        />
        {/* Google Tag Manager — standard head snippet, hardcoded ID */}
        <script
          id="gtm-init"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WM442J55');`,
          }}
        />
      </head>
      <body className={inter.className}>
        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WM442J55"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
      </body>
    </html>
  )
}
