import YouTubeFacade from '@/components/YouTubeFacade'
import type { SpokeVideo } from '@/data/spoke-pages'

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dwewurxla/image/upload/f_auto,q_auto'

export type GalleryImage = {
  id: string
  altEn: string
  altEs: string
}

type Props = {
  locale: string
  images: GalleryImage[]
  videos?: SpokeVideo[]
  headingEn?: string
  headingEs?: string
}

/**
 * TwoColumnGallery — reusable full-bleed spoke gallery.
 *
 * LAYOUT RULES (same family as ZonaColonialGallery / ProposalGallery — do
 * NOT crop):
 *   - Natural aspect ratio, no cropping, no fixed height, no object-fit cover
 *   - Desktop: 2 columns. Mobile: 1 column, full width.
 *   - Zero gap between images.
 *
 * Optional videos render above the gallery as click-to-play facades (no
 * iframe/YouTube JS loaded until clicked) — reuses the same YouTubeFacade
 * component used on the real-estate-drone-photography family page.
 */
export default function TwoColumnGallery({ locale, images, videos, headingEn, headingEs }: Props) {
  const isEs = locale === 'es'

  return (
    <section aria-labelledby="gallery-heading" className="w-full">
      {(headingEn || headingEs) && (
        <div className="bg-neutral-950 py-10 sm:py-16">
          <h2
            id="gallery-heading"
            className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            {isEs ? headingEs : headingEn}
          </h2>
        </div>
      )}

      {videos && videos.length > 0 && (
        <div className="bg-neutral-950 px-4 pb-10 sm:pb-16">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
            {videos.map((video) => (
              <TwoColumnGalleryVideo key={video.youtubeId} video={video} isEs={isEs} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 0, lineHeight: 0 }}>
        {images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.id}
            src={`${CLOUDINARY_BASE}/${img.id}.webp`}
            alt={isEs ? img.altEs : img.altEn}
            className="w-full h-auto block"
            style={{ objectFit: 'unset' }}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>

      <div className="bg-neutral-950 pb-10 sm:pb-16">
        <div className="text-center pt-8">
          <a
            href={`/${locale}/portfolio`}
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 underline-offset-4 hover:underline"
          >
            {isEs ? 'Ver portafolio completo →' : 'View full portfolio →'}
          </a>
        </div>
      </div>
    </section>
  )
}

function TwoColumnGalleryVideo({ video, isEs }: { video: SpokeVideo; isEs: boolean }) {
  return <YouTubeFacade youtubeId={video.youtubeId} title={isEs ? video.titleEs : video.titleEn} />
}
