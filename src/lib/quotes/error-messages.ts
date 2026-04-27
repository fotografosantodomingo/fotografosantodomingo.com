/**
 * Translation map for `/api/quote-request` error codes.
 *
 * The API returns stable error codes (e.g. `unknown_package`) instead of
 * English prose. The wizard maps them through this table to a localized
 * user-facing message. Unknown codes fall through to a generic message.
 *
 * Keep in sync with the QuoteApiErrorCode type in
 * src/app/api/quote-request/route.ts.
 */

type Locale = 'es' | 'en'

const MESSAGES: Record<string, Record<Locale, string>> = {
  invalid_json: {
    es: 'Hubo un problema al enviar el formulario. Recarga la página e inténtalo de nuevo.',
    en: 'There was a problem submitting the form. Reload the page and try again.',
  },
  validation_failed: {
    es: 'Algunos campos del formulario no son válidos. Revisa email, fecha y datos de contacto.',
    en: 'Some form fields are invalid. Check email, date, and contact details.',
  },
  spam_blocked: {
    es: 'No pudimos procesar el formulario. Si crees que es un error, contáctanos por WhatsApp.',
    en: 'We could not process the form. If you think this is an error, contact us via WhatsApp.',
  },
  unknown_family: {
    es: 'Servicio no reconocido. Intenta seleccionar el servicio nuevamente desde el menú.',
    en: 'Unknown service family. Please reselect the service from the menu.',
  },
  unknown_package: {
    es: 'Este paquete específico ya no está disponible. Lo cotizamos como solicitud personalizada — vuelve a enviar el formulario para continuar.',
    en: 'This specific package is no longer available. We will quote it as a custom request — please resubmit the form to continue.',
  },
  family_lookup_failed: {
    es: 'Error temporal del servidor. Inténtalo de nuevo en unos segundos.',
    en: 'Temporary server error. Please try again in a few seconds.',
  },
  package_lookup_failed: {
    es: 'Error temporal del servidor. Inténtalo de nuevo en unos segundos.',
    en: 'Temporary server error. Please try again in a few seconds.',
  },
  insert_failed: {
    es: 'No pudimos guardar tu solicitud. Por favor contáctanos por WhatsApp para continuar.',
    en: 'We could not save your request. Please contact us via WhatsApp to continue.',
  },
}

const FALLBACK: Record<Locale, string> = {
  es: 'No pudimos enviar tu solicitud. Por favor inténtalo de nuevo o contáctanos por WhatsApp.',
  en: 'We could not submit your request. Please try again or contact us via WhatsApp.',
}

export function translateQuoteError(code: string | null | undefined, locale: Locale): string {
  if (!code) return FALLBACK[locale]
  const entry = MESSAGES[code]
  return entry ? entry[locale] : FALLBACK[locale]
}
