// Builds the knowledge blob injected as a second system message in every LLM call.
// Returns a compact JSON string — the model treats <knowledge>...</knowledge> as ground truth.

import { getServiceCatalog } from '@/lib/services/catalog'
import { faqData } from '@/lib/faq-data'
import { PHOTOGRAPHER, CONTACT_INFO } from '@/lib/utils/constants'

export function buildPhotographyKnowledge(locale: 'en' | 'es'): string {
  const catalog = getServiceCatalog(locale)
  const faqs = locale === 'es' ? faqData.es : (faqData.en ?? faqData.es)

  const services = catalog.map((s) => ({
    id: s.id,
    name: s.title,
    description: s.description,
    features: s.features,
    pricing_starting: s.pricing.starting,
    pricing_includes: s.pricing.includes,
  }))

  const kb = {
    photographer: {
      name: PHOTOGRAPHER.name ?? 'Michal Babula',
      phone: PHOTOGRAPHER.phone,
      whatsapp: CONTACT_INFO.whatsapp,
      languages: ['español', 'inglés'],
      base: 'Santo Domingo, República Dominicana',
      coverage: [
        'Santo Domingo',
        'Punta Cana',
        'Bávaro',
        'Cap Cana',
        'La Romana',
        'Casa de Campo',
        'Puerto Plata',
        'Santiago',
        'Isla Saona',
        'Zona Colonial',
        'Macao',
        'Tortuga Bay',
      ],
    },
    services,
    booking_process:
      locale === 'es'
        ? [
            '1. El cliente contacta a Michal vía web, WhatsApp o email para verificar disponibilidad.',
            '2. Se acuerda fecha, locación y paquete.',
            '3. Se paga un depósito no reembolsable del 50% para reservar.',
            '4. El 50% restante se paga el día de la sesión antes de comenzar.',
            '5. Las fotos editadas se entregan en 48–72 h en galería privada online.',
          ]
        : [
            '1. Client contacts Michal via web, WhatsApp or email to check availability.',
            '2. Date, location and package are agreed.',
            '3. A non-refundable 50% deposit is paid to secure the booking.',
            '4. The remaining 50% is paid on the day of the session before it begins.',
            '5. Edited photos delivered within 48–72 h via private online gallery.',
          ],
    faqs: faqs.slice(0, 12).map((f) => ({ q: f.question, a: f.answer })),
    important_notes:
      locale === 'es'
        ? [
            'Los precios orientativos son puntos de partida — el precio final lo confirma Michal.',
            'La disponibilidad de fechas la confirma solo Michal directamente.',
            'Para bodas y eventos grandes se recomienda reservar con al menos 3 meses de anticipación.',
            'Contamos con drone certificado — zonas de vuelo libre en Cap Cana, Macao y playas de Bávaro.',
          ]
        : [
            'Indicative prices are starting points — final pricing confirmed by Michal.',
            'Date availability is confirmed by Michal directly only.',
            'For weddings and large events, booking at least 3 months in advance is recommended.',
            'Certified drone available — free-fly zones at Cap Cana, Macao, and Bávaro beaches.',
          ],
  }

  return JSON.stringify(kb, null, 2)
}
