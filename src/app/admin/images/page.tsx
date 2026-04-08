/**
 * Admin Image SEO Editor — /admin/images?key=YOUR_ADMIN_SECRET
 *
 * Server component. Protected by ADMIN_SECRET env var.
 * Pass ?key=<secret> in the URL to authenticate.
 *
 * Features:
 * - Lists all portfolio images
 * - Per-image form for ES/EN alt, title, caption, description
 * - Saves directly to Supabase via /api/admin/update-image
 */

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPortfolioImages } from '@/lib/supabase/images'
import ImageSeoEditor from '@/components/admin/ImageSeoEditor'

interface AdminImagesPageProps {
  searchParams: { key?: string }
}

export const metadata = { title: 'Admin – Image SEO' }

// Opt out of caching so the latest Supabase data is always shown
export const dynamic = 'force-dynamic'

export default async function AdminImagesPage({ searchParams }: AdminImagesPageProps) {
  const secret = process.env.ADMIN_SECRET

  // If ADMIN_SECRET is not configured, show a helpful message
  if (!secret) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Not Configured</h1>
          <p className="text-gray-600">
            Set the <code className="bg-gray-100 px-1 rounded">ADMIN_SECRET</code> environment
            variable in your Vercel project settings to enable this page.
          </p>
        </div>
      </main>
    )
  }

  // Auth check — key must match ADMIN_SECRET env var
  if (searchParams.key !== secret) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center p-8">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Access Denied</h1>
          <p className="text-gray-600">
            Pass the correct admin key as <code className="bg-gray-100 px-1 rounded">?key=…</code>
          </p>
        </div>
      </main>
    )
  }

  const images = await getPortfolioImages()

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Image SEO Editor</h1>
          <p className="text-gray-600 mt-2">
            Edit bilingual SEO metadata for every portfolio image.
            Changes are saved directly to Supabase and take effect on the next request.
          </p>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>Tip:</strong> After saving, purge the Vercel edge cache by redeploying or
            waiting for the ISR revalidation window.
          </div>
        </div>

        {/* Image grid */}
        <div className="space-y-6">
          {images.map((image) => (
            <ImageSeoEditor
              key={image.id}
              image={image}
              adminSecret={secret}
            />
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No images found. Run the Supabase migration first.
          </div>
        )}
      </div>
    </main>
  )
}
