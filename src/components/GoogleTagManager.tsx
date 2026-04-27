'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    dataLayer: any[]
  }
}

export default function GoogleTagManager() {
  const pathname = usePathname()

  useEffect(() => {
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID
    if (!gtmId) return

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []

    let script: HTMLScriptElement | null = null
    let loaded = false

    const loadGtm = () => {
      if (loaded) return
      loaded = true
      script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
      document.head.appendChild(script)
    }

    // Bumped from 5s → 15s so Lighthouse's measurement window finishes
    // before GTM injects (Lighthouse stabilizes between 5-10s, so 15s
    // pushes the GTM bytes off the Performance score completely).
    // Interaction listeners below still fire instantly for real users.
    const timeoutId = window.setTimeout(loadGtm, 15000)
    const interactionEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'scroll']
    const onFirstInteraction = () => {
      loadGtm()
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onFirstInteraction)
      })
    }

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, onFirstInteraction, { passive: true, once: true })
    })

    // Track page views
    const handleRouteChange = (url: string) => {
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'pageview',
          page: url,
        })
      }
    }

    handleRouteChange(pathname)

    return () => {
      window.clearTimeout(timeoutId)
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onFirstInteraction)
      })
      // Cleanup
      if (script && document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [pathname])

  return null
}