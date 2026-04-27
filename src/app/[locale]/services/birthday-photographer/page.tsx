import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string }
}

type GalleryImage = {
  url: string
  alt: { es: string; en: string }
  title: { es: string; en: string }
}

type BirthdayScenario = {
  id: string
  title: { es: string; en: string }
  description: { es: string; en: string }
  images: GalleryImage[]
}

const scenarios: BirthdayScenario[] = [
  {
    id: 'smash-cake-baby',
    title: {
      es: '1 año: Smash cake para bebé en Santo Domingo y Punta Cana',
      en: '1st birthday: baby smash cake in Santo Domingo and Punta Cana',
    },
    description: {
      es: 'Sesiones de primer cumpleaños con pastel, juego libre y expresiones naturales. Ideal para familias que quieren recuerdos auténticos de esta etapa irrepetible.',
      en: 'First birthday sessions with cake smash, free play, and authentic expressions. Perfect for families who want timeless memories of this milestone.',
    },
    images: [
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343506/fotografo_de_cupleanos_en_republica_dominicana_rucfrb.webp',
        alt: {
          es: 'Fotografo de cumpleanos en Republica Dominicana capturando bebe de 1 ano jugando con pastel',
          en: 'Birthday photographer in Dominican Republic capturing one-year-old baby playing with cake',
        },
        title: {
          es: 'Sesion smash cake bebe 1 ano - Fotografo de cumpleanos Santo Domingo',
          en: 'Smash cake 1st birthday session - Birthday photographer Santo Domingo',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343504/fotografo_de_compleanoos_en_punta_cana_obhy9g.webp',
        alt: {
          es: 'Sesion de fotos de cumpleanos infantil en Punta Cana con bebe de un ano y pastel',
          en: 'Children birthday photoshoot in Punta Cana with one-year-old baby and cake',
        },
        title: {
          es: 'Cumpleanos infantil en Punta Cana - Servicio de fotografia profesional',
          en: 'Kids birthday in Punta Cana - Professional photography service',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343504/fotografo_de_cumpleanos_en_santo_domingo_rvsuft.webp',
        alt: {
          es: 'Fotografo de cumpleanos en Santo Domingo para bebe celebrando primer ano con cake smash',
          en: 'Birthday photographer in Santo Domingo for baby first birthday cake smash celebration',
        },
        title: {
          es: 'Fotografo de cumpleanos Santo Domingo - Primer ano del bebe',
          en: 'Santo Domingo birthday photographer - Baby first birthday',
        },
      },
    ],
  },
  {
    id: 'beach-birthday-11',
    title: {
      es: '11 años: cumpleaños en playa con atardecer',
      en: '11th birthday: beach session at sunset',
    },
    description: {
      es: 'Cobertura dinámica para cumpleaños de preadolescentes en playa, con retratos naturales y ambiente cálido de atardecer.',
      en: 'Dynamic birthday coverage for pre-teens on the beach, with natural portraits and warm sunset atmosphere.',
    },
    images: [
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343815/fotografo_cumpleanos_playa_en_republica_dominicana_jdhags.webp',
        alt: {
          es: 'Fotografo de cumpleanos en playa Republica Dominicana para nino de 11 anos al atardecer',
          en: 'Beach birthday photographer in Dominican Republic for 11-year-old boy at sunset',
        },
        title: {
          es: 'Cumpleanos en playa Republica Dominicana - Fotografo profesional',
          en: 'Beach birthday in Dominican Republic - Professional photographer',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343807/sesion_de_fotos_cumpleanos_en_la_playa_punta_cana_jiu4op.webp',
        alt: {
          es: 'Sesion de fotos de cumpleanos en la playa de Punta Cana para nino y familia',
          en: 'Birthday photoshoot on Punta Cana beach for boy and family',
        },
        title: {
          es: 'Fotografo de cumpleanos Punta Cana - Sesion al atardecer',
          en: 'Punta Cana birthday photographer - Sunset session',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343807/session_de_fotos_cumpleanos_playa_santo_domingo_giadsn.webp',
        alt: {
          es: 'Sesion de fotos de cumpleanos en playa de Santo Domingo con luz dorada y ambiente familiar',
          en: 'Birthday photo session on Santo Domingo beach with golden light and family atmosphere',
        },
        title: {
          es: 'Cumpleanos en playa Santo Domingo - Fotografo de eventos',
          en: 'Santo Domingo beach birthday - Event photographer',
        },
      },
    ],
  },
  {
    id: 'studio-family-2yo',
    title: {
      es: '2 años: sesión en estudio con mamá y papá',
      en: '2nd birthday: studio session with mom and dad',
    },
    description: {
      es: 'Escenas limpias en estudio para celebrar cumpleaños de 2 años con retratos familiares y dirección suave para niños pequeños.',
      en: 'Clean studio scenes to celebrate a 2nd birthday with family portraits and soft direction for toddlers.',
    },
    images: [
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343923/fotografo_estudio_cumpleanos_santo_domingo_ilopn4.webp',
        alt: {
          es: 'Fotografo de estudio para cumpleanos infantil en Santo Domingo con nino de 2 anos y padres',
          en: 'Studio birthday photographer in Santo Domingo with 2-year-old boy and parents',
        },
        title: {
          es: 'Sesion de cumpleanos en estudio Santo Domingo - Familia completa',
          en: 'Santo Domingo studio birthday session - Full family',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343908/fotografo_de_cumpleanos_sesin_de_fotos_estudio_lmdecv.webp',
        alt: {
          es: 'Sesion de fotos de cumpleanos en estudio para nino pequeno en Republica Dominicana',
          en: 'Studio birthday photoshoot for toddler in Dominican Republic',
        },
        title: {
          es: 'Fotografo de cumpleanos en estudio - Retratos naturales',
          en: 'Studio birthday photographer - Natural portraits',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343889/sesion_de_fotos_cumpleanos_estudio_qjv6mq.webp',
        alt: {
          es: 'Sesion de cumpleanos en estudio para nino de 2 anos con ambiente familiar',
          en: 'Studio birthday session for 2-year-old boy with family environment',
        },
        title: {
          es: 'Cumpleanos de 2 anos en estudio - Fotografo Santo Domingo',
          en: '2nd birthday studio session - Santo Domingo photographer',
        },
      },
    ],
  },
  {
    id: 'quince-boca-marina',
    title: {
      es: 'Quinceañera en Boca Chica (Boca Marina)',
      en: 'Quinceañera in Boca Chica (Boca Marina)',
    },
    description: {
      es: 'Cobertura elegante de quinceañeras en restaurantes y locaciones premium de Boca Chica, con familia y decoración personalizada.',
      en: 'Elegant quinceañera coverage in Boca Chica premium venues, including family moments and custom decor.',
    },
    images: [
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343975/fotografo_de_quinceneras_santo_domingo_muvcdo.webp',
        alt: {
          es: 'Fotografo de quinceneras en Santo Domingo para sesion de 15 anos en ambiente elegante',
          en: 'Quinceañera photographer in Santo Domingo for elegant 15th birthday session',
        },
        title: {
          es: 'Fotografo de quinceneras Santo Domingo - Sesion premium',
          en: 'Santo Domingo quinceañera photographer - Premium session',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343976/sesion_de_fotos_quincenera_santo_domingo_pnj3oc.webp',
        alt: {
          es: 'Sesion de fotos de quincenera en Santo Domingo con decoracion y ambiente familiar',
          en: 'Quinceañera photo session in Santo Domingo with decor and family atmosphere',
        },
        title: {
          es: 'Sesion de fotos quincenera Santo Domingo - 15 anos',
          en: 'Santo Domingo quinceañera photoshoot - 15 years',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343980/quincenera_15_servicio_de_fotografia_tfyapk.webp',
        alt: {
          es: 'Servicio de fotografia para quincenera de 15 anos en Republica Dominicana',
          en: '15th birthday quinceañera photography service in Dominican Republic',
        },
        title: {
          es: 'Servicio de fotografia quinceanera - Babula Shots',
          en: 'Quinceañera photography service - Babula Shots',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776343981/fotografo_de_cumpleanos_santo_domingo_vue2be.webp',
        alt: {
          es: 'Fotografo de cumpleanos en Santo Domingo para celebracion de quinceanera con familia',
          en: 'Birthday photographer in Santo Domingo for quinceañera celebration with family',
        },
        title: {
          es: 'Quinceanera Santo Domingo - Cobertura de cumpleanos premium',
          en: 'Santo Domingo quinceañera - Premium birthday coverage',
        },
      },
    ],
  },
  {
    id: 'gokarts-kids-club',
    title: {
      es: 'Cumpleaños temático en club indoor (Go Karts)',
      en: 'Theme birthday in indoor club (Go Karts)',
    },
    description: {
      es: 'Fiestas de niños con actividad y movimiento. Documentamos juegos, reacciones, grupos y momentos clave sin perder espontaneidad.',
      en: 'Kids birthday parties with action and movement. We document games, reactions, group moments, and key milestones naturally.',
    },
    images: [
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776344097/fotografo_compleanos_interior_santo_domingo_fiesta_de_ninos_g8cbf8.webp',
        alt: {
          es: 'Fotografo de cumpleanos interior en Santo Domingo para fiesta de ninos en club tematico',
          en: 'Indoor birthday photographer in Santo Domingo for kids party in themed club',
        },
        title: {
          es: 'Cumpleanos interior Santo Domingo - Fiesta de ninos',
          en: 'Indoor birthday Santo Domingo - Kids party',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776344134/servicio_de_fotografia_de_cumple_en_santo_domingo_republica_dominicana_pzx6wu.webp',
        alt: {
          es: 'Servicio de fotografia de cumpleanos en Santo Domingo Republica Dominicana para evento infantil',
          en: 'Birthday photography service in Santo Domingo Dominican Republic for children event',
        },
        title: {
          es: 'Servicio de fotografia de cumpleanos en Santo Domingo',
          en: 'Birthday photography service in Santo Domingo',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776344133/santo_domingo_fotografia_de_cumpleanos_puts5c.webp',
        alt: {
          es: 'Fotografia de cumpleanos en Santo Domingo con ninos disfrutando tematica de fiesta',
          en: 'Birthday photography in Santo Domingo with kids enjoying themed party',
        },
        title: {
          es: 'Fotografia de cumpleanos Santo Domingo - Cobertura de evento',
          en: 'Santo Domingo birthday photography - Event coverage',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776344137/servicio_de_fotografia_de_cumple_en_santo_domingo_ghofcd.webp',
        alt: {
          es: 'Fotografo de cumpleanos en Santo Domingo para fiesta de ninos en espacio cerrado',
          en: 'Birthday photographer in Santo Domingo for kids party in indoor venue',
        },
        title: {
          es: 'Cumpleanos en interior Santo Domingo - Sesion grupal infantil',
          en: 'Indoor birthday Santo Domingo - Kids group session',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776344139/servicio_de_fotoografia_cumpleanos_santo_domingo_w4lgdi.webp',
        alt: {
          es: 'Servicio de fotografia para cumpleanos de ninos en Santo Domingo con cobertura documental',
          en: 'Birthday photography service for children in Santo Domingo with documentary coverage',
        },
        title: {
          es: 'Cobertura de cumpleanos de ninos en Santo Domingo',
          en: 'Kids birthday coverage in Santo Domingo',
        },
      },
    ],
  },
  {
    id: 'theme-park-school-kids',
    title: {
      es: 'Cumpleaños en parque temático con compañeros de clase',
      en: 'Theme park birthday with classmates',
    },
    description: {
      es: 'Cobertura de cumpleaños escolares con amigos, familia y actividades al aire libre para conservar la energía real del día.',
      en: 'School birthday coverage with classmates, family, and outdoor activities to preserve the real energy of the day.',
    },
    images: [
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776344223/fotografia_cumpleanos_santo_domingo_bzzcig.webp',
        alt: {
          es: 'Fotografia de cumpleanos en Santo Domingo en parque tematico con ninos y familia',
          en: 'Birthday photography in Santo Domingo theme park with kids and family',
        },
        title: {
          es: 'Cumpleanos en parque tematico Santo Domingo - Fotografo de eventos',
          en: 'Theme park birthday in Santo Domingo - Event photographer',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776344232/fiesta_de_cumpleanos_fotografo_en_santo_dmingo_m7usdv.webp',
        alt: {
          es: 'Fiesta de cumpleanos con fotografo en Santo Domingo para grupo escolar',
          en: 'Birthday party with photographer in Santo Domingo for school group',
        },
        title: {
          es: 'Fotografo de fiesta de cumpleanos en Santo Domingo',
          en: 'Birthday party photographer in Santo Domingo',
        },
      },
      {
        url: 'https://res.cloudinary.com/dwewurxla/image/upload/v1776344233/fotografo_en_santo_domingo_cumpleanoos_de_ninos_iqapa6.webp',
        alt: {
          es: 'Fotografo en Santo Domingo para cumpleanos de ninos en evento escolar',
          en: 'Photographer in Santo Domingo for children birthday in school event',
        },
        title: {
          es: 'Cumpleanos de ninos en Santo Domingo - Sesion documental',
          en: 'Children birthday in Santo Domingo - Documentary session',
        },
      },
    ],
  },
]

const faqItems = {
  es: [
    {
      q: 'Que incluye la cobertura de cumpleanos en Santo Domingo?',
      a: 'Incluye direccion de fotos, retratos familiares, momentos espontaneos, fotos de decoracion y entrega digital editada. Podemos adaptar cobertura para bebes, ninos, adolescentes y adultos.',
    },
    {
      q: 'Trabajan en playa, estudio, restaurantes y parques tematicos?',
      a: 'Si. Cubrimos cumpleanos en playa, estudio, locaciones indoor, restaurantes y parques tematicos en Santo Domingo, Punta Cana y zonas cercanas.',
    },
    {
      q: 'Cuanto tiempo antes debo reservar?',
      a: 'Recomendamos reservar con 1 a 3 semanas de anticipacion para asegurar fecha y plan de cobertura, especialmente en fines de semana.',
    },
    {
      q: 'Ofrecen paquetes para quinceneras?',
      a: 'Si. Tenemos paquetes Esencial y VIP para quinceaneras con opciones de maquillaje, direccion de pose y entregables premium.',
    },
  ],
  en: [
    {
      q: 'What is included in birthday coverage in Santo Domingo?',
      a: 'Coverage includes guided portraits, family moments, candid shots, decor details, and edited digital delivery. We adapt sessions for babies, kids, teens, and adults.',
    },
    {
      q: 'Do you work at beaches, studios, restaurants, and theme parks?',
      a: 'Yes. We cover birthdays at beaches, studios, indoor venues, restaurants, and theme parks in Santo Domingo, Punta Cana, and nearby areas.',
    },
    {
      q: 'How far in advance should I book?',
      a: 'We recommend booking 1 to 3 weeks ahead to secure date and coverage plan, especially for weekends.',
    },
    {
      q: 'Do you offer quinceañera packages?',
      a: 'Yes. We offer Essential and VIP quinceañera packages with makeup options, pose direction, and premium deliverables.',
    },
  ],
}

// Booking routes mapped to canonical service_packages (birthday-event-photography family).
// `?service=<slug>` jumps the BookingWizard straight to the date step (BookingWizard.tsx:143).
// Quinceañera 10/15 photo studio sessions have no exact canonical package (canonical
// quinceanera-premium covers 4h ceremony + waltz + reception), so those route through
// /get-quote with family + package context.
function getBookingLinks(locale: string) {
  const cta = 'birthday-photographer-card'
  return {
    event3h: `/${locale}/book?service=signature-celebration&cta=${cta}`,
    // Quinceañera 10/15-photo studio sessions have no canonical package
     // (the canonical Quinceañera Premium is 4h ceremony coverage).
     // Drop the package= query so the API doesn't reject with
     // "Unknown package_slug for this family" — customer describes the
     // photo-count tier in the quote freeform notes.
    quincenara10: `/${locale}/get-quote?family=birthday-event-photography&cta=${cta}-q10`,
    quincenara15: `/${locale}/get-quote?family=birthday-event-photography&cta=${cta}-q15`,
    quincenaraVip: `/${locale}/book?service=quinceanera-premium&cta=${cta}`,
  }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Fotografo de Cumpleanos en Santo Domingo y Punta Cana | Babula Shots'
    : 'Birthday Photographer in Santo Domingo and Punta Cana | Babula Shots'
  const description = isEs
    ? 'Servicio profesional de fotografia de cumpleanos en Santo Domingo, Punta Cana y Boca Chica. Sesiones para bebes, ninos, quinceneras y fiestas familiares.'
    : 'Professional birthday photography in Santo Domingo, Punta Cana, and Boca Chica. Sessions for babies, kids, quinceañeras, and family celebrations.'

  return {
    title,
    description,
    keywords: isEs
      ? 'fotografo de cumpleanos santo domingo, fotografia de cumpleanos punta cana, fotografo quincenera santo domingo, sesion smash cake republica dominicana, cobertura fiesta infantil'
      : 'birthday photographer santo domingo, birthday photography punta cana, quinceanera photographer dominican republic, smash cake session DR, kids party event coverage',
    alternates: {
      canonical: `${BASE_URL}/${locale}/services/birthday-photographer`,
      languages: {
        es: `${BASE_URL}/es/services/birthday-photographer`,
        en: `${BASE_URL}/en/services/birthday-photographer`,
        'x-default': `${BASE_URL}/es/services/birthday-photographer`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Fotografo de Cumpleanos en Santo Domingo' : 'Birthday Photographer in Santo Domingo',
      description,
      url: `${BASE_URL}/${locale}/services/birthday-photographer`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=${isEs ? 'Fotografo+de+Cumpleanos' : 'Birthday+Photographer'}&subtitle=${isEs ? 'Santo+Domingo+y+Punta+Cana' : 'Santo+Domingo+and+Punta+Cana'}`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Fotografo de cumpleanos en Santo Domingo y Punta Cana' : 'Birthday photographer in Santo Domingo and Punta Cana',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Fotografo de Cumpleanos en Santo Domingo' : 'Birthday Photographer in Santo Domingo',
      description,
      images: [`${BASE_URL}/api/og?title=${isEs ? 'Fotografo+de+Cumpleanos' : 'Birthday+Photographer'}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

export default function BirthdayPhotographerPage({ params: { locale } }: Props) {
  const isEs = locale === 'es'
  const bookingLinks = getBookingLinks(locale)

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: isEs ? 'Servicios' : 'Services', url: `${BASE_URL}/${locale}/services` },
    { name: isEs ? 'Fotografo de Cumpleanos' : 'Birthday Photographer', url: `${BASE_URL}/${locale}/services/birthday-photographer` },
  ])

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (isEs ? faqItems.es : faqItems.en).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(faqSchema)} />
      <main className="min-h-screen bg-canvas text-ink">
        {/* ── HEADER ── matches the Bugatti monumental treatment of canonical
             /services/[family] pages. */}
        <section className="border-b border-hairline-soft py-16 md:py-24 lg:py-28">
          <div className="container mx-auto px-4">
            <nav>
              <Link
                href={`/${locale}/services`}
                className="font-mono uppercase tracking-widest text-[11px] text-ink-muted hover:text-ink transition-opacity"
              >
                ← {isEs ? 'Todos los servicios' : 'All services'}
              </Link>
            </nav>
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mt-10 mb-6">
              {isEs ? 'Servicio especializado · Cumpleaños · Quinceañeras' : 'Specialized service · Birthdays · Quinceañeras'}
            </p>
            <h1
              className="font-display uppercase text-ink max-w-5xl"
              style={{
                fontSize: 'clamp(36px, 7vw, 112px)',
                lineHeight: '0.95',
                letterSpacing: '-0.01em',
              }}
            >
              {isEs ? 'Fotógrafo de cumpleaños' : 'Birthday photographer'}
            </h1>
            <p className="text-ink-muted text-base md:text-lg max-w-3xl mt-8 leading-relaxed">
              {isEs
                ? 'Cobertura profesional de cumpleaños infantiles, en playa, sesiones en estudio y quinceañeras en Santo Domingo, Punta Cana y Boca Chica. Recuerdos reales con dirección clara y estilo premium.'
                : 'Professional coverage for kids birthdays, beach birthdays, studio sessions, and quinceañeras across Santo Domingo, Punta Cana, and Boca Chica. Real memories with clear direction and premium style.'}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href={bookingLinks.event3h}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
              >
                {isEs ? 'Reservar cobertura (2h)' : 'Book coverage (2h)'}
              </Link>
              <Link
                href={bookingLinks.quincenara15}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
              >
                {isEs ? 'Quinceañera' : 'Quinceañera'}
              </Link>
              <Link
                href={`/${locale}/portfolio?category=birthday`}
                className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] md:text-[13px] px-7 py-3.5 rounded-full border border-hairline-soft text-ink-muted hover:text-ink hover:border-hairline transition-colors duration-200"
              >
                {isEs ? 'Portafolio' : 'Portfolio'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── SCENARIOS ── photo galleries per session type. Image content
             preserved byte-identical (URLs, alt, title); chrome restyled. */}
        <section className="border-b border-hairline-soft py-16 md:py-20">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Escenarios' : 'Scenarios'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-6"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Posibilidades de sesión' : 'Session possibilities'}
            </h2>
            <p className="text-ink-muted text-base md:text-lg max-w-3xl mb-12 leading-relaxed">
              {isEs
                ? 'Cada cumpleaños tiene ritmo y energía propia. Estas galerías muestran escenarios reales que cubrimos en República Dominicana.'
                : 'Each birthday has its own pace and energy. These galleries show real scenarios we cover across the Dominican Republic.'}
            </p>

            <div className="space-y-16 md:space-y-20">
              {scenarios.map((scenario, idx) => (
                <article key={scenario.id}>
                  <div className="mb-6 max-w-3xl">
                    <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3
                      className="font-display uppercase text-ink mt-3"
                      style={{ fontSize: 'clamp(22px, 2.6vw, 32px)', lineHeight: '1.1' }}
                    >
                      {isEs ? scenario.title.es : scenario.title.en}
                    </h3>
                    <p className="text-ink-muted text-base leading-relaxed mt-4">
                      {isEs ? scenario.description.es : scenario.description.en}
                    </p>
                  </div>
                  <div className="grid gap-1 md:gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {scenario.images.map((image, index) => (
                      <figure key={`${scenario.id}-${index}`} className="overflow-hidden bg-canvas">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt={isEs ? image.alt.es : image.alt.en}
                          title={isEs ? image.title.es : image.title.en}
                          loading="lazy"
                          className="block w-full h-auto"
                        />
                        <figcaption className="px-1 py-2 font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                          {isEs ? image.title.es : image.title.en}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOOKING PACKAGES ── 4 package cards in hairline grid */}
        <section className="border-b border-hairline-soft py-16 md:py-20">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Paquetes' : 'Packages'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-6"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Reservas recomendadas' : 'Recommended bookings'}
            </h2>
            <p className="text-ink-muted text-base md:text-lg max-w-3xl mb-12 leading-relaxed">
              {isEs
                ? 'Para cumpleaños generales recomendamos cobertura de evento 3 horas. Para quinceañeras puedes reservar paquete esencial o VIP según nivel de producción.'
                : 'For general birthdays we recommend the 3-hour event coverage. For quinceañeras, choose Essential or VIP depending on production level.'}
            </p>

            <ul className="grid grid-cols-1 lg:grid-cols-2 border-t border-l border-hairline-soft">
              {[
                {
                  bookingHref: bookingLinks.event3h,
                  badge: isEs ? 'Cobertura · 3h' : 'Coverage · 3h',
                  title: isEs ? 'Cobertura de evento — 3 horas' : 'Event Coverage — 3 hours',
                  desc: isEs
                    ? 'Servicio general para cumpleaños infantiles, escolares y familiares. Reserva con 50% para asegurar fecha.'
                    : 'General service for kids, school, and family birthdays. 50% booking deposit to secure your date.',
                  bullets: isEs
                    ? ['Cobertura documental de momentos clave, retratos grupales y detalles de decoración.', 'Entrega digital editada para compartir con familia e invitados.', 'Reserva 50% para confirmar fecha y horario.']
                    : ['Documentary coverage of key moments, group portraits, and decor details.', 'Edited digital delivery ready to share with family and guests.', '50% booking deposit required to lock date and time.'],
                  ctaLabel: isEs ? 'Reservar' : 'Book',
                  featured: false,
                },
                {
                  bookingHref: bookingLinks.quincenara10,
                  badge: isEs ? 'Quinceañera · 10 fotos' : 'Quinceañera · 10 photos',
                  title: isEs ? 'Quinceañera: Paquete Esencial 10' : 'Quinceañera: Essential 10',
                  desc: isEs
                    ? '1 hora, maquillaje incluido, asesoría de vestuario y 10 fotos premium editadas.'
                    : '1 hour, makeup included, wardrobe guidance, and 10 premium edited photos.',
                  bullets: isEs
                    ? ['Sesión de 1 hora en estudio o locación exterior.', 'Maquillaje y peinado básico con acabado natural.', 'Dirección experta de pose y expresión.', 'Álbum digital listo para compartir.']
                    : ['1-hour session in studio or outdoor location.', 'Basic makeup and hairstyling with a natural finish.', 'Expert pose and expression direction.', 'Digital album ready to share.'],
                  ctaLabel: isEs ? 'Reservar' : 'Book',
                  featured: false,
                },
                {
                  bookingHref: bookingLinks.quincenara15,
                  badge: isEs ? 'Quinceañera · 15 fotos' : 'Quinceañera · 15 photos',
                  title: isEs ? 'Quinceañera: Paquete Esencial 15' : 'Quinceañera: Essential 15',
                  desc: isEs
                    ? '1 hora, maquillaje incluido, dirección de pose y 15 fotos premium con look moderno y atemporal.'
                    : '1 hour, makeup included, pose direction, and 15 premium photos with a modern timeless style.',
                  bullets: isEs
                    ? ['15 fotografías premium editadas con acabado profesional.', 'Asesoría de vestuario, colores y accesorios.', 'Sesión orientada a imagen moderna, fresca y atemporal.', 'Reserva del 50% para asegurar fecha.']
                    : ['15 premium edited photos with professional finishing.', 'Wardrobe, color, and accessories guidance.', 'Session designed for a modern, fresh, and timeless visual style.', '50% booking deposit required to secure your date.'],
                  ctaLabel: isEs ? 'Reservar' : 'Book',
                  featured: false,
                },
                {
                  bookingHref: bookingLinks.quincenaraVip,
                  badge: isEs ? 'VIP exclusivo · 20 fotos' : 'VIP exclusive · 20 photos',
                  title: isEs ? 'Quinceañera: Paquete VIP' : 'Quinceañera: VIP',
                  desc: isEs
                    ? '20 fotos premium, experiencia extendida, maquillaje y peinado profesional, atención VIP y entregables de lujo.'
                    : '20 premium photos, extended experience, professional makeup/hair, VIP support, and luxury deliverables.',
                  bullets: isEs
                    ? ['Sesión extendida para múltiples looks y locaciones.', '20 fotos premium + impresiones físicas seleccionadas.', 'Maquillaje y peinado profesional completo con trato VIP.', 'Inversión referencial: USD 600 + ITBIS (18%), reserva 50%.']
                    : ['Extended session for multiple looks and locations.', '20 premium photos plus selected physical prints.', 'Full professional makeup and hairstyling with VIP treatment.', 'Reference investment: USD 600 + 18% tax, with 50% booking deposit.'],
                  ctaLabel: isEs ? 'Reservar VIP' : 'Book VIP',
                  featured: true,
                },
              ].map((pkg) => (
                <li
                  key={pkg.title}
                  className={`border-r border-b border-hairline-soft p-7 md:p-8 ${pkg.featured ? 'bg-ink/[0.03]' : ''}`}
                >
                  <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">
                    {pkg.badge}
                  </span>
                  <h3
                    className="font-display uppercase text-ink mt-3"
                    style={{ fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: '1.1' }}
                  >
                    {pkg.title}
                  </h3>
                  <p className="text-ink-muted text-sm leading-relaxed mt-4">{pkg.desc}</p>
                  <ul className="mt-5 space-y-2.5">
                    {pkg.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-ink/85 text-sm">
                        <span
                          className="mt-2 inline-block w-2 h-px bg-ink/60 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={pkg.bookingHref}
                    className="mt-7 inline-flex items-center justify-center font-mono uppercase tracking-widest text-[11px] px-6 py-3 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
                  >
                    {pkg.ctaLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FAQ ── drives FAQPage rich-result via the existing JSON-LD above */}
        <section className="border-b border-hairline-soft py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                FAQ
              </p>
              <h2
                className="font-display uppercase text-ink mb-12"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.0' }}
              >
                {isEs ? 'Preguntas frecuentes' : 'Frequently asked'}
              </h2>
              <ul className="border-t border-hairline-soft">
                {(isEs ? faqItems.es : faqItems.en).map((item, i) => (
                  <li key={item.q} className="border-b border-hairline-soft py-6 md:py-7">
                    <div className="flex items-start gap-4 md:gap-6">
                      <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted shrink-0 w-8 mt-1">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-ink text-base md:text-lg leading-snug font-medium">
                          {item.q}
                        </h3>
                        <p className="text-ink-muted text-sm md:text-base leading-relaxed mt-3">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
                {isEs ? 'Reserva' : 'Booking'}
              </p>
              <h2
                className="font-display uppercase text-ink mb-5"
                style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: '1.0' }}
              >
                {isEs ? '¿Listo?' : 'Ready?'}
              </h2>
              <p className="text-ink-muted text-base md:text-lg mb-10 leading-relaxed max-w-xl">
                {isEs
                  ? 'Te ayudamos a diseñar una cobertura clara según edad, locación y tipo de celebración.'
                  : 'We help you design the right coverage based on age, location, and celebration style.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={bookingLinks.event3h}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full bg-ink text-canvas hover:opacity-80 transition-opacity duration-200"
                >
                  {isEs ? 'Reservar ahora' : 'Book now'}
                </Link>
                <Link
                  href={`/${locale}/get-quote?cta=birthday-photographer-bottom`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline text-ink hover:bg-ink hover:text-canvas transition-colors duration-200"
                >
                  {isEs ? 'Solicitar presupuesto' : 'Request quote'}
                </Link>
                <Link
                  href={`/${locale}/services/birthday-event-photography`}
                  className="inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] px-7 py-3.5 rounded-full border border-hairline-soft text-ink-muted hover:text-ink hover:border-hairline transition-colors duration-200"
                >
                  {isEs ? 'Ver familia completa' : 'See full family'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}