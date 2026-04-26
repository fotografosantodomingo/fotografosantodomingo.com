/**
 * Rich SEO content for the real-estate-drone-photography family page.
 *
 * Recovered from the pre-A6 architecture (commit 94fdc10^).
 * Original legacy slug: 'drone-services-photography-punta-cana'.
 * Mapped to canonical family slug: 'real-estate-drone-photography'.
 */

import type { ServiceContent } from './types'

export const realEstateDronePhotographyContent: ServiceContent = {
  seo: {
    title: {
      es: 'Contratar Fotógrafo Inmobiliario y Drone en Punta Cana | Bavaro, Casa de Campo & Santo Domingo | Babula Shots',
      en: 'Hire a Real Estate & Drone Photographer in Punta Cana | Bavaro, Casa de Campo & Santo Domingo | Babula Shots',
    },
    description: {
      es: 'Fotografía inmobiliaria, aéreas con drone, twilight y tours Matterport para propiedades en Punta Cana, Bavaro y Santo Domingo. Reserva online con depósito seguro.',
      en: 'Real estate listings, drone aerials, twilight, and Matterport tours for properties in Punta Cana, Bavaro, and Santo Domingo. Online booking with secure deposit.',
    },
    keywords: {
      es: 'fotografo inmobiliario punta cana, dron inmobiliaria republica dominicana, fotografia aerea bavaro, twilight inmobiliaria casa de campo, tour matterport santo domingo, listing real estate fotografo rd',
      en: 'real estate photographer punta cana, drone real estate dominican republic, aerial photographer bavaro, twilight real estate casa de campo, matterport tour santo domingo, listing photographer DR',
    },
  },
  schemaAdditionalType: 'https://schema.org/ProfessionalService',

  // ── GEO COVERAGE ────────────────────────────────────────────────────
  // 4 cities (user-approved 2026-04-26): Punta Cana, Cap Cana, Bavaro,
  // La Romana / Casa de Campo. Real-estate-specific framing — listing
  // agents, vacation-rental owners, developer marketing departments are
  // the primary buyers. Drone permit/altitude language is geo-specific.
  geoCoverage: [
    {
      citySlug: 'punta-cana',
      cityName: { es: 'Punta Cana', en: 'Punta Cana' },
      intro: {
        es: 'Punta Cana concentra el mayor inventario de propiedades vacacionales y residenciales de la región este — desde condos frente al mar en Bávaro hasta lotes en comunidades de golf como Cocotal y Punta Blanca. Cubrimos fotografía interior con luz natural balanceada, sets de drone aéreo para mostrar contexto de playa y resort, y twilight para listados de alta gama. Manejamos las zonas restringidas y de altitud limitada que el Aeropuerto Internacional de Punta Cana (PUJ) impone en Bávaro central, y volamos sin restricción en zonas libres como Cabeza de Toro y Macao cuando la propiedad lo permite.',
        en: 'Punta Cana holds the eastern region\'s largest inventory of vacation and residential properties — from beachfront condos in Bávaro to lots in golf communities like Cocotal and Punta Blanca. We cover interior photography with balanced natural light, drone aerial sets showing beach and resort context, and twilight for high-end listings. We handle the restricted and altitude-limited zones around Punta Cana International Airport (PUJ) in central Bávaro, and fly unrestricted in free zones like Cabeza de Toro and Macao when the property allows.',
      },
      venues: {
        es: [
          'Cocotal Golf & Country Club — comunidad residencial con propiedades en campo de golf',
          'Punta Blanca Golf Resort — desarrollos boutique con vista al mar',
          'White Sands — condos frente a la playa',
          'Bávaro Beach — propiedades de alquiler vacacional con acceso directo a playa',
          'Cap Cana Marina (zona Punta Cana) — yates y propiedades de marina',
          'Hard Rock Hotel residences — propiedades dentro del resort all-inclusive',
          'Cana Bay Golf — desarrollos premium con vista al campo',
        ],
        en: [
          'Cocotal Golf & Country Club — residential community with golf-front properties',
          'Punta Blanca Golf Resort — boutique developments with ocean views',
          'White Sands — beachfront condos',
          'Bávaro Beach — vacation rental properties with direct beach access',
          'Cap Cana Marina (Punta Cana side) — yacht and marina properties',
          'Hard Rock Hotel residences — properties within the all-inclusive resort',
          'Cana Bay Golf — premium developments with course views',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Pueden volar drone cerca del aeropuerto de Punta Cana?',
            en: 'Can you fly drones near Punta Cana airport?',
          },
          answer: {
            es: 'Sí, con restricciones según la zona. El área inmediata al PUJ es zona restringida (sin vuelo). Bávaro central, Los Manantiales, Cabo Engaño y Punta Cana Village quedan en zona de altitud limitada — volamos a baja altura con coordinación. Cabeza de Toro al norte, Cap Cana al sur y Macao quedan fuera de las restricciones del aeropuerto. Para casos formales coordinamos con el IDAC (Instituto Dominicano de Aviación Civil).',
            en: 'Yes, with restrictions depending on the zone. The area immediately around PUJ is a no-fly Restricted Zone. Central Bávaro, Los Manantiales, Cabo Engaño, and Punta Cana Village fall in an Altitude-Limited Zone — we fly low with coordination. Cabeza de Toro to the north, Cap Cana to the south, and Macao are outside the airport\'s restrictions. For formal cases we coordinate with IDAC (Dominican Civil Aviation Institute).',
          },
        },
        {
          question: {
            es: '¿Cuánto tiempo toma fotografiar un condo de 2 habitaciones en Bávaro?',
            en: 'How long does it take to photograph a 2-bedroom Bávaro condo?',
          },
          answer: {
            es: 'Una sesión típica de 2 habitaciones tarda 2-3 horas: interiores con luz natural, exteriores con drone si aplica, y twilight si el cliente lo pide. Entrega en 5-7 días hábiles.',
            en: 'A typical 2-bedroom shoot takes 2-3 hours: interiors with natural light, exteriors with drone if applicable, and twilight if requested. Delivery in 5-7 business days.',
          },
        },
      ],
      bestSeasonNote: {
        es: 'Mejor luz interior: noviembre a marzo (sol más bajo, ventanas suaves). Para drone exterior, evitar mediodía por altos contrastes.',
        en: 'Best interior light: November–March (lower sun angle, softer through windows). For exterior drone, avoid midday for high-contrast harshness.',
      },
    },
    {
      citySlug: 'cap-cana',
      cityName: { es: 'Cap Cana', en: 'Cap Cana' },
      intro: {
        es: 'Cap Cana es el mercado de bienes raíces de mayor ticket promedio del este — villas en Hacienda Cap Cana, residencias en Las Iguanas, y propiedades de marina con acceso directo a yates. La fotografía aquí debe transmitir privacidad, exclusividad y arquitectura singular. Tenemos acceso de fotógrafos acreditados al gated community y conocimiento de los puntos de vuelo permitidos para drone (Cap Cana tiene reglas internas además de las del IDAC).',
        en: 'Cap Cana is the east\'s highest-ticket real estate market — villas in Hacienda Cap Cana, residences in Las Iguanas, and marina properties with direct yacht access. Photography here must convey privacy, exclusivity, and architectural singularity. We hold accredited photographer access to the gated community and know the permitted drone flight zones (Cap Cana has internal rules on top of IDAC\'s).',
      },
      venues: {
        es: [
          'Hacienda Cap Cana — villas residenciales en zona cerrada',
          'Las Iguanas — residencias en campo de golf Punta Espada',
          'Punta Aguila — comunidad residencial cerrada en Cap Cana',
          'Cap Cana Marina — propiedades frente a marina con muelle privado',
          'Juanillo Beach residences — propiedades a pasos de la playa',
          'Punta Espada Golf Course community — frente al campo Jack Nicklaus',
          'Eden Roc Cap Cana residences — propiedades dentro del resort de lujo',
        ],
        en: [
          'Hacienda Cap Cana — residential villas in the gated zone',
          'Las Iguanas — residences on the Punta Espada golf course',
          'Punta Aguila — gated residential community in Cap Cana',
          'Cap Cana Marina — marina-front properties with private slips',
          'Juanillo Beach residences — properties steps from the beach',
          'Punta Espada Golf Course community — fronting the Jack Nicklaus course',
          'Eden Roc Cap Cana residences — properties within the luxury resort',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Tienen acceso al gated community de Cap Cana para fotografiar?',
            en: 'Do you have access to Cap Cana\'s gated community for shoots?',
          },
          answer: {
            es: 'Sí. Tenemos acreditación de seguridad de Cap Cana para entrar como fotógrafos comerciales. Coordinamos con el listing agent o el property manager con 24-48 horas de anticipación.',
            en: 'Yes. We hold Cap Cana security accreditation to enter as commercial photographers. We coordinate with the listing agent or property manager 24-48 hours in advance.',
          },
        },
        {
          question: {
            es: '¿Hacen twilight con drone en propiedades frente a la marina?',
            en: 'Do you shoot twilight drone for marina-front properties?',
          },
          answer: {
            es: 'Sí. Twilight con drone sobre Cap Cana Marina al atardecer es uno de los entregables más vendibles para listados de alto valor. Coordinamos golden hour según orientación de la propiedad.',
            en: 'Yes. Twilight drone over Cap Cana Marina at sunset is one of the most sellable deliverables for high-value listings. We coordinate golden hour to the property\'s orientation.',
          },
        },
      ],
    },
    {
      citySlug: 'bavaro',
      cityName: { es: 'Bávaro', en: 'Bávaro' },
      intro: {
        es: 'Bávaro es el corazón del mercado de alquiler vacacional dominicano — desarrollos como Los Corales, Costa Bávaro, El Cortecito y Punta Cana Village concentran miles de propiedades de uso turístico. Fotografía aquí está optimizada para Airbnb, Booking, Vrbo y portales locales: interiores brillantes, exterior con drone para mostrar proximidad a la playa, y planos generales de la propiedad. Conocemos los flujos de coordinación con property managers y los tiempos de entrega que la rotación de huéspedes exige.',
        en: 'Bávaro is the heart of the Dominican vacation rental market — developments like Los Corales, Costa Bávaro, El Cortecito, and Punta Cana Village concentrate thousands of tourist-use properties. Photography here is optimized for Airbnb, Booking, Vrbo, and local portals: bright interiors, drone exteriors showing beach proximity, and overall property layouts. We know property-manager coordination flows and the delivery timelines that guest turnover demands.',
      },
      venues: {
        es: [
          'Los Corales — condos y villas de alquiler vacacional cerca de la playa',
          'Costa Bávaro — desarrollos residenciales y vacacionales',
          'El Cortecito — zona turística mixta con propiedades para Airbnb',
          'Punta Cana Village — comunidad residencial con servicios privados',
          'Bayahibe Beach (zona ampliada) — alquiler vacacional cerca del mar',
          'Cocotal Golf residential — propiedades en comunidad de golf',
          'Cabeza de Toro — desarrollos residenciales boutique',
        ],
        en: [
          'Los Corales — vacation rental condos and villas near the beach',
          'Costa Bávaro — residential and vacation developments',
          'El Cortecito — mixed tourist zone with Airbnb properties',
          'Punta Cana Village — residential community with private services',
          'Bayahibe Beach (extended zone) — vacation rentals close to the water',
          'Cocotal Golf residential — properties in the golf community',
          'Cabeza de Toro — boutique residential developments',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Hacen sets optimizados para Airbnb y Booking?',
            en: 'Do you shoot sets optimized for Airbnb and Booking?',
          },
          answer: {
            es: 'Sí. Conocemos las dimensiones recomendadas de cada plataforma (1200×800 horizontal para Airbnb, 1280×720 para Booking) y entregamos sets con la portada correcta para maximizar el click-through-rate del listado.',
            en: 'Yes. We know each platform\'s recommended dimensions (1200×800 landscape for Airbnb, 1280×720 for Booking) and deliver sets with the right cover image to maximize listing click-through rate.',
          },
        },
        {
          question: {
            es: '¿Cuál es el tiempo mínimo de entrega para una propiedad lista para listar?',
            en: 'What\'s the minimum delivery time to get a property ready to list?',
          },
          answer: {
            es: 'Express: 48 horas para set básico (interiores + 2-3 drone). Standard: 5-7 días con edición completa. Para alquileres con check-in inminente coordinamos express si la propiedad está lista al llegar.',
            en: 'Express: 48 hours for a basic set (interiors + 2-3 drone). Standard: 5-7 days with full editing. For rentals with imminent check-in we coordinate express if the property is ready on arrival.',
          },
        },
      ],
    },
    {
      citySlug: 'la-romana-casa-de-campo',
      cityName: { es: 'La Romana / Casa de Campo', en: 'La Romana / Casa de Campo' },
      intro: {
        es: 'Casa de Campo en La Romana es uno de los mercados residenciales más exclusivos del Caribe — villas privadas con servicio de mayordomo, residencias frente al campo de golf Teeth of the Dog, y propiedades en la marina más sofisticada del país. La Romana adyacente complementa con propiedades urbanas y residencias de inversión. Fotografía aquí prioriza arquitectura singular: piscinas infinity, doble altura, integración interior-exterior. Manejamos las restricciones de drone dentro del resort y coordinamos con el equipo de Casa de Campo para acceso a propiedades en venta o alquiler.',
        en: 'Casa de Campo in La Romana is one of the Caribbean\'s most exclusive residential markets — private villas with butler service, residences fronting the Teeth of the Dog golf course, and properties at the country\'s most sophisticated marina. Adjacent La Romana complements with urban properties and investment residences. Photography here prioritizes singular architecture: infinity pools, double-height ceilings, indoor-outdoor integration. We handle drone restrictions inside the resort and coordinate with Casa de Campo\'s team for access to properties for sale or rent.',
      },
      venues: {
        es: [
          'Casa de Campo Resort — villas privadas con piscina y mayordomo',
          'Teeth of the Dog Golf — residencias frente al campo Pete Dye',
          'Casa de Campo Marina — propiedades de marina con muelle',
          'Altos de Chavón — apartamentos boutique en el pueblo mediterráneo',
          'Minitas Beach residences — propiedades cerca de playa privada del resort',
          'La Romana Country Club — desarrollos residenciales',
          'Cacique — sector residencial premium dentro de Casa de Campo',
        ],
        en: [
          'Casa de Campo Resort — private villas with pool and butler service',
          'Teeth of the Dog Golf — residences fronting the Pete Dye course',
          'Casa de Campo Marina — marina properties with private slips',
          'Altos de Chavón — boutique apartments in the Mediterranean village',
          'Minitas Beach residences — properties near the resort\'s private beach',
          'La Romana Country Club — residential developments',
          'Cacique — premium residential sector inside Casa de Campo',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Pueden volar drone dentro de Casa de Campo?',
            en: 'Can you fly drones inside Casa de Campo?',
          },
          answer: {
            es: 'Con restricciones. Casa de Campo tiene políticas internas sobre drone — algunos sectores requieren permiso del manager del resort. Coordinamos con anticipación y respetamos las zonas restringidas (cerca de la marina y áreas residenciales sensibles).',
            en: 'With restrictions. Casa de Campo has internal drone policies — some sectors require resort manager permission. We coordinate in advance and respect restricted zones (near the marina and sensitive residential areas).',
          },
        },
        {
          question: {
            es: '¿Tienen experiencia con villas de Casa de Campo de alto valor?',
            en: 'Do you have experience with high-value Casa de Campo villas?',
          },
          answer: {
            es: 'Sí. Hemos fotografiado villas con valores de mercado superiores a USD 3M en sectores como Teeth of the Dog, La Romana Country Club y Cacique. Conocemos cómo iluminar dobles alturas, piscinas infinity y áreas de entretenimiento exterior.',
            en: 'Yes. We have photographed villas with market values above USD 3M in sectors like Teeth of the Dog, La Romana Country Club, and Cacique. We know how to light double-height ceilings, infinity pools, and outdoor entertainment areas.',
          },
        },
      ],
    },
  ],

  knowsAbout: {
      es: ['fotografia aerea', 'video aereo', 'contenido para hoteleria', 'produccion para real estate'],
      en: ['aerial photography', 'aerial video', 'hospitality marketing content', 'real estate media production'],
    },
  differentiators: [
      { title: { es: 'Planificacion de vuelo orientada a resultado', en: 'Result-focused flight planning' }, proof: { es: 'Shot list por objetivo comercial antes de despegar.', en: 'Commercial objective shot lists before takeoff.' } },
      { title: { es: 'Contenido aereo utilizable para ventas', en: 'Aerial content usable for sales' }, proof: { es: 'Entregables listos para web, reels y presentaciones.', en: 'Deliverables ready for websites, reels, and presentations.' } },
      { title: { es: 'Cobertura integral foto + video + drone', en: 'Integrated photo + video + drone coverage' }, proof: { es: 'Produccion unificada para campanas de hospitalidad y real estate.', en: 'Unified production for hospitality and real estate campaigns.' } },
    ],
  processSteps: [
      { title: { es: 'Pre-flight y permisos', en: 'Pre-flight and permits' }, description: { es: 'Evaluacion de zona, riesgos y objetivos del cliente.', en: 'Area, risk, and client objective assessment.' } },
      { title: { es: 'Plan de vuelo y shot list', en: 'Flight plan and shot list' }, description: { es: 'Ruta aerea por prioridades comerciales y condiciones de luz.', en: 'Aerial route by commercial priorities and lighting conditions.' } },
      { title: { es: 'Produccion en locacion', en: 'On-location production' }, description: { es: 'Captura segura con coordinacion de equipo en tierra.', en: 'Safe capture with ground-team coordination.' } },
      { title: { es: 'Entrega editable y final', en: 'Editable and final delivery' }, description: { es: 'Archivos optimizados para marketing, redes y ventas.', en: 'Files optimized for marketing, social, and sales.' } },
    ],
  locations: [
      { venue: 'Cap Cana Marina', area: 'Cap Cana', style: { es: 'Nautico premium', en: 'Premium nautical' }, bestLight: { es: 'Sunrise', en: 'Sunrise' }, detail: { es: 'Excelente para hoteles y real estate de lujo.', en: 'Excellent for luxury hotels and real estate.' }, href: '/portfolio?category=drone' },
      { venue: 'Bavaro Beachfront', area: 'Bavaro', style: { es: 'Resort costero', en: 'Coastal resort' }, bestLight: { es: 'Golden hour', en: 'Golden hour' }, detail: { es: 'Planos abiertos para campanas de turismo.', en: 'Wide shots for tourism campaigns.' }, href: '/portfolio?category=drone' },
      { venue: 'Santo Domingo Malecon', area: 'Santo Domingo', style: { es: 'Urbano maritimo', en: 'Urban waterfront' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Ideal para piezas institucionales y eventos.', en: 'Ideal for institutional pieces and events.' }, href: '/portfolio?category=drone' },
      { venue: 'Bayahibe Coastline', area: 'La Romana', style: { es: 'Costa natural', en: 'Natural coastline' }, bestLight: { es: 'Manana', en: 'Morning' }, detail: { es: 'Contenido premium para hospitalidad.', en: 'Premium hospitality content.' }, href: '/portfolio?category=drone' },
      { venue: 'Samana Peninsula', area: 'Samana', style: { es: 'Paisaje tropical', en: 'Tropical landscape' }, bestLight: { es: 'Amanecer', en: 'Sunrise' }, detail: { es: 'Tomas de naturaleza y destinos.', en: 'Destination and nature shots.' }, href: '/portfolio?category=drone' },
      { venue: 'Punta Cana Golf Resorts', area: 'Punta Cana', style: { es: 'Resort deportivo', en: 'Sports resort' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Visuales para venta de membresias y eventos.', en: 'Visuals for memberships and event marketing.' }, href: '/portfolio?category=drone' },
      { venue: 'Industrial Zones SDQ', area: 'Santo Domingo', style: { es: 'Corporativo tecnico', en: 'Technical corporate' }, bestLight: { es: 'Media manana', en: 'Mid-morning' }, detail: { es: 'Documentacion de infraestructura y avances.', en: 'Infrastructure and progress documentation.' }, href: '/portfolio?category=drone' },
      { venue: 'Puerto Plata Resorts', area: 'Puerto Plata', style: { es: 'Turismo costa norte', en: 'North coast tourism' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Piezas para comercializacion internacional.', en: 'Assets for international marketing.' }, href: '/portfolio?category=drone' },
    ],
  seasonality: {
      bestMonths: { es: 'Temporada recomendada: enero a abril y julio para cielos mas limpios.', en: 'Recommended season: January to April and July for cleaner skies.' },
      cautionMonths: { es: 'En meses de lluvia se trabaja con ventanas meteorologicas y reprogramacion flexible.', en: 'During rainy months we work with weather windows and flexible rescheduling.' },
      daylightNote: { es: 'Vuelos de golden hour ofrecen mayor contraste y look cinematico para hoteles.', en: 'Golden-hour flights provide stronger contrast and cinematic hotel visuals.' },
    },
  trust: {
      expertBio: {
        es: 'Cobertura aerea para hospitalidad, real estate y eventos con planificacion de vuelo, protocolo de seguridad y ejecucion enfocada en entregables de marketing.',
        en: 'Aerial coverage for hospitality, real estate, and events with flight planning, safety protocol, and execution focused on marketing deliverables.',
      },
      authoritySignals: {
        es: ['Plan de vuelo y evaluacion de riesgo por proyecto', 'Cobertura de zonas turisticas y urbanas en RD', 'Pipeline de edicion para reels, ads y ventas inmobiliarias'],
        en: ['Flight plan and risk assessment per project', 'Coverage across DR tourist and urban areas', 'Editing pipeline for reels, ads, and real estate sales'],
      },
      testimonials: [
        {
          role: { es: 'Gerencia de hotel en Bavaro', en: 'Hotel management in Bavaro' },
          quote: { es: 'El material aereo elevo la percepcion premium de la propiedad.', en: 'The aerial material elevated the premium perception of the property.' },
        },
        {
          role: { es: 'Desarrolladora inmobiliaria', en: 'Real estate developer' },
          quote: { es: 'Recibimos tomas claras para ventas y avance de obra mensual.', en: 'We received clear shots for sales and monthly construction updates.' },
        },
        {
          role: { es: 'Produccion de evento corporativo', en: 'Corporate event production' },
          quote: { es: 'La coordinacion aerea se integro perfecto con el equipo de piso.', en: 'Aerial coordination integrated perfectly with the ground crew.' },
        },
      ],
      caseStudy: {
        title: { es: 'Caso: lanzamiento de resort con ventana de tiempo corta', en: 'Case: resort launch with a short production window' },
        challenge: { es: 'Se necesitaba contenido aereo para prensa y ads en menos de 72 horas.', en: 'Aerial content was needed for press and ads in under 72 hours.' },
        solution: { es: 'Planificacion previa por bloques, rodaje en dos locaciones y edicion priorizada.', en: 'Pre-production by blocks, two-location shoot, and prioritized edit queue.' },
        result: { es: 'Entrega lista para publicacion con piezas verticales y horizontales.', en: 'Delivery was publication-ready with both vertical and horizontal cuts.' },
      },
    },
  longForm: {
      intro: {
        es: 'La produccion con dron en Republica Dominicana necesita una mezcla de creatividad y disciplina operativa. Nuestro enfoque combina planificacion de vuelo, seguridad, cumplimiento local y direccion visual para que hoteles, real estate y marcas reciban activos aereos listos para vender mejor.',
        en: 'Drone production in the Dominican Republic requires both creativity and operational discipline. Our approach combines flight planning, safety, local compliance, and visual direction so hotels, real estate teams, and brands receive aerial assets that are ready to drive results.',
      },
      sections: [
        {
          title: {
            es: 'Produccion aerea profesional para hoteleria, real estate y eventos',
            en: 'Professional aerial production for hospitality, real estate, and events',
          },
          paragraphs: {
            es: [
              'Definimos primero el objetivo comercial de cada vuelo: awareness de marca, ventas inmobiliarias, documentacion de avance o cobertura de evento. Luego se disena el shot list segun el objetivo, no al reves.',
              'Este metodo evita tomas bonitas sin uso real y prioriza contenido utilizable en web, social, ads, presentaciones y piezas de ventas.',
            ],
            en: [
              'We define the business goal of each flight first: brand awareness, real estate sales, progress documentation, or event coverage. Then we design the shot list around that goal, not the other way around.',
              'This method avoids beautiful-but-unused shots and prioritizes content that is usable across websites, social media, ads, presentations, and sales materials.',
            ],
          },
          bullets: {
            es: [
              'Cobertura en Punta Cana, Bavaro, Cap Cana, Santo Domingo y La Romana',
              'Produccion para resorts, villas, desarrollos y eventos corporativos',
              'Entregables orientados a conversion y posicionamiento premium',
            ],
            en: [
              'Coverage in Punta Cana, Bavaro, Cap Cana, Santo Domingo, and La Romana',
              'Production for resorts, villas, developments, and corporate events',
              'Deliverables focused on conversion and premium positioning',
            ],
          },
        },
        {
          title: {
            es: 'Workflow operativo: pre-flight, ejecucion y postproduccion',
            en: 'Operational workflow: pre-flight, execution, and post-production',
          },
          paragraphs: {
            es: [
              'Antes del vuelo analizamos zona, altura segura, ruta de captura y condicion meteorologica. Durante la ejecucion trabajamos con protocolo de seguridad y secuencia por prioridades para proteger tiempo y presupuesto del cliente.',
              'Despues, se procesa el material por canal de uso: formato horizontal para web y presentaciones, vertical para reels/ads, y selecciones con color adaptado al lenguaje visual de marca.',
            ],
            en: [
              'Before flight, we analyze area constraints, safe altitude, capture route, and weather windows. During execution, we follow a safety protocol and priority sequence to protect client time and budget.',
              'Afterward, media is processed per usage channel: horizontal formats for websites and presentations, vertical versions for reels/ads, and color treatment aligned with brand visual language.',
            ],
          },
          bullets: {
            es: [
              'Planificacion por bloques de tomas para maximizar eficiencia',
              'Decision logico de tomas de contexto, detalle y hero shots',
              'Versionado de entregables por plataforma',
            ],
            en: [
              'Block-based shot planning for maximum efficiency',
              'Logical sequence of context, detail, and hero shots',
              'Platform-specific deliverable versioning',
            ],
          },
        },
        {
          title: {
            es: 'Cumplimiento, seguridad y continuidad operativa',
            en: 'Compliance, safety, and operational continuity',
          },
          paragraphs: {
            es: [
              'El valor real de un servicio drone premium tambien esta en reducir riesgo. Por eso integramos revision de condiciones, buffer de reprogramacion y plan alterno para no comprometer resultados cuando cambia el clima.',
              'Esta capa de seguridad y planificacion es clave para clientes de hospitality, desarrolladoras y empresas que no pueden depender de improvisacion.',
            ],
            en: [
              'The real value of premium drone service is also risk reduction. That is why we include condition checks, rescheduling buffers, and backup plans so outcomes stay consistent when weather shifts.',
              'This layer of safety and planning is critical for hospitality clients, developers, and companies that cannot rely on improvisation.',
            ],
          },
          bullets: {
            es: [
              'Evaluacion de riesgo previa por locacion',
              'Politica clara de reprogramacion por clima',
              'Coordinacion con equipos de piso y produccion',
            ],
            en: [
              'Location-based pre-flight risk assessment',
              'Clear weather rescheduling policy',
              'Coordination with ground teams and production leads',
            ],
          },
        },
      ],
      timeline: {
        title: {
          es: 'Ejemplo de flujo de produccion drone',
          en: 'Sample drone production flow',
        },
        rows: [
          {
            phase: { es: 'Brief y objetivos', en: 'Brief and goals' },
            timing: { es: 'Previo al rodaje', en: 'Pre-shoot' },
            notes: { es: 'Definicion de usos, plataformas y tomas prioritarias.', en: 'Define usage channels, platforms, and priority shots.' },
          },
          {
            phase: { es: 'Pre-flight tecnico', en: 'Technical pre-flight' },
            timing: { es: '24-48h antes', en: '24-48h before flight' },
            notes: { es: 'Revision de locacion, clima y seguridad operacional.', en: 'Review location, weather, and operational safety.' },
          },
          {
            phase: { es: 'Captura en locacion', en: 'On-location capture' },
            timing: { es: 'Ventana de mejor luz', en: 'Best-light window' },
            notes: { es: 'Cobertura por bloques: contexto, detalle y hero shots.', en: 'Block-based capture: context, detail, and hero shots.' },
          },
          {
            phase: { es: 'Edicion y entrega', en: 'Edit and delivery' },
            timing: { es: '48h a 7 dias segun alcance', en: '48h to 7 days based on scope' },
            notes: { es: 'Exportes por canal y version final para publicacion.', en: 'Channel-specific exports and final publication-ready assets.' },
          },
        ],
      },
    },
  faqs: [
      {
        question: {
          es: 'En que zonas ofrecen servicios de dron?',
          en: 'Which areas do you cover for drone services?',
        },
        answer: {
          es: 'Nuestra cobertura principal incluye Punta Cana, Bavaro, Cap Cana, Santo Domingo y La Romana, con opcion de coordinar otras zonas segun el proyecto.',
          en: 'Our primary coverage includes Punta Cana, Bavaro, Cap Cana, Santo Domingo, and La Romana, with additional areas available depending on project scope.',
        },
      },
      {
        question: {
          es: 'El servicio de dron incluye permisos y operacion segura?',
          en: 'Does the drone service include permits and safe operation?',
        },
        answer: {
          es: 'Si. Planificamos la operacion segun condiciones del lugar, restricciones y seguridad de vuelo para entregar material utilizable sin riesgos innecesarios.',
          en: 'Yes. We plan operations according to location conditions, restrictions, and flight safety requirements to deliver usable media without unnecessary risk.',
        },
      },
      {
        question: {
          es: 'Que tipo de archivos entregan en servicios de dron?',
          en: 'What file formats do you deliver for drone projects?',
        },
        answer: {
          es: 'Entregamos fotos aereas editadas y clips de video listos para marketing, redes, ventas inmobiliarias o cobertura de eventos.',
          en: 'We deliver edited aerial photos and video clips ready for marketing, social media, real estate sales, or event coverage.',
        },
      },
      {
        question: {
          es: 'Con cuanto tiempo deben reservar para gestionar permisos?',
          en: 'How far ahead should we book to handle permits?',
        },
        answer: {
          es: 'Para proyectos comerciales recomendamos reservar con 7 a 14 dias de anticipacion. En producciones complejas o zonas sensibles, conviene un margen mayor para autorizaciones y scouting.',
          en: 'For commercial projects we recommend booking 7 to 14 days in advance. For complex productions or sensitive zones, a larger lead time is better for approvals and scouting.',
        },
      },
      {
        question: {
          es: 'Pueden operar vuelos nocturnos o en eventos masivos?',
          en: 'Can you operate night flights or crowded-event coverage?',
        },
        answer: {
          es: 'Se evalua caso por caso segun regulacion, seguridad y condiciones de la locacion. Definimos siempre alternativas de captura para cumplir objetivos sin comprometer seguridad operativa.',
          en: 'Operations are evaluated case by case based on regulations, safety, and location conditions. We always define alternate capture plans to meet goals without compromising operational safety.',
        },
      },
      {
        question: {
          es: 'Que pasa si el clima no permite volar?',
          en: 'What happens if weather does not allow flying?',
        },
        answer: {
          es: 'Trabajamos con monitoreo meteorologico previo y politica de reprogramacion. Si el viento o lluvia superan parametros seguros, se activa nueva ventana de vuelo acordada con cliente.',
          en: 'We work with prior weather monitoring and a rescheduling policy. If wind or rain exceeds safe parameters, a new agreed flight window is activated with the client.',
        },
      },
      {
        question: {
          es: 'Ofrecen contratos de contenido mensual para hoteles o desarrollos?',
          en: 'Do you offer monthly content retainers for hotels or developments?',
        },
        answer: {
          es: 'Si. Podemos estructurar planes recurrentes para avance de obra, temporada turistica o contenido de marca, con entregables y KPIs definidos por mes.',
          en: 'Yes. We can structure recurring plans for construction progress, tourism season updates, or brand content, with monthly deliverables and KPI-aligned outputs.',
        },
      },
    ],
  internalLinks: [
      {
        href: '/portfolio?category=drone',
        label: { es: 'Ver tomas aereas recientes', en: 'View recent aerial work' },
        description: { es: 'Ejemplos de contenido drone para hoteles, villas y eventos.', en: 'Examples of drone content for hotels, villas, and events.' },
      },
      {
        href: '/get-quote',
        label: { es: 'Cotizar produccion con dron', en: 'Request a drone production quote' },
        description: { es: 'Comparte locacion, fecha y objetivo de grabacion.', en: 'Share location, date, and production objective.' },
      },
    ],
}
