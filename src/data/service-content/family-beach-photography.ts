/**
 * Rich SEO content for the family-beach-photography family page.
 *
 * Recovered from the pre-A6 architecture (commit 94fdc10^).
 * Original legacy slug: 'family-photography'.
 * Mapped to canonical family slug: 'family-beach-photography'.
 */

import type { ServiceContent } from './types'

export const familyBeachPhotographyContent: ServiceContent = {
  seo: {
    title: {
      es: 'Sesiones Familiares y de Playa Premium en Punta Cana | Santo Domingo & Boca Chica',
      en: 'Premium Family & Beach Photography in Punta Cana | Santo Domingo & Boca Chica',
    },
    description: {
      es: 'Sesiones familiares, maternidad y recién nacido en estudio o playas premium de Punta Cana y Santo Domingo. Dirección natural y reserva online inmediata.',
      en: 'Family, maternity, and newborn sessions in studio or on premium Punta Cana and Santo Domingo beaches. Natural direction and instant online booking.',
    },
    keywords: {
      es: 'fotografo familia punta cana, sesion familiar santo domingo, fotos maternidad republica dominicana, sesion playa familia punta cana, fotografo recien nacido rd, sesion familia premium dominicana',
      en: 'punta cana family photographer, family photographer santo domingo, maternity photography dominican republic, beach family session punta cana, newborn photographer DR, premium family session dominican republic',
    },
  },
  schemaAdditionalType: 'https://schema.org/Service',

  // ── GEO COVERAGE ────────────────────────────────────────────────────
  // 3 cities (user-approved 2026-04-26): Punta Cana, Santo Domingo,
  // La Romana / Casa de Campo. Boca Chica explicitly rejected. Family +
  // beach + maternity intent — destination families on vacation, local
  // families for studio + planned outings, multigenerational reunions.
  geoCoverage: [
    {
      citySlug: 'punta-cana',
      cityName: { es: 'Punta Cana', en: 'Punta Cana' },
      intro: {
        es: 'Punta Cana es la ciudad más fotografiada de República Dominicana para sesiones familiares en playa — familias internacionales que vienen de vacaciones, sesiones de maternidad en arena blanca, y celebraciones multigeneracionales en resorts. Cubrimos sesiones en las playas del Bávaro y Cabeza de Toro, con experiencia en coordinar con resorts all-inclusive (algunos requieren registro previo del fotógrafo). Trabajamos con luz natural en golden hour y manejamos el flujo cuando hay niños pequeños o abuelos en la sesión.',
        en: 'Punta Cana is the most-photographed city in the Dominican Republic for family beach sessions — international families on vacation, maternity sessions on white sand, and multigenerational resort celebrations. We cover sessions on Bávaro and Cabeza de Toro beaches, fluent in all-inclusive resort coordination (some require advance photographer registration). We work natural light at golden hour and manage flow when small kids or grandparents are in the session.',
      },
      venues: {
        es: [
          'Playa Bávaro — sesión clásica de familia frente al Caribe',
          'Cabeza de Toro Beach — playa más tranquila, ideal para bebés y niños pequeños',
          'Playa Macao — set más natural, sin construcciones al fondo',
          'Hard Rock Punta Cana playa — sesión dentro del resort para huéspedes',
          'Iberostar Bávaro playa — para familias hospedadas en el resort',
          'Sanctuary Cap Cana / Juanillo Beach — sesión adults-only premium',
          'Hoyo Azul (cenote) — sesión natural diferente al concepto playa',
        ],
        en: [
          'Bávaro Beach — classic Caribbean-front family session',
          'Cabeza de Toro Beach — calmer beach, ideal for babies and young kids',
          'Macao Beach — more natural set, no resort buildings in background',
          'Hard Rock Punta Cana beach — in-resort session for guests',
          'Iberostar Bávaro beach — for families staying at the resort',
          'Sanctuary Cap Cana / Juanillo Beach — premium adults-only session',
          'Hoyo Azul cenote — natural cenote session beyond the beach concept',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Pueden hacer la sesión en la playa de mi resort all-inclusive?',
            en: 'Can you shoot the session on my all-inclusive resort\'s beach?',
          },
          answer: {
            es: 'Generalmente sí. Algunos resorts (Hard Rock, Iberostar, Hyatt, Excellence) permiten fotógrafos externos con registro previo en seguridad. Otros requieren tarifa de fotógrafo externo. Lo gestionamos en la coordinación.',
            en: 'Usually yes. Some resorts (Hard Rock, Iberostar, Hyatt, Excellence) allow outside photographers with advance security registration. Others charge an outside-photographer fee. We handle this during coordination.',
          },
        },
        {
          question: {
            es: '¿Cuál es la mejor hora para fotografiar familia con niños en la playa?',
            en: 'What\'s the best time for a beach family session with kids?',
          },
          answer: {
            es: 'Golden hour: 6:30-7:30 AM o 5:00-6:00 PM (varía según mes). Luz suave, sin sombras duras en la cara, y temperatura cómoda para niños pequeños. Evitamos mediodía por incomodidad y luz dura.',
            en: 'Golden hour: 6:30-7:30 AM or 5:00-6:00 PM (varies by month). Soft light, no harsh face shadows, comfortable temperature for small kids. We avoid midday for discomfort and harsh light.',
          },
        },
      ],
      bestSeasonNote: {
        es: 'Mejor temporada: diciembre a abril (clima estable). Mayo a noviembre puede tener tarde lluviosa; coordinamos ventana flexible cuando hay riesgo de lluvia.',
        en: 'Best season: December–April (stable weather). May–November may bring afternoon rain; we coordinate a flexible window when rain is likely.',
      },
    },
    {
      citySlug: 'santo-domingo',
      cityName: { es: 'Santo Domingo', en: 'Santo Domingo' },
      intro: {
        es: 'Santo Domingo aporta opciones de sesión familiar que ningún destino de playa ofrece: arquitectura colonial de quinientos años, parques urbanos amplios, y la posibilidad de combinar sesión exterior con estudio. Cubrimos sesiones en la Zona Colonial (Plaza España, Calle Las Damas), parques familiares como Mirador Sur, y estudios privados para retratos de maternidad y recién nacido. Para sesiones familiares de playa, las opciones más cercanas a la ciudad están en Juan Dolio (40 minutos al este): Playa Hemingway y la Playa Pública Juan Dolio, ambas excelentes para sesiones con buena luz natural.',
        en: 'Santo Domingo offers family session options no beach destination has: 500-year-old colonial architecture, expansive urban parks, and the ability to combine outdoor and studio shoots. We cover sessions in the Colonial Zone (Plaza España, Calle Las Damas), family parks like Mirador Sur, and private studios for maternity and newborn portraits. For family beach sessions, the closest options to the city are in Juan Dolio (40 min east): Playa Hemingway and Playa Pública Juan Dolio — both excellent for sessions with strong natural light.',
      },
      venues: {
        es: [
          'Plaza España — sesión familiar con fondo colonial e iluminación al atardecer',
          'Calle Las Damas — la calle empedrada más antigua del Nuevo Mundo',
          'Parque Mirador Sur — sesión amplia en parque familiar urbano',
          'Estudio privado en Piantini — sesión de maternidad y recién nacido en luz controlada',
          'Malecón de Santo Domingo — fondo de mar Caribe con la ciudad detrás',
          'Jardín Botánico Nacional — sesión natural con fondos verdes y florales',
          'Playa Hemingway, Juan Dolio — playa familiar a 40 min de Santo Domingo',
          'Playa Pública Juan Dolio — playa amplia ideal para sesiones grupales',
        ],
        en: [
          'Plaza España — family session with colonial backdrop and sunset light',
          'Calle Las Damas — the oldest cobblestone street in the New World',
          'Parque Mirador Sur — wide-open session in a family urban park',
          'Private studio in Piantini — maternity and newborn session in controlled light',
          'Malecón de Santo Domingo — Caribbean Sea backdrop with the city behind',
          'Jardín Botánico Nacional — natural session with green and floral backdrops',
          'Playa Hemingway, Juan Dolio — family beach 40 min from Santo Domingo',
          'Playa Pública Juan Dolio — wide beach ideal for group sessions',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Hacen sesiones de recién nacido en estudio en Santo Domingo?',
            en: 'Do you do studio newborn sessions in Santo Domingo?',
          },
          answer: {
            es: 'Sí. Tenemos estudio privado con calefacción, props neutros y configuración para sesión de recién nacido (idealmente entre 5 y 14 días de vida). Sesión típica de 2 horas con descansos para alimentar.',
            en: 'Yes. We have a private studio with heating, neutral props, and a newborn session setup (ideally between 5–14 days of age). Typical 2-hour session with feeding breaks.',
          },
        },
        {
          question: {
            es: '¿Pueden combinar sesión exterior y estudio en el mismo día?',
            en: 'Can you combine outdoor and studio sessions on the same day?',
          },
          answer: {
            es: 'Sí. Una opción común: 1 hora en estudio para recién nacido o maternidad + 1 hora en parque o Zona Colonial para familia completa. Coordinamos logística según edad de los participantes.',
            en: 'Yes. A common combo: 1 hour in studio for newborn or maternity + 1 hour in a park or Colonial Zone for the full family. We coordinate logistics based on participant ages.',
          },
        },
      ],
    },
    {
      citySlug: 'la-romana-casa-de-campo',
      cityName: { es: 'La Romana / Casa de Campo', en: 'La Romana / Casa de Campo' },
      intro: {
        es: 'La Romana y Casa de Campo son destino para familias que buscan exclusividad sin la masificación de Punta Cana — playas privadas del resort, villas familiares con servicio dedicado, y la opción única de sesión en Altos de Chavón (un pueblo mediterráneo del siglo XVI tallado a mano). Cubrimos sesiones de familias hospedadas en Casa de Campo Resort, sesiones de maternidad en Minitas Beach, y producciones multigeneracionales en villas privadas. Bayahibe (35 minutos al este) ofrece playas más naturales para familias que prefieren esa estética.',
        en: 'La Romana and Casa de Campo draw families seeking exclusivity without Punta Cana\'s crowds — private resort beaches, family villas with dedicated service, and the unique option of a session at Altos de Chavón (a hand-carved 16th-century Mediterranean village). We cover sessions for families staying at Casa de Campo Resort, maternity sessions on Minitas Beach, and multigenerational productions in private villas. Bayahibe (35 min east) offers more natural beaches for families preferring that aesthetic.',
      },
      venues: {
        es: [
          'Minitas Beach — playa privada del resort, ideal para sesión familiar',
          'Casa de Campo Marina — sesión con yates y restaurantes frente al mar',
          'Altos de Chavón — sesión única con fondos del pueblo mediterráneo',
          'Casa de Campo villas privadas — sesión con piscina e infraestructura del cliente',
          'Playa Bayahibe (35 min de La Romana) — playa pública natural, ideal para familias',
          'Isla Saona excursión — sesión en isla paradisíaca como add-on de día completo',
          'Catalina Island — isla cercana a La Romana, alternativa a Saona menos turística',
          'Juanillo Beach (Cap Cana, ~1 h al este) — playa premium para sesión con vista al Caribe',
        ],
        en: [
          'Minitas Beach — resort private beach, ideal for family sessions',
          'Casa de Campo Marina — session with yachts and seaside restaurants',
          'Altos de Chavón — unique session with Mediterranean village backdrops',
          'Casa de Campo private villas — session with the client\'s pool and infrastructure',
          'Bayahibe Beach (35 min from La Romana) — natural public beach, ideal for families',
          'Saona Island excursion — paradise-island session as a full-day add-on',
          'Catalina Island — close to La Romana, less touristy alternative to Saona',
          'Juanillo Beach (Cap Cana, ~1 h east) — premium beach for sessions with Caribbean views',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Cubren sesiones familiares en villas de Casa de Campo?',
            en: 'Do you cover family sessions in Casa de Campo villas?',
          },
          answer: {
            es: 'Sí. Coordinamos con el wedding planner o concierge del huésped para acceso de fotógrafo externo. Las villas con piscina infinity y áreas exteriores cubiertas son ideales para sesiones multigeneracionales en cualquier clima.',
            en: 'Yes. We coordinate with the guest\'s wedding planner or concierge for outside-photographer access. Villas with infinity pools and covered outdoor areas are ideal for multigenerational sessions in any weather.',
          },
        },
        {
          question: {
            es: '¿Vale la pena hacer sesión en Altos de Chavón con niños pequeños?',
            en: 'Is an Altos de Chavón session worth it with small children?',
          },
          answer: {
            es: 'Sí, si los niños tienen al menos 4 años (calles empedradas). El pueblo entrega 30+ fondos diferentes en menos de una hora caminando: piedra, madera, escaleras, plazas, vista al río Chavón. Para bebés sugerimos Minitas Beach.',
            en: 'Yes, if kids are at least 4 (cobblestone streets). The village delivers 30+ different backdrops in under an hour walking: stone, wood, stairs, plazas, Chavón River views. For babies we suggest Minitas Beach instead.',
          },
        },
      ],
    },
  ],

  knowsAbout: {
      es: ['sesion familiar', 'retratos de maternidad', 'fotografia en playa', 'sesion multigeneracional'],
      en: ['family sessions', 'maternity portraits', 'beach photography', 'multigenerational session'],
    },
  differentiators: [
      { title: { es: 'Direccion amable para ninos y adultos', en: 'Gentle direction for kids and adults' }, proof: { es: 'Flujo relajado que mantiene naturalidad y expresion real.', en: 'Relaxed flow that keeps expressions natural and real.' } },
      { title: { es: 'Locaciones seguras y comodas', en: 'Safe and comfortable locations' }, proof: { es: 'Seleccion de spots con acceso facil y buena luz.', en: 'Location selection with easy access and strong light.' } },
      { title: { es: 'Recuerdos listos para compartir', en: 'Memories ready to share' }, proof: { es: 'Entrega digital optimizada para familia en distintos paises.', en: 'Digital delivery optimized for families across different countries.' } },
    ],
  processSteps: [
      { title: { es: 'Consulta familiar', en: 'Family consultation' }, description: { es: 'Definimos edades, ritmo y expectativas de la sesion.', en: 'We define ages, pace, and session expectations.' } },
      { title: { es: 'Plan de locacion y horario', en: 'Location and timing plan' }, description: { es: 'Seleccion de spot comodo segun luz y energia de ninos.', en: 'Comfortable spot selection based on light and kids energy.' } },
      { title: { es: 'Sesion natural y dinamica', en: 'Natural dynamic session' }, description: { es: 'Direccion ligera para capturar momentos reales.', en: 'Light direction to capture real moments.' } },
      { title: { es: 'Entrega de recuerdos', en: 'Memory delivery' }, description: { es: 'Galeria final lista para compartir y conservar.', en: 'Final gallery ready to share and preserve.' } },
    ],
  locations: [
      { venue: 'Bavaro Calm Beach Zones', area: 'Bavaro', style: { es: 'Familiar playa', en: 'Family beach' }, bestLight: { es: 'Sunrise', en: 'Sunrise' }, detail: { es: 'Aguas tranquilas para ninos pequenos.', en: 'Calm waters for young kids.' }, href: '/portfolio?category=portrait' },
      { venue: 'Cap Cana Garden Areas', area: 'Cap Cana', style: { es: 'Natural elegante', en: 'Elegant natural' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Ideal para maternidad y retrato familiar.', en: 'Ideal for maternity and family portraits.' }, href: '/portfolio?category=portrait' },
      { venue: 'Colonial Zone Streets', area: 'Santo Domingo', style: { es: 'Urbano historico', en: 'Historic urban' }, bestLight: { es: 'Manana', en: 'Morning' }, detail: { es: 'Narrativa familiar con contexto cultural.', en: 'Family storytelling with cultural context.' }, href: '/portfolio?category=portrait' },
      { venue: 'Las Terrenas Beaches', area: 'Las Terrenas', style: { es: 'Vacacional relajado', en: 'Relaxed vacation' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Perfecto para recuerdos de viaje.', en: 'Perfect for vacation memories.' }, href: '/portfolio?category=portrait' },
      { venue: 'Samana Nature Spots', area: 'Samana', style: { es: 'Naturaleza tropical', en: 'Tropical nature' }, bestLight: { es: 'Primeras horas', en: 'Early hours' }, detail: { es: 'Sesiones con look organico y suave.', en: 'Sessions with an organic soft look.' }, href: '/portfolio?category=portrait' },
      { venue: 'Santo Domingo Parks', area: 'Santo Domingo', style: { es: 'Urbano verde', en: 'Urban green' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Ideal para familias locales y celebraciones.', en: 'Ideal for local families and celebrations.' }, href: '/portfolio?category=portrait' },
      { venue: 'Puerto Plata Shoreline', area: 'Puerto Plata', style: { es: 'Costa norte', en: 'North coast' }, bestLight: { es: 'Golden hour', en: 'Golden hour' }, detail: { es: 'Combinacion de playa y palmeras.', en: 'Beach and palm-tree blend.' }, href: '/portfolio?category=portrait' },
      { venue: 'Punta Cana Resort Gardens', area: 'Punta Cana', style: { es: 'Resort familiar', en: 'Family resort' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Comodo para familias en vacaciones.', en: 'Convenient for traveling families.' }, href: '/portfolio?category=portrait' },
    ],
  seasonality: {
      bestMonths: { es: 'Mejores meses playa: diciembre a abril por menor humedad.', en: 'Best beach months: December to April with lower humidity.' },
      cautionMonths: { es: 'Entre mayo y octubre ajustamos horarios para comodidad de ninos.', en: 'Between May and October we adjust timing for kid comfort.' },
      daylightNote: { es: 'Sesiones familiares recomendadas: sunrise o ultima hora para luz suave.', en: 'Recommended family sessions: sunrise or last light for soft tones.' },
    },
  trust: {
      expertBio: {
        es: 'Sesiones familiares y maternidad orientadas a experiencia relajada, con direccion amable para ninos y adultos, cuidando luz natural y tiempos comodos para todos.',
        en: 'Family and maternity sessions designed for a relaxed experience, with gentle direction for kids and adults while optimizing natural light and comfortable pacing.',
      },
      authoritySignals: {
        es: ['Direccion amigable para familias multigeneracionales', 'Planificacion por horarios de siesta y mejor luz', 'Entrega digital simple para compartir con toda la familia'],
        en: ['Kid-friendly direction for multigenerational families', 'Planning around nap schedules and best light', 'Simple digital delivery for easy family sharing'],
      },
      testimonials: [
        {
          role: { es: 'Familia de vacaciones en Punta Cana', en: 'Vacationing family in Punta Cana' },
          quote: { es: 'Los ninos se sintieron comodos y las fotos salieron naturales.', en: 'The kids felt comfortable and the photos looked natural.' },
        },
        {
          role: { es: 'Sesion de maternidad en playa', en: 'Beach maternity session' },
          quote: { es: 'Nos guiaron con calma y el resultado fue emotivo y elegante.', en: 'We were guided calmly and the result was emotional and elegant.' },
        },
        {
          role: { es: 'Sesion familiar con abuelos', en: 'Family session with grandparents' },
          quote: { es: 'Organizaron al grupo grande sin perder espontaneidad.', en: 'They organized a large group without losing spontaneity.' },
        },
      ],
      caseStudy: {
        title: { es: 'Caso: sesion familiar en viaje corto', en: 'Case: family session during a short trip' },
        challenge: { es: 'Solo habia una tarde libre y dos menores con horarios sensibles.', en: 'Only one free afternoon and two young children with sensitive schedules.' },
        solution: { es: 'Ruta compacta, pausas planificadas y secuencia de retratos por energia.', en: 'Compact route, planned breaks, and portrait sequence by energy level.' },
        result: { es: 'Sesion eficiente con galeria completa lista para album familiar.', en: 'Efficient session with full gallery ready for a family album.' },
      },
    },
  longForm: {
      intro: {
        es: 'Una sesion familiar premium en Republica Dominicana combina emocion, comodidad y planificacion realista. Nuestro enfoque prioriza ritmo natural, direccion amable y escenarios donde ninos y adultos se sienten comodos para lograr recuerdos autenticos.',
        en: 'A premium family session in the Dominican Republic combines emotion, comfort, and realistic planning. Our approach prioritizes natural pacing, gentle direction, and locations where kids and adults feel comfortable for authentic memories.',
      },
      sections: [
        {
          title: {
            es: 'Sesiones familiares, maternidad y multigeneracionales con direccion natural',
            en: 'Family, maternity, and multigenerational sessions with natural direction',
          },
          paragraphs: {
            es: [
              'Trabajamos con dinamica flexible para capturar conexiones reales entre padres, hijos y abuelos. La prioridad es crear una experiencia tranquila que produzca expresiones autenticas.',
              'Cada sesion se adapta a la energia del grupo y al objetivo emocional: vacaciones, maternidad, aniversario familiar o memoria multigeneracional.',
            ],
            en: [
              'We work with a flexible dynamic to capture real connection between parents, kids, and grandparents. Priority is creating a calm experience that yields authentic expressions.',
              'Each session adapts to group energy and emotional goal: vacation memories, maternity storytelling, family anniversary, or multigenerational legacy portraits.',
            ],
          },
          bullets: {
            es: [
              'Direccion amable para adultos y ninos',
              'Bloques por nucleos familiares para orden visual',
              'Cobertura en playa, ciudad o naturaleza',
            ],
            en: [
              'Gentle direction for adults and children',
              'Cluster-based family groupings for visual order',
              'Coverage on beach, city, or natural settings',
            ],
          },
        },
        {
          title: {
            es: 'Planificacion por horarios de luz y rutina infantil',
            en: 'Planning around light windows and child routines',
          },
          paragraphs: {
            es: [
              'Una gran sesion familiar depende del horario correcto. Definimos ventana de luz ideal y ritmos del grupo para evitar fatiga y mantener energia positiva.',
              'Cuando hay bebes o toddlers, ajustamos secuencia de retratos para capturar primero los momentos mas importantes y dejar margen para pausas.',
            ],
            en: [
              'Great family sessions depend on timing. We define ideal light windows and group rhythm to avoid fatigue and keep positive energy.',
              'When babies or toddlers are included, we adjust portrait sequence to capture priority moments first and preserve margin for breaks.',
            ],
          },
          bullets: {
            es: [
              'Sunrise o sunset segun edad y rutina',
              'Secuencia de poses por nivel de energia',
              'Ritmo flexible para minimizar estres familiar',
            ],
            en: [
              'Sunrise or sunset based on age and routine',
              'Pose sequence based on energy levels',
              'Flexible pacing to minimize family stress',
            ],
          },
        },
        {
          title: {
            es: 'Entrega final para compartir con toda la familia',
            en: 'Final delivery designed for easy family sharing',
          },
          paragraphs: {
            es: [
              'La entrega esta pensada para familias distribuidas en distintos paises: galeria clara, archivos optimizados y seleccion final lista para imprimir o compartir digitalmente.',
              'Asi el resultado no se queda en un disco duro: se convierte en memoria viva para abuelos, padres e hijos en el tiempo.',
            ],
            en: [
              'Delivery is designed for families distributed across countries: clean gallery, optimized files, and final selects ready for print or digital sharing.',
              'This keeps the result from sitting on a hard drive and turns it into living memory for grandparents, parents, and children over time.',
            ],
          },
          bullets: {
            es: [
              'Galeria digital de uso sencillo',
              'Archivos listos para impresion y social',
              'Curaduria final con enfoque emocional',
            ],
            en: [
              'Simple digital gallery experience',
              'Files ready for print and social sharing',
              'Emotion-first final curation',
            ],
          },
        },
      ],
      timeline: {
        title: {
          es: 'Ejemplo de flujo para sesion familiar',
          en: 'Sample family session flow',
        },
        rows: [
          {
            phase: { es: 'Consulta inicial', en: 'Initial consultation' },
            timing: { es: 'Antes de la sesion', en: 'Before the session' },
            notes: { es: 'Edad de ninos, objetivo y locacion ideal.', en: 'Children ages, goals, and ideal location.' },
          },
          {
            phase: { es: 'Plan de vestuario y horario', en: 'Wardrobe and timing plan' },
            timing: { es: '48-72h previas', en: '48-72h prior' },
            notes: { es: 'Paleta visual y mejor ventana de luz.', en: 'Visual palette and best light window.' },
          },
          {
            phase: { es: 'Sesion en locacion', en: 'On-location session' },
            timing: { es: '60-120 minutos', en: '60-120 minutes' },
            notes: { es: 'Retratos por bloques y momentos espontaneos.', en: 'Cluster portraits and spontaneous moments.' },
          },
          {
            phase: { es: 'Entrega final', en: 'Final delivery' },
            timing: { es: 'Segun temporada y volumen', en: 'Based on season and volume' },
            notes: { es: 'Galeria final lista para compartir en familia.', en: 'Final gallery ready for family sharing.' },
          },
        ],
      },
    },
  faqs: [
      {
        question: {
          es: 'Realizan sesiones familiares en playa y locaciones urbanas?',
          en: 'Do you offer family sessions on beaches and urban locations?',
        },
        answer: {
          es: 'Si. Diseñamos sesiones en playa, ciudad o naturaleza en Santo Domingo, Punta Cana, Samana y otras zonas segun estilo y comodidad de la familia.',
          en: 'Yes. We design sessions on beaches, in the city, or in nature across Santo Domingo, Punta Cana, Samana, and other locations based on your family style and comfort.',
        },
      },
      {
        question: {
          es: 'Incluyen sesiones de maternidad y recien nacidos?',
          en: 'Do you include maternity and newborn sessions?',
        },
        answer: {
          es: 'Si. Podemos organizar sesiones de maternidad y recien nacidos con una direccion tranquila y natural, priorizando seguridad y comodidad.',
          en: 'Yes. We can organize maternity and newborn sessions with calm, natural direction while prioritizing safety and comfort.',
        },
      },
      {
        question: {
          es: 'Cuantas personas pueden participar en una sesion familiar?',
          en: 'How many people can join a family session?',
        },
        answer: {
          es: 'Dependiendo del paquete, podemos cubrir desde nucleo familiar hasta grupos extendidos. Ajustamos duracion y dinamica segun el numero de participantes.',
          en: 'Depending on the package, we can cover immediate families up to extended groups. Session duration and flow are adjusted to participant count.',
        },
      },
      {
        question: {
          es: 'Que horario recomiendan para sesiones con ninos pequenos?',
          en: 'What timing do you recommend for sessions with young children?',
        },
        answer: {
          es: 'Recomendamos sunrise o ultima hora de la tarde segun rutina de sueno. Ajustamos plan para mantener energia y comodidad de los ninos.',
          en: 'We recommend sunrise or late-afternoon windows based on sleep routines. We adjust pacing to maintain kid comfort and energy.',
        },
      },
      {
        question: {
          es: 'Pueden orientar vestuario para toda la familia?',
          en: 'Can you guide wardrobe styling for the whole family?',
        },
        answer: {
          es: 'Si. Compartimos sugerencias de paleta y combinaciones para lograr armonia visual sin que todos se vean iguales.',
          en: 'Yes. We share palette and outfit suggestions to achieve visual harmony without making everyone look identical.',
        },
      },
      {
        question: {
          es: 'Incluyen fotos con abuelos o grupos multigeneracionales?',
          en: 'Do you include grandparents and multi-generation group photos?',
        },
        answer: {
          es: 'Claro. Estructuramos mini bloques de retrato por nucleos familiares para ordenar el flujo y asegurar fotos clave de cada combinacion.',
          en: 'Absolutely. We structure mini portrait blocks by family clusters to keep flow organized and secure key combinations.',
        },
      },
      {
        question: {
          es: 'En cuanto tiempo entregan la galeria final?',
          en: 'How quickly do you deliver the final gallery?',
        },
        answer: {
          es: 'La entrega depende del volumen y temporada, pero siempre confirmamos fecha estimada desde la reserva y mantenemos comunicacion clara en cada etapa.',
          en: 'Delivery depends on volume and season, but we always confirm estimated timing at booking and keep clear communication throughout each stage.',
        },
      },
    ],
  internalLinks: [
      {
        href: '/portfolio?category=portrait',
        label: { es: 'Inspiracion para sesiones familiares', en: 'Family session inspiration' },
        description: { es: 'Descubre estilos naturales para familia, maternidad y pareja.', en: 'Discover natural styles for family, maternity, and couples.' },
      },
      {
        href: '/get-quote',
        label: { es: 'Reservar sesion familiar', en: 'Book a family session' },
        description: { es: 'Elige ciudad, locacion y horario ideal para tu familia.', en: 'Choose city, location, and ideal schedule for your family.' },
      },
    ],
}
