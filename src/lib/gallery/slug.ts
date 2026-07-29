// e.g. "Smith Family" -> "smith-family-x9y8z7" — mirrors the quotations
// proposal_slug pattern (unguessable suffix, no sequential IDs exposed).
export function generateGallerySlug(clientName: string): string {
  const base = clientName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics (after NFD normalize)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  const suffix = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 6)

  return `${base || 'gallery'}-${suffix}`
}
