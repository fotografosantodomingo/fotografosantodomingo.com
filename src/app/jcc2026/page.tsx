import type { Metadata } from 'next'
import Jcc2026Schedule from '@/components/jcc2026/Schedule'

// Public, unlisted utility page — not a marketing page, so kept out of search
// results and the sitemap. Same reasoning as /quotations/[slug].
export const metadata: Metadata = {
  title: 'Hoja de ruta — JCC 2026',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <Jcc2026Schedule />
}
