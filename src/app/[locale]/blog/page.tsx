import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { getAllPosts } from '@/lib/blog/posts'
import {
  getAllPostsFromDb,
  getFeaturedPostsFromDb,
  getPostsByCategoryFromDb,
  searchPostsFromDb,
} from '@/lib/supabase/blog'
import { CONTACT_INFO } from '@/lib/utils/constants'

type Props = {
  params: { locale: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function BlogPage({ params: { locale }, searchParams }: Props) {
  const t = useTranslations()

  // Get all posts and featured posts from DB (falls back to static)
  const [allPostsRaw, featuredPosts] = await Promise.all([
    getAllPostsFromDb(),
    getFeaturedPostsFromDb(),
  ])

  // Handle search and filtering
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : ''
  const categoryFilter = typeof searchParams.category === 'string' ? searchParams.category : ''

  let filteredPosts = allPostsRaw

  if (searchQuery) {
    filteredPosts = await searchPostsFromDb(searchQuery)
  } else if (categoryFilter) {
    filteredPosts = await getPostsByCategoryFromDb(categoryFilter)
  }

  const allPosts = allPostsRaw

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

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('blog.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
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
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  🔍
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/blog`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !categoryFilter && !searchQuery
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && !searchQuery && !categoryFilter && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('blog.featured')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map(post => (
                <article key={post.slug} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative">
                    {/* Placeholder for featured image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-30">📸</span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {t('blog.featured')}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>•</span>
                      <span>{post.readingTime} {t('blog.reading_time')}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {locale === 'es' ? post.titleEs : post.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {locale === 'es' ? post.excerptEs : post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {t('blog.read_more')} →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {searchQuery && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('blog.search')} &ldquo;{searchQuery}&rdquo;
              </h2>
              <p className="text-gray-600">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} found
              </p>
            </div>
          )}

          {categoryFilter && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {categories.find(cat => cat.key === categoryFilter)?.label}
              </h2>
              <p className="text-gray-600">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
              </p>
            </div>
          )}

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('blog.no_results')}
              </h3>
              <p className="text-gray-600 mb-6">
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
                <article key={post.slug} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative">
                    {/* Placeholder for post image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl opacity-30">
                        {post.category === 'wedding' ? '💍' :
                         post.category === 'portrait' ? '👤' :
                         post.category === 'drone' ? '🚁' :
                         post.category === 'commercial' ? '📸' : '📝'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>•</span>
                      <span>{post.readingTime} {t('blog.reading_time')}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {locale === 'es' ? post.titleEs : post.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {locale === 'es' ? post.excerptEs : post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
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
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('footer.newsletter.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t('footer.newsletter.subtitle')}
          </p>

          <div className="max-w-md mx-auto">
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Work Together?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
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
              className="bg-primary-600 hover:bg-primary-700 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              {t('contact.form.send')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}