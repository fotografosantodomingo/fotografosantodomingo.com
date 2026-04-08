import { getPortfolioImages, getReviewStats } from '@/lib/supabase/images'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'
import PortfolioClient from '@/components/portfolio/PortfolioClient'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props) {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Portafolio | Fotografo Santo Domingo - Bodas, Retratos, Drones'
    : 'Portfolio | Santo Domingo Photographer - Weddings, Portraits, Drones'
  const description = isEs
    ? 'Explora nuestro portafolio de fotografía profesional en Santo Domingo: bodas, retratos ejecutivos, drones, eventos y más.'
    : 'Explore our professional photography portfolio in Santo Domingo: weddings, executive portraits, drones, events and more.'
  return {
    title,
    description,
    keywords: isEs
      ? 'portafolio fotógrafo santo domingo, fotos bodas república dominicana, galería fotografía profesional, fotos drone RD, retratos ejecutivos'
      : 'photographer portfolio santo domingo, wedding photos dominican republic, professional photography gallery, drone photos DR, executive portraits',
    alternates: {
      canonical: `${BASE_URL}/${locale}/portfolio`,
      languages: {
        es: `${BASE_URL}/es/portfolio`,
        en: `${BASE_URL}/en/portfolio`,
        'x-default': `${BASE_URL}/es/portfolio`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Portafolio — Babula Shots' : 'Portfolio — Babula Shots',
      description,
      url: `${BASE_URL}/${locale}/portfolio`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=Portafolio&subtitle=Fotografía+Profesional+Santo+Domingo`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Portafolio Fotógrafo Santo Domingo' : 'Santo Domingo Photographer Portfolio',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Portafolio — Babula Shots' : 'Portfolio — Babula Shots',
      description,
      images: [`${BASE_URL}/api/og?title=Portafolio&subtitle=Fotografía+Profesional+Santo+Domingo`],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

export default async function PortfolioPage({ params: { locale } }: Props) {
  const [images, reviewStats] = await Promise.all([
    getPortfolioImages(),
    getReviewStats(),
  ])

  const pageUrl = `${BASE_URL}/${locale}/portfolio`

  const gallerySchema = schemaGenerators.imageGallery(images, pageUrl, locale)
  const businessSchema = schemaGenerators.localBusinessWithRating(reviewStats)
  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: locale === 'es' ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: locale === 'es' ? 'Portafolio' : 'Portfolio', url: pageUrl },
  ])

  return (
    <>
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)}
      />
      {/* ImageGallery JSON-LD — triggers Google multi-image carousel snippet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJsonLd(gallerySchema)}
      />
      {/* LocalBusiness + AggregateRating JSON-LD — triggers star ratings in search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJsonLd(businessSchema)}
      />
      {/* Per-image ImageObject schemas — one script per featured image */}
      {images.filter((img) => img.featured).map((img) => (
        <script
          key={img.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={generateJsonLd(
            schemaGenerators.imageObject(img, locale)
          )}
        />
      ))}

      <PortfolioClient images={images} locale={locale} />
    </>
  )
}
