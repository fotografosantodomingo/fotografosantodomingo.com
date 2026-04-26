/**
 * Rich SEO content for the wedding-photography family page.
 *
 * Recovered from the pre-A6 architecture (commit 94fdc10^) and re-housed
 * here so the canonical Bugatti family page can render it as additional
 * sections. The package compare grid stays as the conversion mechanic;
 * this module supplies the SEO/trust depth that ranks the page.
 */

import type { ServiceContent } from './types'

export const weddingPhotographyContent: ServiceContent = {
  seo: {
    title: {
      es: 'Fotógrafo de Bodas en República Dominicana | Santo Domingo & Punta Cana | Babula Shots',
      en: 'Wedding Photographer in Dominican Republic | Punta Cana & Santo Domingo | Babula Shots',
    },
    description: {
      es: 'Fotografía de bodas premium en Punta Cana, Santo Domingo y toda República Dominicana. Cobertura natural, editorial, galería editada y reserva online inmediata.',
      en: 'Premium wedding photography in Punta Cana, Santo Domingo, and across the Dominican Republic. Natural editorial coverage, edited gallery, and instant online booking.',
    },
    keywords: {
      es: 'fotografo de bodas republica dominicana, fotografo de bodas punta cana, fotografo de bodas santo domingo, boda destino republica dominicana, fotografia de bodas premium, reservar fotografo boda rd',
      en: 'dominican republic wedding photographer, punta cana wedding photographer, santo domingo wedding photographer, destination wedding photographer dominican republic, luxury wedding photography dominican republic, book wedding photographer DR',
    },
  },

  schemaAdditionalType: 'https://schema.org/WeddingService',

  knowsAbout: {
    es: [
      'fotografia de bodas destino',
      'wedding timeline',
      'ceremonias en playa',
      'cobertura de recepcion',
    ],
    en: [
      'destination wedding photography',
      'wedding timeline planning',
      'beach ceremonies',
      'reception coverage',
    ],
  },

  differentiators: [
    {
      title: {
        es: 'Direccion multilingue para bodas destino',
        en: 'Multilingual direction for destination weddings',
      },
      proof: {
        es: 'Coordinacion fluida con parejas y proveedores internacionales.',
        en: 'Smooth coordination with international couples and vendors.',
      },
    },
    {
      title: {
        es: 'Experiencia real en resorts de RD',
        en: 'Real experience across DR resorts',
      },
      proof: {
        es: 'Planificacion de timeline en venues con logistica compleja.',
        en: 'Timeline planning in venues with complex logistics.',
      },
    },
    {
      title: {
        es: 'Narrativa completa del dia',
        en: 'Complete day storytelling',
      },
      proof: {
        es: 'Cobertura de detalles, emocion y ambiente sin perder ritmo.',
        en: 'Coverage of details, emotion, and atmosphere without losing pace.',
      },
    },
  ],

  processSteps: [
    {
      title: { es: 'Consulta inicial y vision de boda', en: 'Initial consultation and wedding vision' },
      description: { es: 'Definimos estilo, cobertura y prioridades del dia.', en: 'We define style, coverage, and day priorities.' },
    },
    {
      title: { es: 'Plan de timeline y locaciones', en: 'Timeline and location planning' },
      description: { es: 'Alineamos ceremonia, retratos y recepcion con la luz ideal.', en: 'We align ceremony, portraits, and reception with ideal light.' },
    },
    {
      title: { es: 'Cobertura del evento', en: 'Wedding day coverage' },
      description: { es: 'Equipo enfocado en historia completa y momentos clave.', en: 'Team focused on complete storytelling and key moments.' },
    },
    {
      title: { es: 'Edicion y entrega', en: 'Post-production and delivery' },
      description: { es: 'Galeria curada en alta resolucion con seleccion final profesional.', en: 'Curated high-resolution gallery with professional final selection.' },
    },
  ],

  locations: [
    { venue: 'Sanctuary Cap Cana', area: 'Cap Cana', style: { es: 'Resort boutique de lujo', en: 'Luxury boutique resort' }, bestLight: { es: 'Golden hour frente al mar', en: 'Golden hour by the sea' }, detail: { es: 'Ideal para bodas elegantes y ceremonias intimas.', en: 'Great for elegant weddings and intimate ceremonies.' }, href: '/portfolio?category=wedding' },
    { venue: 'Hard Rock Punta Cana', area: 'Punta Cana', style: { es: 'Resort moderno de gran escala', en: 'Large modern resort' }, bestLight: { es: 'Manana y sunset', en: 'Morning and sunset' }, detail: { es: 'Funciona bien para celebraciones numerosas.', en: 'Works well for large celebrations.' }, href: '/portfolio?category=wedding' },
    { venue: 'Altos de Chavon', area: 'La Romana', style: { es: 'Arquitectura historica', en: 'Historic architecture' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Escenario con textura cultural y editorial.', en: 'A cultural, editorial-style setting.' }, href: '/portfolio?category=wedding' },
    { venue: 'Tortuga Bay', area: 'Punta Cana', style: { es: 'Villas premium', en: 'Premium villas' }, bestLight: { es: 'Sunrise y sunset', en: 'Sunrise and sunset' }, detail: { es: 'Privacidad y look sofisticado.', en: 'Private and sophisticated look.' }, href: '/portfolio?category=wedding' },
    { venue: 'Casa de Campo', area: 'La Romana', style: { es: 'Resort clasico', en: 'Classic resort' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Variedad de spots entre marina y jardines.', en: 'Variety of spots between marina and gardens.' }, href: '/portfolio?category=wedding' },
    { venue: 'Macao Beach', area: 'Punta Cana', style: { es: 'Playa natural', en: 'Natural beach' }, bestLight: { es: 'Ultima hora del dia', en: 'Last hour of daylight' }, detail: { es: 'Look organico para parejas destino.', en: 'Organic look for destination couples.' }, href: '/portfolio?category=wedding' },
    { venue: 'Santo Domingo Colonial Zone', area: 'Santo Domingo', style: { es: 'Colonial urbano', en: 'Urban colonial' }, bestLight: { es: 'Manana', en: 'Morning' }, detail: { es: 'Sesiones pre o post boda con historia visual.', en: 'Pre/post wedding sessions with historic character.' }, href: '/portfolio?category=wedding' },
    { venue: 'Las Terrenas Beach Clubs', area: 'Las Terrenas', style: { es: 'Boho tropical', en: 'Tropical boho' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Ambiente relajado para bodas destino.', en: 'Relaxed atmosphere for destination weddings.' }, href: '/portfolio?category=wedding' },
  ],

  seasonality: {
    bestMonths: { es: 'Temporada recomendada: noviembre a abril por clima mas estable.', en: 'Best season: November to April for more stable weather.' },
    cautionMonths: { es: 'Temporada de lluvia/huracanes: mayo a octubre, con plan B obligatorio.', en: 'Rain/hurricane season: May to October, with mandatory backup plans.' },
    daylightNote: { es: 'Golden hour promedio: 5:30-6:45 PM segun mes y locacion.', en: 'Average golden hour: 5:30-6:45 PM depending on month and location.' },
  },

  trust: {
    expertBio: {
      es: 'Equipo liderado por fotografo de bodas destino con mas de 10 temporadas en Republica Dominicana, cobertura de celebraciones multiculturales y coordinacion fluida con planners, resorts y equipos de produccion.',
      en: 'Team led by a destination wedding photographer with 10+ seasons in the Dominican Republic, covering multicultural celebrations with smooth coordination across planners, resorts, and production teams.',
    },
    authoritySignals: {
      es: [
        'Direccion bilingue ES/EN para bodas internacionales',
        'Red local de planners y venues en Punta Cana y Cap Cana',
        'Flujo de respaldo: doble camara, doble almacenamiento y contrato claro',
      ],
      en: [
        'Bilingual ES/EN direction for international weddings',
        'Local network of planners and venues in Punta Cana and Cap Cana',
        'Redundant workflow: dual cameras, dual storage, and clear contracts',
      ],
    },
    testimonials: [
      {
        role: { es: 'Pareja destino en Cap Cana', en: 'Destination couple in Cap Cana' },
        quote: { es: 'La direccion fue precisa y tranquila. Nos sentimos acompanados todo el dia.', en: 'Direction was precise and calm. We felt fully guided the entire day.' },
      },
      {
        role: { es: 'Boda resort en Punta Cana', en: 'Resort wedding in Punta Cana' },
        quote: { es: 'Entendieron la luz del venue y resolvieron cambios de clima sin estres.', en: 'They understood the venue light and handled weather changes without stress.' },
      },
      {
        role: { es: 'Micro wedding en La Romana', en: 'Micro wedding in La Romana' },
        quote: { es: 'Recibimos una galeria elegante y autentica, lista para compartir con familia.', en: 'We received an elegant, authentic gallery ready to share with family.' },
      },
    ],
    caseStudy: {
      title: { es: 'Caso: lluvia inesperada en ceremonia de playa', en: 'Case: unexpected rain during beach ceremony' },
      challenge: { es: 'El timeline se movio por lluvia y viento a minutos del inicio.', en: 'The timeline shifted due to rain and wind minutes before start.' },
      solution: { es: 'Se ejecuto plan B en area cubierta, luego retratos en golden hour con ventana climatica.', en: 'We executed plan B under cover, then moved to golden-hour portraits in a weather window.' },
      result: { es: 'Entrega final con narrativa completa del dia sin perdida de momentos clave.', en: 'Final delivery kept the full story of the day with no loss of key moments.' },
    },
  },

  longForm: {
    intro: {
      es: 'La fotografia de bodas destino en Republica Dominicana exige algo mas que una camara. Exige experiencia real en resorts, control de timeline, lectura de luz tropical y capacidad de respuesta ante cambios de clima. Esta pagina resume nuestro enfoque para parejas que buscan una cobertura elegante, natural y orientada a recuerdos que realmente importan con base en Punta Cana, Cap Cana, La Romana y Santo Domingo.',
      en: 'Destination wedding photography in the Dominican Republic requires more than a camera. It requires real resort experience, timeline control, tropical light awareness, and strong response to weather changes. This page outlines our approach for couples who want elegant, natural coverage focused on moments that truly matter across Punta Cana, Cap Cana, La Romana, and Santo Domingo.',
    },
    sections: [
      {
        title: { es: 'Cobertura completa para bodas destino en Punta Cana y Cap Cana', en: 'Complete destination coverage in Punta Cana and Cap Cana' },
        paragraphs: {
          es: [
            'Nuestra cobertura esta pensada para parejas internacionales y locales que necesitan claridad desde la etapa de planificacion. Definimos objetivos visuales, estilo de retrato, orden de prioridades y bloques horarios para que la boda fluya sin fricciones.',
            'A diferencia de una cobertura social generica, trabajamos con enfoque editorial-documental: direccion precisa cuando hace falta, observacion silenciosa cuando el momento pide naturalidad, y una narrativa final que conecta preparativos, ceremonia, recepcion y emociones familiares.',
          ],
          en: [
            'Our coverage is built for international and local couples who need clarity during planning. We define visual goals, portrait style, priority order, and time blocks so the wedding day runs smoothly.',
            'Unlike generic event coverage, we work with an editorial-documentary approach: precise direction when needed, quiet observation when moments should stay natural, and a final narrative that connects getting ready, ceremony, reception, and family emotion.',
          ],
        },
        bullets: {
          es: [
            'Coordinacion previa con planner, venue y equipo audiovisual',
            'Direccion de pareja y familia sin poses rigidas',
            'Cobertura de detalles de diseno, atmosfera y storytelling completo',
            'Entrega final pensada para galeria digital, album y social sharing',
          ],
          en: [
            'Pre-production coordination with planner, venue, and audiovisual team',
            'Couple and family direction without rigid posing',
            'Coverage of design details, atmosphere, and full storytelling',
            'Final delivery optimized for digital galleries, albums, and social sharing',
          ],
        },
      },
      {
        title: { es: 'Paquetes y niveles de cobertura segun el tipo de boda', en: 'Coverage packages by wedding type' },
        paragraphs: {
          es: [
            'Para elopements y bodas intimas, priorizamos una cobertura compacta y emocional enfocada en ceremonia, retratos y detalles de contexto. Para bodas de jornada completa, estructuramos la narrativa desde preparativos hasta fiesta, con margen para retratos al atardecer.',
            'En bodas multi-dia incluimos eventos previos como welcome dinner o brunch post-boda para construir una historia mas rica del viaje completo de la pareja y sus invitados.',
          ],
          en: [
            'For elopements and intimate weddings, we prioritize compact emotional coverage focused on ceremony, portraits, and contextual details. For full-day weddings, we structure the narrative from getting ready to dance floor, with room for sunset portraits.',
            'For multi-day weddings, we include pre-events such as welcome dinner or post-wedding brunch to build a richer story around the couple and guest experience.',
          ],
        },
        bullets: {
          es: [
            'Media jornada: ceremonia + retratos + highlights de recepcion',
            'Jornada completa: preparativos + ceremonia + recepcion + fiesta',
            'Multi-dia: eventos previos y posteriores para historia extendida',
          ],
          en: [
            'Half-day: ceremony + portraits + reception highlights',
            'Full-day: getting ready + ceremony + reception + party coverage',
            'Multi-day: pre and post events for extended storytelling',
          ],
        },
      },
      {
        title: { es: 'Inversion y factores que impactan el presupuesto', en: 'Investment and factors that affect pricing' },
        paragraphs: {
          es: [
            'El rango de inversion depende de horas de cobertura, numero de invitados, complejidad logistica entre locaciones, necesidad de segundo fotografo y productos finales (albumes, impresiones, entregas express).',
            'Para mantener transparencia, trabajamos con propuesta clara por etapas: reserva de fecha, planificacion, cobertura y entrega final. Asi puedes evaluar el retorno real en experiencia y calidad de recuerdos.',
          ],
          en: [
            'Investment range depends on coverage hours, guest count, logistical complexity between locations, second-shooter needs, and final products (albums, prints, rush options).',
            'To keep pricing transparent, we use a clear staged proposal: date reservation, planning, coverage, and final delivery. This helps couples evaluate real value in both experience and long-term memory quality.',
          ],
        },
        bullets: {
          es: [
            'Rango orientativo wedding destination: USD 2,800 a 8,000+',
            'Factores clave: horas, invitados, venues, equipo, productos finales',
            'Opciones de add-ons: preboda, drone, album premium, express delivery',
          ],
          en: [
            'Indicative destination range: USD 2,800 to 8,000+',
            'Key factors: hours, guests, venues, crew, final products',
            'Add-ons: engagement session, drone, premium album, express delivery',
          ],
        },
      },
      {
        title: { es: 'Plan B en temporada de lluvia: confianza operativa', en: 'Rain-season backup planning: operational trust' },
        paragraphs: {
          es: [
            'La temporada de lluvia no significa perder calidad. Significa planificar bien. Trabajamos con rutas alternativas, areas cubiertas seleccionadas por luz y tiempos de retrato ajustados para aprovechar ventanas climaticas.',
            'El objetivo es proteger la experiencia del cliente y sostener resultados premium aun cuando cambian las condiciones. Esta preparacion es parte critica de nuestro valor en bodas destino en RD.',
          ],
          en: [
            'Rain season does not mean lower quality. It means stronger planning. We work with alternate routes, covered areas selected for light, and portrait timing adjusted to weather windows.',
            'The goal is to protect the client experience and maintain premium results even when conditions shift. This preparation is a key part of our value for destination weddings in the DR.',
          ],
        },
        bullets: {
          es: [
            'Plan alterno de retratos por venue',
            'Redundancia de equipo y almacenamiento',
            'Coordinacion en tiempo real con planner y venue',
          ],
          en: [
            'Venue-specific portrait backup plan',
            'Equipment and storage redundancy',
            'Real-time coordination with planner and venue staff',
          ],
        },
      },
    ],
    timeline: {
      title: { es: 'Ejemplo de timeline de boda (cobertura completa)', en: 'Sample wedding timeline (full-day coverage)' },
      rows: [
        {
          phase: { es: 'Preparativos', en: 'Getting ready' },
          timing: { es: '2-3 horas antes de ceremonia', en: '2-3 hours before ceremony' },
          notes: { es: 'Detalles, retratos iniciales, familia cercana.', en: 'Details, early portraits, close family coverage.' },
        },
        {
          phase: { es: 'Ceremonia', en: 'Ceremony' },
          timing: { es: 'Bloque principal', en: 'Core timeline block' },
          notes: { es: 'Entradas, votos, anillos, salida y abrazos.', en: 'Entrance, vows, rings, exit, and key reactions.' },
        },
        {
          phase: { es: 'Retratos de pareja y familia', en: 'Couple and family portraits' },
          timing: { es: 'Golden hour recomendado', en: 'Golden hour recommended' },
          notes: { es: 'Direccion natural para retratos elegantes y emotivos.', en: 'Natural direction for elegant emotional portraits.' },
        },
        {
          phase: { es: 'Recepcion y fiesta', en: 'Reception and celebration' },
          timing: { es: 'Resto de cobertura', en: 'Remaining coverage block' },
          notes: { es: 'Discursos, primer baile, ambiente y energia final.', en: 'Speeches, first dance, atmosphere, and party energy.' },
        },
      ],
    },
  },

  faqs: [
    {
      question: { es: 'Con cuanto tiempo de anticipacion debo reservar fotografia de bodas en Republica Dominicana?', en: 'How far in advance should I book wedding photography in the Dominican Republic?' },
      answer: { es: 'Recomendamos reservar entre 6 y 12 meses antes para fechas de alta demanda en Punta Cana, Cap Cana y Santo Domingo. Para bodas intimas entre semana tambien podemos confirmar con menor anticipacion.', en: 'We recommend booking 6 to 12 months in advance for high-demand dates in Punta Cana, Cap Cana, and Santo Domingo. For intimate weekday weddings we can often confirm on shorter notice.' },
    },
    {
      question: { es: 'Cubren bodas destino fuera de Punta Cana?', en: 'Do you cover destination weddings outside Punta Cana?' },
      answer: { es: 'Si. Cubrimos bodas destino en toda Republica Dominicana incluyendo La Romana, Samana, Las Terrenas y Puerto Plata, segun logistica y agenda.', en: 'Yes. We cover destination weddings across the Dominican Republic including La Romana, Samana, Las Terrenas, and Puerto Plata, based on logistics and schedule.' },
    },
    {
      question: { es: 'En cuanto tiempo entregan las fotos de boda?', en: 'How fast do you deliver wedding photos?' },
      answer: { es: 'Entregamos una seleccion inicial rapida y luego la galeria final editada en alta resolucion dentro del plazo acordado en contrato, segun cobertura y volumen.', en: 'We provide a fast preview selection and then the final high-resolution edited gallery within the contract timeline, depending on coverage length and image volume.' },
    },
    {
      question: { es: 'Cuantas fotos recibimos por hora de cobertura?', en: 'How many images do we receive per hour of coverage?' },
      answer: { es: 'Como referencia, entregamos normalmente entre 80 y 100 fotos finales por hora de cobertura efectiva, manteniendo coherencia de color y narrativa del dia.', en: 'As a reference, we usually deliver between 80 and 100 final images per hour of effective coverage while keeping color consistency and full-day storytelling.' },
    },
    {
      question: { es: 'Ofrecen segundo fotografo para bodas grandes?', en: 'Do you offer a second shooter for large weddings?' },
      answer: { es: 'Si. Recomendamos segundo fotografo para bodas de 100+ invitados, multiples locaciones o timelines ajustados para no perder momentos simultaneos.', en: 'Yes. We recommend a second shooter for 100+ guest weddings, multi-location timelines, or tight schedules so simultaneous moments are not missed.' },
    },
    {
      question: { es: 'Que pasa si llueve o hay alerta de tormenta?', en: 'What happens if it rains or there is a storm alert?' },
      answer: { es: 'Trabajamos con plan de contingencia desde preproduccion: spots cubiertos, orden alterno del timeline y politica de reprogramacion segun contrato.', en: 'We work with a contingency plan from pre-production: covered spots, alternate timeline order, and a contract-based rescheduling policy.' },
    },
    {
      question: { es: 'Podemos pedir una lista de fotos imprescindibles?', en: 'Can we request a must-have shot list?' },
      answer: { es: 'Claro. En la fase de planificacion recopilamos tu lista de retratos familiares, detalles y momentos clave para integrarla al flujo del dia.', en: 'Absolutely. During planning we collect your family portrait list, detail priorities, and key moments to integrate them into the wedding-day flow.' },
    },
    {
      question: { es: 'En que idiomas pueden coordinar la cobertura?', en: 'Which languages can you coordinate coverage in?' },
      answer: { es: 'Coordinamos regularmente en espanol e ingles para bodas destino, facilitando comunicacion con parejas, wedding planners y proveedores locales.', en: 'We regularly coordinate in Spanish and English for destination weddings, making communication smooth with couples, wedding planners, and local vendors.' },
    },
  ],

  internalLinks: [
    {
      href: '/portfolio?category=wedding',
      label: { es: 'Ver bodas reales en el portafolio', en: 'See real weddings in the portfolio' },
      description: { es: 'Revisa cobertura completa de bodas destino en Punta Cana y Cap Cana.', en: 'Review full destination wedding coverage in Punta Cana and Cap Cana.' },
    },
    {
      href: '/get-quote?family=wedding-photography&cta=family-page-internal-links',
      label: { es: 'Solicitar disponibilidad de fecha', en: 'Check date availability' },
      description: { es: 'Agenda una consulta para asegurar tu fecha de boda en RD.', en: 'Book a consultation to secure your wedding date in the DR.' },
    },
  ],
}
