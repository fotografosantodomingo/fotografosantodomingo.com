/**
 * Rich SEO content for the real-estate-drone-photography family page.
 *
 * Recovered from the pre-A6 architecture (commit 94fdc10^).
 * Original legacy slug: 'drone-services-photography-punta-cana'.
 * Mapped to canonical family slug: 'real-estate-drone-photography'.
 */

import type { ServiceContent } from './types'

export const realEstateDronePhotographyContent: ServiceContent = {
  schemaAdditionalType: 'https://schema.org/ProfessionalService',
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
