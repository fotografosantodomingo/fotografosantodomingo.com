import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getPostBySlug, getRelatedPosts } from '@/lib/supabase/blog'
import { CONTACT_INFO } from '@/lib/utils/constants'
import { InstagramPhoneFeed } from '@/components/instagram/InstagramPhoneFeed'

const BASE_URL = 'https://www.fotografosantodomingo.com'
const GOOGLE_REVIEWS_URL = 'https://share.google/aJphPsrVL2VXH9EWH'
const WHATSAPP_URL = `https://wa.me/${CONTACT_INFO.whatsapp}`
const SETMORE_BASE_URL = 'https://babulashotsrd.setmore.com/'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: { locale: string; slug: string }
}

type FaqItem = { question: string; answer: string }
type ReviewItem = { author: string; rating: number; text: string; session_type?: string }
type InternalLink = { text: string; url: string; description?: string }

type ServiceOffer = {
  nameEs: string
  nameEn: string
  descriptionEs: string
  descriptionEn: string
  price: string
  path: string
  icon: string
}

const SERVICE_OFFERS: Record<string, ServiceOffer[]> = {
  wedding: [
    {
      nameEs: 'Wedding Essential',
      nameEn: 'Wedding Essential',
      descriptionEs: 'Cobertura de boda esencial para capturar la historia completa con estilo editorial.',
      descriptionEn: 'Essential wedding coverage to capture the full story with an editorial style.',
      price: 'Desde $499 USD',
      path: 'services/449806f6-d719-40a4-abf7-81078df1667c',
      icon: '💍',
    },
    {
      nameEs: 'Wedding Signature',
      nameEn: 'Wedding Signature',
      descriptionEs: 'Dirección creativa y narrativa completa para parejas que quieren un resultado premium.',
      descriptionEn: 'Creative direction and complete storytelling for couples who want a premium result.',
      price: 'Desde $899 USD',
      path: 'services/95520777-9dc8-4721-9dd3-f33d3bc78256',
      icon: '✨',
    },
  ],
  saona: [
    {
      nameEs: 'Sesión Isla Saona',
      nameEn: 'Saona Island Session',
      descriptionEs: 'Experiencia fotográfica en playa virgen con dirección ligera y resultados naturales.',
      descriptionEn: 'Beach photography experience with light direction and natural results.',
      price: 'Desde $390 USD',
      path: 'services/ecff4d69-6861-4df3-b52b-407f1b117ff7',
      icon: '🏝️',
    },
    {
      nameEs: 'Pre-boda Premium',
      nameEn: 'Pre-wedding Premium',
      descriptionEs: 'Sesión romántica para parejas con look editorial y localizaciones exclusivas.',
      descriptionEn: 'Romantic couple session with editorial style and exclusive locations.',
      price: 'Desde $450 USD',
      path: 'services/1506c6a5-1494-4d7d-bb5b-9f5b80a4d057',
      icon: '📸',
    },
  ],
  general: [
    {
      nameEs: 'Sesión Premium',
      nameEn: 'Premium Session',
      descriptionEs: 'Sesiones personalizadas para parejas, retratos y contenido de marca.',
      descriptionEn: 'Custom sessions for couples, portraits, and brand content.',
      price: 'Desde $290 USD',
      path: 'reserva',
      icon: '📷',
    },
    {
      nameEs: 'Cobertura de Eventos',
      nameEn: 'Event Coverage',
      descriptionEs: 'Cobertura documental y elegante para eventos sociales y corporativos.',
      descriptionEn: 'Documentary and elegant coverage for social and corporate events.',
      price: 'Desde $350 USD',
      path: 'products=76f13f08-20be-43f2-8dd4-4e8902a2bc43',
      icon: '🎉',
    },
  ],
}

function normalizeUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url
  return `/${url}`
}

function splitParagraphs(text: string | null | undefined) {
  if (!text) return []
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return normalized
    .split(/\n\n+|\n(?=[A-ZÁÉÍÓÚÑ0-9])/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function splitSentences(text: string | null | undefined) {
  if (!text) return []
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 40)
}

function buildContentBlocks(paragraphs: string[]) {
  if (paragraphs.length >= 3) return paragraphs
  const combined = paragraphs.join(' ')
  const sentences = splitSentences(combined)
  const blocks: string[] = []
  for (let i = 0; i < sentences.length; i += 2) {
    blocks.push(sentences.slice(i, i + 2).join(' '))
  }
  return blocks.filter(Boolean)
}

function contextualFallbackFaq(locale: string, serviceType: string, location: string): FaqItem[] {
  const isEs = locale === 'es'
  const service = serviceType || (isEs ? 'sesión fotográfica' : 'photo session')

  return isEs
    ? [
        { question: `¿Cuál es el mejor horario para una ${service} en ${location}?`, answer: 'La mejor luz suele ser temprano en la mañana o cerca del atardecer para tonos más cinematográficos.' },
        { question: `¿Qué debo llevar para mi sesión en ${location}?`, answer: 'Recomendamos 2 cambios de ropa, agua, protector solar y accesorios simples que combinen con el entorno.' },
        { question: '¿Cuánto tarda la entrega final?', answer: 'La entrega inicial llega rápido y la galería final editada se comparte en alta resolución.' },
      ]
    : [
        { question: `What is the best time for a ${service} in ${location}?`, answer: 'Golden-hour light is usually best, either early morning or before sunset for a cinematic look.' },
        { question: `What should I bring for my session in ${location}?`, answer: 'We recommend 2 outfit options, water, sun protection, and simple accessories that match the location.' },
        { question: 'How long does final delivery take?', answer: 'A quick preview is delivered first, followed by a fully edited high-resolution gallery.' },
      ]
}

function fallbackReviews(locale: string): ReviewItem[] {
  if (locale === 'es') {
    return [
      { author: 'Ana P.', rating: 5, text: 'Nos encantó la experiencia. Dirección súper clara, fotos naturales y entrega impecable.', session_type: 'Boda en Punta Cana' },
      { author: 'Michael R.', rating: 5, text: 'Desde la planificación hasta la entrega fue excelente. Muy recomendado para parejas destino.', session_type: 'Sesión de pareja' },
      { author: 'Laura C.', rating: 5, text: 'El manejo de luz en playa fue increíble. Las fotos quedaron de revista.', session_type: 'Sesión en Isla Saona' },
    ]
  }

  return [
    { author: 'Ana P.', rating: 5, text: 'We loved the full experience. Clear direction, natural photos, and an excellent final delivery.', session_type: 'Punta Cana Wedding' },
    { author: 'Michael R.', rating: 5, text: 'From planning to final delivery everything was excellent. Highly recommended for destination couples.', session_type: 'Couple Session' },
    { author: 'Laura C.', rating: 5, text: 'The way they handled beach light was incredible. The final photos looked editorial.', session_type: 'Saona Island Session' },
  ]
}

function fallbackInternalLinks(locale: string): InternalLink[] {
  return [
    { text: locale === 'es' ? 'Servicios de fotografía en República Dominicana' : 'Photography Services in the Dominican Republic', url: `/${locale}/services` },
    { text: locale === 'es' ? 'Ver portafolio completo' : 'See full portfolio', url: `/${locale}/portfolio` },
    { text: locale === 'es' ? 'Contactar al fotógrafo' : 'Contact the photographer', url: `/${locale}/contact` },
    { text: locale === 'es' ? 'Guía de sesiones en playa' : 'Beach session guide', url: 'https://babulashotsrd.com/ceremonia-de-matrimonio-en-la-playa-como-preparar/' },
  ]
}

function originalCloudinaryImage(publicId: string | null | undefined, fallbackUrl: string | null | undefined) {
  if (fallbackUrl) {
    return fallbackUrl
  }

  if (publicId) {
    return `https://res.cloudinary.com/dwewurxla/image/upload/f_auto,q_auto/${publicId}`
  }

  return null
}

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const post = await getPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found', robots: { index: false, follow: false } }
  }

  const isEs = locale === 'es'
  const canonicalSlug = isEs ? post.slug_es : post.slug_en
  const title = isEs ? (post.title_es || post.og_title_es || 'Blog') : (post.title_en || post.og_title_en || 'Blog')
  const description = isEs
    ? (post.meta_description_es || post.excerpt_es || '')
    : (post.meta_description_en || post.excerpt_en || '')
  const image = post.cover_image_url || `${BASE_URL}/api/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog/${canonicalSlug}`,
      languages: {
        es: `${BASE_URL}/es/blog/${post.slug_es}`,
        en: `${BASE_URL}/en/blog/${post.slug_en}`,
        'x-default': `${BASE_URL}/es/blog/${post.slug_es}`,
      },
    },
    openGraph: {
      type: 'article',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? (post.og_title_es || post.title_es) : (post.og_title_en || post.title_en),
      description,
      url: `${BASE_URL}/${locale}/blog/${canonicalSlug}`,
      locale: isEs ? 'es_DO' : 'en_US',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at ?? post.published_at,
      images: [{
        url: image,
        width: 1200,
        height: 630,
        alt: isEs ? (post.cover_image_alt_es || post.title_es) : (post.cover_image_alt_en || post.title_en),
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isEs ? (post.og_title_es || post.title_es) : (post.og_title_en || post.title_en),
      description,
      images: [image],
    },
  }
}

export default async function BlogPostPage({ params: { locale, slug } }: Props) {
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const isEs = locale === 'es'
  const postSlug = isEs ? post.slug_es : post.slug_en

  if (slug !== postSlug) {
    permanentRedirect(`/${locale}/blog/${postSlug}`)
  }

  const title = isEs ? post.title_es : post.title_en
  const excerpt = (isEs ? post.excerpt_es : post.excerpt_en) || ''
  const content = (isEs ? post.content_es : post.content_en) || ''
  const introParagraphs = splitParagraphs(isEs ? post.intro_es : post.intro_en)
  const locationParagraphs = splitParagraphs(isEs ? post.location_section_es : post.location_section_en)
  const faq = ((isEs ? post.faq_es : post.faq_en) || []) as FaqItem[]
  const reviews = ((isEs ? post.reviews_es : post.reviews_en) || []) as ReviewItem[]
  const internalLinks = ((isEs ? post.internal_links_es : post.internal_links_en) || []) as InternalLink[]

  const selectedFaq = faq.length > 0
    ? faq
    : contextualFallbackFaq(locale, post.service_type || '', post.location || post.geo_city || (isEs ? 'República Dominicana' : 'Dominican Republic'))
  const selectedReviews = reviews.length > 0 ? reviews : fallbackReviews(locale)
  const selectedLinks = internalLinks.length > 0 ? internalLinks : fallbackInternalLinks(locale)

  const serviceKey = (post.service_type || '').toLowerCase().includes('saona') ? 'saona' : (post.service_type || 'general')
  const serviceOffers = SERVICE_OFFERS[serviceKey] || SERVICE_OFFERS.general
  const setmoreUrl = post.setmore_service_url || `${SETMORE_BASE_URL}${serviceOffers[0]?.path || 'reserva'}`

  const galleryImageUrl = originalCloudinaryImage(post.cover_image_public_id, post.cover_image_url)

  let relatedPosts = [] as Awaited<ReturnType<typeof getRelatedPosts>>
  try {
    relatedPosts = await getRelatedPosts(post.service_type ?? 'general', slug, locale as 'es' | 'en')
  } catch (error) {
    console.error('related posts lookup failed:', error)
  }

  const locationLabel = post.location || post.geo_city || (isEs ? 'República Dominicana' : 'Dominican Republic')
  const articleParagraphs = splitParagraphs(content)
  const contentBlocks = buildContentBlocks(articleParagraphs)

  const pageUrl = `${BASE_URL}/${locale}/blog/${postSlug}`
  const imageUrl = post.cover_image_url || `${BASE_URL}/api/og?title=${encodeURIComponent(title)}`
  const heroImageUrl = originalCloudinaryImage(post.cover_image_public_id, post.cover_image_url) || imageUrl

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: title,
        description: isEs ? (post.meta_description_es || excerpt) : (post.meta_description_en || excerpt),
        inLanguage: locale,
        primaryImageOfPage: { '@type': 'ImageObject', url: imageUrl },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: isEs ? 'Inicio' : 'Home', item: `${BASE_URL}/${locale}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/${locale}/blog/` },
            { '@type': 'ListItem', position: 3, name: title, item: pageUrl },
          ],
        },
      },
      {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        headline: title,
        description: isEs ? (post.meta_description_es || excerpt) : (post.meta_description_en || excerpt),
        image: { '@type': 'ImageObject', url: imageUrl, width: 1200, height: 630 },
        author: { '@id': `${BASE_URL}/#business` },
        publisher: { '@id': `${BASE_URL}/#business` },
        datePublished: post.published_at,
        dateModified: post.updated_at ?? post.published_at,
        inLanguage: locale,
        mainEntityOfPage: pageUrl,
      },
      {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': `${BASE_URL}/#business`,
        name: 'Fotografo Santo Domingo',
        url: BASE_URL,
        telephone: '+1-809-720-9547',
        email: 'info@fotografosantodomingo.com',
        image: imageUrl,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Santo Domingo',
          addressRegion: 'Distrito Nacional',
          addressCountry: 'DO',
        },
        sameAs: [
          'https://www.instagram.com/babulashotsrd',
          GOOGLE_REVIEWS_URL,
          'https://www.babulashotsrd.com',
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '162',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: isEs ? `${post.service_type || 'Fotografía Profesional'} en ${locationLabel}` : `${post.service_type || 'Professional Photography'} in ${locationLabel}`,
        serviceType: post.schema_service_type || post.service_type || 'Photography',
        provider: { '@id': `${BASE_URL}/#business` },
        areaServed: [
          { '@type': 'City', name: post.geo_city || locationLabel },
          { '@type': 'Country', name: 'República Dominicana' },
        ],
        image: imageUrl,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: setmoreUrl,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: selectedFaq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
      ...selectedReviews.slice(0, 3).map((review) => ({
        '@type': 'Review',
        itemReviewed: { '@id': `${BASE_URL}/#business` },
        author: { '@type': 'Person', name: review.author },
        reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5 },
        reviewBody: review.text,
      })),
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }} />
      <main className="min-h-screen bg-gray-950 text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-700/30 via-cyan-500/10 to-emerald-500/20" />
          <div className="container relative mx-auto px-4 py-10 md:py-16">
            <div className="mb-6">
              <Link href={`/${locale}/blog`} className="text-sm font-semibold text-sky-300 hover:text-sky-200">
                {isEs ? '← Volver al blog' : '← Back to blog'}
              </Link>
            </div>

            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <h1 className="mb-4 text-4xl font-black leading-tight md:text-5xl lg:text-6xl">{title}</h1>
                {excerpt && <p className="mb-6 text-lg text-gray-200 md:text-xl">{excerpt}</p>}
                <div className="flex flex-wrap gap-3">
                  <a href={setmoreUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-gray-900 transition hover:bg-gray-200">
                    {isEs ? 'Reservar Sesión' : 'Book Session'}
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rounded-full border border-green-400 bg-green-500/20 px-5 py-3 text-sm font-bold text-green-200 transition hover:bg-green-500/30">
                    WhatsApp
                  </a>
                </div>
                <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-sm font-semibold text-amber-300 hover:text-amber-200">
                  ⭐ 4.9 / 162 {isEs ? 'reseñas en Google' : 'Google reviews'}
                </a>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/30 p-3 shadow-2xl md:p-4">
                <img
                  src={heroImageUrl}
                  alt={isEs ? (post.cover_image_alt_es || title) : (post.cover_image_alt_en || title)}
                  className="h-auto max-h-[75vh] w-full rounded-xl object-contain"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-4xl space-y-6 text-lg leading-9 text-gray-200 md:text-xl">
            {(introParagraphs.length > 0 ? introParagraphs : articleParagraphs.slice(0, 2)).map((paragraph, index) => (
              <p key={`intro-${index}`}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-14">
          <h2 className="mb-6 text-3xl font-extrabold">{isEs ? 'Galería de la sesión' : 'Session gallery'}</h2>
          {galleryImageUrl && (
            <figure className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900 p-3 md:p-5">
              <img
                src={galleryImageUrl}
                alt={`${title} - ${isEs ? 'fotógrafo en' : 'photographer in'} ${locationLabel}`}
                className="h-auto max-h-[80vh] w-full rounded-xl object-contain"
                loading="eager"
              />
              <figcaption className="px-2 pt-4 text-sm text-gray-300 md:text-base">
                {isEs ? `Imagen original de la sesión en ${locationLabel}` : `Original session photo in ${locationLabel}`}
              </figcaption>
            </figure>
          )}
          <div className="mt-6">
            <Link href={`/${locale}/portfolio`} className="inline-block rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-500">
              {isEs ? 'Ver Galería Completa' : 'See Full Gallery'}
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-14">
          <h2 className="mb-6 text-3xl font-extrabold">{isEs ? `Por qué ${locationLabel} es especial para fotos` : `Why ${locationLabel} is special for photos`}</h2>
          <div className="mx-auto max-w-4xl space-y-5 text-lg leading-9 text-gray-200 md:text-xl">
            {(locationParagraphs.length > 0 ? locationParagraphs : articleParagraphs.slice(2, 6)).map((paragraph, index) => (
              <p key={`location-${index}`}>{paragraph}</p>
            ))}
          </div>
        </section>

        {contentBlocks.length > 0 && (
          <section className="container mx-auto px-4 pb-14">
            <h2 className="mb-6 text-3xl font-extrabold">{isEs ? 'Guía completa de la sesión' : 'Complete session guide'}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {contentBlocks.slice(0, 6).map((block, index) => (
                <article key={`content-block-${index}`} className="rounded-2xl border border-white/10 bg-gray-900 p-6">
                  <h3 className="mb-3 text-xl font-bold text-sky-300">
                    {isEs ? `Punto clave ${index + 1}` : `Key point ${index + 1}`}
                  </h3>
                  <p className="text-base leading-8 text-gray-200 md:text-lg">{block}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 pb-14">
          <h2 className="mb-6 text-3xl font-extrabold">{isEs ? `Servicios de Fotografía en ${locationLabel}` : `Photography Services in ${locationLabel}`}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {serviceOffers.map((offer) => (
              <article key={offer.path} className="rounded-2xl border border-white/10 bg-gray-900 p-6">
                <div className="mb-3 text-2xl">{offer.icon}</div>
                <h3 className="mb-2 text-xl font-bold">{isEs ? offer.nameEs : offer.nameEn}</h3>
                <p className="mb-4 text-gray-300">{isEs ? offer.descriptionEs : offer.descriptionEn}</p>
                <p className="mb-4 text-sm font-semibold text-emerald-300">{offer.price}</p>
                <a href={`${SETMORE_BASE_URL}${offer.path}`} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-sky-300 hover:text-sky-300">
                  {isEs ? 'Reservar este servicio' : 'Book this service'}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-14">
          <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 p-7 text-center">
            <h2 className="mb-4 text-2xl font-extrabold">{isEs ? `¿Listo para tu sesión en ${locationLabel}?` : `Ready for your session in ${locationLabel}?`}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={setmoreUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-gray-900">{isEs ? 'Reservar ahora' : 'Book now'}</a>
              <a href="https://calendly.com/info-vym7/video-llamada" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/30 px-5 py-2 text-sm font-bold">{isEs ? 'Videollamada' : 'Video call'}</a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rounded-full border border-green-400 px-5 py-2 text-sm font-bold text-green-200">WhatsApp</a>
              <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="rounded-full border border-amber-400 px-5 py-2 text-sm font-bold text-amber-200">Google</a>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-14">
          <h2 className="mb-2 text-3xl font-extrabold">{isEs ? 'Lo Que Dicen Nuestros Clientes' : 'What Our Clients Say'}</h2>
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="mb-6 inline-block text-sm font-semibold text-amber-300">
            ⭐⭐⭐⭐⭐ 4.9 de 5 (162 reseñas en Google)
          </a>
          <div className="grid gap-5 md:grid-cols-2">
            {selectedReviews.slice(0, 3).map((review, index) => (
              <article key={`${review.author}-${index}`} className="rounded-2xl border border-white/10 bg-gray-900 p-6">
                <p className="mb-3 text-amber-300">{'⭐'.repeat(Math.max(1, Math.min(5, review.rating || 5)))}</p>
                <p className="mb-4 text-gray-200">{review.text}</p>
                <p className="text-sm font-semibold text-white">{review.author}</p>
                {review.session_type && <p className="text-sm text-gray-400">{review.session_type}</p>}
              </article>
            ))}
          </div>
        </section>

        <InstagramPhoneFeed locale={locale} currentSlug={postSlug} />

        <section className="container mx-auto px-4 pb-14">
          <h2 className="mb-6 text-3xl font-extrabold">{isEs ? 'Ver Más Trabajos' : 'See More Work'}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <a href={`/${locale}/portfolio`} className="rounded-xl border border-white/10 bg-gray-900 p-5 hover:border-sky-400">
              <h3 className="mb-2 text-xl font-bold">{isEs ? 'Portafolio Principal' : 'Main Portfolio'}</h3>
              <p className="text-gray-300">{isEs ? 'Explora bodas, parejas, retratos y sesiones en playa.' : 'Explore weddings, couples, portraits, and beach sessions.'}</p>
            </a>
            <a href="https://babulashotsprevievshots.pic-time.com/-fotografobodapuntacanard" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/10 bg-gray-900 p-5 hover:border-sky-400">
              <h3 className="mb-2 text-xl font-bold">{isEs ? 'Galería de Bodas' : 'Wedding Gallery'}</h3>
              <p className="text-gray-300">{isEs ? 'Historias reales de bodas destino en República Dominicana.' : 'Real destination wedding stories in the Dominican Republic.'}</p>
            </a>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-14">
          <h2 className="mb-6 text-3xl font-extrabold">{isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}</h2>
          <div className="space-y-3">
            {selectedFaq.slice(0, 6).map((item, index) => (
              <details key={`${item.question}-${index}`} className="rounded-xl border border-white/10 bg-gray-900 p-4">
                <summary className="cursor-pointer text-lg font-semibold">{item.question}</summary>
                <p className="mt-3 text-gray-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-14">
          <h2 className="mb-4 text-2xl font-extrabold">{isEs ? 'Enlaces recomendados' : 'Recommended links'}</h2>
          <p className="text-lg text-gray-300">
            {selectedLinks.map((item, index) => (
              <span key={`${item.url}-${index}`}>
                <a href={normalizeUrl(item.url)} className="font-semibold text-sky-300 hover:text-sky-200">{item.text}</a>
                {item.description ? ` — ${item.description}` : ''}
                {index < selectedLinks.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 p-7 text-center">
            <h2 className="mb-4 text-2xl font-extrabold">{isEs ? 'Reserva tu fecha hoy mismo' : 'Book your date today'}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={setmoreUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-gray-900">{isEs ? 'Reservar ahora' : 'Book now'}</a>
              <a href="https://calendly.com/info-vym7/video-llamada" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/30 px-5 py-2 text-sm font-bold">{isEs ? 'Videollamada' : 'Video call'}</a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rounded-full border border-green-400 px-5 py-2 text-sm font-bold text-green-200">WhatsApp</a>
              <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="rounded-full border border-amber-400 px-5 py-2 text-sm font-bold text-amber-200">Google</a>
            </div>
          </div>
        </section>

        {relatedPosts.length > 0 && (
          <section className="container mx-auto border-t border-white/10 px-4 py-14">
            <h2 className="mb-6 text-3xl font-extrabold">{isEs ? 'Más artículos relacionados' : 'Related articles'}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="overflow-hidden rounded-xl border border-white/10 bg-gray-900">
                  <div className="relative aspect-video">
                    <Image
                      src={relatedPost.cover_image_thumbnail_url || imageUrl}
                      alt={relatedPost.cover_image_alt || relatedPost.title}
                      fill
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-bold">
                      <Link href={`/${locale}/blog/${relatedPost.slug}`} className="hover:text-sky-300">{relatedPost.title}</Link>
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-300">{relatedPost.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
