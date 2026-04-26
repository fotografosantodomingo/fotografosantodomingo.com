/**
 * Rich SEO content for the commercial-branding-photography family page.
 *
 * Recovered from the pre-A6 architecture (commit 94fdc10^).
 * Original legacy slug: 'commercial-photography'.
 * Mapped to canonical family slug: 'commercial-branding-photography'.
 */

import type { ServiceContent } from './types'

export const commercialBrandingPhotographyContent: ServiceContent = {
  seo: {
    title: {
      es: 'Fotografía Comercial Profesional en República Dominicana | Hoteles, Productos & Marcas | Babula Shots',
      en: 'Professional Commercial Photography Dominican Republic | Hotels, Products & Brands | Babula Shots',
    },
    description: {
      es: 'Fotografía comercial para hoteles de Punta Cana, restaurantes de Santo Domingo, productos y marcas en RD. Derechos de uso claros y entrega rápida con reserva online.',
      en: 'Commercial photography for Punta Cana hotels, Santo Domingo restaurants, products, and brands across DR. Clear usage rights, fast delivery, and online booking.',
    },
    keywords: {
      es: 'fotografo comercial santo domingo, fotografia hoteles punta cana, fotografo productos republica dominicana, fotografia gastronomica restaurantes rd, contenido marca premium dominicana, contratar fotografo comercial dr',
      en: 'commercial photographer santo domingo, hotel photographer punta cana, product photography dominican republic, food photography restaurants DR, premium brand content dominican republic, hire commercial photographer DR',
    },
  },
  schemaAdditionalType: 'https://schema.org/ProfessionalService',
  knowsAbout: {
      es: ['fotografia comercial', 'produccion de campanas', 'contenido ecommerce', 'licenciamiento de imagen'],
      en: ['commercial photography', 'campaign production', 'ecommerce content', 'image licensing'],
    },
  differentiators: [
      { title: { es: 'Brief creativo orientado a objetivos', en: 'Goal-driven creative brief process' }, proof: { es: 'Cada set responde a metricas de marca y conversion.', en: 'Every setup maps to brand and conversion metrics.' } },
      { title: { es: 'Licencias claras para equipos legales', en: 'Clear licensing for legal teams' }, proof: { es: 'Uso definido por canal, territorio y duracion.', en: 'Usage defined by channel, territory, and duration.' } },
      { title: { es: 'Produccion escalable para campanas', en: 'Scalable campaign production' }, proof: { es: 'Desde ecommerce puntual hasta bibliotecas visuales completas.', en: 'From focused ecommerce sets to full visual libraries.' } },
    ],
  processSteps: [
      { title: { es: 'Discovery y brief', en: 'Discovery and brief' }, description: { es: 'Aterrizamos objetivos de negocio, audiencia y canales.', en: 'We align business goals, audiences, and channels.' } },
      { title: { es: 'Preproduccion', en: 'Pre-production' }, description: { es: 'Shot list, calendario, casting y aprobaciones previas.', en: 'Shot list, schedule, casting, and pre-approvals.' } },
      { title: { es: 'Rodaje multiformato', en: 'Multi-format production' }, description: { es: 'Produccion foto y complementos segun campana.', en: 'Photo production and add-ons based on campaign goals.' } },
      { title: { es: 'Post y deployment', en: 'Post-production and deployment' }, description: { es: 'Entregables por plataforma con licenciamiento definido.', en: 'Platform-ready deliverables with defined licensing.' } },
    ],
  locations: [
      { venue: 'Santo Domingo Studios', area: 'Santo Domingo', style: { es: 'Producto ecommerce', en: 'Ecommerce product' }, bestLight: { es: 'Control total', en: 'Full control' }, detail: { es: 'Fondos limpios para catalogo y marketplaces.', en: 'Clean backgrounds for catalogs and marketplaces.' }, href: '/portfolio?category=commercial' },
      { venue: 'Hospitality Resorts Punta Cana', area: 'Punta Cana', style: { es: 'Hospitalidad premium', en: 'Premium hospitality' }, bestLight: { es: 'Sunrise y sunset', en: 'Sunrise and sunset' }, detail: { es: 'Contenido para web de hotel y OTA.', en: 'Content for hotel websites and OTAs.' }, href: '/portfolio?category=commercial' },
      { venue: 'Cap Cana Restaurants', area: 'Cap Cana', style: { es: 'Food and beverage', en: 'Food and beverage' }, bestLight: { es: 'Lunch y dinner', en: 'Lunch and dinner' }, detail: { es: 'Fotografia de menu y piezas de campana.', en: 'Menu photography and campaign assets.' }, href: '/portfolio?category=commercial' },
      { venue: 'Santiago Retail Spaces', area: 'Santiago', style: { es: 'Retail branding', en: 'Retail branding' }, bestLight: { es: 'Interior controlado', en: 'Controlled indoor' }, detail: { es: 'Visuales de punto de venta y equipo.', en: 'Point-of-sale and team visuals.' }, href: '/portfolio?category=commercial' },
      { venue: 'Industrial Parks SDQ', area: 'Santo Domingo', style: { es: 'Industrial B2B', en: 'Industrial B2B' }, bestLight: { es: 'Media manana', en: 'Mid-morning' }, detail: { es: 'Contenido corporativo para inversionistas.', en: 'Corporate content for investors.' }, href: '/portfolio?category=commercial' },
      { venue: 'La Romana Developments', area: 'La Romana', style: { es: 'Real estate premium', en: 'Premium real estate' }, bestLight: { es: 'Golden hour', en: 'Golden hour' }, detail: { es: 'Visuales para preventa y presentaciones.', en: 'Visuals for pre-sales and presentations.' }, href: '/portfolio?category=commercial' },
      { venue: 'Puerto Plata Hotel Zones', area: 'Puerto Plata', style: { es: 'Turismo comercial', en: 'Commercial tourism' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Campanas estacionales de ocupacion.', en: 'Seasonal occupancy campaigns.' }, href: '/portfolio?category=commercial' },
      { venue: 'Bavaro Lifestyle Areas', area: 'Bavaro', style: { es: 'Lifestyle de marca', en: 'Brand lifestyle' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Producciones para social y paid media.', en: 'Productions for social and paid media.' }, href: '/portfolio?category=commercial' },
    ],
  seasonality: {
      bestMonths: { es: 'Produccion comercial se realiza todo el ano con preproduccion por clima.', en: 'Commercial production runs year-round with climate-aware pre-production.' },
      cautionMonths: { es: 'En temporada de lluvia se prioriza shooting block y cronograma modular.', en: 'In rainy season we prioritize block shooting and modular scheduling.' },
      daylightNote: { es: 'Para hospitality, sunrise y blue hour maximizan impacto visual.', en: 'For hospitality, sunrise and blue hour maximize visual impact.' },
    },
  trust: {
      expertBio: {
        es: 'Produccion comercial para marcas y hoteles con metodologia de brief creativo, plan de rodaje y entregables listos para campana, ecommerce y comunicacion corporativa.',
        en: 'Commercial production for brands and hotels with a creative brief methodology, shoot planning, and deliverables ready for campaigns, ecommerce, and corporate communications.',
      },
      authoritySignals: {
        es: ['Workflow orientado a ROI y objetivos de marketing', 'Licenciamiento comercial claro por canal y duracion', 'Colaboracion con equipos de agencia y directores creativos'],
        en: ['ROI-focused workflow tied to marketing objectives', 'Clear commercial licensing by channel and duration', 'Collaboration-ready with agency teams and creative directors'],
      },
      testimonials: [
        {
          role: { es: 'Marca de hospitalidad', en: 'Hospitality brand' },
          quote: { es: 'La produccion elevo la coherencia visual de toda la campana.', en: 'Production elevated the visual consistency of the entire campaign.' },
        },
        {
          role: { es: 'Empresa de consumo masivo', en: 'Consumer goods company' },
          quote: { es: 'Recibimos assets listos para ecommerce y anuncios sin retrabajo.', en: 'We received assets ready for ecommerce and ads with no rework.' },
        },
        {
          role: { es: 'Equipo de marketing B2B', en: 'B2B marketing team' },
          quote: { es: 'Excelente control de tiempos y entregables por hito de campana.', en: 'Excellent timeline control and milestone-based campaign deliverables.' },
        },
      ],
      caseStudy: {
        title: { es: 'Caso: refresh de contenido para marca hotelera', en: 'Case: content refresh for a hospitality brand' },
        challenge: { es: 'La marca necesitaba activos nuevos para web, OTAs y pauta digital.', en: 'The brand needed fresh assets for website, OTAs, and paid media.' },
        solution: { es: 'Brief por objetivos, shot list por canal y produccion hibrida foto + drone.', en: 'Goal-driven brief, channel-based shot list, and hybrid photo + drone production.' },
        result: { es: 'Biblioteca visual utilizable en multiples campañas y temporadas.', en: 'Visual library reusable across multiple campaigns and seasons.' },
      },
    },
  longForm: {
      intro: {
        es: 'La fotografia comercial efectiva no se mide solo por estetica. Se mide por impacto en marca, conversion y velocidad de ejecucion. Nuestra metodologia en Republica Dominicana combina estrategia de contenido, produccion controlada y entregables pensados para marketing y ventas.',
        en: 'Effective commercial photography is not measured by aesthetics alone. It is measured by impact on brand, conversion, and execution speed. Our methodology in the Dominican Republic combines content strategy, controlled production, and deliverables built for marketing and sales teams.',
      },
      sections: [
        {
          title: {
            es: 'Produccion comercial orientada a objetivos de negocio',
            en: 'Commercial production aligned with business outcomes',
          },
          paragraphs: {
            es: [
              'Cada proyecto inicia con discovery de audiencia, canal y objetivo: lanzar producto, aumentar reservas, mejorar CTR o reforzar posicionamiento premium. A partir de eso se define concepto visual y shot list util.',
              'Este enfoque evita sesiones sin direccion comercial y permite que cada fotografia tenga funcion clara dentro del embudo de conversion.',
            ],
            en: [
              'Each project starts with audience, channel, and objective discovery: product launch, booking growth, CTR improvement, or premium positioning. From there, visual concept and practical shot list are built.',
              'This approach avoids directionless shoots and ensures every image has a clear function within the conversion funnel.',
            ],
          },
          bullets: {
            es: [
              'Brief creativo por canal y etapa de campana',
              'Produccion para ecommerce, hospitality, food, y branding corporativo',
              'Activos reutilizables para web, social, PR y paid ads',
            ],
            en: [
              'Creative brief by channel and campaign stage',
              'Production for ecommerce, hospitality, food, and corporate branding',
              'Reusable assets for web, social, PR, and paid ads',
            ],
          },
        },
        {
          title: {
            es: 'Sistema de preproduccion para equipos de marketing y agencias',
            en: 'Pre-production system for marketing teams and agencies',
          },
          paragraphs: {
            es: [
              'Trabajamos con workflow claro: brief, moodboard, shot list, cronograma y aprobaciones por hitos. Esto reduce retrabajo y mantiene al equipo alineado en tiempos y expectativas.',
              'Podemos integrarnos a estructura in-house o agencia externa, respetando lineamientos de marca, tono visual y requisitos de legal/licensing.',
            ],
            en: [
              'We work with a clear workflow: brief, moodboard, shot list, timeline, and milestone approvals. This reduces rework and keeps teams aligned on timing and expectations.',
              'We can integrate with in-house structures or external agencies while respecting brand guidelines, visual tone, and legal/licensing requirements.',
            ],
          },
          bullets: {
            es: [
              'Aprobaciones por etapa para evitar desviaciones',
              'Adaptacion de formato segun plataforma destino',
              'Coordinacion de produccion local y logistica',
            ],
            en: [
              'Stage-based approvals to avoid production drift',
              'Format adaptation per destination platform',
              'Local production and logistics coordination',
            ],
          },
        },
        {
          title: {
            es: 'Licencias, entregables y velocidad de deployment',
            en: 'Licensing, deliverables, and deployment speed',
          },
          paragraphs: {
            es: [
              'Definimos derechos de uso por territorio, duracion y canal para proteger la inversion de marca y facilitar compliance legal. Cada entrega incluye estructura ordenada para uso rapido por el equipo de marketing.',
              'Cuando hay necesidad de lanzamiento rapido, organizamos flujo express para que el cliente tenga selects prioritarios mientras se completa el master final.',
            ],
            en: [
              'We define usage rights by territory, duration, and channel to protect brand investment and simplify legal compliance. Deliveries are structured for fast deployment by marketing teams.',
              'When rapid launch is required, we run an express flow so clients receive priority selects while final masters are completed.',
            ],
          },
          bullets: {
            es: [
              'Licenciamiento comercial claro y documentado',
              'Entregables por ratios y usos de campana',
              'Flujo express para lanzamientos urgentes',
            ],
            en: [
              'Clear documented commercial licensing',
              'Ratio-specific deliverables by campaign use case',
              'Express flow for urgent launches',
            ],
          },
        },
      ],
      timeline: {
        title: {
          es: 'Ejemplo de flujo comercial por campana',
          en: 'Sample campaign production flow',
        },
        rows: [
          {
            phase: { es: 'Discovery comercial', en: 'Commercial discovery' },
            timing: { es: 'Kickoff', en: 'Kickoff' },
            notes: { es: 'Objetivos de negocio, audiencia y canales prioritarios.', en: 'Business goals, audience, and priority channels.' },
          },
          {
            phase: { es: 'Preproduccion', en: 'Pre-production' },
            timing: { es: 'Semana 1', en: 'Week 1' },
            notes: { es: 'Brief, moodboard, shot list y validaciones de marca.', en: 'Brief, moodboard, shot list, and brand validations.' },
          },
          {
            phase: { es: 'Produccion', en: 'Production' },
            timing: { es: 'Semana 2', en: 'Week 2' },
            notes: { es: 'Captura por bloques y supervisiones de avance.', en: 'Block-based capture with progress checkpoints.' },
          },
          {
            phase: { es: 'Post y deployment', en: 'Post and deployment' },
            timing: { es: 'Semana 2-3', en: 'Week 2-3' },
            notes: { es: 'Edicion final, exportes por canal y paquete master.', en: 'Final edit, channel exports, and master package.' },
          },
        ],
      },
    },
  faqs: [
      {
        question: {
          es: 'Que tipo de marcas atienden en fotografia comercial?',
          en: 'What types of brands do you work with for commercial photography?',
        },
        answer: {
          es: 'Trabajamos con hoteles, restaurantes, inmobiliarias, marcas de consumo y negocios de servicios en Santo Domingo, Santiago y Punta Cana.',
          en: 'We work with hotels, restaurants, real estate, consumer brands, and service businesses in Santo Domingo, Santiago, and Punta Cana.',
        },
      },
      {
        question: {
          es: 'Pueden producir contenido para campanas y redes sociales?',
          en: 'Can you produce content for campaigns and social media?',
        },
        answer: {
          es: 'Si. Producimos contenido orientado a conversion para anuncios, lanzamientos, ecommerce, redes sociales y material comercial de marca.',
          en: 'Yes. We produce conversion-focused content for ads, launches, ecommerce, social channels, and brand sales materials.',
        },
      },
      {
        question: {
          es: 'Incluyen derechos de uso comercial?',
          en: 'Do you include commercial usage rights?',
        },
        answer: {
          es: 'Si. Definimos licencias de uso comercial claras segun alcance del proyecto, canales de uso y duracion requerida por la marca.',
          en: 'Yes. We define clear commercial licensing based on project scope, media channels, and usage duration required by your brand.',
        },
      },
      {
        question: {
          es: 'Pueden trabajar bajo brief de agencia o director creativo externo?',
          en: 'Can you work under an agency brief or external creative director?',
        },
        answer: {
          es: 'Si. Nos integramos al flujo de agencias con preproduccion, shot list, moodboard y aprobaciones por hito para mantener consistencia de campana.',
          en: 'Yes. We integrate into agency workflows with pre-production, shot lists, moodboards, and milestone approvals to keep campaign consistency.',
        },
      },
      {
        question: {
          es: 'Que formatos entregan para ecommerce y anuncios?',
          en: 'What output formats do you provide for ecommerce and ads?',
        },
        answer: {
          es: 'Entregamos formatos optimizados para web, marketplaces, redes y paid media, incluyendo versiones por ratio y peso segun plataforma de publicacion.',
          en: 'We deliver optimized formats for websites, marketplaces, social, and paid media, including ratio-specific and platform-ready export variants.',
        },
      },
      {
        question: {
          es: 'Gestionan casting de talento y produccion local?',
          en: 'Do you handle local casting and production support?',
        },
        answer: {
          es: 'Podemos coordinar apoyo de produccion local segun proyecto: scouting, talento, estilismo y logistica para ejecucion eficiente en Santo Domingo y Punta Cana.',
          en: 'We can coordinate local production support by project needs: scouting, talent, styling, and logistics for efficient execution in Santo Domingo and Punta Cana.',
        },
      },
      {
        question: {
          es: 'Cual es el tiempo de entrega para campanas comerciales?',
          en: 'What is the delivery timeline for commercial campaigns?',
        },
        answer: {
          es: 'Depende del alcance y volumen, pero trabajamos con calendario por fases (seleccion, retoque, master final) para que el equipo de marketing tenga visibilidad total.',
          en: 'It depends on scope and volume, but we work with phase-based schedules (selection, retouching, final master) so marketing teams have full visibility.',
        },
      },
    ],
  internalLinks: [
      {
        href: '/portfolio?category=commercial',
        label: { es: 'Ver casos comerciales', en: 'See commercial case studies' },
        description: { es: 'Trabajo visual para marcas, productos y hospitalidad.', en: 'Visual work for brands, products, and hospitality.' },
      },
      {
        href: '/get-quote',
        label: { es: 'Solicitar propuesta comercial', en: 'Request a commercial proposal' },
        description: { es: 'Creamos alcance y entregables segun objetivos de negocio.', en: 'We define scope and deliverables around business goals.' },
      },
    ],
}
