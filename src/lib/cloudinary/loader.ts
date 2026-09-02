/**
 * Custom next/image loader for this Cloudflare Pages deployment.
 *
 * Next's built-in /_next/image optimizer is a passthrough here — no
 * sharp/Cloudflare Image Resizing is wired up, so it returns the same
 * original bytes regardless of the requested width. This loader bypasses
 * /_next/image entirely for Cloudinary-hosted sources and lets Cloudinary
 * itself produce the resized derivative, which works identically in the
 * edge runtime with no server-side image-processing dependency.
 *
 * Non-Cloudinary sources (Supabase Storage, /api/og, local /public files)
 * are returned unchanged — Cloudinary transforms only apply to assets it
 * hosts, and altering how those are served is outside this loader's job.
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  const marker = '/image/upload/'
  const idx = src.startsWith('https://res.cloudinary.com/') ? src.indexOf(marker) : -1
  if (idx === -1) return src

  const insertAt = idx + marker.length
  const q = quality ?? 'auto'
  // Inserted as the first chained transformation — Cloudinary applies it
  // before any transform already present later in the URL, so this works
  // whether the source URL already has transforms or not.
  return `${src.slice(0, insertAt)}f_auto,q_${q},c_limit,w_${width}/${src.slice(insertAt)}`
}
