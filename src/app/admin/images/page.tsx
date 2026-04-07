/**
 * Admin Image SEO Editor — /admin/images?key=YOUR_ADMIN_SECRET
 *
 * Server component. Protected by ADMIN_SECRET env var.
 * Pass ?key=<secret> in the URL to authenticate.
 *
 * Features:
 * - Lists all portfolio images
 * - Per-image ✨ AI caption generator (GPT-4o Vision, bilingual)
 * - Per-image ES/EN form for alt, title, caption, description
 * - Saves directly to Supabase
 */

import { getPortfolioImages } from '@/lib/supabase/images'
import ImageSeoEditor from '@/components/admin/ImageSeoEditor'
import BulkGenerateButton from '@/components/admin/BulkGenerateButton'

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
  const withoutAI = images.filter((img) => !img.ai_generated)

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Image SEO Editor</h1>
          <p className="text-gray-600 mt-2">
            AI generates bilingual alt text, titles, captions and JSON-LD descriptions
            instantly. Review and save, or tweak manually.
          </p>

          {/* Stats row */}
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm">
              <span className="text-gray-500">Total images:</span>{' '}
              <strong>{images.length}</strong>
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-lg px-4 py-2 text-sm">
              <span className="text-violet-600">AI-captioned:</span>{' '}
              <strong className="text-violet-800">{images.length - withoutAI.length}</strong>
            </div>
            {withoutAI.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm">
                <span className="text-amber-700">Awaiting AI:</span>{' '}
                <strong className="text-amber-900">{withoutAI.length}</strong>
              </div>
            )}
          </div>

          {/* Bulk generate */}
          {withoutAI.length > 0 && (
            <div className="mt-5 p-4 bg-violet-50 border border-violet-200 rounded-xl">
              <p className="text-sm font-semibold text-violet-800 mb-1">
                ✨ {withoutAI.length} image{withoutAI.length !== 1 ? 's' : ''} still need AI captions
              </p>
              <p className="text-xs text-violet-600 mb-3">
                Run AI generation on all un-captioned images at once. Each call
                uses GPT-4o Vision — takes ~3 s per image.
              </p>
              <BulkGenerateButton
                images={withoutAI.map((img) => ({
                  publicId: img.public_id,
                  category: img.category,
                  location: img.location,
                }))}
                adminSecret={secret}
              />
            </div>
          )}

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>How it works:</strong> Click ✨ Generate on any image (or Bulk Generate above).
            The AI analyses the photo via GPT-4o Vision and writes alt text, title, caption and
            description in both ES &amp; EN — keyword-enriched if you supply page keywords.
            New uploads are captioned <em>automatically</em> via the Cloudinary webhook.
          </div>
        </div>

        {/* Image list */}
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
