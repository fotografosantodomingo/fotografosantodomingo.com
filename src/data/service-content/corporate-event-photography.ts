/**
 * Rich SEO content for the corporate-event-photography family page.
 *
 * Recovered from the pre-A6 architecture (commit 94fdc10^).
 * Original legacy slug: 'event-photography'.
 * Mapped to canonical family slug: 'corporate-event-photography'.
 */

import type { ServiceContent } from './types'

export const corporateEventPhotographyContent: ServiceContent = {
  seo: {
    title: {
      es: 'Fotógrafo de Eventos Corporativos Premium en Santo Domingo | Punta Cana & Resorts RD | Babula Shots',
      en: 'Premium Corporate Event Photographer in Santo Domingo | Punta Cana & DR Resorts | Babula Shots',
    },
    description: {
      es: 'Cobertura premium de conferencias, lanzamientos, premiaciones e incentivos en Santo Domingo, Punta Cana y resorts de RD. Reserva por hora o día completo.',
      en: 'Premium coverage of conferences, launches, awards, and incentive trips in Santo Domingo, Punta Cana, and DR resorts. Hourly or full-day online booking.',
    },
    keywords: {
      es: 'fotografo eventos corporativos santo domingo, fotografo conferencias punta cana, cobertura premiaciones republica dominicana, fotografo lanzamiento marca rd, fotografia incentivo corporativo resort, contratar fotografo corporativo dominicana',
      en: 'corporate event photographer santo domingo, conference photographer punta cana, awards coverage dominican republic, brand launch photographer DR, incentive trip photographer resort, hire corporate photographer dominican republic',
    },
  },
  schemaAdditionalType: 'https://schema.org/Event',
  knowsAbout: {
      es: ['fotografia de eventos corporativos', 'cobertura de conferencias', 'entrega express para prensa', 'fotografia de activaciones de marca'],
      en: ['corporate event photography', 'conference coverage', 'express PR delivery', 'brand activation photography'],
    },
  differentiators: [
      { title: { es: 'Cobertura por prioridades de marca', en: 'Coverage based on brand priorities' }, proof: { es: 'Run-of-show y shot list alineados con marketing.', en: 'Run-of-show and shot list aligned with marketing.' } },
      { title: { es: 'Selecciones express durante evento', en: 'Express selects during event hours' }, proof: { es: 'Imagenes clave para PR y redes el mismo dia.', en: 'Key images for PR and social on the same day.' } },
      { title: { es: 'Escalabilidad para eventos grandes', en: 'Scalability for large events' }, proof: { es: 'Equipo ampliable para congresos y summits de alto volumen.', en: 'Expandable team for high-volume conferences and summits.' } },
    ],
  processSteps: [
      { title: { es: 'Kickoff con organizacion', en: 'Kickoff with organizers' }, description: { es: 'Alineamos agenda, stakeholders y momentos no negociables.', en: 'We align agenda, stakeholders, and non-negotiable moments.' } },
      { title: { es: 'Cobertura por zonas', en: 'Zone-based coverage' }, description: { es: 'Distribucion de equipo por escenario y flujo de asistentes.', en: 'Team distribution by stage and attendee flow.' } },
      { title: { es: 'Selecciones rapidas', en: 'Rapid selects' }, description: { es: 'Entrega de fotos clave para redes y comunicacion interna.', en: 'Delivery of key photos for social and internal communications.' } },
      { title: { es: 'Galeria final estructurada', en: 'Structured final gallery' }, description: { es: 'Organizacion por bloques para PR, marca y archivo.', en: 'Organization by blocks for PR, brand, and archive.' } },
    ],
  locations: [
      { venue: 'Convention Center SDQ', area: 'Santo Domingo', style: { es: 'Congresos', en: 'Conferences' }, bestLight: { es: 'Luz mixta interior', en: 'Mixed indoor light' }, detail: { es: 'Keynotes y networking con cobertura editorial.', en: 'Keynotes and networking with editorial coverage.' }, href: '/portfolio?category=event' },
      { venue: 'Resort Ballrooms', area: 'Punta Cana', style: { es: 'Gala corporativa', en: 'Corporate gala' }, bestLight: { es: 'Iluminacion de escenario', en: 'Stage lighting' }, detail: { es: 'Ideal para premios y eventos de marca.', en: 'Ideal for awards and brand events.' }, href: '/portfolio?category=event' },
      { venue: 'Colonial Event Houses', area: 'Santo Domingo', style: { es: 'Social premium', en: 'Premium social' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Eventos privados con look elegante.', en: 'Private events with elegant look.' }, href: '/portfolio?category=event' },
      { venue: 'Cap Cana Conference Hotels', area: 'Cap Cana', style: { es: 'Business luxury', en: 'Business luxury' }, bestLight: { es: 'Controlado', en: 'Controlled' }, detail: { es: 'Summits y board meetings internacionales.', en: 'International summits and board meetings.' }, href: '/portfolio?category=event' },
      { venue: 'Santiago Expo Spaces', area: 'Santiago', style: { es: 'Trade show', en: 'Trade show' }, bestLight: { es: 'Interior uniforme', en: 'Uniform indoor' }, detail: { es: 'Cobertura de stands y activaciones.', en: 'Booth and activation coverage.' }, href: '/portfolio?category=event' },
      { venue: 'Beach Festivals Bavaro', area: 'Bavaro', style: { es: 'Festival costero', en: 'Beach festival' }, bestLight: { es: 'Sunset y noche', en: 'Sunset and night' }, detail: { es: 'Ambiente dinamico para contenido social.', en: 'Dynamic atmosphere for social content.' }, href: '/portfolio?category=event' },
      { venue: 'La Romana Private Clubs', area: 'La Romana', style: { es: 'Evento privado', en: 'Private event' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Cobertura discreta de alto nivel.', en: 'High-end discreet coverage.' }, href: '/portfolio?category=event' },
      { venue: 'Puerto Plata Waterfront Venues', area: 'Puerto Plata', style: { es: 'Evento destino', en: 'Destination event' }, bestLight: { es: 'Golden hour', en: 'Golden hour' }, detail: { es: 'Visuales de experiencia para sponsors.', en: 'Experience visuals for sponsors.' }, href: '/portfolio?category=event' },
    ],
  seasonality: {
      bestMonths: { es: 'Alta temporada corporativa: febrero-junio y septiembre-noviembre.', en: 'High corporate season: February-June and September-November.' },
      cautionMonths: { es: 'Para eventos en exterior se define plan de lluvia y flujo interior alterno.', en: 'For outdoor events we define rain plans and indoor workflow alternatives.' },
      daylightNote: { es: 'Para eventos mixtos conviene iniciar retratos antes de la puesta del sol.', en: 'For mixed indoor/outdoor events, portraits should start before sunset.' },
    },
  trust: {
      expertBio: {
        es: 'Cobertura de eventos corporativos y sociales con enfoque editorial, ritmo de entrega rapido y alineacion con brief de marca, desde conferencias hasta galas privadas.',
        en: 'Corporate and social event coverage with editorial focus, fast turnaround, and brand-brief alignment, from conferences to private galas.',
      },
      authoritySignals: {
        es: ['Cobertura multi-fotografo para eventos de alto volumen', 'Seleccion express para redes y prensa', 'Flujo por run-of-show y prioridades del cliente'],
        en: ['Multi-photographer coverage for high-volume events', 'Express selects for social and press teams', 'Run-of-show workflow with client priorities'],
      },
      testimonials: [
        {
          role: { es: 'Congreso regional en Santo Domingo', en: 'Regional conference in Santo Domingo' },
          quote: { es: 'Tuvimos fotos clave durante el evento para comunicacion en vivo.', en: 'We had key photos during the event for live communications.' },
        },
        {
          role: { es: 'Gala de recaudacion', en: 'Fundraising gala' },
          quote: { es: 'La narrativa visual capturo protocolo, invitados y atmosfera premium.', en: 'The visual narrative captured protocol, guests, and premium atmosphere.' },
        },
        {
          role: { es: 'Summit corporativo', en: 'Corporate summit' },
          quote: { es: 'Excelente coordinacion con marketing y patrocinadores.', en: 'Excellent coordination with marketing and sponsors.' },
        },
      ],
      caseStudy: {
        title: { es: 'Caso: cobertura con 3 escenarios simultaneos', en: 'Case: coverage with 3 simultaneous stages' },
        challenge: { es: 'Agenda compleja con keynotes, networking y activaciones de marca.', en: 'Complex agenda with keynotes, networking, and brand activations.' },
        solution: { es: 'Asignacion por zonas y lista de prioridades en tiempo real con cliente.', en: 'Zone-based assignment and real-time priority tracking with the client.' },
        result: { es: 'Galeria estructurada por momentos para PR, sponsors y archivo corporativo.', en: 'Gallery structured by moments for PR, sponsors, and corporate archive.' },
      },
    },
  longForm: {
      intro: {
        es: 'La fotografia de eventos de alto nivel requiere velocidad, criterio editorial y control de prioridades en tiempo real. Nuestro enfoque en Republica Dominicana esta pensado para marcas, productores y organizaciones que necesitan contenido util durante y despues del evento.',
        en: 'High-level event photography requires speed, editorial judgment, and real-time priority control. Our Dominican Republic approach is built for brands, producers, and organizations that need usable content during and after the event.',
      },
      sections: [
        {
          title: {
            es: 'Cobertura por run-of-show para eventos corporativos y sociales',
            en: 'Run-of-show coverage for corporate and social events',
          },
          paragraphs: {
            es: [
              'Trabajamos con agenda del evento y mapa de prioridades: speakers, invitados clave, sponsors, activaciones, networking y ambiente general. Este orden evita perder momentos criticos.',
              'La cobertura se adapta al formato del evento: conferencias, summits, lanzamientos, galas privadas o celebraciones de marca.',
            ],
            en: [
              'We work from event agenda and priority mapping: speakers, key guests, sponsors, activations, networking, and atmosphere. This order prevents missing critical moments.',
              'Coverage adapts to event format: conferences, summits, launches, private galas, or brand celebrations.',
            ],
          },
          bullets: {
            es: [
              'Cobertura editorial de escenario y audiencia',
              'Fotografia de marca y patrocinadores',
              'Narrativa visual por bloques del evento',
            ],
            en: [
              'Editorial stage and audience coverage',
              'Brand and sponsor photography',
              'Visual storytelling by event blocks',
            ],
          },
        },
        {
          title: {
            es: 'Entrega rapida para PR, social y equipos internos',
            en: 'Fast delivery for PR, social, and internal teams',
          },
          paragraphs: {
            es: [
              'En eventos con comunicacion en vivo, preparamos flujo de seleccion express para entregar fotos clave mientras el evento esta en marcha.',
              'Asi, marketing y PR publican contenido oportuno sin esperar la galeria completa, manteniendo relevancia en tiempo real.',
            ],
            en: [
              'For live communication events, we prepare an express-select workflow to deliver key images while the event is still running.',
              'This allows marketing and PR teams to publish timely content without waiting for the full gallery, preserving real-time relevance.',
            ],
          },
          bullets: {
            es: [
              'Selecciones clave el mismo dia',
              'Galeria final estructurada por bloques',
              'Formato listo para prensa y redes',
            ],
            en: [
              'Same-day key selects',
              'Final gallery structured by event blocks',
              'Press- and social-ready formats',
            ],
          },
        },
        {
          title: {
            es: 'Escalabilidad para eventos de alto volumen',
            en: 'Scalability for high-volume events',
          },
          paragraphs: {
            es: [
              'Cuando la produccion lo requiere, ampliamos equipo para cubrir escenarios simultaneos, backstage, networking y activaciones sin perder consistencia visual.',
              'Este modelo es clave para congresos, festivales y convenciones donde el evento sucede en paralelo en multiples zonas.',
            ],
            en: [
              'When production demands it, we scale crew to cover simultaneous stages, backstage, networking, and activations while preserving visual consistency.',
              'This model is essential for congresses, festivals, and conventions where activity runs in parallel across multiple zones.',
            ],
          },
          bullets: {
            es: [
              'Cobertura multi-zona coordinada',
              'Consistencia de estilo en toda la galeria',
              'Capacidad de respuesta a cambios de agenda',
            ],
            en: [
              'Coordinated multi-zone coverage',
              'Consistent style across full gallery',
              'Rapid response to schedule changes',
            ],
          },
        },
      ],
      timeline: {
        title: {
          es: 'Ejemplo de flujo para cobertura de evento',
          en: 'Sample event coverage flow',
        },
        rows: [
          {
            phase: { es: 'Kickoff con organizador', en: 'Organizer kickoff' },
            timing: { es: 'Previo al evento', en: 'Pre-event' },
            notes: { es: 'Brief, run-of-show y lista de prioridades.', en: 'Brief, run-of-show, and priority list.' },
          },
          {
            phase: { es: 'Cobertura en sitio', en: 'On-site coverage' },
            timing: { es: 'Durante evento', en: 'During event' },
            notes: { es: 'Escenario, networking, marca y momentos clave.', en: 'Stage, networking, branding, and key moments.' },
          },
          {
            phase: { es: 'Selecciones express', en: 'Express selects' },
            timing: { es: 'Mismo dia', en: 'Same day' },
            notes: { es: 'Entrega de fotos para social y PR.', en: 'Image delivery for social and PR teams.' },
          },
          {
            phase: { es: 'Galeria final', en: 'Final gallery' },
            timing: { es: '24-96h segun alcance', en: '24-96h based on scope' },
            notes: { es: 'Curaduria completa por bloques del evento.', en: 'Full curated delivery by event blocks.' },
          },
        ],
      },
    },
  faqs: [
      {
        question: {
          es: 'Cubren eventos corporativos y sociales en distintas ciudades?',
          en: 'Do you cover corporate and social events across different cities?',
        },
        answer: {
          es: 'Si. Cubrimos eventos en Santo Domingo, Santiago, Punta Cana y otras ciudades clave de Republica Dominicana.',
          en: 'Yes. We cover events in Santo Domingo, Santiago, Punta Cana, and other key Dominican Republic cities.',
        },
      },
      {
        question: {
          es: 'Pueden entregar fotos el mismo dia del evento?',
          en: 'Can you deliver images on the same day as the event?',
        },
        answer: {
          es: 'Disponemos de opciones express para seleccion de fotos clave el mismo dia, ideal para prensa, redes y comunicaciones internas.',
          en: 'We offer express options for same-day key image delivery, ideal for press, social media, and internal communications.',
        },
      },
      {
        question: {
          es: 'Trabajan con branding de marca para eventos empresariales?',
          en: 'Do you align coverage with brand guidelines for corporate events?',
        },
        answer: {
          es: 'Si. Adaptamos el estilo de cobertura y seleccion final para reforzar la identidad visual de la marca y sus objetivos de comunicacion.',
          en: 'Yes. We adapt shooting style and final selection to support your brand identity and communication goals.',
        },
      },
      {
        question: {
          es: 'Cuantos fotografos recomiendan segun cantidad de invitados?',
          en: 'How many photographers do you recommend by guest count?',
        },
        answer: {
          es: 'Como referencia: 1 fotografo para eventos pequenos, 2 para cobertura media y equipo ampliado para congresos o formatos con escenarios simultaneos.',
          en: 'As a guideline: 1 photographer for small events, 2 for mid-size coverage, and an expanded team for conferences or multi-stage formats.',
        },
      },
      {
        question: {
          es: 'Entregan fotos durante el evento para redes sociales?',
          en: 'Do you deliver photos during the event for social media?',
        },
        answer: {
          es: 'Si. Podemos configurar flujo de seleccion rapida para que el equipo de marketing publique en tiempo real momentos clave.',
          en: 'Yes. We can set up a rapid-select workflow so marketing teams can publish key moments in real time.',
        },
      },
      {
        question: {
          es: 'Incluyen cobertura de backstage y speakers?',
          en: 'Do you include backstage and speaker coverage?',
        },
        answer: {
          es: 'Si, cuando forma parte del brief. Definimos previamente accesos, tiempos y prioridades para no afectar operacion del evento.',
          en: 'Yes, when included in the brief. We define access, timing, and priorities in advance to avoid disrupting event operations.',
        },
      },
      {
        question: {
          es: 'Como manejan overtime o cambios de agenda el mismo dia?',
          en: 'How do you handle overtime or same-day schedule changes?',
        },
        answer: {
          es: 'Trabajamos con esquema flexible de extensiones y decision rapida en sitio para cubrir hitos criticos sin perder continuidad visual.',
          en: 'We work with a flexible extension model and on-site rapid decisions to cover critical milestones without losing visual continuity.',
        },
      },
    ],
  internalLinks: [
      {
        href: '/portfolio?category=event',
        label: { es: 'Revisar cobertura de eventos', en: 'Review event coverage samples' },
        description: { es: 'Casos de eventos corporativos y sociales en distintas ciudades.', en: 'Examples of corporate and social events across multiple cities.' },
      },
      {
        href: '/get-quote',
        label: { es: 'Planificar cobertura de evento', en: 'Plan event coverage' },
        description: { es: 'Definimos cronograma, entregables y plan de cobertura.', en: 'We define timeline, deliverables, and coverage plan.' },
      },
    ],
}
