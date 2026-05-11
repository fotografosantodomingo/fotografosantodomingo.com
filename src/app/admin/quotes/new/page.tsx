import Link from 'next/link'
import NewDraftClient from './NewDraftClient'

export const dynamic = 'force-dynamic'

export default function NewDraftPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/quotes" className="text-sm text-sky-600 hover:underline dark:text-sky-400">
          ← All quotes
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Draft</h1>
      </div>
      <NewDraftClient />
    </div>
  )
}
