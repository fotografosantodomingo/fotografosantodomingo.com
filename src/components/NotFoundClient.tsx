'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

type Props = {
  initialLocale: 'es' | 'en'
}

type Tile = {
  image: string
  href: string
  titleEs: string
  titleEn: string
}

const tiles: Tile[] = [
  {
    image: 'https://res.cloudinary.com/dwewurxla/image/upload/w_900,c_limit,f_auto,q_auto/v1776563769/sesion-fotos-pareja-playa-punta-cana_nniebt.webp',
    href: '/portfolio',
    titleEs: 'Bodas y parejas',
    titleEn: 'Weddings and couples',
  },
  {
    image: 'https://res.cloudinary.com/dwewurxla/image/upload/w_900,c_limit,f_auto,q_auto/v1776561751/fotografo-retratos-profesionales-santo-domingo_r93azo.webp',
    href: '/portfolio',
    titleEs: 'Retratos profesionales',
    titleEn: 'Professional portraits',
  },
  {
    image: 'https://res.cloudinary.com/dwewurxla/image/upload/w_900,c_limit,f_auto,q_auto/v1776561751/Fotografo_profesional_Santo_Domingo_Sesion_de_Fotos_aradxg.webp',
    href: '/services',
    titleEs: 'Servicios destacados',
    titleEn: 'Featured services',
  },
  {
    image: 'https://res.cloudinary.com/dwewurxla/image/upload/w_900,c_limit,f_auto,q_auto/v1776561751/Fotografo_en_Santo_Domingo_retratos_arte_srdiz0.webp',
    href: '/blog',
    titleEs: 'Ideas y guias',
    titleEn: 'Ideas and guides',
  },
]

function detectLocaleFromPath(pathname: string) {
  if (pathname.startsWith('/es')) return 'es'
  if (pathname.startsWith('/en')) return 'en'
  return null
}

export default function NotFoundClient({ initialLocale }: Props) {
  const pathname = usePathname()
  const [locale, setLocale] = useState<'es' | 'en'>(initialLocale)

  useEffect(() => {
    const fromPath = detectLocaleFromPath(pathname)
    if (fromPath) {
      setLocale(fromPath)
      return
    }

    if (typeof navigator !== 'undefined') {
      const fromBrowser = navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
      setLocale(fromBrowser)
    }
  }, [pathname])

  const t = useMemo(() => {
    if (locale === 'es') {
      return {
        subtitle: 'Lo sentimos, esta pagina ya no esta disponible.',
        contact: 'Contactame',
        back: 'Volver a la Galeria Principal',
        explore: 'Explora mi trabajo',
      }
    }

    return {
      subtitle: 'Sorry, this page is not available anymore.',
      contact: 'Contact Me',
      back: 'Back to Main Gallery',
      explore: 'Explore my work',
    }
  }, [locale])

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-14 md:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_45%)]" />

        <div className="relative mx-auto w-full max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">404</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">{t.subtitle}</h1>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/${locale}/contact`}
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              {t.contact}
            </Link>
            <Link
              href={`/${locale}/portfolio`}
              className="rounded-full bg-sky-500 px-7 py-3 text-sm font-bold text-gray-950 transition hover:bg-sky-400"
            >
              {t.back}
            </Link>
          </div>
        </div>

        <div className="relative mt-12">
          <h2 className="mb-4 text-center text-2xl font-bold md:text-3xl">{t.explore}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {tiles.map((tile) => (
              <Link
                key={tile.image}
                href={`/${locale}${tile.href}`}
                className="group overflow-hidden rounded-xl border border-white/10 bg-gray-900"
              >
                <img
                  src={tile.image}
                  alt={locale === 'es' ? tile.titleEs : tile.titleEn}
                  className="h-auto w-full object-contain transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="px-3 py-2 text-xs font-semibold text-gray-200 md:text-sm">
                  {locale === 'es' ? tile.titleEs : tile.titleEn}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}