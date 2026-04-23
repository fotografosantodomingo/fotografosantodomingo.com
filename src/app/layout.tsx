import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import './globals.css'

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
    <html lang={locale} className="dark" suppressHydrationWarning>
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
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
