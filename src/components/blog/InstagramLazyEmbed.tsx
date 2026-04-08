'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  instagramPostId?: string | null
}

export function InstagramLazyEmbed({ instagramPostId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '150px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || !instagramPostId) return

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://www.instagram.com/embed.js'
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [isVisible, instagramPostId])

  return (
    <div ref={containerRef} className="mb-5">
      {!isVisible && (
        <div className="rounded-xl bg-black/20 p-4 text-sm text-white/90">
          Cargando contenido de Instagram...
        </div>
      )}

      {isVisible && instagramPostId && (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={`https://www.instagram.com/p/${instagramPostId}/`}
          data-instgrm-version="14"
          style={{
            background: '#fff',
            border: 0,
            borderRadius: '12px',
            margin: 0,
            maxWidth: '540px',
            minWidth: '326px',
            width: '100%',
          }}
        />
      )}

      {isVisible && !instagramPostId && (
        <p className="text-sm font-semibold text-white">
          No Instagram embed configured for this post yet.
        </p>
      )}
    </div>
  )
}
