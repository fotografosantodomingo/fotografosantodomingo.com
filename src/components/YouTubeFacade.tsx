'use client'

import { useState } from 'react'

type Props = {
  youtubeId: string
  title: string
}

/**
 * Click-to-play YouTube facade — no iframe (and no YouTube JS) loads
 * until the visitor actually clicks play, keeping the page's initial
 * load light. Title card matches the site's bordered/mono-caps style
 * rather than depending on a remote thumbnail image.
 */
export default function YouTubeFacade({ youtubeId, title }: Props) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="relative w-full aspect-video border border-hairline-soft bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative flex w-full aspect-video flex-col justify-end border border-hairline-soft bg-black p-6 text-left transition-colors hover:border-ink/40"
      aria-label={title}
    >
      <span
        className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink/40 transition-colors group-hover:border-ink"
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="ml-0.5">
          <path d="M4 2.5L15 9L4 15.5V2.5Z" fill="currentColor" className="text-ink" />
        </svg>
      </span>
      <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted mb-2">
        Video
      </span>
      <span className="text-ink text-sm md:text-base leading-snug">{title}</span>
    </button>
  )
}
