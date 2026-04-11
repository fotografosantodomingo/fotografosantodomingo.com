import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServiceBySlug, serviceLandingSlugs } from '@/lib/services/catalog'
import { CONTACT_INFO } from '@/lib/utils/constants'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'
import NewsletterForm from '@/components/NewsletterForm'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = {
  params: { locale: string; service: string }
}

type ServiceSeoConfig = {
  keywords: { es: string; en: string }
  serviceType: { es: string; en: string }
  focusLocations: string[]
}

type ServiceFaqItem = {
  question: { es: string; en: string }
  answer: { es: string; en: string }
}

type ServiceInternalLink = {
  href: string
  label: { es: string; en: string }
  description: { es: string; en: string }
}

type ServiceTrustSignal = {
  expertBio: { es: string; en: string }
  authoritySignals: { es: string[]; en: string[] }
  testimonials: Array<{ role: { es: string; en: string }; quote: { es: string; en: string } }>
  caseStudy: {
    title: { es: string; en: string }
    challenge: { es: string; en: string }
    solution: { es: string; en: string }
    result: { es: string; en: string }
  }
}

type ServiceConversionConfig = {
  primaryCta: { label: { es: string; en: string }; href: string }
  secondaryCta: { label: { es: string; en: string }; href: string }
  leadMagnet: {
    title: { es: string; en: string }
    value: { es: string; en: string }
  }
}

type ServiceLocationRecord = {
  venue: string
  area: string
  style: { es: string; en: string }
  bestLight: { es: string; en: string }
  detail: { es: string; en: string }
  href: string
}

type ServiceSeasonality = {
  bestMonths: { es: string; en: string }
  cautionMonths: { es: string; en: string }
  daylightNote: { es: string; en: string }
}

type ServiceDifferentiator = {
  title: { es: string; en: string }
  proof: { es: string; en: string }
}

type ServiceProcessStep = {
  title: { es: string; en: string }
  description: { es: string; en: string }
}

type ServicePackageOffer = {
  name: { es: string; en: string }
  description: { es: string; en: string }
}

type ServiceLongFormSection = {
  title: { es: string; en: string }
  paragraphs: { es: string[]; en: string[] }
  bullets?: { es: string[]; en: string[] }
}

type ServiceLongFormContent = {
  intro: { es: string; en: string }
  sections: ServiceLongFormSection[]
  timeline: {
    title: { es: string; en: string }
    rows: Array<{
      phase: { es: string; en: string }
      timing: { es: string; en: string }
      notes: { es: string; en: string }
    }>
  }
}

const DOMINICAN_KEY_LOCATIONS = [
  { es: 'Santo Domingo', en: 'Santo Domingo' },
  { es: 'Punta Cana', en: 'Punta Cana' },
  { es: 'Bavaro', en: 'Bavaro' },
  { es: 'Cap Cana', en: 'Cap Cana' },
  { es: 'Santiago', en: 'Santiago' },
  { es: 'La Romana', en: 'La Romana' },
  { es: 'Samana', en: 'Samana' },
  { es: 'Puerto Plata', en: 'Puerto Plata' },
  { es: 'Las Terrenas', en: 'Las Terrenas' },
]

const SERVICE_SEO_CONFIG: Record<string, ServiceSeoConfig> = {
  'wedding-photography': {
    keywords: {
      es: 'fotografo bodas santo domingo, fotografia de bodas punta cana, wedding destination republica dominicana, sesion preboda rd, cobertura bodas premium',
      en: 'wedding photographer santo domingo, punta cana wedding photography, destination wedding dominican republic, engagement session DR, luxury wedding coverage',
    },
    serviceType: {
      es: 'Fotografia de bodas y wedding destination',
      en: 'Wedding and destination wedding photography',
    },
    focusLocations: ['Punta Cana', 'Cap Cana', 'Santo Domingo', 'La Romana', 'Samana'],
  },
  'portrait-photography': {
    keywords: {
      es: 'fotografo retratos santo domingo, retratos corporativos rd, headshots ejecutivos republica dominicana, sesion retrato profesional, fotografia personal branding',
      en: 'portrait photographer santo domingo, corporate portraits DR, executive headshots dominican republic, professional portrait session, personal branding photography',
    },
    serviceType: {
      es: 'Retratos corporativos y personal branding',
      en: 'Corporate portraits and personal branding',
    },
    focusLocations: ['Santo Domingo', 'Santiago', 'Punta Cana', 'Puerto Plata'],
  },
  'drone-services-photography-punta-cana': {
    keywords: {
      es: 'servicios de dron punta cana, fotografia aerea santo domingo, video dron bodas republica dominicana, dron inmobiliaria rd, contenido aereo hoteles',
      en: 'drone services punta cana, aerial photography santo domingo, wedding drone video dominican republic, real estate drone DR, aerial hotel content',
    },
    serviceType: {
      es: 'Fotografia y video aereo con dron',
      en: 'Aerial drone photography and video',
    },
    focusLocations: ['Punta Cana', 'Bavaro', 'Cap Cana', 'Santo Domingo', 'La Romana'],
  },
  'event-photography': {
    keywords: {
      es: 'fotografo eventos santo domingo, cobertura eventos corporativos rd, fotografo fiestas privadas punta cana, fotografia social republica dominicana, fotos evento empresarial',
      en: 'event photographer santo domingo, corporate event coverage DR, private party photographer punta cana, social event photography dominican republic, business event photos',
    },
    serviceType: {
      es: 'Cobertura fotografica de eventos corporativos y sociales',
      en: 'Corporate and social event photography coverage',
    },
    focusLocations: ['Santo Domingo', 'Santiago', 'Punta Cana', 'Puerto Plata'],
  },
  'family-photography': {
    keywords: {
      es: 'sesion familiar santo domingo, fotografo familia punta cana, fotos maternidad republica dominicana, fotografia recien nacido rd, retratos familiares playa',
      en: 'family session santo domingo, family photographer punta cana, maternity photos dominican republic, newborn photography DR, beach family portraits',
    },
    serviceType: {
      es: 'Sesiones familiares, maternidad y recien nacidos',
      en: 'Family, maternity, and newborn sessions',
    },
    focusLocations: ['Santo Domingo', 'Punta Cana', 'Las Terrenas', 'Samana', 'Puerto Plata'],
  },
  'commercial-photography': {
    keywords: {
      es: 'fotografia comercial santo domingo, fotografo productos republica dominicana, fotografia gastronomica rd, fotografia hoteles punta cana, contenido visual para marcas',
      en: 'commercial photographer santo domingo, product photography dominican republic, food photography DR, hotel photography punta cana, brand visual content',
    },
    serviceType: {
      es: 'Fotografia comercial para marcas, hoteles y productos',
      en: 'Commercial photography for brands, hotels, and products',
    },
    focusLocations: ['Santo Domingo', 'Santiago', 'Punta Cana', 'Bavaro', 'Cap Cana'],
  },
}

const SERVICE_FAQ_CONFIG: Record<string, ServiceFaqItem[]> = {
  'wedding-photography': [
    {
      question: {
        es: 'Con cuanto tiempo de anticipacion debo reservar fotografia de bodas en Republica Dominicana?',
        en: 'How far in advance should I book wedding photography in the Dominican Republic?',
      },
      answer: {
        es: 'Recomendamos reservar entre 6 y 12 meses antes para fechas de alta demanda en Punta Cana, Cap Cana y Santo Domingo. Para bodas intimas entre semana tambien podemos confirmar con menor anticipacion.',
        en: 'We recommend booking 6 to 12 months in advance for high-demand dates in Punta Cana, Cap Cana, and Santo Domingo. For intimate weekday weddings we can often confirm on shorter notice.',
      },
    },
    {
      question: {
        es: 'Cubren bodas destino fuera de Punta Cana?',
        en: 'Do you cover destination weddings outside Punta Cana?',
      },
      answer: {
        es: 'Si. Cubrimos bodas destino en toda Republica Dominicana incluyendo La Romana, Samana, Las Terrenas y Puerto Plata, segun logistica y agenda.',
        en: 'Yes. We cover destination weddings across the Dominican Republic including La Romana, Samana, Las Terrenas, and Puerto Plata, based on logistics and schedule.',
      },
    },
    {
      question: {
        es: 'En cuanto tiempo entregan las fotos de boda?',
        en: 'How fast do you deliver wedding photos?',
      },
      answer: {
        es: 'Entregamos una seleccion inicial rapida y luego la galeria final editada en alta resolucion dentro del plazo acordado en contrato, segun cobertura y volumen.',
        en: 'We provide a fast preview selection and then the final high-resolution edited gallery within the contract timeline, depending on coverage length and image volume.',
      },
    },
    {
      question: {
        es: 'Cuantas fotos recibimos por hora de cobertura?',
        en: 'How many images do we receive per hour of coverage?',
      },
      answer: {
        es: 'Como referencia, entregamos normalmente entre 80 y 100 fotos finales por hora de cobertura efectiva, manteniendo coherencia de color y narrativa del dia.',
        en: 'As a reference, we usually deliver between 80 and 100 final images per hour of effective coverage while keeping color consistency and full-day storytelling.',
      },
    },
    {
      question: {
        es: 'Ofrecen segundo fotografo para bodas grandes?',
        en: 'Do you offer a second shooter for large weddings?',
      },
      answer: {
        es: 'Si. Recomendamos segundo fotografo para bodas de 100+ invitados, multiples locaciones o timelines ajustados para no perder momentos simultaneos.',
        en: 'Yes. We recommend a second shooter for 100+ guest weddings, multi-location timelines, or tight schedules so simultaneous moments are not missed.',
      },
    },
    {
      question: {
        es: 'Que pasa si llueve o hay alerta de tormenta?',
        en: 'What happens if it rains or there is a storm alert?',
      },
      answer: {
        es: 'Trabajamos con plan de contingencia desde preproduccion: spots cubiertos, orden alterno del timeline y politica de reprogramacion segun contrato.',
        en: 'We work with a contingency plan from pre-production: covered spots, alternate timeline order, and a contract-based rescheduling policy.',
      },
    },
    {
      question: {
        es: 'Podemos pedir una lista de fotos imprescindibles?',
        en: 'Can we request a must-have shot list?',
      },
      answer: {
        es: 'Claro. En la fase de planificacion recopilamos tu lista de retratos familiares, detalles y momentos clave para integrarla al flujo del dia.',
        en: 'Absolutely. During planning we collect your family portrait list, detail priorities, and key moments to integrate them into the wedding-day flow.',
      },
    },
    {
      question: {
        es: 'En que idiomas pueden coordinar la cobertura?',
        en: 'Which languages can you coordinate coverage in?',
      },
      answer: {
        es: 'Coordinamos regularmente en espanol e ingles para bodas destino, facilitando comunicacion con parejas, wedding planners y proveedores locales.',
        en: 'We regularly coordinate in Spanish and English for destination weddings, making communication smooth with couples, wedding planners, and local vendors.',
      },
    },
  ],
  'portrait-photography': [
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
  'drone-services-photography-punta-cana': [
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
  'event-photography': [
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
  'family-photography': [
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
  'commercial-photography': [
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
}

const SERVICE_INTERNAL_LINKS: Record<string, ServiceInternalLink[]> = {
  'wedding-photography': [
    {
      href: '/portfolio?category=wedding',
      label: { es: 'Ver bodas reales en el portafolio', en: 'See real weddings in the portfolio' },
      description: { es: 'Revisa cobertura completa de bodas destino en Punta Cana y Cap Cana.', en: 'Review full destination wedding coverage in Punta Cana and Cap Cana.' },
    },
    {
      href: '/contact',
      label: { es: 'Solicitar disponibilidad de fecha', en: 'Check date availability' },
      description: { es: 'Agenda una consulta para asegurar tu fecha de boda en RD.', en: 'Book a consultation to secure your wedding date in the DR.' },
    },
  ],
  'portrait-photography': [
    {
      href: '/portfolio?category=portrait',
      label: { es: 'Explorar retratos y headshots', en: 'Explore portraits and headshots' },
      description: { es: 'Mira ejemplos de retratos corporativos y personales.', en: 'See examples of corporate and personal portraits.' },
    },
    {
      href: '/contact',
      label: { es: 'Coordinar sesion de retrato', en: 'Schedule a portrait session' },
      description: { es: 'Definimos estilo, locacion y objetivos de imagen.', en: 'We define style, location, and image goals.' },
    },
  ],
  'drone-services-photography-punta-cana': [
    {
      href: '/portfolio?category=drone',
      label: { es: 'Ver tomas aereas recientes', en: 'View recent aerial work' },
      description: { es: 'Ejemplos de contenido drone para hoteles, villas y eventos.', en: 'Examples of drone content for hotels, villas, and events.' },
    },
    {
      href: '/contact',
      label: { es: 'Cotizar produccion con dron', en: 'Request a drone production quote' },
      description: { es: 'Comparte locacion, fecha y objetivo de grabacion.', en: 'Share location, date, and production objective.' },
    },
  ],
  'event-photography': [
    {
      href: '/portfolio?category=event',
      label: { es: 'Revisar cobertura de eventos', en: 'Review event coverage samples' },
      description: { es: 'Casos de eventos corporativos y sociales en distintas ciudades.', en: 'Examples of corporate and social events across multiple cities.' },
    },
    {
      href: '/contact',
      label: { es: 'Planificar cobertura de evento', en: 'Plan event coverage' },
      description: { es: 'Definimos cronograma, entregables y plan de cobertura.', en: 'We define timeline, deliverables, and coverage plan.' },
    },
  ],
  'family-photography': [
    {
      href: '/portfolio?category=portrait',
      label: { es: 'Inspiracion para sesiones familiares', en: 'Family session inspiration' },
      description: { es: 'Descubre estilos naturales para familia, maternidad y pareja.', en: 'Discover natural styles for family, maternity, and couples.' },
    },
    {
      href: '/contact',
      label: { es: 'Reservar sesion familiar', en: 'Book a family session' },
      description: { es: 'Elige ciudad, locacion y horario ideal para tu familia.', en: 'Choose city, location, and ideal schedule for your family.' },
    },
  ],
  'commercial-photography': [
    {
      href: '/portfolio?category=commercial',
      label: { es: 'Ver casos comerciales', en: 'See commercial case studies' },
      description: { es: 'Trabajo visual para marcas, productos y hospitalidad.', en: 'Visual work for brands, products, and hospitality.' },
    },
    {
      href: '/contact',
      label: { es: 'Solicitar propuesta comercial', en: 'Request a commercial proposal' },
      description: { es: 'Creamos alcance y entregables segun objetivos de negocio.', en: 'We define scope and deliverables around business goals.' },
    },
  ],
}

const SERVICE_TRUST_CONFIG: Record<string, ServiceTrustSignal> = {
  'wedding-photography': {
    expertBio: {
      es: 'Equipo liderado por fotografo de bodas destino con mas de 10 temporadas en Republica Dominicana, cobertura de celebraciones multiculturales y coordinacion fluida con planners, resorts y equipos de produccion.',
      en: 'Team led by a destination wedding photographer with 10+ seasons in the Dominican Republic, covering multicultural celebrations with smooth coordination across planners, resorts, and production teams.',
    },
    authoritySignals: {
      es: ['Direccion bilingue ES/EN para bodas internacionales', 'Red local de planners y venues en Punta Cana y Cap Cana', 'Flujo de respaldo: doble camara, doble almacenamiento y contrato claro'],
      en: ['Bilingual ES/EN direction for international weddings', 'Local network of planners and venues in Punta Cana and Cap Cana', 'Redundant workflow: dual cameras, dual storage, and clear contracts'],
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
  'portrait-photography': {
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
  'drone-services-photography-punta-cana': {
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
  'event-photography': {
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
  'family-photography': {
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
  'commercial-photography': {
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
}

const SERVICE_CONVERSION_CONFIG: Record<string, ServiceConversionConfig> = {
  'wedding-photography': {
    primaryCta: { label: { es: 'Ver Bodas Reales en Portafolio', en: 'View Real Weddings Portfolio' }, href: '/portfolio?category=wedding' },
    secondaryCta: { label: { es: 'Consultar Disponibilidad 2026', en: 'Check 2026 Availability' }, href: '/contact' },
    leadMagnet: {
      title: { es: 'Guia de Timeline para Boda en Punta Cana', en: 'Punta Cana Wedding Timeline Guide' },
      value: { es: 'Plantilla practica para planificar foto y momentos clave.', en: 'Practical template to plan photography and key moments.' },
    },
  },
  'portrait-photography': {
    primaryCta: { label: { es: 'Reservar Sesion de Branding', en: 'Book Your Branding Session' }, href: '/contact' },
    secondaryCta: { label: { es: 'Ver Ejemplos de Headshots', en: 'See Executive Headshot Examples' }, href: '/portfolio?category=portrait' },
    leadMagnet: {
      title: { es: 'Checklist de Imagen Profesional para LinkedIn', en: 'LinkedIn Professional Photo Checklist' },
      value: { es: 'Recomendaciones de vestuario, pose y expresion para ejecutivos.', en: 'Wardrobe, pose, and expression recommendations for executives.' },
    },
  },
  'drone-services-photography-punta-cana': {
    primaryCta: { label: { es: 'Solicitar Cotizacion Aerea', en: 'Request Aerial Quote' }, href: '/contact' },
    secondaryCta: { label: { es: 'Ver Reel de Tomas Drone', en: 'Watch Sample Drone Reel' }, href: '/portfolio?category=drone' },
    leadMagnet: {
      title: { es: 'Mapa Base de Zonas de Vuelo en RD', en: 'DR Flight Zone Starter Map' },
      value: { es: 'Guia inicial para planificar proyectos aereos de forma segura.', en: 'Starter guide for planning aerial projects safely.' },
    },
  },
  'event-photography': {
    primaryCta: { label: { es: 'Planificar Cobertura del Evento', en: 'Plan Your Event Coverage' }, href: '/contact' },
    secondaryCta: { label: { es: 'Ver Casos de Eventos', en: 'See Event Coverage Examples' }, href: '/portfolio?category=event' },
    leadMagnet: {
      title: { es: 'Plantilla de Shot List para Eventos Corporativos', en: 'Corporate Event Shot List Template' },
      value: { es: 'Checklist para alinear foto con marketing y patrocinadores.', en: 'Checklist to align photography with marketing and sponsors.' },
    },
  },
  'family-photography': {
    primaryCta: { label: { es: 'Reservar Sesion Familiar', en: 'Book Your Family Session' }, href: '/contact' },
    secondaryCta: { label: { es: 'Ver Retratos de Familia', en: 'See Family Portrait Examples' }, href: '/portfolio?category=portrait' },
    leadMagnet: {
      title: { es: 'Lista de Preparacion para Sesion Familiar en Playa', en: 'Beach Family Session Packing List' },
      value: { es: 'Guia simple para vestuario, horarios y comodidad de ninos.', en: 'Simple guide for wardrobe, timing, and kid comfort.' },
    },
  },
  'commercial-photography': {
    primaryCta: { label: { es: 'Solicitar Propuesta Comercial', en: 'Request Commercial Proposal' }, href: '/contact' },
    secondaryCta: { label: { es: 'Ver Casos de Marca y Hotel', en: 'See Brand and Hotel Examples' }, href: '/portfolio?category=commercial' },
    leadMagnet: {
      title: { es: 'Template de Brief Creativo para Produccion Foto', en: 'Creative Brief Template for Photo Production' },
      value: { es: 'Formato para acelerar aprobaciones con equipos de marketing.', en: 'Template to speed approvals with marketing teams.' },
    },
  },
}

const SERVICE_LOCATION_DATABASE: Record<string, ServiceLocationRecord[]> = {
  'wedding-photography': [
    { venue: 'Sanctuary Cap Cana', area: 'Cap Cana', style: { es: 'Resort boutique de lujo', en: 'Luxury boutique resort' }, bestLight: { es: 'Golden hour frente al mar', en: 'Golden hour by the sea' }, detail: { es: 'Ideal para bodas elegantes y ceremonias intimas.', en: 'Great for elegant weddings and intimate ceremonies.' }, href: '/portfolio?category=wedding' },
    { venue: 'Hard Rock Punta Cana', area: 'Punta Cana', style: { es: 'Resort moderno de gran escala', en: 'Large modern resort' }, bestLight: { es: 'Manana y sunset', en: 'Morning and sunset' }, detail: { es: 'Funciona bien para celebraciones numerosas.', en: 'Works well for large celebrations.' }, href: '/portfolio?category=wedding' },
    { venue: 'Altos de Chavon', area: 'La Romana', style: { es: 'Arquitectura historica', en: 'Historic architecture' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Escenario con textura cultural y editorial.', en: 'A cultural, editorial-style setting.' }, href: '/portfolio?category=wedding' },
    { venue: 'Tortuga Bay', area: 'Punta Cana', style: { es: 'Villas premium', en: 'Premium villas' }, bestLight: { es: 'Sunrise y sunset', en: 'Sunrise and sunset' }, detail: { es: 'Privacidad y look sofisticado.', en: 'Private and sophisticated look.' }, href: '/portfolio?category=wedding' },
    { venue: 'Casa de Campo', area: 'La Romana', style: { es: 'Resort clasico', en: 'Classic resort' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Variedad de spots entre marina y jardines.', en: 'Variety of spots between marina and gardens.' }, href: '/portfolio?category=wedding' },
    { venue: 'Macao Beach', area: 'Punta Cana', style: { es: 'Playa natural', en: 'Natural beach' }, bestLight: { es: 'Ultima hora del dia', en: 'Last hour of daylight' }, detail: { es: 'Look organico para parejas destino.', en: 'Organic look for destination couples.' }, href: '/portfolio?category=wedding' },
    { venue: 'Santo Domingo Colonial Zone', area: 'Santo Domingo', style: { es: 'Colonial urbano', en: 'Urban colonial' }, bestLight: { es: 'Manana', en: 'Morning' }, detail: { es: 'Sesiones pre o post boda con historia visual.', en: 'Pre/post wedding sessions with historic character.' }, href: '/portfolio?category=wedding' },
    { venue: 'Las Terrenas Beach Clubs', area: 'Las Terrenas', style: { es: 'Boho tropical', en: 'Tropical boho' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Ambiente relajado para bodas destino.', en: 'Relaxed atmosphere for destination weddings.' }, href: '/portfolio?category=wedding' },
  ],
  'portrait-photography': [
    { venue: 'BlueMall Business District', area: 'Santo Domingo', style: { es: 'Corporativo moderno', en: 'Modern corporate' }, bestLight: { es: 'Manana', en: 'Morning' }, detail: { es: 'Perfecto para headshots ejecutivos.', en: 'Perfect for executive headshots.' }, href: '/portfolio?category=portrait' },
    { venue: 'Punta Cana Resort Offices', area: 'Punta Cana', style: { es: 'Hospitalidad premium', en: 'Premium hospitality' }, bestLight: { es: 'Manana y tarde', en: 'Morning and afternoon' }, detail: { es: 'Ideal para equipos en eventos empresariales.', en: 'Ideal for teams during business events.' }, href: '/portfolio?category=portrait' },
    { venue: 'Colonial Facades', area: 'Santo Domingo', style: { es: 'Editorial urbano', en: 'Urban editorial' }, bestLight: { es: 'Primeras horas', en: 'Early hours' }, detail: { es: 'Look premium para marca personal.', en: 'Premium look for personal brands.' }, href: '/portfolio?category=portrait' },
    { venue: 'Santiago Corporate Towers', area: 'Santiago', style: { es: 'Ejecutivo limpio', en: 'Clean executive' }, bestLight: { es: 'Mediodia interior', en: 'Indoor midday' }, detail: { es: 'Setups rapidos para sesiones de equipo.', en: 'Fast setups for team sessions.' }, href: '/portfolio?category=portrait' },
    { venue: 'Hotel Lobbies SDQ', area: 'Santo Domingo', style: { es: 'Lifestyle profesional', en: 'Professional lifestyle' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Ideal para viajeros de negocio.', en: 'Great for business travelers.' }, href: '/portfolio?category=portrait' },
    { venue: 'Cap Cana Marina Walk', area: 'Cap Cana', style: { es: 'Lujoso exterior', en: 'Luxury outdoor' }, bestLight: { es: 'Golden hour', en: 'Golden hour' }, detail: { es: 'Marca personal con contexto de lifestyle.', en: 'Personal branding with lifestyle context.' }, href: '/portfolio?category=portrait' },
    { venue: 'Puerto Plata Boardwalk', area: 'Puerto Plata', style: { es: 'Costero casual premium', en: 'Coastal premium casual' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Sesiones branding para emprendedores.', en: 'Branding sessions for entrepreneurs.' }, href: '/portfolio?category=portrait' },
    { venue: 'Conference Venues', area: 'Punta Cana', style: { es: 'Corporativo evento', en: 'Corporate event' }, bestLight: { es: 'Controlado por luz artificial', en: 'Controlled artificial light' }, detail: { es: 'Headshots durante congresos y summits.', en: 'Headshots during conferences and summits.' }, href: '/portfolio?category=portrait' },
  ],
  'drone-services-photography-punta-cana': [
    { venue: 'Cap Cana Marina', area: 'Cap Cana', style: { es: 'Nautico premium', en: 'Premium nautical' }, bestLight: { es: 'Sunrise', en: 'Sunrise' }, detail: { es: 'Excelente para hoteles y real estate de lujo.', en: 'Excellent for luxury hotels and real estate.' }, href: '/portfolio?category=drone' },
    { venue: 'Bavaro Beachfront', area: 'Bavaro', style: { es: 'Resort costero', en: 'Coastal resort' }, bestLight: { es: 'Golden hour', en: 'Golden hour' }, detail: { es: 'Planos abiertos para campanas de turismo.', en: 'Wide shots for tourism campaigns.' }, href: '/portfolio?category=drone' },
    { venue: 'Santo Domingo Malecon', area: 'Santo Domingo', style: { es: 'Urbano maritimo', en: 'Urban waterfront' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Ideal para piezas institucionales y eventos.', en: 'Ideal for institutional pieces and events.' }, href: '/portfolio?category=drone' },
    { venue: 'Bayahibe Coastline', area: 'La Romana', style: { es: 'Costa natural', en: 'Natural coastline' }, bestLight: { es: 'Manana', en: 'Morning' }, detail: { es: 'Contenido premium para hospitalidad.', en: 'Premium hospitality content.' }, href: '/portfolio?category=drone' },
    { venue: 'Samana Peninsula', area: 'Samana', style: { es: 'Paisaje tropical', en: 'Tropical landscape' }, bestLight: { es: 'Amanecer', en: 'Sunrise' }, detail: { es: 'Tomas de naturaleza y destinos.', en: 'Destination and nature shots.' }, href: '/portfolio?category=drone' },
    { venue: 'Punta Cana Golf Resorts', area: 'Punta Cana', style: { es: 'Resort deportivo', en: 'Sports resort' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Visuales para venta de membresias y eventos.', en: 'Visuals for memberships and event marketing.' }, href: '/portfolio?category=drone' },
    { venue: 'Industrial Zones SDQ', area: 'Santo Domingo', style: { es: 'Corporativo tecnico', en: 'Technical corporate' }, bestLight: { es: 'Media manana', en: 'Mid-morning' }, detail: { es: 'Documentacion de infraestructura y avances.', en: 'Infrastructure and progress documentation.' }, href: '/portfolio?category=drone' },
    { venue: 'Puerto Plata Resorts', area: 'Puerto Plata', style: { es: 'Turismo costa norte', en: 'North coast tourism' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Piezas para comercializacion internacional.', en: 'Assets for international marketing.' }, href: '/portfolio?category=drone' },
  ],
  'event-photography': [
    { venue: 'Convention Center SDQ', area: 'Santo Domingo', style: { es: 'Congresos', en: 'Conferences' }, bestLight: { es: 'Luz mixta interior', en: 'Mixed indoor light' }, detail: { es: 'Keynotes y networking con cobertura editorial.', en: 'Keynotes and networking with editorial coverage.' }, href: '/portfolio?category=event' },
    { venue: 'Resort Ballrooms', area: 'Punta Cana', style: { es: 'Gala corporativa', en: 'Corporate gala' }, bestLight: { es: 'Iluminacion de escenario', en: 'Stage lighting' }, detail: { es: 'Ideal para premios y eventos de marca.', en: 'Ideal for awards and brand events.' }, href: '/portfolio?category=event' },
    { venue: 'Colonial Event Houses', area: 'Santo Domingo', style: { es: 'Social premium', en: 'Premium social' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Eventos privados con look elegante.', en: 'Private events with elegant look.' }, href: '/portfolio?category=event' },
    { venue: 'Cap Cana Conference Hotels', area: 'Cap Cana', style: { es: 'Business luxury', en: 'Business luxury' }, bestLight: { es: 'Controlado', en: 'Controlled' }, detail: { es: 'Summits y board meetings internacionales.', en: 'International summits and board meetings.' }, href: '/portfolio?category=event' },
    { venue: 'Santiago Expo Spaces', area: 'Santiago', style: { es: 'Trade show', en: 'Trade show' }, bestLight: { es: 'Interior uniforme', en: 'Uniform indoor' }, detail: { es: 'Cobertura de stands y activaciones.', en: 'Booth and activation coverage.' }, href: '/portfolio?category=event' },
    { venue: 'Beach Festivals Bavaro', area: 'Bavaro', style: { es: 'Festival costero', en: 'Beach festival' }, bestLight: { es: 'Sunset y noche', en: 'Sunset and night' }, detail: { es: 'Ambiente dinamico para contenido social.', en: 'Dynamic atmosphere for social content.' }, href: '/portfolio?category=event' },
    { venue: 'La Romana Private Clubs', area: 'La Romana', style: { es: 'Evento privado', en: 'Private event' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Cobertura discreta de alto nivel.', en: 'High-end discreet coverage.' }, href: '/portfolio?category=event' },
    { venue: 'Puerto Plata Waterfront Venues', area: 'Puerto Plata', style: { es: 'Evento destino', en: 'Destination event' }, bestLight: { es: 'Golden hour', en: 'Golden hour' }, detail: { es: 'Visuales de experiencia para sponsors.', en: 'Experience visuals for sponsors.' }, href: '/portfolio?category=event' },
  ],
  'family-photography': [
    { venue: 'Bavaro Calm Beach Zones', area: 'Bavaro', style: { es: 'Familiar playa', en: 'Family beach' }, bestLight: { es: 'Sunrise', en: 'Sunrise' }, detail: { es: 'Aguas tranquilas para ninos pequenos.', en: 'Calm waters for young kids.' }, href: '/portfolio?category=portrait' },
    { venue: 'Cap Cana Garden Areas', area: 'Cap Cana', style: { es: 'Natural elegante', en: 'Elegant natural' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Ideal para maternidad y retrato familiar.', en: 'Ideal for maternity and family portraits.' }, href: '/portfolio?category=portrait' },
    { venue: 'Colonial Zone Streets', area: 'Santo Domingo', style: { es: 'Urbano historico', en: 'Historic urban' }, bestLight: { es: 'Manana', en: 'Morning' }, detail: { es: 'Narrativa familiar con contexto cultural.', en: 'Family storytelling with cultural context.' }, href: '/portfolio?category=portrait' },
    { venue: 'Las Terrenas Beaches', area: 'Las Terrenas', style: { es: 'Vacacional relajado', en: 'Relaxed vacation' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Perfecto para recuerdos de viaje.', en: 'Perfect for vacation memories.' }, href: '/portfolio?category=portrait' },
    { venue: 'Samana Nature Spots', area: 'Samana', style: { es: 'Naturaleza tropical', en: 'Tropical nature' }, bestLight: { es: 'Primeras horas', en: 'Early hours' }, detail: { es: 'Sesiones con look organico y suave.', en: 'Sessions with an organic soft look.' }, href: '/portfolio?category=portrait' },
    { venue: 'Santo Domingo Parks', area: 'Santo Domingo', style: { es: 'Urbano verde', en: 'Urban green' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Ideal para familias locales y celebraciones.', en: 'Ideal for local families and celebrations.' }, href: '/portfolio?category=portrait' },
    { venue: 'Puerto Plata Shoreline', area: 'Puerto Plata', style: { es: 'Costa norte', en: 'North coast' }, bestLight: { es: 'Golden hour', en: 'Golden hour' }, detail: { es: 'Combinacion de playa y palmeras.', en: 'Beach and palm-tree blend.' }, href: '/portfolio?category=portrait' },
    { venue: 'Punta Cana Resort Gardens', area: 'Punta Cana', style: { es: 'Resort familiar', en: 'Family resort' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Comodo para familias en vacaciones.', en: 'Convenient for traveling families.' }, href: '/portfolio?category=portrait' },
  ],
  'commercial-photography': [
    { venue: 'Santo Domingo Studios', area: 'Santo Domingo', style: { es: 'Producto ecommerce', en: 'Ecommerce product' }, bestLight: { es: 'Control total', en: 'Full control' }, detail: { es: 'Fondos limpios para catalogo y marketplaces.', en: 'Clean backgrounds for catalogs and marketplaces.' }, href: '/portfolio?category=commercial' },
    { venue: 'Hospitality Resorts Punta Cana', area: 'Punta Cana', style: { es: 'Hospitalidad premium', en: 'Premium hospitality' }, bestLight: { es: 'Sunrise y sunset', en: 'Sunrise and sunset' }, detail: { es: 'Contenido para web de hotel y OTA.', en: 'Content for hotel websites and OTAs.' }, href: '/portfolio?category=commercial' },
    { venue: 'Cap Cana Restaurants', area: 'Cap Cana', style: { es: 'Food and beverage', en: 'Food and beverage' }, bestLight: { es: 'Lunch y dinner', en: 'Lunch and dinner' }, detail: { es: 'Fotografia de menu y piezas de campana.', en: 'Menu photography and campaign assets.' }, href: '/portfolio?category=commercial' },
    { venue: 'Santiago Retail Spaces', area: 'Santiago', style: { es: 'Retail branding', en: 'Retail branding' }, bestLight: { es: 'Interior controlado', en: 'Controlled indoor' }, detail: { es: 'Visuales de punto de venta y equipo.', en: 'Point-of-sale and team visuals.' }, href: '/portfolio?category=commercial' },
    { venue: 'Industrial Parks SDQ', area: 'Santo Domingo', style: { es: 'Industrial B2B', en: 'Industrial B2B' }, bestLight: { es: 'Media manana', en: 'Mid-morning' }, detail: { es: 'Contenido corporativo para inversionistas.', en: 'Corporate content for investors.' }, href: '/portfolio?category=commercial' },
    { venue: 'La Romana Developments', area: 'La Romana', style: { es: 'Real estate premium', en: 'Premium real estate' }, bestLight: { es: 'Golden hour', en: 'Golden hour' }, detail: { es: 'Visuales para preventa y presentaciones.', en: 'Visuals for pre-sales and presentations.' }, href: '/portfolio?category=commercial' },
    { venue: 'Puerto Plata Hotel Zones', area: 'Puerto Plata', style: { es: 'Turismo comercial', en: 'Commercial tourism' }, bestLight: { es: 'Sunset', en: 'Sunset' }, detail: { es: 'Campanas estacionales de ocupacion.', en: 'Seasonal occupancy campaigns.' }, href: '/portfolio?category=commercial' },
    { venue: 'Bavaro Lifestyle Areas', area: 'Bavaro', style: { es: 'Lifestyle de marca', en: 'Brand lifestyle' }, bestLight: { es: 'Tarde', en: 'Afternoon' }, detail: { es: 'Producciones para social y paid media.', en: 'Productions for social and paid media.' }, href: '/portfolio?category=commercial' },
  ],
}

const SERVICE_SEASONALITY_CONFIG: Record<string, ServiceSeasonality> = {
  'wedding-photography': {
    bestMonths: { es: 'Temporada recomendada: noviembre a abril por clima mas estable.', en: 'Best season: November to April for more stable weather.' },
    cautionMonths: { es: 'Temporada de lluvia/huracanes: mayo a octubre, con plan B obligatorio.', en: 'Rain/hurricane season: May to October, with mandatory backup plans.' },
    daylightNote: { es: 'Golden hour promedio: 5:30-6:45 PM segun mes y locacion.', en: 'Average golden hour: 5:30-6:45 PM depending on month and location.' },
  },
  'portrait-photography': {
    bestMonths: { es: 'Temporada ideal exterior: diciembre a abril; interior funciona todo el ano.', en: 'Ideal outdoor season: December to April; indoor works year-round.' },
    cautionMonths: { es: 'De junio a octubre recomendamos ventanas cortas y locacion cubierta alternativa.', en: 'From June to October, we recommend shorter windows and covered backup options.' },
    daylightNote: { es: 'Mejor luz natural para retrato: primeras 2 horas del dia o golden hour.', en: 'Best natural portrait light: first two hours of day or golden hour.' },
  },
  'drone-services-photography-punta-cana': {
    bestMonths: { es: 'Temporada recomendada: enero a abril y julio para cielos mas limpios.', en: 'Recommended season: January to April and July for cleaner skies.' },
    cautionMonths: { es: 'En meses de lluvia se trabaja con ventanas meteorologicas y reprogramacion flexible.', en: 'During rainy months we work with weather windows and flexible rescheduling.' },
    daylightNote: { es: 'Vuelos de golden hour ofrecen mayor contraste y look cinematico para hoteles.', en: 'Golden-hour flights provide stronger contrast and cinematic hotel visuals.' },
  },
  'event-photography': {
    bestMonths: { es: 'Alta temporada corporativa: febrero-junio y septiembre-noviembre.', en: 'High corporate season: February-June and September-November.' },
    cautionMonths: { es: 'Para eventos en exterior se define plan de lluvia y flujo interior alterno.', en: 'For outdoor events we define rain plans and indoor workflow alternatives.' },
    daylightNote: { es: 'Para eventos mixtos conviene iniciar retratos antes de la puesta del sol.', en: 'For mixed indoor/outdoor events, portraits should start before sunset.' },
  },
  'family-photography': {
    bestMonths: { es: 'Mejores meses playa: diciembre a abril por menor humedad.', en: 'Best beach months: December to April with lower humidity.' },
    cautionMonths: { es: 'Entre mayo y octubre ajustamos horarios para comodidad de ninos.', en: 'Between May and October we adjust timing for kid comfort.' },
    daylightNote: { es: 'Sesiones familiares recomendadas: sunrise o ultima hora para luz suave.', en: 'Recommended family sessions: sunrise or last light for soft tones.' },
  },
  'commercial-photography': {
    bestMonths: { es: 'Produccion comercial se realiza todo el ano con preproduccion por clima.', en: 'Commercial production runs year-round with climate-aware pre-production.' },
    cautionMonths: { es: 'En temporada de lluvia se prioriza shooting block y cronograma modular.', en: 'In rainy season we prioritize block shooting and modular scheduling.' },
    daylightNote: { es: 'Para hospitality, sunrise y blue hour maximizan impacto visual.', en: 'For hospitality, sunrise and blue hour maximize visual impact.' },
  },
}

const SERVICE_DIFFERENTIATORS: Record<string, ServiceDifferentiator[]> = {
  'wedding-photography': [
    { title: { es: 'Direccion multilingue para bodas destino', en: 'Multilingual direction for destination weddings' }, proof: { es: 'Coordinacion fluida con parejas y proveedores internacionales.', en: 'Smooth coordination with international couples and vendors.' } },
    { title: { es: 'Experiencia real en resorts de RD', en: 'Real experience across DR resorts' }, proof: { es: 'Planificacion de timeline en venues con logistica compleja.', en: 'Timeline planning in venues with complex logistics.' } },
    { title: { es: 'Narrativa completa del dia', en: 'Complete day storytelling' }, proof: { es: 'Cobertura de detalles, emocion y ambiente sin perder ritmo.', en: 'Coverage of details, emotion, and atmosphere without losing pace.' } },
  ],
  'portrait-photography': [
    { title: { es: 'Headshots orientados a negocio', en: 'Business-oriented headshots' }, proof: { es: 'Imagen alineada con posicionamiento profesional y confianza.', en: 'Image aligned with professional positioning and trust.' } },
    { title: { es: 'Entrega rapida para agendas ejecutivas', en: 'Fast delivery for executive schedules' }, proof: { es: 'Flujo express para viajes, eventos y comunicacion urgente.', en: 'Express workflow for travel, events, and urgent communications.' } },
    { title: { es: 'Estilo consistente para equipos', en: 'Consistent style across teams' }, proof: { es: 'Setups repetibles para departamentos y empresas regionales.', en: 'Repeatable setups for departments and regional companies.' } },
  ],
  'drone-services-photography-punta-cana': [
    { title: { es: 'Planificacion de vuelo orientada a resultado', en: 'Result-focused flight planning' }, proof: { es: 'Shot list por objetivo comercial antes de despegar.', en: 'Commercial objective shot lists before takeoff.' } },
    { title: { es: 'Contenido aereo utilizable para ventas', en: 'Aerial content usable for sales' }, proof: { es: 'Entregables listos para web, reels y presentaciones.', en: 'Deliverables ready for websites, reels, and presentations.' } },
    { title: { es: 'Cobertura integral foto + video + drone', en: 'Integrated photo + video + drone coverage' }, proof: { es: 'Produccion unificada para campanas de hospitalidad y real estate.', en: 'Unified production for hospitality and real estate campaigns.' } },
  ],
  'event-photography': [
    { title: { es: 'Cobertura por prioridades de marca', en: 'Coverage based on brand priorities' }, proof: { es: 'Run-of-show y shot list alineados con marketing.', en: 'Run-of-show and shot list aligned with marketing.' } },
    { title: { es: 'Selecciones express durante evento', en: 'Express selects during event hours' }, proof: { es: 'Imagenes clave para PR y redes el mismo dia.', en: 'Key images for PR and social on the same day.' } },
    { title: { es: 'Escalabilidad para eventos grandes', en: 'Scalability for large events' }, proof: { es: 'Equipo ampliable para congresos y summits de alto volumen.', en: 'Expandable team for high-volume conferences and summits.' } },
  ],
  'family-photography': [
    { title: { es: 'Direccion amable para ninos y adultos', en: 'Gentle direction for kids and adults' }, proof: { es: 'Flujo relajado que mantiene naturalidad y expresion real.', en: 'Relaxed flow that keeps expressions natural and real.' } },
    { title: { es: 'Locaciones seguras y comodas', en: 'Safe and comfortable locations' }, proof: { es: 'Seleccion de spots con acceso facil y buena luz.', en: 'Location selection with easy access and strong light.' } },
    { title: { es: 'Recuerdos listos para compartir', en: 'Memories ready to share' }, proof: { es: 'Entrega digital optimizada para familia en distintos paises.', en: 'Digital delivery optimized for families across different countries.' } },
  ],
  'commercial-photography': [
    { title: { es: 'Brief creativo orientado a objetivos', en: 'Goal-driven creative brief process' }, proof: { es: 'Cada set responde a metricas de marca y conversion.', en: 'Every setup maps to brand and conversion metrics.' } },
    { title: { es: 'Licencias claras para equipos legales', en: 'Clear licensing for legal teams' }, proof: { es: 'Uso definido por canal, territorio y duracion.', en: 'Usage defined by channel, territory, and duration.' } },
    { title: { es: 'Produccion escalable para campanas', en: 'Scalable campaign production' }, proof: { es: 'Desde ecommerce puntual hasta bibliotecas visuales completas.', en: 'From focused ecommerce sets to full visual libraries.' } },
  ],
}

const SERVICE_PROCESS_STEPS: Record<string, ServiceProcessStep[]> = {
  'wedding-photography': [
    { title: { es: 'Consulta inicial y vision de boda', en: 'Initial consultation and wedding vision' }, description: { es: 'Definimos estilo, cobertura y prioridades del dia.', en: 'We define style, coverage, and day priorities.' } },
    { title: { es: 'Plan de timeline y locaciones', en: 'Timeline and location planning' }, description: { es: 'Alineamos ceremonia, retratos y recepcion con la luz ideal.', en: 'We align ceremony, portraits, and reception with ideal light.' } },
    { title: { es: 'Cobertura del evento', en: 'Wedding day coverage' }, description: { es: 'Equipo enfocado en historia completa y momentos clave.', en: 'Team focused on complete storytelling and key moments.' } },
    { title: { es: 'Edicion y entrega', en: 'Post-production and delivery' }, description: { es: 'Galeria curada en alta resolucion con seleccion final profesional.', en: 'Curated high-resolution gallery with professional final selection.' } },
  ],
  'portrait-photography': [
    { title: { es: 'Brief de imagen', en: 'Image brief' }, description: { es: 'Definimos objetivo profesional y tono visual.', en: 'We define your professional objective and visual tone.' } },
    { title: { es: 'Preparacion de vestuario y set', en: 'Wardrobe and setup prep' }, description: { es: 'Guia de looks y fondo segun canal de uso.', en: 'Guidance on looks and background by usage channel.' } },
    { title: { es: 'Sesion guiada', en: 'Guided session' }, description: { es: 'Direccion de pose y expresion para confianza real.', en: 'Pose and expression direction for authentic confidence.' } },
    { title: { es: 'Seleccion y retoque final', en: 'Selection and final retouch' }, description: { es: 'Entrega optimizada para LinkedIn, web y prensa.', en: 'Delivery optimized for LinkedIn, websites, and press.' } },
  ],
  'drone-services-photography-punta-cana': [
    { title: { es: 'Pre-flight y permisos', en: 'Pre-flight and permits' }, description: { es: 'Evaluacion de zona, riesgos y objetivos del cliente.', en: 'Area, risk, and client objective assessment.' } },
    { title: { es: 'Plan de vuelo y shot list', en: 'Flight plan and shot list' }, description: { es: 'Ruta aerea por prioridades comerciales y condiciones de luz.', en: 'Aerial route by commercial priorities and lighting conditions.' } },
    { title: { es: 'Produccion en locacion', en: 'On-location production' }, description: { es: 'Captura segura con coordinacion de equipo en tierra.', en: 'Safe capture with ground-team coordination.' } },
    { title: { es: 'Entrega editable y final', en: 'Editable and final delivery' }, description: { es: 'Archivos optimizados para marketing, redes y ventas.', en: 'Files optimized for marketing, social, and sales.' } },
  ],
  'event-photography': [
    { title: { es: 'Kickoff con organizacion', en: 'Kickoff with organizers' }, description: { es: 'Alineamos agenda, stakeholders y momentos no negociables.', en: 'We align agenda, stakeholders, and non-negotiable moments.' } },
    { title: { es: 'Cobertura por zonas', en: 'Zone-based coverage' }, description: { es: 'Distribucion de equipo por escenario y flujo de asistentes.', en: 'Team distribution by stage and attendee flow.' } },
    { title: { es: 'Selecciones rapidas', en: 'Rapid selects' }, description: { es: 'Entrega de fotos clave para redes y comunicacion interna.', en: 'Delivery of key photos for social and internal communications.' } },
    { title: { es: 'Galeria final estructurada', en: 'Structured final gallery' }, description: { es: 'Organizacion por bloques para PR, marca y archivo.', en: 'Organization by blocks for PR, brand, and archive.' } },
  ],
  'family-photography': [
    { title: { es: 'Consulta familiar', en: 'Family consultation' }, description: { es: 'Definimos edades, ritmo y expectativas de la sesion.', en: 'We define ages, pace, and session expectations.' } },
    { title: { es: 'Plan de locacion y horario', en: 'Location and timing plan' }, description: { es: 'Seleccion de spot comodo segun luz y energia de ninos.', en: 'Comfortable spot selection based on light and kids energy.' } },
    { title: { es: 'Sesion natural y dinamica', en: 'Natural dynamic session' }, description: { es: 'Direccion ligera para capturar momentos reales.', en: 'Light direction to capture real moments.' } },
    { title: { es: 'Entrega de recuerdos', en: 'Memory delivery' }, description: { es: 'Galeria final lista para compartir y conservar.', en: 'Final gallery ready to share and preserve.' } },
  ],
  'commercial-photography': [
    { title: { es: 'Discovery y brief', en: 'Discovery and brief' }, description: { es: 'Aterrizamos objetivos de negocio, audiencia y canales.', en: 'We align business goals, audiences, and channels.' } },
    { title: { es: 'Preproduccion', en: 'Pre-production' }, description: { es: 'Shot list, calendario, casting y aprobaciones previas.', en: 'Shot list, schedule, casting, and pre-approvals.' } },
    { title: { es: 'Rodaje multiformato', en: 'Multi-format production' }, description: { es: 'Produccion foto y complementos segun campana.', en: 'Photo production and add-ons based on campaign goals.' } },
    { title: { es: 'Post y deployment', en: 'Post-production and deployment' }, description: { es: 'Entregables por plataforma con licenciamiento definido.', en: 'Platform-ready deliverables with defined licensing.' } },
  ],
}

const SERVICE_OFFER_CATALOG: Record<string, ServicePackageOffer[]> = {
  'wedding-photography': [
    { name: { es: 'Cobertura media jornada', en: 'Half-day coverage' }, description: { es: 'Ceremonia y retratos principales.', en: 'Ceremony and core portrait coverage.' } },
    { name: { es: 'Cobertura jornada completa', en: 'Full-day coverage' }, description: { es: 'Desde preparativos hasta fiesta.', en: 'From getting ready through celebration.' } },
    { name: { es: 'Paquete multi-dia', en: 'Multi-day package' }, description: { es: 'Welcome dinner, boda y brunch.', en: 'Welcome dinner, wedding day, and brunch.' } },
  ],
  'portrait-photography': [
    { name: { es: 'Headshots ejecutivos', en: 'Executive headshots' }, description: { es: 'Sesiones individuales y de liderazgo.', en: 'Individual and leadership sessions.' } },
    { name: { es: 'Branding personal', en: 'Personal branding' }, description: { es: 'Contenido para perfiles y web personal.', en: 'Content for profiles and personal websites.' } },
    { name: { es: 'Sesiones de equipo', en: 'Team sessions' }, description: { es: 'Produccion para departamentos completos.', en: 'Production for full departments.' } },
  ],
  'drone-services-photography-punta-cana': [
    { name: { es: 'Aereo para hospitalidad', en: 'Aerial for hospitality' }, description: { es: 'Resorts, hoteles y experiencias.', en: 'Resorts, hotels, and guest experiences.' } },
    { name: { es: 'Aereo inmobiliario', en: 'Aerial real estate' }, description: { es: 'Propiedades, desarrollos y lotes.', en: 'Properties, developments, and land plots.' } },
    { name: { es: 'Aereo para eventos', en: 'Aerial event coverage' }, description: { es: 'Complemento para bodas y corporativo.', en: 'Add-on for weddings and corporate events.' } },
  ],
  'event-photography': [
    { name: { es: 'Cobertura corporativa', en: 'Corporate event coverage' }, description: { es: 'Conferencias, summits y lanzamientos.', en: 'Conferences, summits, and launches.' } },
    { name: { es: 'Cobertura social premium', en: 'Premium social coverage' }, description: { es: 'Galas, celebraciones y eventos privados.', en: 'Galas, celebrations, and private events.' } },
    { name: { es: 'Entrega express para PR', en: 'Express PR selects' }, description: { es: 'Fotos clave durante el evento.', en: 'Key images delivered during the event.' } },
  ],
  'family-photography': [
    { name: { es: 'Sesion familiar en playa', en: 'Beach family session' }, description: { es: 'Retratos de vacaciones y celebraciones.', en: 'Vacation portraits and celebrations.' } },
    { name: { es: 'Sesion maternidad', en: 'Maternity session' }, description: { es: 'Direccion suave y emocional.', en: 'Soft, emotional direction.' } },
    { name: { es: 'Sesion multigeneracional', en: 'Multi-generation session' }, description: { es: 'Cobertura para familias extendidas.', en: 'Coverage for extended families.' } },
  ],
  'commercial-photography': [
    { name: { es: 'Produccion de producto', en: 'Product production' }, description: { es: 'Catalogo ecommerce y anuncios.', en: 'Ecommerce catalogs and ads.' } },
    { name: { es: 'Hospitalidad y arquitectura', en: 'Hospitality and architecture' }, description: { es: 'Visuales para hoteles y bienes raices.', en: 'Visuals for hotels and real estate.' } },
    { name: { es: 'Campana de marca', en: 'Brand campaign production' }, description: { es: 'Producciones para lanzamientos y paid media.', en: 'Campaign production for launches and paid media.' } },
  ],
}

const SERVICE_LONG_FORM_CONTENT: Record<string, ServiceLongFormContent> = {
  'wedding-photography': {
    intro: {
      es: 'La fotografia de bodas destino en Republica Dominicana exige algo mas que una camara. Exige experiencia real en resorts, control de timeline, lectura de luz tropical y capacidad de respuesta ante cambios de clima. Esta pagina resume nuestro enfoque para parejas que buscan una cobertura elegante, natural y orientada a recuerdos que realmente importan con base en Punta Cana, Cap Cana, La Romana y Santo Domingo.',
      en: 'Destination wedding photography in the Dominican Republic requires more than a camera. It requires real resort experience, timeline control, tropical light awareness, and strong response to weather changes. This page outlines our approach for couples who want elegant, natural coverage focused on moments that truly matter across Punta Cana, Cap Cana, La Romana, and Santo Domingo.',
    },
    sections: [
      {
        title: {
          es: 'Cobertura completa para bodas destino en Punta Cana y Cap Cana',
          en: 'Complete destination coverage in Punta Cana and Cap Cana',
        },
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
        title: {
          es: 'Paquetes y niveles de cobertura segun el tipo de boda',
          en: 'Coverage packages by wedding type',
        },
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
        title: {
          es: 'Inversion y factores que impactan el presupuesto',
          en: 'Investment and factors that affect pricing',
        },
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
        title: {
          es: 'Plan B en temporada de lluvia: confianza operativa',
          en: 'Rain-season backup planning: operational trust',
        },
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
      title: {
        es: 'Ejemplo de timeline de boda (cobertura completa)',
        en: 'Sample wedding timeline (full-day coverage)',
      },
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
  'drone-services-photography-punta-cana': {
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
  'commercial-photography': {
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
  'portrait-photography': {
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
  'event-photography': {
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
  'family-photography': {
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
}

const SERVICE_SCHEMA_ADDITIONAL_TYPE: Record<string, string> = {
  'wedding-photography': 'https://schema.org/WeddingService',
  'portrait-photography': 'https://schema.org/ProfessionalService',
  'drone-services-photography-punta-cana': 'https://schema.org/ProfessionalService',
  'event-photography': 'https://schema.org/Event',
  'family-photography': 'https://schema.org/Service',
  'commercial-photography': 'https://schema.org/ProfessionalService',
}

const SERVICE_SCHEMA_KNOWS_ABOUT: Record<string, { es: string[]; en: string[] }> = {
  'wedding-photography': {
    es: ['fotografia de bodas destino', 'wedding timeline', 'ceremonias en playa', 'cobertura de recepcion'],
    en: ['destination wedding photography', 'wedding timeline planning', 'beach ceremonies', 'reception coverage'],
  },
  'drone-services-photography-punta-cana': {
    es: ['fotografia aerea', 'video aereo', 'contenido para hoteleria', 'produccion para real estate'],
    en: ['aerial photography', 'aerial video', 'hospitality marketing content', 'real estate media production'],
  },
  'commercial-photography': {
    es: ['fotografia comercial', 'produccion de campanas', 'contenido ecommerce', 'licenciamiento de imagen'],
    en: ['commercial photography', 'campaign production', 'ecommerce content', 'image licensing'],
  },
  'portrait-photography': {
    es: ['headshots ejecutivos', 'retrato corporativo', 'personal branding', 'fotografia para LinkedIn'],
    en: ['executive headshots', 'corporate portraits', 'personal branding', 'LinkedIn photography'],
  },
  'event-photography': {
    es: ['fotografia de eventos corporativos', 'cobertura de conferencias', 'entrega express para prensa', 'fotografia de activaciones de marca'],
    en: ['corporate event photography', 'conference coverage', 'express PR delivery', 'brand activation photography'],
  },
  'family-photography': {
    es: ['sesion familiar', 'retratos de maternidad', 'fotografia en playa', 'sesion multigeneracional'],
    en: ['family sessions', 'maternity portraits', 'beach photography', 'multigenerational session'],
  },
}

function uniqueLocationsOrdered(primary: string[]) {
  const ordered = [...primary, ...DOMINICAN_KEY_LOCATIONS.map((p) => p.en)]
  return [...new Set(ordered)]
}

function localizeLocationName(locale: string, nameEn: string) {
  const place = DOMINICAN_KEY_LOCATIONS.find((item) => item.en === nameEn)
  if (!place) return nameEn
  return locale === 'es' ? place.es : place.en
}

function buildServiceMetadata(locale: string, serviceSlug: string, serviceTitle: string, serviceDescription: string): Metadata {
  const isEs = locale === 'es'
  const url = `${BASE_URL}/${locale}/services/${serviceSlug}`
  const seoConfig = SERVICE_SEO_CONFIG[serviceSlug]
  const focusLocations = uniqueLocationsOrdered(seoConfig?.focusLocations || ['Santo Domingo', 'Punta Cana'])
  const focusLocalized = focusLocations.slice(0, 3).map((loc) => localizeLocationName(locale, loc))

  const title = isEs
    ? `${serviceTitle} en ${focusLocalized[0]} y ${focusLocalized[1]} | Fotografo Santo Domingo`
    : `${serviceTitle} in ${focusLocalized[0]} and ${focusLocalized[1]} | Photographer Santo Domingo`

  const description = isEs
    ? `${serviceDescription} Cobertura principal en ${focusLocalized.join(', ')} y en los destinos clave de Republica Dominicana.`
    : `${serviceDescription} Primary coverage in ${focusLocalized.join(', ')} and across key Dominican Republic destinations.`

  const keywords = isEs ? seoConfig?.keywords.es : seoConfig?.keywords.en

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        es: `${BASE_URL}/es/services/${serviceSlug}`,
        en: `${BASE_URL}/en/services/${serviceSlug}`,
        'x-default': `${BASE_URL}/es/services/${serviceSlug}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title: serviceTitle,
      description,
      url,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{
        url: `${BASE_URL}/api/og?title=${encodeURIComponent(serviceTitle).replace(/%20/g, '+')}&subtitle=${encodeURIComponent(focusLocalized.slice(0, 2).join(' · ')).replace(/%20/g, '+')}`,
        width: 1200,
        height: 630,
        alt: serviceTitle,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@babulashots',
      creator: '@babulashots',
      title: serviceTitle,
      description,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(serviceTitle).replace(/%20/g, '+')}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

export async function generateStaticParams() {
  const locales = ['es', 'en']
  return locales.flatMap((locale) => serviceLandingSlugs.map((service) => ({ locale, service })))
}

export async function generateMetadata({ params: { locale, service } }: Props): Promise<Metadata> {
  const serviceData = getServiceBySlug(locale, service)
  if (!serviceData) return {}
  return buildServiceMetadata(locale, service, serviceData.title, serviceData.description)
}

export default function ServiceLandingPage({ params: { locale, service } }: Props) {
  const serviceData = getServiceBySlug(locale, service)
  if (!serviceData) notFound()
  const isEs = locale === 'es'
  const seoConfig = SERVICE_SEO_CONFIG[service]
  const faqItems = SERVICE_FAQ_CONFIG[service] || []
  const contextualLinks = SERVICE_INTERNAL_LINKS[service] || []
  const trustConfig = SERVICE_TRUST_CONFIG[service]
  const conversionConfig = SERVICE_CONVERSION_CONFIG[service]
  const locationRecords = SERVICE_LOCATION_DATABASE[service] || []
  const seasonalityConfig = SERVICE_SEASONALITY_CONFIG[service]
  const differentiators = SERVICE_DIFFERENTIATORS[service] || []
  const processSteps = SERVICE_PROCESS_STEPS[service] || []
  const offerCatalog = SERVICE_OFFER_CATALOG[service] || []
  const longFormContent = SERVICE_LONG_FORM_CONTENT[service]
  const schemaAdditionalType = SERVICE_SCHEMA_ADDITIONAL_TYPE[service]
  const schemaKnowsAbout = SERVICE_SCHEMA_KNOWS_ABOUT[service]
  const prioritizedLocations = uniqueLocationsOrdered(seoConfig?.focusLocations || ['Santo Domingo', 'Punta Cana'])
  const prioritizedLocalized = prioritizedLocations.map((loc) => localizeLocationName(locale, loc))
  const serviceUrl = `${BASE_URL}/${locale}/services/${service}`
  const localServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalService',
    '@id': `${serviceUrl}#local-service`,
    name: serviceData.title,
    description: serviceData.description,
    serviceType: isEs ? (seoConfig?.serviceType.es || serviceData.title) : (seoConfig?.serviceType.en || serviceData.title),
    additionalType: schemaAdditionalType,
    knowsAbout: schemaKnowsAbout ? (isEs ? schemaKnowsAbout.es : schemaKnowsAbout.en) : undefined,
    url: serviceUrl,
    provider: { '@id': `${BASE_URL}/#business` },
    areaServed: prioritizedLocations.map((locationEn) => ({
      '@type': 'City',
      name: localizeLocationName(locale, locationEn),
      addressCountry: 'DO',
    })),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'USD',
        minPrice: serviceData.pricing.starting.replace(/[^0-9.]/g, ''),
      },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: isEs ? `Paquetes de ${serviceData.title}` : `${serviceData.title} Packages`,
      itemListElement: offerCatalog.map((pkg) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: isEs ? pkg.name.es : pkg.name.en,
          description: isEs ? pkg.description.es : pkg.description.en,
        },
      })),
    },
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${serviceUrl}#faq`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: isEs ? item.question.es : item.question.en,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isEs ? item.answer.es : item.answer.en,
      },
    })),
  }

  const relatedServices = serviceLandingSlugs.filter((slug) => slug !== service).slice(0, 3)
  const breadcrumbSchema = schemaGenerators.breadcrumb([
    { name: locale === 'es' ? 'Inicio' : 'Home', url: `${BASE_URL}/${locale}` },
    { name: locale === 'es' ? 'Servicios' : 'Services', url: `${BASE_URL}/${locale}/services` },
    { name: serviceData.title, url: `${BASE_URL}/${locale}/services/${service}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(localServiceSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(faqSchema)} />
      <main className="min-h-screen bg-gray-950 text-white">
        <section className="relative py-20">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-500/10 to-transparent" />
          <div className="relative container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <p className="text-sky-300 font-semibold tracking-wide uppercase text-sm">
                {locale === 'es' ? 'Servicio Especializado' : 'Specialized Service'}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold">{serviceData.title}</h1>
              <p className="text-lg md:text-xl text-gray-300">{serviceData.description}</p>
              <p className="text-sm text-gray-400">
                {isEs
                  ? `Cobertura principal en ${prioritizedLocalized.slice(0, 5).join(', ')} y operacion en los destinos clave de Republica Dominicana.`
                  : `Primary coverage in ${prioritizedLocalized.slice(0, 5).join(', ')} with operations across key Dominican Republic destinations.`}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/${locale}${conversionConfig.primaryCta.href}`} className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  {isEs ? conversionConfig.primaryCta.label.es : conversionConfig.primaryCta.label.en}
                </Link>
                <Link href={`/${locale}${conversionConfig.secondaryCta.href}`} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center">
                  {isEs ? conversionConfig.secondaryCta.label.es : conversionConfig.secondaryCta.label.en}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 border-y border-white/10 bg-gray-900/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {isEs ? 'Confianza, Experiencia y Resultados Comprobables' : 'Trust, Experience, and Proven Results'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <article className="rounded-xl border border-white/10 bg-gray-900 p-6 lg:col-span-2">
                <p className="text-sm uppercase tracking-wide text-sky-300 font-semibold mb-3">
                  {isEs ? 'Expert Bio' : 'Expert Bio'}
                </p>
                <p className="text-gray-200 leading-7">{isEs ? trustConfig.expertBio.es : trustConfig.expertBio.en}</p>
                <ul className="mt-5 space-y-2 text-sm text-gray-300">
                  {(isEs ? trustConfig.authoritySignals.es : trustConfig.authoritySignals.en).map((signal) => (
                    <li key={signal} className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="rounded-xl border border-white/10 bg-gray-900 p-6">
                <p className="text-sm uppercase tracking-wide text-sky-300 font-semibold mb-3">
                  {isEs ? 'Mini Caso de Estudio' : 'Mini Case Study'}
                </p>
                <h3 className="font-semibold text-white">{isEs ? trustConfig.caseStudy.title.es : trustConfig.caseStudy.title.en}</h3>
                <p className="text-gray-300 mt-3 text-sm"><strong>{isEs ? 'Reto:' : 'Challenge:'}</strong> {isEs ? trustConfig.caseStudy.challenge.es : trustConfig.caseStudy.challenge.en}</p>
                <p className="text-gray-300 mt-2 text-sm"><strong>{isEs ? 'Solucion:' : 'Solution:'}</strong> {isEs ? trustConfig.caseStudy.solution.es : trustConfig.caseStudy.solution.en}</p>
                <p className="text-gray-300 mt-2 text-sm"><strong>{isEs ? 'Resultado:' : 'Result:'}</strong> {isEs ? trustConfig.caseStudy.result.es : trustConfig.caseStudy.result.en}</p>
              </article>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {trustConfig.testimonials.map((testimonial) => (
                <article key={isEs ? testimonial.quote.es : testimonial.quote.en} className="rounded-xl border border-white/10 bg-gray-900 p-5">
                  <p className="text-gray-100 leading-7">&quot;{isEs ? testimonial.quote.es : testimonial.quote.en}&quot;</p>
                  <p className="text-xs uppercase tracking-wide text-sky-300 mt-4">{isEs ? testimonial.role.es : testimonial.role.en}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-900/60 border-y border-white/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {locale === 'es' ? 'Que Incluye Este Servicio' : 'What This Service Includes'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceData.features.map((feature) => (
                <div key={feature} className="rounded-xl border border-white/10 bg-gray-900 p-4 text-gray-200 flex items-start gap-3">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 border-b border-white/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {isEs ? `Como Funciona Nuestro Proceso de ${serviceData.title}` : `How Our ${serviceData.title} Process Works`}
            </h2>
            <ol className="space-y-4">
              {processSteps.map((step, index) => (
                <li key={isEs ? step.title.es : step.title.en} className="rounded-xl border border-white/10 bg-gray-900 p-5">
                  <p className="text-sm uppercase tracking-wide text-sky-300">{isEs ? 'Paso' : 'Step'} {index + 1}</p>
                  <h3 className="text-lg font-semibold mt-1">{isEs ? step.title.es : step.title.en}</h3>
                  <p className="text-gray-300 mt-2">{isEs ? step.description.es : step.description.en}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {longFormContent && (
          <section className="py-16 border-b border-white/10 bg-gray-900/30">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-3xl font-bold mb-6 text-center">
                {isEs
                  ? `Guia Completa de ${serviceData.title} en Republica Dominicana`
                  : `Complete ${serviceData.title} Guide in the Dominican Republic`}
              </h2>
              <p className="text-gray-300 leading-8 text-lg max-w-4xl mx-auto text-center">
                {isEs ? longFormContent.intro.es : longFormContent.intro.en}
              </p>

              <div className="mt-10 space-y-8">
                {longFormContent.sections.map((section) => (
                  <article key={isEs ? section.title.es : section.title.en} className="rounded-2xl border border-white/10 bg-gray-900 p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-white">{isEs ? section.title.es : section.title.en}</h3>
                    <div className="space-y-4 mt-4">
                      {(isEs ? section.paragraphs.es : section.paragraphs.en).map((paragraph) => (
                        <p key={paragraph} className="text-gray-300 leading-8">{paragraph}</p>
                      ))}
                    </div>
                    {section.bullets && (
                      <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(isEs ? section.bullets.es : section.bullets.en).map((bullet) => (
                          <li key={bullet} className="rounded-lg border border-white/10 bg-gray-950 px-4 py-3 text-sm text-gray-200 flex gap-2 items-start">
                            <span className="text-sky-300 mt-0.5">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>

              <div className="mt-10 rounded-2xl border border-white/10 bg-gray-900 p-6 md:p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  {isEs ? longFormContent.timeline.title.es : longFormContent.timeline.title.en}
                </h3>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-950">
                      <tr>
                        <th className="text-left px-4 py-3 text-sky-300">{isEs ? 'Fase' : 'Phase'}</th>
                        <th className="text-left px-4 py-3 text-sky-300">{isEs ? 'Momento' : 'Timing'}</th>
                        <th className="text-left px-4 py-3 text-sky-300">{isEs ? 'Notas' : 'Notes'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {longFormContent.timeline.rows.map((row) => (
                        <tr key={isEs ? row.phase.es : row.phase.en} className="border-t border-white/10 bg-gray-900/40">
                          <td className="px-4 py-3 font-semibold text-white">{isEs ? row.phase.es : row.phase.en}</td>
                          <td className="px-4 py-3 text-gray-300">{isEs ? row.timing.es : row.timing.en}</td>
                          <td className="px-4 py-3 text-gray-300">{isEs ? row.notes.es : row.notes.en}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={`/${locale}${conversionConfig.primaryCta.href}`} className="rounded-xl border border-white/10 bg-gray-900 p-5 hover:border-sky-400/60 transition-colors">
                  <p className="font-semibold text-white">{isEs ? conversionConfig.primaryCta.label.es : conversionConfig.primaryCta.label.en}</p>
                  <p className="text-sm text-gray-400 mt-2">{isEs ? 'Explora ejemplos y enfoque real de este servicio.' : 'Explore real examples and this service approach.'}</p>
                </Link>
                <Link href={`/${locale}/about`} className="rounded-xl border border-white/10 bg-gray-900 p-5 hover:border-sky-400/60 transition-colors">
                  <p className="font-semibold text-white">{isEs ? 'Conoce Nuestra Experiencia' : 'Learn About Our Experience'}</p>
                  <p className="text-sm text-gray-400 mt-2">{isEs ? 'Revisa expertise local, metodologia y estandar de calidad.' : 'Review local expertise, methodology, and quality standards.'}</p>
                </Link>
                <Link href={`/${locale}/contact`} className="rounded-xl border border-white/10 bg-gray-900 p-5 hover:border-sky-400/60 transition-colors">
                  <p className="font-semibold text-white">{isEs ? 'Solicitar Propuesta' : 'Request a Proposal'}</p>
                  <p className="text-sm text-gray-400 mt-2">{isEs ? 'Recibe una propuesta clara por alcance y fecha.' : 'Get a clear proposal based on scope and date.'}</p>
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-6 text-center">
              {isEs ? 'Zonas Clave de Cobertura en Republica Dominicana' : 'Key Coverage Areas in the Dominican Republic'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {prioritizedLocalized.map((placeName) => (
                <div key={placeName} className="rounded-lg border border-white/10 bg-gray-900 px-4 py-3 text-center text-gray-200">
                  {placeName}
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-6 text-center">
              {isEs
                ? 'Tambien coordinamos sesiones en otras ciudades y destinos turisticos segun disponibilidad y tipo de proyecto.'
                : 'We also coordinate sessions in additional cities and tourist destinations depending on project type and availability.'}
            </p>
          </div>
        </section>

        <section className="py-16 bg-gray-900/40 border-y border-white/10">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold mb-6 text-center">
              {isEs ? `Base de Locaciones para ${serviceData.title} en RD` : `${serviceData.title} Location Database in the DR`}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-sky-300">{isEs ? 'Locacion' : 'Venue'}</th>
                    <th className="px-4 py-3 text-sky-300">{isEs ? 'Zona' : 'Area'}</th>
                    <th className="px-4 py-3 text-sky-300">{isEs ? 'Estilo' : 'Style'}</th>
                    <th className="px-4 py-3 text-sky-300">{isEs ? 'Mejor Luz' : 'Best Light'}</th>
                    <th className="px-4 py-3 text-sky-300">{isEs ? 'Detalle' : 'Details'}</th>
                  </tr>
                </thead>
                <tbody>
                  {locationRecords.map((item) => (
                    <tr key={`${item.venue}-${item.area}`} className="border-t border-white/10 bg-gray-950/40">
                      <td className="px-4 py-3 font-semibold text-white">
                        <Link href={`/${locale}${item.href}`} className="hover:text-sky-300 transition-colors">{item.venue}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{item.area}</td>
                      <td className="px-4 py-3 text-gray-300">{isEs ? item.style.es : item.style.en}</td>
                      <td className="px-4 py-3 text-gray-300">{isEs ? item.bestLight.es : item.bestLight.en}</td>
                      <td className="px-4 py-3 text-gray-300">{isEs ? item.detail.es : item.detail.en}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-16 border-b border-white/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-6 text-center">
              {isEs ? 'Guia de Temporada y Clima en Republica Dominicana' : 'Dominican Seasonality and Weather Guide'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <article className="rounded-xl border border-white/10 bg-gray-900 p-5">
                <h3 className="font-semibold text-sky-300 mb-2">{isEs ? 'Meses Recomendados' : 'Best Months'}</h3>
                <p className="text-gray-300 text-sm leading-6">{isEs ? seasonalityConfig.bestMonths.es : seasonalityConfig.bestMonths.en}</p>
              </article>
              <article className="rounded-xl border border-white/10 bg-gray-900 p-5">
                <h3 className="font-semibold text-sky-300 mb-2">{isEs ? 'Meses con Precaucion' : 'Caution Months'}</h3>
                <p className="text-gray-300 text-sm leading-6">{isEs ? seasonalityConfig.cautionMonths.es : seasonalityConfig.cautionMonths.en}</p>
              </article>
              <article className="rounded-xl border border-white/10 bg-gray-900 p-5">
                <h3 className="font-semibold text-sky-300 mb-2">{isEs ? 'Plan de Luz' : 'Daylight Planning'}</h3>
                <p className="text-gray-300 text-sm leading-6">{isEs ? seasonalityConfig.daylightNote.es : seasonalityConfig.daylightNote.en}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-white/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="rounded-2xl border border-white/10 bg-gray-900 p-8">
              <p className="text-sm uppercase tracking-wide text-sky-300 font-semibold mb-2">
                {locale === 'es' ? 'Inversion' : 'Investment'}
              </p>
              <p className="text-3xl font-bold text-white">{serviceData.pricing.starting}</p>
              <p className="text-gray-400 mt-2">{serviceData.pricing.includes}</p>
            </div>

            <div id="service-faq" className="mt-12">
              <h2 className="text-2xl font-bold mb-6">
                {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <article key={isEs ? item.question.es : item.question.en} className="rounded-xl border border-white/10 bg-gray-900 p-5">
                    <h3 className="text-lg font-semibold text-white">
                      {isEs ? item.question.es : item.question.en}
                    </h3>
                    <p className="text-gray-300 mt-2 leading-7">
                      {isEs ? item.answer.es : item.answer.en}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">
                {isEs ? `Por Que Elegirnos para ${serviceData.title} en RD` : `Why Choose Us for ${serviceData.title} in the DR`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {differentiators.map((item) => (
                  <article key={isEs ? item.title.es : item.title.en} className="rounded-xl border border-white/10 bg-gray-900 p-5">
                    <h3 className="font-semibold text-white">{isEs ? item.title.es : item.title.en}</h3>
                    <p className="text-sm text-gray-300 mt-2">{isEs ? item.proof.es : item.proof.en}</p>
                  </article>
                ))}
              </div>

              <h2 className="text-2xl font-bold mb-4">
                {locale === 'es' ? 'Servicios Relacionados' : 'Related Services'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedServices.map((relatedSlug) => (
                  <Link
                    key={relatedSlug}
                    href={`/${locale}/services/${relatedSlug}`}
                    className="rounded-xl border border-white/10 bg-gray-900 p-5 hover:border-sky-400/60 transition-colors"
                  >
                    <p className="font-semibold text-white">{getServiceBySlug(locale, relatedSlug)?.title}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {locale === 'es' ? 'Ver detalles del servicio' : 'View service details'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-12 rounded-2xl border border-sky-400/30 bg-sky-500/10 p-8">
              <p className="text-xs uppercase tracking-wide text-sky-300 font-semibold mb-2">
                {isEs ? 'Recurso Gratuito' : 'Free Resource'}
              </p>
              <h2 className="text-2xl font-bold text-white">
                {isEs ? conversionConfig.leadMagnet.title.es : conversionConfig.leadMagnet.title.en}
              </h2>
              <p className="text-gray-300 mt-2 mb-6">
                {isEs ? conversionConfig.leadMagnet.value.es : conversionConfig.leadMagnet.value.en}
              </p>
              <div className="max-w-xl">
                <NewsletterForm locale={locale} />
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link href={`/${locale}${conversionConfig.primaryCta.href}`} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center">
                {isEs ? conversionConfig.primaryCta.label.es : conversionConfig.primaryCta.label.en}
              </Link>
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(
                  locale === 'es'
                    ? `Hola, quiero una cotizacion para ${serviceData.title}.`
                    : `Hello, I need a quote for ${serviceData.title}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                WhatsApp
              </a>
              <Link href={`/${locale}/services`} className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors text-center">
                {locale === 'es' ? 'Volver a Servicios' : 'Back to Services'}
              </Link>
            </div>

            {contextualLinks.length > 0 && (
              <div className="mt-12 border-t border-white/10 pt-10">
                <h2 className="text-2xl font-bold mb-4">
                  {isEs ? 'Planifica Tu Servicio con Recursos Relacionados' : 'Plan Your Service with Related Resources'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contextualLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={`/${locale}${item.href}`}
                      className="rounded-xl border border-white/10 bg-gray-900 p-5 hover:border-sky-400/60 transition-colors"
                    >
                      <p className="font-semibold text-white">{isEs ? item.label.es : item.label.en}</p>
                      <p className="text-sm text-gray-400 mt-2">{isEs ? item.description.es : item.description.en}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
