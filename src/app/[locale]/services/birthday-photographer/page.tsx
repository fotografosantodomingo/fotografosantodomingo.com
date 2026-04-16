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

const bookingLinks = {
  quincenara10: 'https://babulashotsrd.setmore.com/book?step=staff&products=b31e3558-0a5f-4e1b-8bc0-044ef171c706&type=service',
  quincenara15: 'https://babulashotsrd.setmore.com/book?step=staff&products=2b901454-3c03-44f0-a53b-b4e6f6d9687a&type=service',
  quincenaraVip: 'https://babulashotsrd.setmore.com/book?step=staff&products=413dd972-ccbb-41db-8ac5-6424fc995ee7&type=service',
  event3h: 'https://babulashotsrd.setmore.com/book?step=time-slot&products=76f13f08-20be-43f2-8dd4-4e8902a2bc43&type=service&staff=a0f4eb7f-9ac4-412e-8b02-c60ede177919&staffSelected=true',
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
      <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-white">
        <section className="relative overflow-hidden border-b border-slate-200 dark:border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/30 via-sky-100/20 to-emerald-100/30 dark:from-sky-700/20 dark:via-cyan-600/10 dark:to-emerald-600/20" />
          <div className="container relative mx-auto px-4 py-14 md:py-20">
            <span className="inline-block rounded-full border border-sky-400/40 bg-sky-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
              {isEs ? 'Servicio Especializado' : 'Specialized Service'}
            </span>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              {isEs ? 'Fotografo de Cumpleanos en Santo Domingo, Punta Cana y Boca Chica' : 'Birthday Photographer in Santo Domingo, Punta Cana, and Boca Chica'}
            </h1>
            <p className="mt-5 max-w-3xl text-lg text-slate-700 dark:text-gray-300 md:text-xl">
              {isEs
                ? 'Cobertura profesional de cumpleaños infantiles, cumpleaños en playa, sesiones en estudio y quinceañeras. Creamos recuerdos reales con dirección clara y estilo premium.'
                : 'Professional coverage for kids birthdays, beach birthdays, studio sessions, and quinceañeras. We create real memories with clear direction and premium style.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={bookingLinks.event3h} target="_blank" rel="noopener noreferrer" className="rounded-full bg-sky-600 px-6 py-3 text-sm font-bold text-white hover:bg-sky-500">
                {isEs ? 'Reservar Cobertura de Evento (3h)' : 'Book Event Coverage (3h)'}
              </a>
              <a href={bookingLinks.quincenara15} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                {isEs ? 'Reservar Quinceañera' : 'Book Quinceañera'}
              </a>
              <Link href={`/${locale}/portfolio?category=birthday`} className="rounded-full border border-emerald-500 px-6 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-200 dark:hover:bg-emerald-500/10">
                {isEs ? 'Ver Portafolio de Cumpleaños' : 'View Birthday Portfolio'}
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            {isEs ? 'Posibilidades de sesiones de cumpleaños' : 'Birthday session possibilities'}
          </h2>
          <p className="mt-3 max-w-3xl text-base text-slate-600 dark:text-gray-300 md:text-lg">
            {isEs
              ? 'Cada cumpleaños tiene ritmo y energía propia. Estas galerías muestran escenarios reales que cubrimos en República Dominicana con enfoque en familia, emoción y narrativa visual.'
              : 'Each birthday has its own pace and energy. These galleries show real scenarios we cover across the Dominican Republic with a focus on family, emotion, and visual storytelling.'}
          </p>

          <div className="mt-10 space-y-12">
            {scenarios.map((scenario) => (
              <article key={scenario.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900 md:p-7">
                <h3 className="text-2xl font-bold">{isEs ? scenario.title.es : scenario.title.en}</h3>
                <p className="mt-3 text-slate-600 dark:text-gray-300">{isEs ? scenario.description.es : scenario.description.en}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {scenario.images.map((image, index) => (
                    <figure key={`${scenario.id}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-black/30">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={image.url}
                          alt={isEs ? image.alt.es : image.alt.en}
                          title={isEs ? image.title.es : image.title.en}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <figcaption className="px-3 py-2 text-xs text-slate-600 dark:text-gray-300">
                        {isEs ? image.title.es : image.title.en}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-100/70 py-12 dark:border-white/10 dark:bg-gray-900/60 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-extrabold md:text-4xl">{isEs ? 'Reservas y paquetes recomendados' : 'Recommended bookings and packages'}</h2>
            <p className="mt-3 max-w-3xl text-slate-600 dark:text-gray-300">
              {isEs
                ? 'Para cumpleaños generales recomendamos cobertura de evento 3 horas. Para quinceañeras puedes reservar paquete esencial o VIP según nivel de producción.'
                : 'For general birthdays we recommend the 3-hour event coverage. For quinceañeras, choose Essential or VIP depending on production level.'}
            </p>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                <h3 className="text-xl font-bold">{isEs ? 'Cobertura de Evento - 3 horas' : 'Event Coverage - 3 hours'}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
                  {isEs ? 'Servicio general para cumpleaños infantiles, escolares y familiares. Reserva con 50% para asegurar fecha.' : 'General service for kids, school, and family birthdays. 50% booking deposit to secure your date.'}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-gray-300">
                  <li>{isEs ? 'Cobertura documental de momentos clave, retratos grupales y detalles de decoracion.' : 'Documentary coverage of key moments, group portraits, and decor details.'}</li>
                  <li>{isEs ? 'Entrega digital editada para compartir con familia e invitados.' : 'Edited digital delivery ready to share with family and guests.'}</li>
                  <li>{isEs ? 'Reserva 50% para confirmar fecha y horario.' : '50% booking deposit required to lock date and time.'}</li>
                </ul>
                <a href={bookingLinks.event3h} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500">
                  {isEs ? 'Reservar cobertura de evento' : 'Book event coverage'}
                </a>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                <h3 className="text-xl font-bold">{isEs ? 'Quinceañera: Paquete Esencial (10 fotos)' : 'Quinceañera: Essential Package (10 photos)'}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
                  {isEs ? '1 hora, maquillaje incluido, asesoría de vestuario y 10 fotos premium editadas.' : '1 hour, makeup included, wardrobe guidance, and 10 premium edited photos.'}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-gray-300">
                  <li>{isEs ? 'Sesion de 1 hora en estudio o locacion exterior.' : '1-hour session in studio or outdoor location.'}</li>
                  <li>{isEs ? 'Maquillaje y peinado basico con acabado natural.' : 'Basic makeup and hairstyling with a natural finish.'}</li>
                  <li>{isEs ? 'Direccion experta de pose y expresion para estilo elegante.' : 'Expert pose and expression direction for an elegant style.'}</li>
                  <li>{isEs ? 'Albun digital listo para compartir con familia y amigos.' : 'Digital album ready to share with family and friends.'}</li>
                </ul>
                <a href={bookingLinks.quincenara10} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-500">
                  {isEs ? 'Reservar Esencial 10' : 'Book Essential 10'}
                </a>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                <h3 className="text-xl font-bold">{isEs ? 'Quinceañera: Paquete Esencial (15 fotos)' : 'Quinceañera: Essential Package (15 photos)'}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
                  {isEs ? '1 hora, maquillaje incluido, dirección de pose y 15 fotos premium con look moderno y atemporal.' : '1 hour, makeup included, pose direction, and 15 premium photos with a modern timeless style.'}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-gray-300">
                  <li>{isEs ? '15 fotografias premium editadas con acabado profesional.' : '15 premium edited photos with professional finishing.'}</li>
                  <li>{isEs ? 'Asesoria de vestuario, colores y accesorios.' : 'Wardrobe, color, and accessories guidance.'}</li>
                  <li>{isEs ? 'Sesion orientada a imagen moderna, fresca y atemporal.' : 'Session designed for a modern, fresh, and timeless visual style.'}</li>
                  <li>{isEs ? 'Reserva del 50% para asegurar fecha de sesion.' : '50% booking deposit required to secure your session date.'}</li>
                </ul>
                <a href={bookingLinks.quincenara15} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-500">
                  {isEs ? 'Reservar Esencial 15' : 'Book Essential 15'}
                </a>
              </article>

              <article className="rounded-2xl border border-amber-400/50 bg-white p-6 shadow-sm dark:border-amber-300/30 dark:bg-gray-900">
                <h3 className="text-xl font-bold">{isEs ? 'Quinceañera: Paquete VIP Exclusivo' : 'Quinceañera: VIP Exclusive Package'}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
                  {isEs ? '20 fotos premium, experiencia extendida, maquillaje y peinado profesional, atención VIP y entregables de lujo.' : '20 premium photos, extended experience, professional makeup/hair, VIP support, and luxury deliverables.'}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-gray-300">
                  <li>{isEs ? 'Sesion extendida para multiples looks y locaciones.' : 'Extended session for multiple looks and locations.'}</li>
                  <li>{isEs ? '20 fotos premium + impresiones fisicas seleccionadas.' : '20 premium photos plus selected physical prints.'}</li>
                  <li>{isEs ? 'Maquillaje y peinado profesional completo con trato VIP.' : 'Full professional makeup and hairstyling with VIP treatment.'}</li>
                  <li>{isEs ? 'Inversion referencial: USD 600 + ITBIS (18%), reserva 50%.' : 'Reference investment: USD 600 + 18% tax, with 50% booking deposit.'}</li>
                </ul>
                <a href={bookingLinks.quincenaraVip} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-400">
                  {isEs ? 'Reservar VIP Quinceañera' : 'Book VIP Quinceañera'}
                </a>
              </article>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="text-3xl font-extrabold md:text-4xl">{isEs ? 'Preguntas frecuentes' : 'Frequently asked questions'}</h2>
          <div className="mt-8 space-y-3">
            {(isEs ? faqItems.es : faqItems.en).map((item) => (
              <details key={item.q} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900">
                <summary className="cursor-pointer text-lg font-semibold">{item.q}</summary>
                <p className="mt-3 text-slate-600 dark:text-gray-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-100 via-cyan-50 to-slate-100 p-7 text-center dark:border-white/15 dark:bg-gradient-to-r dark:from-slate-900 dark:via-cyan-950 dark:to-slate-900">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isEs ? 'Listo para reservar tu fotógrafo de cumpleaños?' : 'Ready to book your birthday photographer?'}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-gray-300">
              {isEs
                ? 'Te ayudamos a diseñar una cobertura clara según edad, locación y tipo de celebración. Reserva online o solicita una propuesta personalizada.'
                : 'We help you design the right coverage based on age, location, and celebration style. Book online or request a custom proposal.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={bookingLinks.event3h} target="_blank" rel="noopener noreferrer" className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-500">
                {isEs ? 'Reservar ahora' : 'Book now'}
              </a>
              <Link href={`/${locale}/get-quote`} className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-white/30 dark:bg-transparent dark:text-white dark:hover:bg-white/10">
                {isEs ? 'Solicitar presupuesto' : 'Request quote'}
              </Link>
              <Link href={`/${locale}/services/event-photography`} className="rounded-full border border-emerald-500 bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 dark:bg-transparent dark:text-emerald-200 dark:hover:bg-emerald-500/10">
                {isEs ? 'Ver cobertura de eventos' : 'See event coverage'}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}