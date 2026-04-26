/**
 * Rich SEO content for the custom-specialty-photography family page.
 *
 * No legacy slug equivalent — this canonical family was introduced in
 * Slice A as the quote-only catch-all for video, theatre, art, multi-day,
 * and bespoke projects. Content authored fresh, oriented around the
 * "we shape the brief together" RFQ flow rather than fixed packages.
 */

import type { ServiceContent } from './types'

export const customSpecialtyPhotographyContent: ServiceContent = {
  schemaAdditionalType: 'https://schema.org/CreativeWork',

  knowsAbout: {
    es: ['proyectos a medida', 'cobertura multi-dia', 'fotografia editorial', 'documentales visuales', 'produccion de video', 'campanas de marca'],
    en: ['custom projects', 'multi-day coverage', 'editorial photography', 'visual documentaries', 'video production', 'brand campaigns'],
  },

  differentiators: [
    {
      title: { es: 'Briefs personalizados de inicio a fin', en: 'Custom briefs end to end' },
      proof: { es: 'Cada proyecto se disena segun objetivos, locaciones, equipo y entregables especificos.', en: 'Every project is designed around specific goals, locations, crew, and deliverables.' },
    },
    {
      title: { es: 'Cobertura multi-dia y multi-locacion', en: 'Multi-day and multi-location coverage' },
      proof: { es: 'Logistica fluida para producciones de varios dias en Republica Dominicana.', en: 'Seamless logistics for multi-day productions across the Dominican Republic.' },
    },
    {
      title: { es: 'Equipo escalable segun proyecto', en: 'Crew scales to project needs' },
      proof: { es: 'Desde fotografo solo hasta produccion completa con asistentes, video y drone.', en: 'From solo photographer to full production with assistants, video, and drone.' },
    },
  ],

  processSteps: [
    {
      title: { es: 'Conversacion inicial sobre vision', en: 'Initial vision conversation' },
      description: { es: 'Definimos objetivos, audiencia, estilo y resultados esperados.', en: 'We define goals, audience, style, and expected outcomes.' },
    },
    {
      title: { es: 'Propuesta personalizada', en: 'Custom proposal' },
      description: { es: 'Cotizacion clara con alcance, timeline, equipo y entregables.', en: 'Clear quote with scope, timeline, crew, and deliverables.' },
    },
    {
      title: { es: 'Produccion del proyecto', en: 'Project production' },
      description: { es: 'Ejecucion con coordinacion logistica y direccion artistica diaria.', en: 'Execution with logistics coordination and daily art direction.' },
    },
    {
      title: { es: 'Edicion y entrega curada', en: 'Curated editing and delivery' },
      description: { es: 'Post-produccion alineada al uso final: editorial, social, web o impreso.', en: 'Post-production aligned with final use: editorial, social, web, or print.' },
    },
  ],

  seasonality: {
    bestMonths: { es: 'Producciones outdoor: noviembre a abril por estabilidad climatica.', en: 'Outdoor productions: November to April for stable weather.' },
    cautionMonths: { es: 'Mayo a octubre requieren plan B y ventana climatica para shoots exteriores.', en: 'May to October require backup plans and weather windows for outdoor shoots.' },
    daylightNote: { es: 'Disenamos timeline de produccion alrededor de golden hour y luz tropical disponible.', en: 'We design production timelines around golden hour and available tropical light.' },
  },

  trust: {
    expertBio: {
      es: 'Equipo con experiencia en proyectos editoriales, documentales, multi-dia y campanas de marca en Republica Dominicana. Adaptamos crew, equipo y direccion segun el brief — desde una jornada solo hasta produccion completa con video y drone.',
      en: 'Team experienced in editorial, documentary, multi-day, and brand campaign projects across the Dominican Republic. We adapt crew, equipment, and direction to the brief — from a solo day to full production with video and drone.',
    },
    authoritySignals: {
      es: ['Coordinacion bilingue ES/EN para clientes internacionales', 'Red de talento local: asistentes, MUA, video, drone', 'Contratos claros con propiedad intelectual definida desde inicio'],
      en: ['Bilingual ES/EN coordination for international clients', 'Local talent network: assistants, MUA, video, drone', 'Clear contracts with intellectual property defined from the start'],
    },
    testimonials: [
      {
        role: { es: 'Director artistico — campana de moda', en: 'Art director — fashion campaign' },
        quote: { es: 'Entendieron la vision y la elevaron con direccion local que nosotros no teniamos.', en: 'They understood the vision and elevated it with local direction we did not have.' },
      },
      {
        role: { es: 'Productor — proyecto multi-dia', en: 'Producer — multi-day project' },
        quote: { es: 'Cubrieron 4 dias en 3 ciudades sin un solo problema logistico.', en: 'They covered 4 days across 3 cities without a single logistical issue.' },
      },
    ],
  },

  longForm: {
    intro: {
      es: 'Algunos proyectos no encajan en un paquete fijo. Una campana de moda con direccion artistica internacional. Un documental visual de 5 dias. Un video musical en locaciones premium. Una colaboracion editorial para una marca. Para todo eso existe esta familia: cobertura totalmente personalizada, con propuesta clara despues de una conversacion inicial sobre vision y alcance.',
      en: 'Some projects do not fit a fixed package. A fashion campaign with international art direction. A 5-day visual documentary. A music video in premium locations. An editorial collaboration for a brand. This family exists for all of that: fully customized coverage, with a clear proposal after an initial conversation about vision and scope.',
    },
    sections: [
      {
        title: { es: 'Que tipo de proyectos cubre esta familia', en: 'What types of projects this family covers' },
        paragraphs: {
          es: [
            'Trabajamos en proyectos donde el brief es el punto de partida. Eso incluye produccion editorial para revistas y marcas, cobertura documental de eventos culturales o lanzamientos, video musical y comercial, y colaboraciones de larga duracion con agencias o estudios.',
            'Tambien cubrimos proyectos personales que requieren tratamiento custom — un libro fotografico, un homenaje familiar de varios dias, una experiencia de pareja con cobertura editorial. Si el resultado esperado no es un paquete listo, este es el camino correcto.',
          ],
          en: [
            'We take on projects where the brief is the starting point. That includes editorial production for magazines and brands, documentary coverage of cultural events or launches, music and commercial video, and long-form collaborations with agencies or studios.',
            'We also cover personal projects that need custom treatment — a photo book, a multi-day family tribute, an editorial-style couple experience. If the expected outcome is not a ready-made package, this is the right path.',
          ],
        },
        bullets: {
          es: [
            'Campañas editoriales y de moda',
            'Documentales visuales (1-5+ dias)',
            'Video musical y comercial',
            'Colaboraciones con agencias',
            'Proyectos personales custom',
          ],
          en: [
            'Editorial and fashion campaigns',
            'Visual documentaries (1-5+ days)',
            'Music and commercial video',
            'Agency collaborations',
            'Custom personal projects',
          ],
        },
      },
      {
        title: { es: 'Como funciona la cotizacion personalizada', en: 'How custom quoting works' },
        paragraphs: {
          es: [
            'Empezamos con una conversacion inicial — por WhatsApp o videollamada — donde definimos objetivos del proyecto, audiencia, estilo de referencia, locaciones, fechas, equipo necesario y entregables finales. Esa conversacion es siempre gratuita y sin compromiso.',
            'Despues enviamos una propuesta clara con alcance detallado, cronograma, equipo recomendado, derechos de uso y costo por etapas. Tu apruebas y firmamos contrato. La transparencia desde inicio es lo que separa un proyecto bien ejecutado de uno problematico.',
          ],
          en: [
            'We start with an initial conversation — via WhatsApp or video call — where we define project goals, audience, reference style, locations, dates, required crew, and final deliverables. That conversation is always free and no-commitment.',
            'Then we send a clear proposal with detailed scope, schedule, recommended crew, usage rights, and staged pricing. You approve and we sign a contract. Transparency from the start is what separates a well-executed project from a problematic one.',
          ],
        },
        bullets: {
          es: [
            'Conversacion inicial gratuita y sin compromiso',
            'Propuesta detallada en menos de 5 dias habiles',
            'Costo por etapas con derechos de uso definidos',
            'Contrato firmado antes de produccion',
          ],
          en: [
            'Free no-commitment initial conversation',
            'Detailed proposal within 5 business days',
            'Staged pricing with defined usage rights',
            'Signed contract before production starts',
          ],
        },
      },
    ],
  },

  faqs: [
    {
      question: { es: 'Que diferencia esta familia del resto?', en: 'What sets this family apart from the others?' },
      answer: { es: 'Las otras familias tienen paquetes fijos con precio publicado. Esta familia es exclusivamente cotizacion: cada proyecto se disena desde cero segun brief, alcance, equipo y entregables.', en: 'Other families have fixed packages with published prices. This family is quote-only: each project is designed from scratch based on brief, scope, crew, and deliverables.' },
    },
    {
      question: { es: 'Hay un precio minimo para empezar a hablar?', en: 'Is there a minimum budget to start talking?' },
      answer: { es: 'La consulta inicial es gratuita siempre. Como referencia practica, los proyectos custom suelen comenzar desde USD 1,500 — pero la conversacion no tiene umbral.', en: 'The initial conversation is always free. As a practical reference, custom projects typically start from USD 1,500 — but the conversation has no threshold.' },
    },
    {
      question: { es: 'Trabajan con agencias y productoras internacionales?', en: 'Do you work with international agencies and production houses?' },
      answer: { es: 'Si. Tenemos experiencia coordinando con clientes en Estados Unidos, Europa y Latinoamerica. La coordinacion es bilingue ES/EN.', en: 'Yes. We have experience coordinating with clients in the United States, Europe, and Latin America. Coordination is bilingual ES/EN.' },
    },
    {
      question: { es: 'Pueden incluir video y drone en el mismo proyecto?', en: 'Can you include video and drone in the same project?' },
      answer: { es: 'Si. Para proyectos de campana o multi-dia, incorporamos video, drone y asistencia segun el brief. Crew escalable.', en: 'Yes. For campaign or multi-day projects, we add video, drone, and assistance based on the brief. Crew is scalable.' },
    },
    {
      question: { es: 'Como se manejan los derechos de uso de las imagenes?', en: 'How are image usage rights handled?' },
      answer: { es: 'Cada propuesta incluye derechos de uso explicitos: web, social, impreso, comercial, exclusividad temporal. Lo definimos antes del proyecto, no despues.', en: 'Every proposal includes explicit usage rights: web, social, print, commercial, temporary exclusivity. We define this before the project, not after.' },
    },
  ],

  internalLinks: [
    {
      href: '/portfolio',
      label: { es: 'Explorar portafolio completo', en: 'Explore full portfolio' },
      description: { es: 'Trabajos editoriales, comerciales y proyectos custom recientes.', en: 'Editorial, commercial, and recent custom projects.' },
    },
    {
      href: '/get-quote?family=custom-specialty-photography&cta=family-page-internal-links',
      label: { es: 'Iniciar conversacion sobre tu proyecto', en: 'Start a conversation about your project' },
      description: { es: 'Cuentanos vision, fechas y alcance — propuesta detallada en menos de 5 dias.', en: 'Tell us your vision, dates, and scope — detailed proposal within 5 days.' },
    },
  ],
}
