/**
 * Rich SEO content for the birthday-event-photography family page.
 *
 * No legacy slug equivalent — this canonical family was introduced in
 * Slice A and consolidates birthdays, baptisms, graduations, and
 * quinceañeras under one premium family. Content authored fresh.
 *
 * Note: /services/birthday-photographer is a SEPARATE static SEO page
 * (untouched by Phase B). This file powers the canonical family page
 * /services/birthday-event-photography only.
 */

import type { ServiceContent } from './types'

export const birthdayEventPhotographyContent: ServiceContent = {
  seo: {
    title: {
      es: 'Fotógrafo de Quinceañeras, Cumpleaños y Bautizos | Santo Domingo & Punta Cana | Babula Shots',
      en: 'Quinceañera, Birthday & Baptism Photographer | Santo Domingo & Punta Cana | Babula Shots',
    },
    description: {
      es: 'Cobertura premium de quinceañeras, cumpleaños, bautizos y graduaciones en Santo Domingo, Punta Cana y Boca Chica. Galería editada y reserva online con depósito.',
      en: 'Premium coverage of quinceañeras, birthdays, baptisms, and graduations in Santo Domingo, Punta Cana, and Boca Chica. Edited gallery and online booking with deposit.',
    },
    keywords: {
      es: 'fotografo quinceanera santo domingo, fotografo cumpleanos punta cana, fotografia bautizo republica dominicana, fotografo graduacion rd, cobertura quinceanos premium dominicana, reservar fotografo cumpleanos dr',
      en: 'quinceanera photographer santo domingo, birthday photographer punta cana, baptism photography dominican republic, graduation photographer DR, premium quinceanera coverage, book birthday photographer DR',
    },
  },

  schemaAdditionalType: 'https://schema.org/Event',

  knowsAbout: {
    es: ['fotografia de cumpleanos', 'cobertura de quinceaneras', 'fotografia de bautizos', 'sesiones de graduacion', 'eventos familiares premium'],
    en: ['birthday photography', 'quinceanera coverage', 'baptism photography', 'graduation sessions', 'premium family events'],
  },

  differentiators: [
    {
      title: { es: 'Especialistas en eventos familiares premium', en: 'Premium family event specialists' },
      proof: { es: 'Cumpleaños, bautizos, graduaciones y quinceañeras con flujo cinematográfico.', en: 'Birthdays, baptisms, graduations, and quinceañeras with cinematic flow.' },
    },
    {
      title: { es: 'Direccion gentil para todas las edades', en: 'Gentle direction across all ages' },
      proof: { es: 'Sabemos como trabajar con bebes, ninos, adolescentes y abuelos en la misma sesion.', en: 'We know how to direct babies, kids, teens, and grandparents in the same session.' },
    },
    {
      title: { es: 'Cobertura completa de la celebracion', en: 'Complete celebration storytelling' },
      proof: { es: 'Detalles, ceremonia, retratos familiares, momentos espontaneos y fiesta.', en: 'Details, ceremony, family portraits, spontaneous moments, and party.' },
    },
  ],

  processSteps: [
    {
      title: { es: 'Consulta y vision del evento', en: 'Event consultation and vision' },
      description: { es: 'Definimos tipo de celebracion, edades de homenajeados y prioridades fotograficas.', en: 'We define celebration type, honoree ages, and photography priorities.' },
    },
    {
      title: { es: 'Plan de cobertura y timeline', en: 'Coverage and timeline plan' },
      description: { es: 'Coordinamos llegada, momentos clave, retratos y bloque de fiesta.', en: 'We coordinate arrival, key moments, portraits, and party block.' },
    },
    {
      title: { es: 'Cobertura del evento', en: 'Event-day coverage' },
      description: { es: 'Equipo enfocado en historia familiar completa con direccion no invasiva.', en: 'Team focused on full family storytelling with non-invasive direction.' },
    },
    {
      title: { es: 'Edicion y entrega rapida', en: 'Editing and fast delivery' },
      description: { es: 'Galeria editada en alta resolucion para compartir con familia.', en: 'High-resolution edited gallery ready to share with family.' },
    },
  ],

  locations: [
    { venue: 'Centros de eventos Santo Domingo', area: 'Santo Domingo', style: { es: 'Salones formales con decoracion', en: 'Formal halls with full decor' }, bestLight: { es: 'Mezcla luz ambiente y flash', en: 'Ambient + flash mix' }, detail: { es: 'Cobertura clasica para celebraciones de gran formato.', en: 'Classic coverage for large-format celebrations.' }, href: '/portfolio?category=event' },
    { venue: 'Iglesias coloniales', area: 'Santo Domingo', style: { es: 'Arquitectura historica religiosa', en: 'Historic religious architecture' }, bestLight: { es: 'Manana con luz natural', en: 'Morning natural light' }, detail: { es: 'Bautizos y ceremonias religiosas con narrativa autentica.', en: 'Baptisms and religious ceremonies with authentic narrative.' }, href: '/portfolio?category=event' },
    { venue: 'Resorts Punta Cana', area: 'Punta Cana', style: { es: 'Salon o playa de hotel', en: 'Resort ballroom or beach' }, bestLight: { es: 'Sunset y noche', en: 'Sunset and night' }, detail: { es: 'Quinceaneras y cumpleaños destino con look tropical.', en: 'Destination quinceañeras and birthdays with tropical look.' }, href: '/portfolio?category=event' },
    { venue: 'Casa de Campo La Romana', area: 'La Romana', style: { es: 'Resort clasico', en: 'Classic resort' }, bestLight: { es: 'Tarde y atardecer', en: 'Afternoon and sunset' }, detail: { es: 'Celebraciones premium con privacidad y variedad de spots.', en: 'Premium celebrations with privacy and varied spots.' }, href: '/portfolio?category=event' },
    { venue: 'Residencias privadas', area: 'Toda RD', style: { es: 'Casas y villas familiares', en: 'Family homes and villas' }, bestLight: { es: 'Segun arquitectura', en: 'Per architecture' }, detail: { es: 'Sesiones intimas en el espacio que la familia conoce.', en: 'Intimate sessions in the space the family knows.' }, href: '/portfolio?category=event' },
    { venue: 'Universidades / centros academicos', area: 'Santo Domingo · Santiago', style: { es: 'Salones graduacion + campus', en: 'Graduation halls + campus' }, bestLight: { es: 'Mañana o tarde', en: 'Morning or afternoon' }, detail: { es: 'Graduaciones con cobertura de ceremonia + retratos en campus.', en: 'Graduations with ceremony coverage + campus portraits.' }, href: '/portfolio?category=event' },
  ],

  seasonality: {
    bestMonths: { es: 'Quinceañeras y graduaciones: mayo a agosto. Bautizos y cumpleaños: todo el año.', en: 'Quinceañeras and graduations: May to August. Baptisms and birthdays: year-round.' },
    cautionMonths: { es: 'Eventos al aire libre en mayo-octubre requieren plan B por lluvia.', en: 'Outdoor events May-October require a rain backup plan.' },
    daylightNote: { es: 'Para retratos al aire libre la mejor luz es entre 5:00 y 6:30 PM.', en: 'For outdoor portraits, best light is between 5:00 and 6:30 PM.' },
  },

  trust: {
    expertBio: {
      es: 'Equipo con cobertura regular de cumpleaños, bautizos, graduaciones y quinceañeras en toda Republica Dominicana. Combinamos sensibilidad para momentos familiares con direccion eficiente para mantener el flujo de la celebracion.',
      en: 'Team with regular coverage of birthdays, baptisms, graduations, and quinceañeras across the Dominican Republic. We combine family-moment sensitivity with efficient direction to keep the celebration flowing.',
    },
    authoritySignals: {
      es: ['Cobertura bilingue ES/EN para familias internacionales', 'Direccion gentil para todas las edades incluidos bebes y abuelos', 'Entrega rapida — galeria principal en 7-10 dias'],
      en: ['Bilingual ES/EN coverage for international families', 'Gentle direction for all ages including babies and grandparents', 'Fast delivery — main gallery in 7-10 days'],
    },
    testimonials: [
      {
        role: { es: 'Quinceañera Punta Cana', en: 'Quinceañera Punta Cana' },
        quote: { es: 'Fotos elegantes y sin pose forzada. Nuestra hija las amo.', en: 'Elegant photos with no forced posing. Our daughter loved them.' },
      },
      {
        role: { es: 'Bautizo Iglesia Colonial', en: 'Baptism Colonial Church' },
        quote: { es: 'Capturaron la ceremonia y la celebracion familiar sin estorbar.', en: 'They captured both the ceremony and the family celebration without intruding.' },
      },
      {
        role: { es: 'Graduacion universitaria', en: 'University graduation' },
        quote: { es: 'Direccion clara, retratos rapidos y galeria entregada antes de tiempo.', en: 'Clear direction, fast portraits, and gallery delivered ahead of schedule.' },
      },
    ],
  },

  longForm: {
    intro: {
      es: 'La fotografia de eventos familiares en Republica Dominicana — cumpleaños, bautizos, graduaciones y quinceañeras — exige equilibrio entre formalidad y emocion natural. Cubrimos eventos en Santo Domingo, Punta Cana y toda la isla con un enfoque editorial-documental: direccion precisa para retratos clave, observacion silenciosa para momentos espontaneos.',
      en: 'Family event photography in the Dominican Republic — birthdays, baptisms, graduations, and quinceañeras — requires a balance between formality and natural emotion. We cover events in Santo Domingo, Punta Cana, and across the island with an editorial-documentary approach: precise direction for key portraits, quiet observation for spontaneous moments.',
    },
    sections: [
      {
        title: { es: 'Cumpleaños y celebraciones familiares', en: 'Birthdays and family celebrations' },
        paragraphs: {
          es: [
            'Cubrimos desde fiestas de smash cake del primer ano hasta cumpleaños de adultos en restaurantes, salones y residencias. La cobertura se ajusta a la edad del homenajeado — para ninos priorizamos energia y juego, para adultos priorizamos retratos elegantes y momentos sociales.',
            'Documentamos los detalles del evento — decoracion, mesa principal, postre — junto con la dinamica familiar. La galeria final balancea ambiente formal y momentos espontaneos para construir una historia visual completa.',
          ],
          en: [
            'We cover everything from first-year smash-cake parties to adult birthdays in restaurants, halls, and homes. Coverage adapts to the honoree age — for kids we prioritize energy and play, for adults we prioritize elegant portraits and social moments.',
            'We document the event details — decor, main table, dessert — alongside family dynamics. The final gallery balances formal atmosphere and spontaneous moments to build a complete visual story.',
          ],
        },
        bullets: {
          es: [
            'Smash cake del primer año (1-2 horas)',
            'Cumpleaños infantiles con tematica',
            'Cumpleaños hito (15, 18, 30, 40, 50, 60+)',
            'Decoracion + retratos + ambiente',
          ],
          en: [
            'First-year smash cake (1-2 hours)',
            'Themed kids birthday parties',
            'Milestone birthdays (15, 18, 30, 40, 50, 60+)',
            'Decor + portraits + atmosphere',
          ],
        },
      },
      {
        title: { es: 'Quinceañeras y eventos hito', en: 'Quinceañeras and milestone events' },
        paragraphs: {
          es: [
            'La quinceañera es uno de los eventos mas importantes en la cultura dominicana y latinoamericana. Cubrimos ceremonia, vals, retratos formales con la familia, y la celebracion completa hasta el final de la fiesta. La cobertura incluye sesion previa de retratos para tener material para invitaciones y decoracion.',
            'Para sesiones de quinceañera de moda editorial, trabajamos con direccion artistica — locaciones cinematograficas en Santo Domingo, Punta Cana, Las Terrenas o Samana. El estilo es elegante, no posado, con enfasis en luz natural y la personalidad real de la homenajeada.',
          ],
          en: [
            'The quinceañera is one of the most important events in Dominican and Latin American culture. We cover the ceremony, the waltz, formal family portraits, and the full celebration through the end of the party. Coverage includes a preview portrait session for invitations and decor material.',
            'For editorial-fashion quinceañera sessions, we work with art direction — cinematic locations in Santo Domingo, Punta Cana, Las Terrenas, or Samana. The style is elegant, not posed, with emphasis on natural light and the honoree real personality.',
          ],
        },
        bullets: {
          es: [
            'Sesion previa para invitaciones',
            'Cobertura de ceremonia + vals',
            'Retratos formales con familia',
            'Celebracion completa con narrativa de fiesta',
          ],
          en: [
            'Preview session for invitations',
            'Ceremony + waltz coverage',
            'Formal family portraits',
            'Full celebration with party storytelling',
          ],
        },
      },
      {
        title: { es: 'Bautizos y graduaciones', en: 'Baptisms and graduations' },
        paragraphs: {
          es: [
            'Para bautizos cubrimos la ceremonia religiosa en iglesia, retratos familiares con padrinos, y la celebracion en casa o salon. La iluminacion en iglesias requiere lentes rapidos y experiencia para no usar flash durante el momento sacramental — algo que respetamos siempre.',
            'Las graduaciones — desde primaria hasta universitaria y posgrado — combinan cobertura de ceremonia formal con retratos en campus o salon. Trabajamos rapido para entregar las fotos hito (toga, diploma, familia) en menos de 7 dias.',
          ],
          en: [
            'For baptisms we cover the religious ceremony in church, family portraits with godparents, and the celebration at home or hall. Church lighting requires fast lenses and experience to avoid flash during the sacramental moment — which we always respect.',
            'Graduations — from elementary through university and graduate school — combine formal ceremony coverage with campus or hall portraits. We work fast to deliver milestone photos (gown, diploma, family) in under 7 days.',
          ],
        },
      },
    ],
  },

  faqs: [
    {
      question: { es: 'Cuanto dura la cobertura de un cumpleaños o evento familiar?', en: 'How long does birthday or family event coverage last?' },
      answer: { es: 'La cobertura estandar es de 2 horas para cumpleaños o bautizos, 3-4 horas para quinceañeras y graduaciones. Eventos mas grandes pueden contratar cobertura extendida o segundo fotografo.', en: 'Standard coverage is 2 hours for birthdays or baptisms, 3-4 hours for quinceañeras and graduations. Larger events can book extended coverage or a second shooter.' },
    },
    {
      question: { es: 'Cubren bautizos en iglesia con restricciones de flash?', en: 'Do you cover church baptisms with flash restrictions?' },
      answer: { es: 'Si. Trabajamos sin flash durante la ceremonia sacramental, usando lentes rapidos y luz natural disponible. Respetamos las normas de cada iglesia.', en: 'Yes. We work without flash during the sacramental ceremony, using fast lenses and available natural light. We respect each church\'s rules.' },
    },
    {
      question: { es: 'Pueden hacer sesion previa para invitaciones de quinceañera?', en: 'Can you do a preview session for quinceañera invitations?' },
      answer: { es: 'Si. Recomendamos hacer la sesion 6-8 semanas antes del evento para tener tiempo de imprimir invitaciones y decoracion fotografica.', en: 'Yes. We recommend the session 6-8 weeks before the event to allow time for invitation printing and photo decor.' },
    },
    {
      question: { es: 'En cuanto tiempo entregan las fotos?', en: 'How fast do you deliver the photos?' },
      answer: { es: 'Galeria principal en 7-10 dias. Para graduaciones tenemos opcion de entrega express en 24-48 horas (cargo adicional).', en: 'Main gallery in 7-10 days. For graduations we offer express delivery in 24-48 hours (additional charge).' },
    },
    {
      question: { es: 'Cuantas fotos editadas recibimos?', en: 'How many edited photos do we receive?' },
      answer: { es: 'Como referencia: 30 fotos por hora para cumpleaños y bautizos, 80+ para quinceañeras de jornada completa. La cantidad final depende del nivel de actividad del evento.', en: 'As a reference: 30 photos per hour for birthdays and baptisms, 80+ for full-day quinceañeras. Final count depends on event activity level.' },
    },
    {
      question: { es: 'Cubren eventos fuera de Santo Domingo?', en: 'Do you cover events outside Santo Domingo?' },
      answer: { es: 'Si. Cubrimos eventos en Punta Cana, La Romana, Santiago, Samana, Las Terrenas y Puerto Plata. Traslado fuera del Distrito Nacional se cotiza segun distancia.', en: 'Yes. We cover events in Punta Cana, La Romana, Santiago, Samana, Las Terrenas, and Puerto Plata. Travel outside the National District is quoted by distance.' },
    },
  ],

  internalLinks: [
    {
      href: '/portfolio?category=event',
      label: { es: 'Ver eventos en el portafolio', en: 'See events in the portfolio' },
      description: { es: 'Cumpleaños, bautizos, quinceañeras y graduaciones reales.', en: 'Real birthdays, baptisms, quinceañeras, and graduations.' },
    },
    {
      href: '/get-quote?family=birthday-event-photography&cta=family-page-internal-links',
      label: { es: 'Solicitar cotizacion de evento', en: 'Request event quote' },
      description: { es: 'Cuentanos la fecha, tipo y locacion para cotizarte.', en: 'Tell us the date, type, and location for a quote.' },
    },
  ],
}
