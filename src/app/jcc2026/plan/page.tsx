import type { Metadata } from 'next'
import Jcc2026DayPlan from '@/components/jcc2026/DayPlan'

// Top-level routes (not under /admin, which inherits edge runtime from its own
// layout) must declare this explicitly or Cloudflare Pages' next-on-pages
// adapter won't serve them — matches /quotations/[slug]/page.tsx.
export const runtime = 'edge'

// Public, unlisted utility page — not a marketing page, so kept out of search
// results and the sitemap. Same reasoning as /quotations/[slug].
export const metadata: Metadata = {
  title: 'Plan por hora y dirección — JCC 2026',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <Jcc2026DayPlan />
}
