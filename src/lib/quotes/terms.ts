export type TermId =
  | 'cancellation'
  | 'weather'
  | 'drone_regulation'
  | 'image_rights'
  | 'late_arrival'
  | 'commercial_use'

export type TermContent = { titleEs: string; titleEn: string; bodyEs: string; bodyEn: string }

export const TERMS_CONTENT: Record<TermId, TermContent> = {
  cancellation: {
    titleEs: 'Política de Cancelación',
    titleEn: 'Cancellation Policy',
    bodyEs:
      'El depósito del 50% es no reembolsable en caso de cancelación con menos de 72 horas de anticipación. Para cancelaciones con más de 72 horas de antelación, el depósito puede aplicarse a una futura sesión dentro de los próximos 90 días.',
    bodyEn:
      'The 50% deposit is non-refundable for cancellations with less than 72 hours notice. For cancellations with more than 72 hours notice, the deposit may be applied to a future session within the next 90 days.',
  },
  weather: {
    titleEs: 'Cláusula Meteorológica',
    titleEn: 'Weather Clause',
    bodyEs:
      'Para sesiones en exteriores, si las condiciones climáticas (lluvia, vientos fuertes o tormentas) impiden la realización de la sesión, esta se reprogramará sin costo adicional en la próxima fecha disponible. La determinación de las condiciones es a criterio del fotógrafo por razones de seguridad.',
    bodyEn:
      'For outdoor sessions, if weather conditions (rain, strong winds, or storms) prevent the session, it will be rescheduled at no additional cost on the next available date. The determination of conditions is at the photographer\'s discretion for safety reasons.',
  },
  drone_regulation: {
    titleEs: 'Regulación Drone (IDAC)',
    titleEn: 'Drone Regulation (IDAC)',
    bodyEs:
      'Todos los vuelos se realizan bajo certificación RPAS vigente del IDAC (Instituto Dominicano de Aviación Civil). En zonas de control de espacio aéreo, se gestionarán los permisos correspondientes con antelación. El operador se reserva el derecho de limitar o cancelar el vuelo si las condiciones de seguridad o regulatorias no lo permiten.',
    bodyEn:
      'All flights are conducted under a valid RPAS certification from the IDAC (Dominican Civil Aviation Institute). In controlled airspace zones, permits will be obtained in advance. The operator reserves the right to limit or cancel the flight if safety or regulatory conditions do not allow it.',
  },
  image_rights: {
    titleEs: 'Derechos de Imagen',
    titleEn: 'Image Rights',
    bodyEs:
      'Las imágenes entregadas incluyen una licencia de uso no exclusiva para fines personales y promocionales. Babula Shots retiene los derechos de autor y se reserva el derecho de usar las imágenes en su portafolio, redes sociales y materiales de marketing, salvo acuerdo por escrito en contrario.',
    bodyEn:
      'Delivered images include a non-exclusive license for personal and promotional use. Babula Shots retains copyright and reserves the right to use images in its portfolio, social media, and marketing materials, unless otherwise agreed in writing.',
  },
  late_arrival: {
    titleEs: 'Puntualidad',
    titleEn: 'Punctuality',
    bodyEs:
      'La sesión comenzará a la hora acordada. El tiempo perdido por llegada tardía del cliente no se recuperará ni se extenderá la sesión sin cargo adicional. Retrasos superiores a 30 minutos pueden resultar en reprogramación con un cargo de $50 USD.',
    bodyEn:
      'The session will begin at the agreed time. Time lost due to late arrival will not be recovered, and the session will not be extended without additional charge. Delays exceeding 30 minutes may result in rescheduling with a $50 USD fee.',
  },
  commercial_use: {
    titleEs: 'Uso Comercial',
    titleEn: 'Commercial Use',
    bodyEs:
      'Esta cotización incluye licencia de uso comercial para los medios especificados. El uso en medios adicionales, publicidad pagada o distribución masiva requiere un acuerdo de licencia independiente.',
    bodyEn:
      'This quotation includes a commercial use license for the specified media. Use in additional media, paid advertising, or mass distribution requires a separate licensing agreement.',
  },
}

const SERVICE_TERMS: Record<string, TermId[]> = {
  WEDDINGS:           ['cancellation', 'image_rights', 'late_arrival'],
  ENGAGEMENT_SESSION: ['cancellation', 'weather', 'image_rights'],
  QUINCEANERAS:       ['cancellation', 'image_rights'],
  MATERNITY:          ['cancellation', 'image_rights'],
  FAMILY:             ['cancellation', 'weather', 'image_rights'],
  BIRTHDAY_PARTY:     ['cancellation', 'image_rights'],
  BAPTISMS:           ['cancellation', 'image_rights'],
  GRADUATION:         ['cancellation', 'image_rights'],
  CHILDRENS_SESSIONS: ['cancellation', 'image_rights'],
  PORTRAITS:          ['cancellation', 'image_rights'],
  CORPORATE_PORTRAITS:['cancellation', 'image_rights', 'commercial_use'],
  ARCHITECTURE:       ['cancellation', 'image_rights', 'commercial_use'],
  CORPORATE_EVENTS:   ['cancellation', 'image_rights', 'commercial_use'],
  FOOD_AND_BEVERAGE:  ['cancellation', 'image_rights', 'commercial_use'],
  VIDEO_PRODUCTION:   ['cancellation', 'image_rights', 'commercial_use'],
  DRONE_AERIAL:       ['cancellation', 'weather', 'drone_regulation', 'image_rights'],
  OTHER:              ['cancellation', 'image_rights'],
}

export function getTermsForService(serviceType: string | null): TermContent[] {
  const ids = (serviceType && SERVICE_TERMS[serviceType]) || SERVICE_TERMS.OTHER
  return ids.map(id => TERMS_CONTENT[id])
}
