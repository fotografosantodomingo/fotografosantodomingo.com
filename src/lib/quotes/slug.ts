function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function toKebab(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30)
}

/** Generates an unguessable proposal slug, e.g. "maria-garcia-a3f8c12d" */
export function generateProposalSlug(clientName: string | null): string {
  const nameSlug = toKebab(clientName ?? 'proposal')
  const bytes = new Uint8Array(5)
  crypto.getRandomValues(bytes)
  const suffix = bytesToHex(bytes) // 10 hex chars = 40 bits entropy
  return `${nameSlug}-${suffix}`
}
