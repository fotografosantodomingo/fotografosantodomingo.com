/**
 * Rich SEO content for the family-beach-photography family page.
 *
 * Recovered from the pre-A6 architecture (commit 94fdc10^).
 * Original legacy slug: 'family-photography'.
 * Mapped to canonical family slug: 'family-beach-photography'.
 */

import type { ServiceContent } from './types'

export const familyBeachPhotographyContent: ServiceContent = {
  schemaAdditionalType: 'https://schema.org/Service',
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
