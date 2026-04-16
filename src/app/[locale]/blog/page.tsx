import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { getPublishedPosts } from '@/lib/supabase/blog'
import { CONTACT_INFO } from '@/lib/utils/constants'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'

const BASE_URL = 'https://www.fotografosantodomingo.com'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: { locale: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Blog de Fotografía — Consejos, Bodas & Tendencias | Babula Shots'
    : 'Photography Blog — Tips, Weddings & Trends | Babula Shots'
  const description = isEs
    ? 'Consejos de fotografía, guías de bodas y recomendaciones de locaciones en República Dominicana del fotógrafo profesional Michal Babula. Planifica tu sesión perfecta.'
    : 'Photography tips, wedding guides, and DR location recommendations from professional photographer Michal Babula. Plan your perfect photo session.'
  return {
    title,
    description,
    keywords: isEs
      ? 'blog fotografía santo domingo, consejos fotografía bodas, tendencias fotografía dominicana, sesiones familiares RD, drone fotografía caribe'
      : 'photography blog santo domingo, wedding photography tips, dominican photography trends, family sessions DR, drone photography caribbean',
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
      languages: {
        es: `${BASE_URL}/es/blog`,
        en: `${BASE_URL}/en/blog`,
        'x-default': `${BASE_URL}/es/blog`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: isEs ? 'Blog de Fotografía — Babula Shots' : 'Photography Blog — Babula Shots',
      description,
      url: `${BASE_URL}/${locale}/blog`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=Blog+de+Fotografía&subtitle=Consejos+·+Bodas+·+Tendencias`,
        width: 1200,
        height: 630,
        alt: isEs ? 'Blog de Fotografía — Babula Shots' : 'Photography Blog — Babula Shots',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: isEs ? 'Blog de Fotografía — Babula Shots' : 'Photography Blog — Babula Shots',
      description,
      images: [`${BASE_URL}/api/og?title=Blog+de+Fotografía&subtitle=Consejos+·+Bodas+·+Tendencias`],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

export default async function BlogPage({ params: { locale }, searchParams }: Props) {
  const t = await getTranslations({ locale })

  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : ''
  const categoryFilter = typeof searchParams.category === 'string' ? searchParams.category : ''

  const allPosts = await getPublishedPosts(locale as 'es' | 'en')
  let filteredPosts = allPosts

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredPosts = allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.service_type?.toLowerCase().includes(q)
    )
  } else if (categoryFilter) {
    filteredPosts = allPosts.filter((p) => p.service_type === categoryFilter)
  }

  const categories = [
    { key: 'wedding', label: t('blog.categories_list.wedding') },
    { key: 'portrait', label: t('blog.categories_list.portrait') },
    { key: 'drone', label: t('blog.categories_list.drone') },
    { key: 'commercial', label: t('blog.categories_list.commercial') },
    { key: 'tips', label: t('blog.categories_list.tips') },
    { key: 'behind_scenes', label: t('blog.categories_list.behind_scenes') },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: locale === 'es' ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: locale === 'es' ? 'Blog' : 'Blog', url: `${BASE_URL}/${locale}/blog` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative bg-gray-950 py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('blog.title')}
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              {t('blog.subtitle')}
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <form method="get" className="flex gap-2">
                <input
                  type="text"
                  name="q"
                  placeholder={t('blog.search')}
                  defaultValue={searchQuery}
                  className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  🔍
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 bg-gray-950 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/${locale}/blog`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !categoryFilter && !searchQuery
                  ? 'bg-sky-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {t('blog.latest')}
            </Link>
            {categories.map(category => (
              <Link
                key={category.key}
                href={`/${locale}/blog?category=${category.key}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === category.key
                    ? 'bg-sky-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* All Posts Grid */}
      <section className="py-16 bg-gray-950">
        <div className="container mx-auto px-4">
          {searchQuery && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('blog.search')} &ldquo;{searchQuery}&rdquo;
              </h2>
              <p className="text-gray-400">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} found
              </p>
            </div>
          )}

          {categoryFilter && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {categories.find(cat => cat.key === categoryFilter)?.label}
              </h2>
              <p className="text-gray-400">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
              </p>
            </div>
          )}

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t('blog.no_results')}
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search terms or browse all posts.
              </p>
              <Link
                href={`/${locale}/blog`}
                className="btn-primary"
              >
                {t('blog.back_to_blog')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <article key={post.slug} className="bg-gray-900 rounded-xl border border-white/10 overflow-hidden hover:border-sky-500/40 transition-colors">
                  <div className="relative aspect-video bg-black/40">
                    <Image
                      src={post.cover_image_thumbnail_url || `${BASE_URL}/api/og?title=Babula+Shots`}
                      alt={post.cover_image_alt || post.title}
                      title={post.cover_image_title || post.cover_image_alt || post.title}
                      fill
                      loading="lazy"
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>{formatDate(post.published_at)}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">
                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="hover:text-sky-400 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-end">
                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="text-sky-400 hover:text-sky-300 font-medium text-sm"
                      >
                        {t('blog.read_more')}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gray-900 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('footer.newsletter.title')}
          </h2>
          <p className="text-xl mb-8 text-gray-400 max-w-2xl mx-auto">
            {t('footer.newsletter.subtitle')}
          </p>

          <div className="max-w-md mx-auto">
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-semibold"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-950 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Work Together?
          </h2>
          <p className="text-xl mb-8 text-gray-400 max-w-2xl mx-auto">
            Have questions about photography? Let&apos;s discuss your project and create something amazing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              WhatsApp: {CONTACT_INFO.phone}
            </a>
            <Link
              href={`/${locale}/contact`}
              className="bg-sky-600 hover:bg-sky-700 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              {t('contact.form.send')}
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  )
}