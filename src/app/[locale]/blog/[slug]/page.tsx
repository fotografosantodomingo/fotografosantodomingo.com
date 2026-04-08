import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getPostBySlug, getRelatedPosts } from '@/lib/blog/posts'
import { getPostBySlugFromDb, getRelatedPostsFromDb } from '@/lib/supabase/blog'
import { CONTACT_INFO } from '@/lib/utils/constants'
import { schemaGenerators, generateJsonLd } from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string; slug: string }
}

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const post = await getPostBySlugFromDb(slug)

  if (!post) {
    return { title: 'Post Not Found', robots: { index: false, follow: false } }
  }

  const title = locale === 'es' ? post.seo.titleEs : post.seo.title
  const description = locale === 'es' ? post.seo.descriptionEs : post.seo.description
  const keywords = locale === 'es' ? post.seo.keywordsEs : post.seo.keywords

  return {
    title,
    description,
    keywords: keywords.join(', '),
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog/${slug}`,
      languages: {
        es: `${BASE_URL}/es/blog/${slug}`,
        en: `${BASE_URL}/en/blog/${slug}`,
        'x-default': `${BASE_URL}/es/blog/${slug}`,
      },
    },
    openGraph: {
      type: 'article',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title,
      description,
      url: `${BASE_URL}/${locale}/blog/${slug}`,
      locale: locale === 'es' ? 'es_DO' : 'en_US',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: `${BASE_URL}/api/og?title=${encodeURIComponent(title)}`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title,
      description,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(title)}`],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

export default async function BlogPostPage({ params: { locale, slug } }: Props) {
  const t = await getTranslations({ locale })

  const post = await getPostBySlugFromDb(slug)
  const relatedPosts = post ? await getRelatedPostsFromDb(post, 3) : []

  if (!post) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const content = locale === 'es' ? post.contentEs : post.content
  const title = locale === 'es' ? post.titleEs : post.title

  // Split content into paragraphs for better rendering
  const paragraphs = content.split('\n\n').filter(p => p.trim())

  const articleSchema = schemaGenerators.article(post, locale)
  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: locale === 'es' ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: 'Blog', url: `${BASE_URL}/${locale}/blog` },
    { name: title, url: `${BASE_URL}/${locale}/blog/${slug}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(articleSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section with Post Info */}
      <section className="relative bg-gray-950 pt-20 pb-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <Link
                href={`/${locale}/blog`}
                className="text-sky-400 hover:text-sky-300 font-medium"
              >
                ← {t('blog.back_to_blog')}
              </Link>
            </nav>

            {/* Post Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                <span>{formatDate(post.publishedAt)}</span>
                <span>•</span>
                <span>{post.readingTime} {t('blog.reading_time')}</span>
                <span>•</span>
                <span>{t('blog.by')} {post.author}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {post.tags.map(tag => (
                  <span key={tag} className="bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Featured Image Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl mb-8 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl opacity-20">
                  {post.category === 'wedding' ? '💍' :
                   post.category === 'portrait' ? '👤' :
                   post.category === 'drone' ? '🚁' :
                   post.category === 'commercial' ? '📸' : '📝'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 bg-gray-950">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto">
            <div className="prose prose-lg prose-invert max-w-none">
              {paragraphs.map((paragraph, index) => {
                // Handle headings
                if (paragraph.startsWith('# ')) {
                  return (
                    <h2 key={index} className="text-3xl font-bold text-white mt-12 mb-6 first:mt-0">
                      {paragraph.replace('# ', '')}
                    </h2>
                  )
                }

                // Handle subheadings
                if (paragraph.startsWith('## ')) {
                  return (
                    <h3 key={index} className="text-2xl font-semibold text-white mt-10 mb-4">
                      {paragraph.replace('## ', '')}
                    </h3>
                  )
                }

                // Handle lists (basic implementation)
                if (paragraph.startsWith('- ')) {
                  const listItems = paragraph.split('\n').filter(item => item.trim())
                  return (
                    <ul key={index} className="list-disc list-inside space-y-2 my-6 text-gray-300">
                      {listItems.map((item, itemIndex) => (
                        <li key={itemIndex}>{item.replace('- ', '')}</li>
                      ))}
                    </ul>
                  )
                }

                // Regular paragraphs
                return (
                  <p key={index} className="text-gray-300 leading-relaxed mb-6">
                    {paragraph}
                  </p>
                )
              })}
            </div>

            {/* Share Section */}
            <div className="border-t border-gray-700 pt-8 mt-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 font-medium">{t('blog.share')}:</span>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <span className="text-sm">f</span>
                    </button>
                    <button className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors">
                      <span className="text-sm">t</span>
                    </button>
                    <button className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">
                      <span className="text-sm">📷</span>
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  {t('blog.published_on')} {formatDate(post.publishedAt)}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-white text-center mb-12">
                {t('blog.related_posts')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map(relatedPost => (
                  <article key={relatedPost.slug} className="bg-gray-950 rounded-xl border border-white/10 overflow-hidden hover:border-sky-500/40 transition-colors">
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-700 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl opacity-20">
                          {relatedPost.category === 'wedding' ? '💍' :
                           relatedPost.category === 'portrait' ? '👤' :
                           relatedPost.category === 'drone' ? '🚁' :
                           relatedPost.category === 'commercial' ? '📸' : '📝'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>{formatDate(relatedPost.publishedAt)}</span>
                        <span>•</span>
                        <span>{relatedPost.readingTime} {t('blog.reading_time')}</span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3">
                        <Link
                          href={`/${locale}/blog/${relatedPost.slug}`}
                          className="hover:text-sky-400 transition-colors"
                        >
                          {locale === 'es' ? relatedPost.titleEs : relatedPost.title}
                        </Link>
                      </h3>

                      <p className="text-gray-400 mb-4 line-clamp-2">
                        {locale === 'es' ? relatedPost.excerptEs : relatedPost.excerpt}
                      </p>

                      <Link
                        href={`/${locale}/blog/${relatedPost.slug}`}
                        className="text-sky-400 hover:text-sky-300 font-medium"
                      >
                        {t('blog.read_more')} →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Author Bio */}
      <section className="py-16 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-xl border border-white/10 p-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl text-white">📸</span>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {post.author}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {locale === 'es'
                      ? 'Fotógrafo profesional especializado en bodas, retratos y fotografía comercial en Santo Domingo, República Dominicana. Con más de 10 años de experiencia, capturo los momentos más preciados de tu vida con creatividad y autenticidad.'
                      : 'Professional photographer specializing in weddings, portraits, and commercial photography in Santo Domingo, Dominican Republic. With over 10 years of experience, I help capture life\'s most precious moments with creativity and authenticity.'
                    }
                  </p>

                  <div className="flex gap-4">
                    <Link
                      href={`/${locale}/about`}
                      className="text-sky-400 hover:text-sky-300 font-medium"
                    >
                      {locale === 'es' ? 'Más Sobre Mí →' : 'Learn More About Me →'}
                    </Link>
                    <a
                      href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 font-medium"
                    >
                      {locale === 'es' ? 'Contáctame →' : 'Get in Touch →'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
    </main>
    </>
  )
}