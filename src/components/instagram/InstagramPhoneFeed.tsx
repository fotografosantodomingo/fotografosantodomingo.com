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
  const fallbackPosts = recentPosts.filter((post) => post.slug !== currentSlug).slice(0, limit)
  const hasInstagram = items.length > 0
  const visibleCount = Math.max(1, Math.min(limit, 6))

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
      <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(3,7,18,0.96))] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 text-lg font-black text-white">
            IG
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{copy.title}</h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                {hasInstagram ? copy.liveNow : copy.recentStories}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">{copy.subtitle}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">@babulashotsrd</p>
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
        <p className="mb-5 text-sm text-slate-600 dark:text-gray-300">{copy.empty}</p>
      )}

      {hasInstagram ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, visibleCount).map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-gray-900">
              <a href={item.permalink} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative h-56 overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-black/30">
                  <Image
                    src={item.media_url || ''}
                    alt={item.caption || copy.fallbackCaption}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="rounded-full border border-white/20 bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
                      {copy.fromInstagram}
                    </span>
                    {mediaBadge(item.media_type) && (
                      <span className="rounded-full border border-white/20 bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
                        {mediaBadge(item.media_type)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 dark:text-white">{captionText(item.caption)}</p>
                  <p className="mt-2 text-xs font-medium text-slate-600 dark:text-white/80">{copy.viewPost}</p>
                </div>
              </a>
            </article>
          ))}
        </div>
      ) : fallbackPosts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fallbackPosts.slice(0, visibleCount).map((post) => (
            <article key={post.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-gray-900">
              <Link href={`/${normalizedLocale}/blog/${post.slug}`} className="block">
                <div className="relative h-56 overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-black/30">
                  <Image
                    src={post.cover_image_thumbnail_url || post.cover_image_url || '/images/og-default.webp'}
                    alt={post.cover_image_alt || post.title}
                    title={post.cover_image_title || post.cover_image_alt || post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    {post.published_at && (
                      <span className="rounded-full border border-white/20 bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
                        {formatPublishedAt(post.published_at, normalizedLocale)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 dark:text-white">{post.title}</p>
                  <p className="mt-1 text-[11px] text-slate-600 dark:text-white/75">{postMeta(post.service_type, post.location) || copy.viewCaseStudy}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
