import { getPortfolioImages, getReviewStats } from '@/lib/supabase/images'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'
import PortfolioClient from '@/components/portfolio/PortfolioClient'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props) {
  return {
    title: locale === 'es'
      ? 'Portafolio | Fotografo Santo Domingo - Bodas, Retratos, Drones'
      : 'Portfolio | Santo Domingo Photographer - Weddings, Portraits, Drones',
    description: locale === 'es'
      ? 'Explora nuestro portafolio de fotografía profesional en Santo Domingo: bodas, retratos ejecutivos, drones, eventos y más.'
      : 'Explore our professional photography portfolio in Santo Domingo: weddings, executive portraits, drones, events and more.',
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
      url: `${BASE_URL}/${locale}/portfolio`,
      images: [{ url: `${BASE_URL}/api/og?title=Portafolio&subtitle=Fotografía+Profesional+Santo+Domingo`, width: 1200, height: 630 }],
    },
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

  return (
    <>
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
