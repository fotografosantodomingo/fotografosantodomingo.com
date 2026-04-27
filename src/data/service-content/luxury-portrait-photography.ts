/**
 * Rich SEO content for the luxury-portrait-photography family page.
 *
 * Recovered from the pre-A6 architecture (commit 94fdc10^).
 * Original legacy slug: 'portrait-photography'.
 * Mapped to canonical family slug: 'luxury-portrait-photography'.
 */

import type { ServiceContent } from './types'

export const luxuryPortraitPhotographyContent: ServiceContent = {
  seo: {
    title: {
      es: 'Fotógrafo de Retratos y Headshots Editoriales | Santo Domingo, Punta Cana & RD | Babula Shots',
      en: 'Editorial Portrait & Executive Headshot Photographer | Santo Domingo & Punta Cana | Babula Shots',
    },
    description: {
      es: 'Retratos editoriales y headshots ejecutivos para profesionales y marcas personales en Santo Domingo y Punta Cana. Estética premium y reserva online segura.',
      en: 'Editorial portraits and executive headshots for professionals and personal brands in Santo Domingo and Punta Cana. Premium aesthetic and secure online booking.',
    },
    keywords: {
      es: 'fotografo retratos santo domingo, headshots ejecutivos republica dominicana, retratos personal branding punta cana, sesion retrato profesional rd, fotografia editorial dominicana, reservar fotografo retrato dr',
      en: 'portrait photographer santo domingo, executive headshot photographer dominican republic, personal branding photographer punta cana, professional portrait session DR, editorial photographer dominican republic, book portrait photographer DR',
    },
  },
  schemaAdditionalType: 'https://schema.org/ProfessionalService',

  // ── GEO COVERAGE ────────────────────────────────────────────────────
  // 3 cities: Santo Domingo (HQ city for executives, finance, agencies),
  // Punta Cana (resort residents, hospitality C-suite), Cap Cana (luxury
  // residents, family office). Buyer = executives, personal brands,
  // creators needing editorial-grade portraits and headshots.
  geoCoverage: [
    {
      citySlug: 'santo-domingo',
      cityName: { es: 'Santo Domingo', en: 'Santo Domingo' },
      intro: {
        es: 'Santo Domingo es el centro corporativo y financiero de República Dominicana — bancos, agencias, despachos legales, médicos privados y creadores de marca personal concentrados en Piantini, Naco, Bella Vista y Acrópolis. Cubrimos retratos editoriales con luz natural en oficinas corporativas, headshots en estudio privado, y sesiones de personal branding para LinkedIn, web y campañas. Para ejecutivos con agendas comprimidas ofrecemos sesión express con entrega en 48 horas.',
        en: 'Santo Domingo is the Dominican Republic\'s corporate and financial center — banks, agencies, legal firms, private medical practices, and personal-brand creators concentrated in Piantini, Naco, Bella Vista, and Acrópolis. We cover editorial portraits with natural light in corporate offices, studio headshots, and personal branding sessions for LinkedIn, web, and campaigns. For executives with tight schedules we offer express sessions with 48-hour delivery.',
      },
      venues: {
        es: [
          'Estudio privado en Piantini — luz controlada para headshots y editorial',
          'Torre Acrópolis — retratos en entorno corporativo de alto nivel',
          'JW Marriott Santo Domingo — retratos ejecutivos en hotel de lujo',
          'Hilton Santo Domingo — sesión con vista al Malecón como fondo',
          'Plaza Naco / Plaza Lincoln — entorno financiero y corporativo',
          'Zona Colonial — retratos editoriales con fondo histórico',
          'Mirador Sur — sesión exterior natural al atardecer',
        ],
        en: [
          'Private studio in Piantini — controlled light for headshots and editorial',
          'Torre Acrópolis — portraits in a top-tier corporate environment',
          'JW Marriott Santo Domingo — executive portraits in a luxury hotel',
          'Hilton Santo Domingo — session with the Malecón as backdrop',
          'Plaza Naco / Plaza Lincoln — financial and corporate environment',
          'Colonial Zone — editorial portraits with historic backdrop',
          'Mirador Sur — natural outdoor session at sunset',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Hacen sesiones de headshot en oficinas en Piantini o Naco?',
            en: 'Do you do headshot sessions at offices in Piantini or Naco?',
          },
          answer: {
            es: 'Sí. Llevamos kit de iluminación portátil y fondo plegable cuando la oficina no tiene buena luz natural. Sesión típica de 30-45 minutos por persona, ideal para equipos ejecutivos de 5-15 personas en una mañana.',
            en: 'Yes. We bring portable lighting and a folding backdrop when the office lacks good natural light. Typical session: 30-45 minutes per person, ideal for 5-15 executive teams in a single morning.',
          },
        },
        {
          question: {
            es: '¿Cuál es el tiempo de entrega para headshots listos para LinkedIn?',
            en: 'What\'s the turnaround for LinkedIn-ready headshots?',
          },
          answer: {
            es: 'Standard: 5 días hábiles con edición completa. Express: 48 horas con cargo adicional (ideal para anuncios de promoción, posts de prensa, perfiles para conferencias).',
            en: 'Standard: 5 business days with full editing. Express: 48 hours with additional fee (ideal for promotion announcements, press posts, conference profiles).',
          },
        },
      ],
    },
    {
      citySlug: 'punta-cana',
      cityName: { es: 'Punta Cana', en: 'Punta Cana' },
      intro: {
        es: 'Punta Cana atrae a ejecutivos del sector hotelero, residentes en comunidades como Punta Cana Village o Cap Cana, y profesionales internacionales que combinan trabajo y vida en el Caribe. Cubrimos retratos para gerentes de resort y equipo C-suite hospitality, sesiones de personal branding para hospedados temporalmente, y editorial para creadores de contenido. Trabajamos en suites del cliente, en exteriores con palmeras y arena al fondo, o en estudio rental en Bávaro cuando se necesita luz controlada.',
        en: 'Punta Cana draws hospitality executives, residents in communities like Punta Cana Village or Cap Cana, and international professionals combining work and Caribbean living. We cover portraits for resort GMs and hospitality C-suite teams, personal branding sessions for temporary residents, and editorial for content creators. We work in client suites, outdoor with palm trees and sand backdrops, or at a Bávaro rental studio when controlled light is needed.',
      },
      venues: {
        es: [
          'Punta Cana Village — entorno corporativo en comunidad residencial',
          'Hard Rock Hotel — retratos ejecutivos en suites y áreas privadas',
          'Tortuga Bay (Westin) — sesión boutique con detalles de lujo',
          'Cocotal Golf Country Club — retratos editoriales con campo de golf al fondo',
          'Cana Bay — entorno de comunidad de golf premium',
          'Playas privadas del cliente — sesión de personal branding con feel de destino',
          'Estudio rental en Bávaro — luz controlada para headshots formales',
        ],
        en: [
          'Punta Cana Village — corporate environment in a residential community',
          'Hard Rock Hotel — executive portraits in suites and private areas',
          'Tortuga Bay (Westin) — boutique session with luxury detailing',
          'Cocotal Golf Country Club — editorial portraits with golf course backdrop',
          'Cana Bay — premium golf community setting',
          'Client private beaches — personal branding session with destination feel',
          'Rental studio in Bávaro — controlled light for formal headshots',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Pueden hacer retratos ejecutivos en mi suite del resort?',
            en: 'Can you shoot executive portraits in my resort suite?',
          },
          answer: {
            es: 'Sí. Llevamos kit de iluminación compacto que cabe en suite estándar. Coordinamos con seguridad del resort previamente. Una sesión típica de 1 hora entrega 15-25 imágenes editadas para LinkedIn, web corporativa y campañas.',
            en: 'Yes. We bring a compact lighting kit that fits in a standard suite. We coordinate with resort security in advance. A typical 1-hour session delivers 15-25 edited images for LinkedIn, corporate web, and campaigns.',
          },
        },
        {
          question: {
            es: '¿Ofrecen entrega same-day para headshots corporativos urgentes?',
            en: 'Do you offer same-day delivery for time-sensitive corporate headshots?',
          },
          answer: {
            es: 'Sí, con cargo express. Entregamos sesión completa en 4-6 horas si se necesita para evento corporativo o anuncio mismo día. Coordinar con anticipación del horario de la sesión.',
            en: 'Yes, with an express fee. We deliver a full session in 4-6 hours if needed for a same-day corporate event or announcement. Coordinate session timing in advance.',
          },
        },
      ],
    },
    {
      citySlug: 'cap-cana',
      cityName: { es: 'Cap Cana', en: 'Cap Cana' },
      intro: {
        es: 'Cap Cana concentra residentes de alto poder adquisitivo, family offices y ejecutivos que combinan vivienda permanente con actividades de golf y marina. Cubrimos retratos en villas privadas de Hacienda Cap Cana, sesiones editoriales en Eden Roc y Sanctuary, y portraits con golf como fondo en Punta Espada. Para personal branding de ejecutivos con perfil internacional, Cap Cana entrega un fondo visual que comunica logro y discreción simultáneamente.',
        en: 'Cap Cana concentrates high-net-worth residents, family offices, and executives combining permanent residence with golf and marina life. We cover portraits in private Hacienda Cap Cana villas, editorial sessions at Eden Roc and Sanctuary, and golf-backdrop portraits at Punta Espada. For international-profile executive personal branding, Cap Cana delivers a backdrop that conveys achievement and discretion simultaneously.',
      },
      venues: {
        es: [
          'Eden Roc Cap Cana — retratos ejecutivos en boutique de lujo',
          'Sanctuary Cap Cana — sesión adults-only en setting sofisticado',
          'Cap Cana Marina — retratos con yates y marina al fondo',
          'Punta Espada Golf Course — sesión editorial con campo Jack Nicklaus',
          'Hacienda Cap Cana — retratos en villas residenciales privadas',
          'Juanillo Beach — personal branding con destino de lujo como fondo',
          'Salones privados del cliente — sesión en entorno corporativo controlado',
        ],
        en: [
          'Eden Roc Cap Cana — executive portraits in luxury boutique',
          'Sanctuary Cap Cana — adults-only session in sophisticated setting',
          'Cap Cana Marina — portraits with yachts and marina backdrop',
          'Punta Espada Golf Course — editorial session at the Jack Nicklaus course',
          'Hacienda Cap Cana — portraits in private residential villas',
          'Juanillo Beach — personal branding with luxury-destination backdrop',
          'Client private spaces — session in controlled corporate environment',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Fotografían en villas privadas de Cap Cana?',
            en: 'Do you photograph at private Cap Cana villas?',
          },
          answer: {
            es: 'Sí. Tenemos acreditación de seguridad de Cap Cana para entrar como fotógrafos comerciales. Coordinamos con el property manager o asistente del cliente con 24-48 horas de anticipación.',
            en: 'Yes. We hold Cap Cana security accreditation to enter as commercial photographers. We coordinate with the property manager or client assistant 24-48 hours in advance.',
          },
        },
        {
          question: {
            es: '¿Pueden crear sets formales y casuales en una misma sesión?',
            en: 'Can you create both formal and casual portrait sets in one session?',
          },
          answer: {
            es: 'Sí. Una sesión típica de 2-3 horas en Cap Cana entrega: set formal en interior con luz controlada (LinkedIn, web corporativa) + set casual en exterior con palmeras o marina al fondo (redes sociales personales, branding). Cambio de wardrobe entre sets.',
            en: 'Yes. A typical 2-3 hour Cap Cana session delivers: formal indoor set with controlled light (LinkedIn, corporate web) + casual outdoor set with palm trees or marina backdrop (personal social, branding). Wardrobe change between sets.',
          },
        },
      ],
    },
  ],

  knowsAbout: {
      es: ['headshots ejecutivos', 'retrato corporativo', 'personal branding', 'fotografia para LinkedIn'],
      en: ['executive headshots', 'corporate portraits', 'personal branding', 'LinkedIn photography'],
    },
  differentiators: [
      { title: { es: 'Headshots orientados a negocio', en: 'Business-oriented headshots' }, proof: { es: 'Imagen alineada con posicionamiento profesional y confianza.', en: 'Image aligned with professional positioning and trust.' } },
      { title: { es: 'Entrega rapida para agendas ejecutivas', en: 'Fast delivery for executive schedules' }, proof: { es: 'Flujo express para viajes, eventos y comunicacion urgente.', en: 'Express workflow for travel, events, and urgent communications.' } },
      { title: { es: 'Estilo consistente para equipos', en: 'Consistent style across teams' }, proof: { es: 'Setups repetibles para departamentos y empresas regionales.', en: 'Repeatable setups for departments and regional companies.' } },
    ],
  processSteps: [
      { title: { es: 'Brief de imagen', en: 'Image brief' }, description: { es: 'Definimos objetivo profesional y tono visual.', en: 'We define your professional objective and visual tone.' } },
      { title: { es: 'Preparacion de vestuario y set', en: 'Wardrobe and setup prep' }, description: { es: 'Guia de looks y fondo segun canal de uso.', en: 'Guidance on looks and background by usage channel.' } },
      { title: { es: 'Sesion guiada', en: 'Guided session' }, description: { es: 'Direccion de pose y expresion para confianza real.', en: 'Pose and expression direction for authentic confidence.' } },
      { title: { es: 'Seleccion y retoque final', en: 'Selection and final retouch' }, description: { es: 'Entrega optimizada para LinkedIn, web y prensa.', en: 'Delivery optimized for LinkedIn, websites, and press.' } },
    ],
  locations: [
      { venue: 'BlueMall Business District', area: 'Santo Domingo', style: { es: 'Corporativo moderno', en: 'Modern corporate' }, bestLight: { es: 'Manana', en: 'Morning' }, detail: { es: 'Perfecto para headshots ejecutivos.', en: 'Perfect for executive headshots.' }, href: '/portfolio?category=portrait' },
      { venue: 'Punta Cana Resort Offices', area: 'Punta Cana', style: { es: 'Hospitalidad premium', en: 'Premium hospitality' }, bestLight: { es: 'Manana y tarde', en: 'Morning and afternoon' }, detail: { es: 'Ideal para equipos en eventos empresariales.', en: 'Ideal for teams during business events.' }, href: '/portfolio?category=portrait' },
      { venue: 'Colonial Facades', area: 'Santo Domingo', style: { es: 'Editorial urbano', en: 'Urban editorial' }, bestLight: { es: 'Primeras horas', en: 'Early hours' }, detail: { es: 'Look premium para marca personal.', en: 'Premium look for personal brands.' }, href: '/portfolio?category=portrait' },
      { venue: 'Santiago Corporate Towers', area: 'Santiago', style: { es: 'Ejecutivo limpio', en: 'Clean executive' }, bestLight: { es: 'Mediodia interior', en: 'Indoor midday' }, detail: { es: 'Setups rapidos para sesiones de equipo.', en: 'Fast setups for team sessions.' }, href: '/portfolio?category=portrait' },
      { venue: 'Hotel Lobbies SDQ', area: 'Santo Domingo', style: { es: 'Lifestyle profesional', en: 'Professional lifestyle' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Ideal para viajeros de negocio.', en: 'Great for business travelers.' }, href: '/portfolio?category=portrait' },
      { venue: 'Cap Cana Marina Walk', area: 'Cap Cana', style: { es: 'Lujoso exterior', en: 'Luxury outdoor' }, bestLight: { es: 'Golden hour', en: 'Golden hour' }, detail: { es: 'Marca personal con contexto de lifestyle.', en: 'Personal branding with lifestyle context.' }, href: '/portfolio?category=portrait' },
      { venue: 'Puerto Plata Boardwalk', area: 'Puerto Plata', style: { es: 'Costero casual premium', en: 'Coastal premium casual' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Sesiones branding para emprendedores.', en: 'Branding sessions for entrepreneurs.' }, href: '/portfolio?category=portrait' },
      { venue: 'Conference Venues', area: 'Punta Cana', style: { es: 'Corporativo evento', en: 'Corporate event' }, bestLight: { es: 'Controlado por luz artificial', en: 'Controlled artificial light' }, detail: { es: 'Headshots durante congresos y summits.', en: 'Headshots during conferences and summits.' }, href: '/portfolio?category=portrait' },
    ],
  seasonality: {
      bestMonths: { es: 'Temporada ideal exterior: diciembre a abril; interior funciona todo el ano.', en: 'Ideal outdoor season: December to April; indoor works year-round.' },
      cautionMonths: { es: 'De junio a octubre recomendamos ventanas cortas y locacion cubierta alternativa.', en: 'From June to October, we recommend shorter windows and covered backup options.' },
      daylightNote: { es: 'Mejor luz natural para retrato: primeras 2 horas del dia o golden hour.', en: 'Best natural portrait light: first two hours of day or golden hour.' },
    },
  trust: {
      expertBio: {
        es: 'Especialistas en retrato ejecutivo y personal branding para profesionales que necesitan imagen solida en LinkedIn, prensa y sitios corporativos con direccion clara y resultado rapido.',
        en: 'Specialists in executive portraits and personal branding for professionals who need a strong image for LinkedIn, press, and corporate websites with clear direction and fast delivery.',
      },
      authoritySignals: {
        es: ['Flujo de sesion optimizado para agendas de negocio', 'Estandar de retoque profesional y natural', 'Entrega multiformato para web, PR y presentaciones'],
        en: ['Session workflow optimized for business schedules', 'Professional, natural retouching standard', 'Multi-format delivery for web, PR, and presentations'],
      },
      testimonials: [
        {
          role: { es: 'CEO en viaje de negocios', en: 'CEO on a business trip' },
          quote: { es: 'En menos de una hora tuvimos fotos listas para prensa y LinkedIn.', en: 'In under an hour we had photos ready for press and LinkedIn.' },
        },
        {
          role: { es: 'Equipo regional de ventas', en: 'Regional sales team' },
          quote: { es: 'Lograron consistencia visual entre 20 perfiles en una sola jornada.', en: 'They achieved visual consistency across 20 profiles in one day.' },
        },
        {
          role: { es: 'Fundadora de marca personal', en: 'Personal brand founder' },
          quote: { es: 'La sesion reflejo autoridad y cercania, justo lo que necesitabamos comunicar.', en: 'The session reflected authority and approachability, exactly what we needed to communicate.' },
        },
      ],
      caseStudy: {
        title: { es: 'Caso: relanzamiento de perfil ejecutivo', en: 'Case: executive profile relaunch' },
        challenge: { es: 'Imagen desactualizada para keynote internacional y medios.', en: 'Outdated image for an international keynote and media placements.' },
        solution: { es: 'Sesion express en hotel con guion visual por canal (LinkedIn, prensa, web).', en: 'Express hotel session with channel-based visual plan (LinkedIn, press, website).' },
        result: { es: 'Activos entregados en 48h con mejora inmediata de presencia profesional.', en: 'Assets delivered in 48h with immediate upgrade in professional presence.' },
      },
    },
  longForm: {
      intro: {
        es: 'Los retratos profesionales hoy cumplen una funcion comercial directa: confianza, autoridad y conversion. Nuestro enfoque en Republica Dominicana combina direccion de pose, narrativa de marca personal y entregables optimizados para LinkedIn, web corporativa, prensa y ventas.',
        en: 'Professional portraits today serve a direct commercial function: trust, authority, and conversion. Our Dominican Republic approach combines pose direction, personal-brand narrative, and deliverables optimized for LinkedIn, corporate websites, PR, and sales.',
      },
      sections: [
        {
          title: {
            es: 'Headshots ejecutivos y branding personal con intencion comercial',
            en: 'Executive headshots and personal branding with commercial intent',
          },
          paragraphs: {
            es: [
              'Antes de disparar, definimos como se usara la imagen: perfil profesional, keynote, nota de prensa o pagina de liderazgo. Esto permite direccion visual coherente con posicionamiento real.',
              'Nuestro objetivo no es solo que la foto se vea bien, sino que comunique credibilidad, cercania y criterio profesional en los canales donde se toman decisiones de negocio.',
            ],
            en: [
              'Before shooting, we define exactly how the image will be used: professional profile, keynote, press release, or leadership page. This enables visual direction aligned with real positioning.',
              'Our goal is not only to make the image look good, but to communicate credibility, approachability, and professional authority in channels where business decisions are made.',
            ],
          },
          bullets: {
            es: [
              'Headshots individuales para ejecutivos y fundadores',
              'Sesiones de branding para consultores y marca personal',
              'Produccion para equipos con look consistente',
            ],
            en: [
              'Individual headshots for executives and founders',
              'Branding sessions for consultants and personal brands',
              'Team production with consistent visual style',
            ],
          },
        },
        {
          title: {
            es: 'Proceso de sesion: preparacion, direccion y seleccion final',
            en: 'Session process: preparation, direction, and final selection',
          },
          paragraphs: {
            es: [
              'La diferencia entre una sesion promedio y una sesion premium esta en la preparacion. Definimos vestuario, fondo, angulos y microgestos para acelerar resultados durante la produccion.',
              'Luego de la sesion, trabajamos una seleccion estrategica de imagenes finalistas y retoque profesional natural para mantener autenticidad y alto estandar visual.',
            ],
            en: [
              'The difference between an average and premium session is preparation. We define wardrobe, background, angles, and micro-expressions to accelerate outcomes during production.',
              'After the shoot, we run strategic image selection and natural professional retouching to preserve authenticity with a high visual standard.',
            ],
          },
          bullets: {
            es: [
              'Guia previa de vestuario y estilo',
              'Direccion de expresion para autoridad y cercania',
              'Entrega web + alta resolucion + variantes por canal',
            ],
            en: [
              'Pre-session wardrobe and styling guide',
              'Expression direction for authority and approachability',
              'Web + high-resolution delivery + channel variants',
            ],
          },
        },
        {
          title: {
            es: 'Velocidad de entrega para profesionales en movimiento',
            en: 'Fast delivery for professionals on the move',
          },
          paragraphs: {
            es: [
              'Para ejecutivos y equipos comerciales, el tiempo es parte del valor. Podemos estructurar flujo express para que tengas selects listos para comunicacion inmediata.',
              'Esto es especialmente util en viajes de negocios, conferencias, procesos de rebranding y anuncios corporativos con ventanas cortas de publicacion.',
            ],
            en: [
              'For executives and commercial teams, timing is part of the value. We can structure an express workflow so you have selects ready for immediate communications.',
              'This is especially useful for business travel, conferences, rebranding cycles, and corporate announcements with short publishing windows.',
            ],
          },
          bullets: {
            es: [
              'Opcion de delivery express para uso urgente',
              'Setups en oficina, hotel o venue corporativo',
              'Formato listo para LinkedIn, PR y presentaciones',
            ],
            en: [
              'Express delivery option for urgent use',
              'Setups at office, hotel, or corporate venues',
              'Ready formats for LinkedIn, PR, and presentations',
            ],
          },
        },
      ],
      timeline: {
        title: {
          es: 'Ejemplo de flujo para headshots ejecutivos',
          en: 'Sample executive headshot workflow',
        },
        rows: [
          {
            phase: { es: 'Brief de imagen', en: 'Image brief' },
            timing: { es: 'Pre-sesion', en: 'Pre-session' },
            notes: { es: 'Objetivo, canal y tono visual deseado.', en: 'Target, channel, and desired visual tone.' },
          },
          {
            phase: { es: 'Produccion', en: 'Session production' },
            timing: { es: '30-90 minutos', en: '30-90 minutes' },
            notes: { es: 'Direccion de pose, expresion y variaciones de look.', en: 'Pose, expression, and look variation direction.' },
          },
          {
            phase: { es: 'Seleccion', en: 'Selection' },
            timing: { es: '24-48h', en: '24-48h' },
            notes: { es: 'Curaduria de opciones finalistas por uso.', en: 'Curated finalist options by use case.' },
          },
          {
            phase: { es: 'Entrega final', en: 'Final delivery' },
            timing: { es: '48h a 5 dias', en: '48h to 5 days' },
            notes: { es: 'Archivos optimizados para web, social y prensa.', en: 'Optimized files for web, social, and press.' },
          },
        ],
      },
    },
  faqs: [
      {
        question: {
          es: 'Hacen retratos corporativos para equipos completos?',
          en: 'Do you provide corporate portraits for full teams?',
        },
        answer: {
          es: 'Si. Coordinamos sesiones individuales o por equipos para empresas en Santo Domingo, Santiago y Punta Cana con estilo visual consistente para todo el staff.',
          en: 'Yes. We coordinate individual or team sessions for companies in Santo Domingo, Santiago, and Punta Cana with a consistent visual style across your staff.',
        },
      },
      {
        question: {
          es: 'Pueden hacer la sesion en nuestras oficinas?',
          en: 'Can you do the session at our office?',
        },
        answer: {
          es: 'Claro. Podemos montar un set de iluminacion profesional en tu oficina u hotel, o trabajar en locacion exterior segun la imagen de marca que necesites.',
          en: 'Absolutely. We can set up a professional lighting station at your office or hotel, or shoot on location based on the brand image you need.',
        },
      },
      {
        question: {
          es: 'Que tipo de entrega reciben para LinkedIn y web corporativa?',
          en: 'What delivery format do we get for LinkedIn and corporate websites?',
        },
        answer: {
          es: 'Recibes versiones optimizadas para web y redes, junto con archivos en alta resolucion para presentaciones, prensa y uso comercial interno.',
          en: 'You receive optimized versions for web and social channels plus high-resolution files for presentations, press materials, and internal commercial use.',
        },
      },
      {
        question: {
          es: 'Que vestuario recomiendan para headshots ejecutivos?',
          en: 'What wardrobe do you recommend for executive headshots?',
        },
        answer: {
          es: 'Recomendamos piezas solidas, tonos neutros y capas simples que mantengan enfoque en rostro y expresion. Antes de la sesion compartimos una guia breve para facilitar decisiones.',
          en: 'We recommend solid pieces, neutral tones, and simple layers that keep attention on facial expression. Before the session we share a short guide to simplify wardrobe decisions.',
        },
      },
      {
        question: {
          es: 'Cuanto retoque incluyen en una sesion de retrato profesional?',
          en: 'How much retouching is included in a professional portrait session?',
        },
        answer: {
          es: 'Aplicamos retoque profesional natural: piel, color, contraste y limpieza de detalles temporales. Evitamos alteraciones excesivas para conservar credibilidad en imagen ejecutiva.',
          en: 'We apply natural professional retouching: skin cleanup, color, contrast, and temporary detail cleanup. We avoid excessive edits to keep executive image credibility.',
        },
      },
      {
        question: {
          es: 'Ofrecen sesiones para equipos en conferencias o offsites?',
          en: 'Do you offer team sessions during conferences or offsites?',
        },
        answer: {
          es: 'Si. Podemos montar estaciones de retrato en hoteles o venues de eventos, manteniendo consistencia visual entre perfiles y velocidad de flujo para grupos.',
          en: 'Yes. We can set up portrait stations in hotels or event venues, keeping visual consistency across profiles with fast throughput for teams.',
        },
      },
      {
        question: {
          es: 'Pueden entregar archivos en 48 horas para prensa o lanzamiento?',
          en: 'Can you deliver files within 48 hours for press or launches?',
        },
        answer: {
          es: 'Disponemos de opcion express segun agenda y alcance. Entregamos primero selects prioritarios y luego paquete final completo.',
          en: 'We offer an express option based on scope and schedule. Priority selects are delivered first, followed by the complete final package.',
        },
      },
    ],
  internalLinks: [
      {
        href: '/portfolio?category=portrait',
        label: { es: 'Explorar retratos y headshots', en: 'Explore portraits and headshots' },
        description: { es: 'Mira ejemplos de retratos corporativos y personales.', en: 'See examples of corporate and personal portraits.' },
      },
      {
        href: '/get-quote',
        label: { es: 'Coordinar sesion de retrato', en: 'Schedule a portrait session' },
        description: { es: 'Definimos estilo, locacion y objetivos de imagen.', en: 'We define style, location, and image goals.' },
      },
    ],
}
