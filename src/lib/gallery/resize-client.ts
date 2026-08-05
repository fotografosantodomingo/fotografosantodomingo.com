/**
 * Browser-only image resizing for gallery previews. Cloudflare's edge
 * runtime has no image-processing capability (no sharp, no WASM codec
 * wired up), so previews are generated here — in the admin's own browser,
 * via canvas — both at upload time and when backfilling existing photos.
 */

export type GeneratedPreview = { blob: Blob; width: number; height: number }

export async function generatePreviewBlob(
  source: File | Blob,
  maxDimension = 1400,
  quality = 0.78
): Promise<GeneratedPreview> {
  const bitmap = await createImageBitmap(source)
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas.toBlob failed'))), 'image/jpeg', quality)
    })

    return { blob, width, height }
  } finally {
    bitmap.close()
  }
}
