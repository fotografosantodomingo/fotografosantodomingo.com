import Jcc2026Schedule from '@/components/jcc2026/Schedule'

// Explicit even though admin/layout.tsx already declares edge runtime and
// Next.js inherits it — no ambiguity this way.
export const runtime = 'edge'

export default function Page() {
  return <Jcc2026Schedule />
}
