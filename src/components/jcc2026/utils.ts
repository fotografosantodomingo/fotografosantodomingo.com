const DOW = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Shared with the discipline tracker (Schedule.tsx) — marking a discipline
// done there should show as covered here too, same device.
export const STORAGE_KEY = 'jcc2026-done-v2'

export function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return { dow: DOW[dt.getUTCDay()], label: `${d} ${MON[m - 1]}` }
}

export function splitDisc(raw: string): [string, string] {
  const spaceIdx = raw.indexOf(' ')
  const cat = spaceIdx === -1 ? raw : raw.slice(0, spaceIdx)
  const rest = spaceIdx === -1 ? raw : raw.slice(spaceIdx + 1)
  return [cat, rest || cat]
}

export function properCase(s: string) {
  return s
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ')
}

// Minutes since midnight, for sorting sessions within a day. Sessions with no
// listed time sort after all timed ones.
export function timeToMinutes(time: string | null): number {
  if (!time) return Infinity
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function mapsUrl(venue: string) {
  const query = `${venue}, Santo Domingo, República Dominicana`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
