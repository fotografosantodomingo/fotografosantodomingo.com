import Jcc2026DayPlan from '@/components/jcc2026/DayPlan'

// Explicit even though admin/layout.tsx already declares edge runtime and
// Next.js inherits it — no ambiguity this way.
export const runtime = 'edge'

export default function Page() {
  return <Jcc2026DayPlan />
}
