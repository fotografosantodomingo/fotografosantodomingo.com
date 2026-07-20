import type { Metadata } from 'next'
import Link from 'next/link'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Admin — Babula Shots',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell min-h-screen bg-slate-100 font-sans antialiased dark:bg-gray-950">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-3 dark:border-white/10 dark:bg-gray-900">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <Link href="/admin/quotes" className="font-semibold text-slate-900 dark:text-white">
                📸 Babula Shots Admin
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/admin/bookings" className="text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white">
                  Bookings
                </Link>
                <Link href="/admin/availability" className="text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white">
                  Availability
                </Link>
                <Link href="/admin/families" className="text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white">
                  Families
                </Link>
                <Link href="/admin/packages" className="text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white">
                  Packages
                </Link>
                <Link href="/admin/quote-requests" className="text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white">
                  Quote Requests
                </Link>
                <Link href="/admin/booking-services" className="text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white" title="Legacy (frozen)">
                  Services<span className="ml-1 text-xs text-slate-400">(legacy)</span>
                </Link>
                <Link href="/admin/quotes" className="text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white">
                  Quotes
                </Link>
                <Link href="/admin/ai-inbox" className="font-medium text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300">
                  AI Inbox
                </Link>
                <Link href="/admin/whatsapp" className="font-medium text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
                  WhatsApp
                </Link>
                <Link href="/admin/images" className="text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white">
                  Images
                </Link>
                <Link href="/admin/account" className="text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white">
                  Account
                </Link>
                <form action="/api/admin/signout" method="POST">
                  <button
                    type="submit"
                    className="rounded-full border border-slate-300 px-3 py-1 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-white/20 dark:text-gray-300 dark:hover:text-white"
                  >
                    Sign out
                  </button>
                </form>
              </nav>
            </div>
          </header>
          <main className="flex-1 px-4 py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
    </div>
  )
}
