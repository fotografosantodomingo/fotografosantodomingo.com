export const SITE_LAST_UPDATED_ISO = '2026-04-22'

export function formatSiteLastUpdated(locale: string) {
  const date = new Date(`${SITE_LAST_UPDATED_ISO}T00:00:00Z`)
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}