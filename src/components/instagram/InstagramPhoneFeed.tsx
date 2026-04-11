import Image from 'next/image'
import Link from 'next/link'
import { getInstagramFeed } from '@/lib/instagram/feed'
import { getPublishedPosts } from '@/lib/supabase/blog'

type Props = {
  locale: string
  limit?: number
  currentSlug?: string
}

const PROFILE_URL = 'https://www.instagram.com/babulashotsrd/'

function t(locale: string) {
  const isEs = locale === 'es'

  return {
    title: isEs ? 'Trabajos recientes' : 'Latest work',
    subtitle: isEs ? 'Muestra viva de sesiones recientes, con Instagram cuando está disponible y respaldo del blog cuando no lo está.' : 'A live view of recent sessions, using Instagram when available and recent blog work when it is not.',
    empty: isEs ? 'No pudimos cargar Instagram ahora mismo, pero aquí tienes trabajos recientes del estudio.' : 'We could not load Instagram right now, but here is recent studio work instead.',
    cta: isEs ? 'Ver perfil en Instagram' : 'View profile on Instagram',
    viewPost: isEs ? 'Ver post' : 'View post',
    viewCaseStudy: isEs ? 'Ver sesión completa' : 'View full session',
    fallbackCaption: isEs ? 'Nueva publicación en @babulashotsrd' : 'New post on @babulashotsrd',
    video: isEs ? 'Video' : 'Video',
    carousel: isEs ? 'Carrusel' : 'Carousel',
    liveNow: isEs ? 'Feed activo' : 'Live feed',
    recentStories: isEs ? 'Sesiones recientes' : 'Recent sessions',
    fromInstagram: isEs ? 'Desde Instagram' : 'From Instagram',
    fromBlog: isEs ? 'Desde el blog' : 'From the blog',
  }
}

function shortCaption(value?: string) {
  if (!value) return ''

  const compact = value
    .replace(/\s+/g, ' ')
    .replace(/#[^\s]+/g, '')
    .trim()

  if (compact.length <= 42) return compact
  return `${compact.slice(0, 42).trim()}...`
}

function formatPublishedAt(value?: string, locale = 'es') {
  if (!value) return ''

  try {
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value))
  } catch {
    return ''
  }
}

export async function InstagramPhoneFeed({ locale, limit = 12, currentSlug }: Props) {
  const copy = t(locale)
  const normalizedLocale = locale === 'es' ? 'es' : 'en'
  const [items, recentPosts] = await Promise.all([
    getInstagramFeed(limit),
    getPublishedPosts(normalizedLocale),
  ])
  const [featured, ...gridItems] = items
  const fallbackPosts = recentPosts.filter((post) => post.slug !== currentSlug).slice(0, limit)
  const [featuredFallback, ...fallbackGridItems] = fallbackPosts
  const hasInstagram = items.length > 0

  function captionText(caption?: string) {
    return shortCaption(caption) || copy.fallbackCaption
  }

  function mediaBadge(mediaType?: string) {
    if (mediaType === 'VIDEO') return copy.video
    if (mediaType === 'CAROUSEL_ALBUM') return copy.carousel
    return ''
  }

  function postMeta(serviceType?: string | null, location?: string | null) {
    return [serviceType, location].filter(Boolean).join(' · ')
  }

  return (
    <section className="container mx-auto px-4 pb-14">
      <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(3,7,18,0.96))] p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 text-lg font-black text-white">
            IG
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-extrabold">{copy.title}</h2>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                {hasInstagram ? copy.liveNow : copy.recentStories}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-300">{copy.subtitle}</p>
            <p className="mt-2 text-sm font-semibold text-white">@babulashotsrd</p>
          </div>
        </div>

        <a
          href={PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-bold text-gray-900"
        >
          {copy.cta}
        </a>
      </div>

      {!hasInstagram && fallbackPosts.length > 0 && (
        <p className="mb-5 text-sm text-gray-300">{copy.empty}</p>
      )}

      {hasInstagram ? (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          {featured && (
            <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-gray-950">
              <a href={featured.permalink} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={featured.media_url || ''}
                    alt={featured.caption || copy.fallbackCaption}
                    fill
                    sizes="(max-width: 768px) 100vw, 52vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {copy.fromInstagram}
                    </span>
                    {mediaBadge(featured.media_type) && (
                      <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                        {mediaBadge(featured.media_type)}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="max-w-xl text-lg font-semibold leading-7 md:text-xl">{captionText(featured.caption)}</p>
                    <p className="mt-3 text-sm font-medium text-white/80">{copy.viewPost}</p>
                  </div>
                </div>
              </a>
            </article>
          )}

          <div className="grid grid-cols-2 gap-4">
            {gridItems.slice(0, 4).map((item) => (
              <article key={item.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-gray-900">
                <a href={item.permalink} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={item.media_url || ''}
                      alt={item.caption || copy.fallbackCaption}
                      fill
                      sizes="(max-width: 768px) 50vw, 26vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                    <div className="absolute left-3 top-3">
                      {mediaBadge(item.media_type) && (
                        <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
                          {mediaBadge(item.media_type)}
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <p className="line-clamp-2 text-sm font-semibold leading-5">{captionText(item.caption)}</p>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
      ) : fallbackPosts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          {featuredFallback && (
            <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-gray-950">
              <Link href={`/${normalizedLocale}/blog/${featuredFallback.slug}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={featuredFallback.cover_image_thumbnail_url || '/images/og-default.webp'}
                    alt={featuredFallback.cover_image_alt || featuredFallback.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 52vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {copy.fromBlog}
                    </span>
                    {featuredFallback.published_at && (
                      <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                        {formatPublishedAt(featuredFallback.published_at, normalizedLocale)}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="max-w-xl text-xl font-semibold leading-8">{featuredFallback.title}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-white/80">{featuredFallback.excerpt}</p>
                    <p className="mt-3 text-sm font-medium text-white/90">{copy.viewCaseStudy}</p>
                  </div>
                </div>
              </Link>
            </article>
          )}

          <div className="grid grid-cols-2 gap-4">
            {fallbackGridItems.slice(0, 4).map((post) => (
              <article key={post.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-gray-900">
                <Link href={`/${normalizedLocale}/blog/${post.slug}`} className="block">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={post.cover_image_thumbnail_url || '/images/og-default.webp'}
                      alt={post.cover_image_alt || post.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 26vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <p className="line-clamp-2 text-sm font-semibold leading-5">{post.title}</p>
                      <p className="mt-1 text-[11px] text-white/75">{postMeta(post.service_type, post.location) || copy.viewCaseStudy}</p>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
