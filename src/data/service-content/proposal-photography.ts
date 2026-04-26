/**
 * Rich SEO content for the proposal-photography family page.
 *
 * Recovered from the pre-A6 architecture (commit 94fdc10^).
 * Original legacy slug: 'proposal-photography'.
 * Mapped to canonical family slug: 'proposal-photography'.
 */

import type { ServiceContent } from './types'

export const proposalPhotographyContent: ServiceContent = {
  schemaAdditionalType: 'https://schema.org/Service',
  knowsAbout: {
      es: ['fotografia de propuesta sorpresa', 'modo ninja con teleobjetivo', 'propuesta en restaurante Santo Domingo', 'fotografia oculta de pedida de mano'],
      en: ['surprise proposal photography', 'ninja mode telephoto technique', 'restaurant proposal Santo Domingo', 'hidden engagement photography'],
    },
  differentiators: [
      { title: { es: 'Teleobjetivo 400-600 mm -- invisibilidad total', en: '400-600 mm telephoto -- complete invisibility' }, proof: { es: 'Disparamos desde 50-80 metros sin que ella lo vea en ningun momento.', en: 'We shoot from 50-80 meters without her seeing us at any point.' } },
      { title: { es: 'Coordinacion secreta con restaurantes y venues', en: 'Secret coordination with restaurants and venues' }, proof: { es: 'El personal sabe el plan. Ella nunca lo descubre.', en: 'The staff knows the plan. She never finds out.' } },
      { title: { es: 'La doble sorpresa -- galeria en la manana', en: 'The double surprise -- gallery the next morning' }, proof: { es: 'La mayoria de parejas dice que la segunda sorpresa impacta tanto como la propuesta.', en: 'Most couples say the second surprise hits as hard as the proposal itself.' } },
    ],
  processSteps: [
      { title: { es: 'Coordinacion secreta por WhatsApp', en: 'Secret WhatsApp coordination' }, description: { es: 'Definimos fecha, locacion, plan de posicionamiento y senales del dia.', en: 'We define date, location, positioning plan, and day-of signals.' } },
      { title: { es: 'Llegamos antes que ustedes', en: 'We arrive before you' }, description: { es: '45 minutos de antelacion para reconocer la locacion y posicionarnos sin ser vistos.', en: '45 minutes early to scout the spot and position ourselves without being seen.' } },
      { title: { es: 'Captura completa en modo ninja', en: 'Full ninja-mode capture' }, description: { es: 'Teleobjetivo largo, cobertura silenciosa desde el si hasta los abrazos.', en: 'Long telephoto, silent coverage from the yes through the hugs and kisses.' } },
      { title: { es: 'Galeria privada esa misma noche', en: 'Private gallery that same night' }, description: { es: 'La segunda sorpresa: ella despierta con el album del momento que pensaba que era privado.', en: 'The second surprise: she wakes up with the album of the moment she thought was private.' } },
    ],
  locations: [
      { venue: 'Meson de la Cava', area: 'Santo Domingo', style: { es: 'Cueva subterranea elegante', en: 'Elegant underground cave' }, bestLight: { es: 'Iluminacion ambiente tenue', en: 'Dim ambient lighting' }, detail: { es: 'Atmosfera unica en RD. Ideal para propuesta intima en restaurante.', en: 'Unique atmosphere in DR. Ideal for intimate restaurant proposal.' }, href: '/proposal' },
      { venue: 'La Briciola (Zona Colonial)', area: 'Santo Domingo', style: { es: 'Colonial italiano con velas', en: 'Candlelit colonial Italian' }, bestLight: { es: 'Cena con luz calida', en: 'Candlelit dinner light' }, detail: { es: 'Patio colonial historico. Perfecto para propuesta sorpresa.', en: 'Historic colonial courtyard. Perfect for surprise proposal.' }, href: '/proposal' },
      { venue: 'Valetudo / Prime Rooftop', area: 'Santo Domingo', style: { es: 'Azotea urbana nocturna', en: 'Urban rooftop at night' }, bestLight: { es: 'Luces de ciudad al atardecer', en: 'City lights at sunset' }, detail: { es: 'Vistas panoramicas de Santo Domingo. Look premium para propuesta.', en: 'Panoramic Santo Domingo views. Premium proposal look.' }, href: '/proposal' },
      { venue: 'La Yola at Marina Cap Cana', area: 'Cap Cana', style: { es: 'Marina con yates de fondo', en: 'Marina with yachts behind' }, bestLight: { es: 'Atardecer sobre el muelle', en: 'Sunset over the dock' }, detail: { es: 'El restaurante mejor posicionado para fotografia oculta en Cap Cana.', en: 'Best-positioned restaurant for hidden photography in Cap Cana.' }, href: '/proposal' },
      { venue: 'Jellyfish Beach Restaurant', area: 'Punta Cana', style: { es: 'Playa-restaurante al atardecer', en: 'Beach restaurant at sunset' }, bestLight: { es: 'Golden hour en la arena', en: 'Golden hour on the sand' }, detail: { es: 'Ambiente relajado con el mar de fondo. Para propuesta en la arena.', en: 'Relaxed vibe with the sea behind. For beach-side proposal.' }, href: '/proposal' },
      { venue: 'La Piazzetta, Casa de Campo', area: 'La Romana', style: { es: 'Villa italiana de lujo', en: 'Luxury Italian villa' }, bestLight: { es: 'Tarde con luz de jardin', en: 'Afternoon garden light' }, detail: { es: 'Dentro de la estate mas exclusiva del Caribe. Propuesta ultra privada.', en: 'Inside one of the most exclusive estates in the Caribbean.' }, href: '/proposal' },
      { venue: 'Playa Nueva Romana Villas', area: 'La Romana', style: { es: 'Villa privada frente al mar', en: 'Private beachfront villa' }, bestLight: { es: 'Sunrise o sunset en playa exclusiva', en: 'Sunrise or sunset on exclusive beach' }, detail: { es: 'Sin otros huespedes. Control total del escenario. Look cinematografico.', en: 'No other guests. Full scene control. Cinematic look.' }, href: '/proposal' },
      { venue: 'Kukua / Playa Blanca', area: 'Punta Cana', style: { es: 'Playa-bar intimo y privado', en: 'Intimate private beach bar' }, bestLight: { es: 'Tarde tarde y puesta del sol', en: 'Late afternoon and sunset' }, detail: { es: 'Privacidad natural para propuesta en playa sin interferencias.', en: 'Natural privacy for beach proposal without interruptions.' }, href: '/proposal' },
    ],
  seasonality: {
      bestMonths: { es: 'Temporada recomendada: noviembre a abril por clima mas estable y mejor luz en playa.', en: 'Best season: November to April for more stable weather and stronger beach light.' },
      cautionMonths: { es: 'De mayo a octubre recomendamos restaurantes o venues cubiertos como plan principal.', en: 'From May to October we recommend restaurants or covered venues as the primary plan.' },
      daylightNote: { es: 'Golden hour promedio: 5:30-6:45 PM. Para restaurantes la propuesta funciona bien de 7 a 9 PM.', en: 'Average golden hour: 5:30-6:45 PM. For restaurants, proposals work well during 7-9 PM dinner hour.' },
    },
  trust: {
      expertBio: {
        es: 'Especialistas en fotografia de propuesta sorpresa en modo oculto en Republica Dominicana. Usamos lentes de teleobjetivo 400-600 mm y tecnica de posicionamiento ninja para restaurantes, playas, marinas y villas privadas en toda la isla.',
        en: 'Specialists in hidden-mode surprise proposal photography across Dominican Republic. We use 400-600 mm telephoto lenses and ninja positioning for restaurants, beaches, marinas, and private villas island-wide.',
      },
      authoritySignals: {
        es: ['Coordinacion secreta con restaurantes: Meson de la Cava, La Briciola, La Yola', 'Cobertura en toda la isla: SDQ, Punta Cana, Cap Cana, Casa de Campo, Playa Nueva Romana', 'Sistema de senales WhatsApp el dia de la propuesta'],
        en: ['Secret restaurant coordination: Meson de la Cava, La Briciola, La Yola', 'Island-wide coverage: SDQ, Punta Cana, Cap Cana, Casa de Campo, Playa Nueva Romana', 'WhatsApp signal system on proposal day'],
      },
      testimonials: [
        {
          role: { es: 'Propuesta sorpresa en restaurante Santo Domingo', en: 'Surprise proposal in Santo Domingo restaurant' },
          quote: { es: 'Llegaron antes que nosotros y ella nunca los vio. Las fotos son increibles.', en: 'They arrived before us and she never saw them. The photos are incredible.' },
        },
        {
          role: { es: 'Propuesta en playa privada Punta Cana', en: 'Private beach proposal Punta Cana' },
          quote: { es: 'La segunda sorpresa fue la galeria al dia siguiente. Ella lloro de nuevo.', en: 'The second surprise was the gallery the next morning. She cried again.' },
        },
        {
          role: { es: 'Propuesta modo ninja Cap Cana', en: 'Ninja mode proposal Cap Cana' },
          quote: { es: 'Planificacion perfecta por WhatsApp. El dia fluyo sin ningun nerviosismo extra.', en: 'Perfect WhatsApp coordination. The day went smooth with no extra nerves.' },
        },
      ],
      caseStudy: {
        title: { es: 'Caso: propuesta en restaurante sin que ella lo supiera', en: 'Case: restaurant proposal she never suspected' },
        challenge: { es: 'La pareja cenaria en un restaurante concurrido de la Zona Colonial.', en: 'The couple was dining at a busy restaurant in the Colonial Zone.' },
        solution: { es: 'Coordinamos con el manager, llegamos 40 minutos antes y nos sentamos en mesa adyacente como clientes regulares.', en: 'We coordinated with the manager, arrived 40 minutes early, and sat at an adjacent table as regular guests.' },
        result: { es: 'Propuesta capturada completamente sin que ella notara nada hasta ver las fotos al dia siguiente.', en: 'Proposal fully captured without her noticing anything until seeing the photos the next morning.' },
      },
    },
  longForm: {
      intro: {
        es: 'La fotografia de propuesta en Republica Dominicana no es solo apretar un boton. Es una operacion logistica discreta que requiere planificacion secreta, posicionamiento invisible, coordinacion con el restaurante o venue, y un sistema de senales para el dia exacto. Esta pagina resume como lo hacemos -- en playas, restaurantes, villas privadas y marinas en toda la isla.',
        en: 'Proposal photography in the Dominican Republic is not just pressing a button. It is a discreet logistical operation that requires secret planning, invisible positioning, venue coordination, and a day-of signal system. This page covers how we do it -- on beaches, in restaurants, private villas, and marinas across the island.',
      },
      sections: [
        {
          title: {
            es: 'Como funciona el modo ninja -- tecnica de teleobjetivo 400-600 mm',
            en: 'How ninja mode works -- 400-600 mm telephoto technique',
          },
          paragraphs: {
            es: [
              'Usamos lentes de teleobjetivo 400-600 mm que nos permiten disparar desde 50 a 80 metros de la pareja con resultados que parecen tomados justo al lado. A esa distancia somos completamente invisibles -- especialmente en playas concurridas donde nos mezclamos como cualquier otro turista con camara.',
              'Para propuestas en restaurantes la tecnica cambia: llegamos antes que la pareja, nos sentamos en una mesa cercana como comensales regulares, y cuando ocurre el momento ya estamos en la posicion perfecta. La iluminacion interior requiere una configuracion distinta pero el resultado es igualmente natural.',
            ],
            en: [
              'We use 400-600 mm telephoto lenses that let us shoot from 50 to 80 meters away with results that look like we were standing right next to you. At that distance we are completely invisible -- especially on busy beaches where we blend in as any other tourist with a camera.',
              'For restaurant proposals the technique shifts: we arrive before the couple, sit at a nearby table as regular guests, and when the moment happens we are already in position. Indoor lighting requires a different setup but the results are equally natural.',
            ],
          },
          bullets: {
            es: [
              'Cobertura desde 50-80 metros en exteriores',
              'Posicionamiento en mesa cercana para propuestas en restaurantes',
              'Llegamos 45 minutos antes para reconocer la locacion',
              'Sistema de senales WhatsApp para confirmar posicion final',
            ],
            en: [
              'Coverage from 50-80 meters outdoors',
              'Adjacent table positioning for restaurant proposals',
              'We arrive 45 minutes early to scout the location',
              'WhatsApp signal system to confirm final position',
            ],
          },
        },
        {
          title: {
            es: 'Los mejores restaurantes para propuesta en Santo Domingo y Republica Dominicana',
            en: 'Best proposal restaurants in Santo Domingo and Dominican Republic',
          },
          paragraphs: {
            es: [
              'Santo Domingo tiene algunos de los escenarios mas unicos de la isla para una propuesta en restaurante. Meson de la Cava es una cueva subterranea real convertida en restaurante de alta cocina -- la atmosfera es completamente diferente a cualquier otro lugar del pais. La Briciola en la Zona Colonial es un romantico restaurante italiano con velas dentro de un edificio del siglo XVI con patio abierto.',
              'Fuera de Santo Domingo, La Yola en Marina Cap Cana ofrece una cena romantica con el muelle de yates de fondo -- uno de los locales mejor posicionados para fotografia oculta en toda la RD. En La Romana, La Piazzetta en Casa de Campo es una de las propuestas mas exclusivas que se pueden planificar en el Caribe.',
            ],
            en: [
              'Santo Domingo has some of the most unique restaurant proposal settings on the island. Meson de la Cava is a real underground cave converted into a fine-dining restaurant -- the atmosphere is unlike anything else in the country. La Briciola in the Colonial Zone is a romantic candlelit Italian restaurant inside a 16th-century colonial building with an open courtyard.',
              'Outside Santo Domingo, La Yola at Marina Cap Cana offers romantic dining with the yacht dock as backdrop -- one of the best-positioned venues for hidden photography across all of DR. In La Romana, La Piazzetta at Casa de Campo is one of the most exclusive proposal settings you can plan in the Caribbean.',
            ],
          },
          bullets: {
            es: [
              'Santo Domingo: Meson de la Cava, La Briciola, Valetudo, Prime, Mitre',
              'Punta Cana / Cap Cana: La Yola, Jellyfish, Kukua, Playa Blanca',
              'La Romana: La Piazzetta (Casa de Campo)',
              'Playa Nueva Romana: villas privadas en playa exclusiva',
            ],
            en: [
              'Santo Domingo: Meson de la Cava, La Briciola, Valetudo, Prime, Mitre',
              'Punta Cana / Cap Cana: La Yola, Jellyfish, Kukua, Playa Blanca',
              'La Romana: La Piazzetta (Casa de Campo)',
              'Playa Nueva Romana: private beachfront villas',
            ],
          },
        },
        {
          title: {
            es: 'La doble sorpresa -- la galeria que ella no esperaba',
            en: 'The double surprise -- the gallery she did not expect',
          },
          paragraphs: {
            es: [
              'La propuesta es el primer momento de sorpresa. La segunda sorpresa llega a la manana siguiente: ella despierta y encuentra una galeria completa del momento que pensaba que nadie estaba capturando. La mayoria de nuestros clientes nos dice que esta segunda sorpresa impacta igual o mas que la propuesta misma.',
              'Entregamos una galeria de vista previa la misma noche o a primera hora de la manana siguiente. La galeria completa editada llega dentro de 48 horas. Si agregas album impreso, lo entregamos en tu hotel o residencia dentro de 72 horas.',
            ],
            en: [
              'The proposal is the first surprise moment. The second surprise arrives the next morning: she wakes up to a complete gallery of the moment she thought no one was capturing. Most of our clients say this second surprise hits equally or harder than the proposal itself.',
              'We deliver a preview gallery the same night or first thing the next morning. The full edited gallery follows within 48 hours. If you add a printed album, we deliver it to your hotel or home within 72 hours.',
            ],
          },
          bullets: {
            es: [
              'Vista previa la misma noche o manana siguiente',
              'Galeria completa editada en 48 horas',
              'Album impreso entregado en hotel dentro de 72 horas (opcional)',
              'Acceso digital privado para compartir con familia',
            ],
            en: [
              'Preview gallery same night or next morning',
              'Full edited gallery within 48 hours',
              'Printed album delivered to hotel within 72 hours (optional)',
              'Private digital access for sharing with family',
            ],
          },
        },
      ],
      timeline: {
        title: {
          es: 'Ejemplo de flujo para propuesta sorpresa',
          en: 'Sample flow for a surprise proposal',
        },
        rows: [
          {
            phase: { es: 'Coordinacion previa', en: 'Pre-proposal coordination' },
            timing: { es: '1-3 dias antes', en: '1-3 days before' },
            notes: { es: 'WhatsApp: locacion, hora, senales y plan de posicionamiento.', en: 'WhatsApp: location, timing, signals, and positioning plan.' },
          },
          {
            phase: { es: 'Llegada y reconocimiento', en: 'Arrival and scouting' },
            timing: { es: '45 min antes', en: '45 min early' },
            notes: { es: 'Llegamos invisibles y confirmamos posicion final.', en: 'We arrive hidden and confirm final position.' },
          },
          {
            phase: { es: 'Senal de WhatsApp', en: 'WhatsApp signal' },
            timing: { es: '10 min antes', en: '10 min before' },
            notes: { es: 'Tu senal para nosotros -- silencio total desde ese momento.', en: 'Your cue to us -- radio silence from that point on.' },
          },
          {
            phase: { es: 'Galeria privada', en: 'Private gallery delivery' },
            timing: { es: 'Misma noche / manana siguiente', en: 'Same night / next morning' },
            notes: { es: 'Vista previa segura -- la doble sorpresa esta lista.', en: 'Secure preview -- the double surprise is ready.' },
          },
        ],
      },
    },
  faqs: [
      {
        question: {
          es: 'Cuanto cobran por una sesion de fotografia de propuesta?',
          en: 'How much does a proposal photography session cost?',
        },
        answer: {
          es: 'El paquete estandar comienza desde $250 USD + 18% ITBIS. El precio varia segun locacion, tipo de propuesta (playa, restaurante, villa privada), necesidad de coordinacion con el venue y productos finales como album impreso. Escribenos por WhatsApp y te cotizamos segun tu plan exacto.',
          en: 'The standard package starts at $250 USD + 18% tax. Price varies by location, proposal type (beach, restaurant, private villa), venue coordination needs, and final products like a printed album. Message us on WhatsApp and we quote based on your exact plan.',
        },
      },
      {
        question: {
          es: 'Pueden fotografiar una propuesta dentro de un restaurante en Santo Domingo?',
          en: 'Can you photograph a proposal inside a restaurant in Santo Domingo?',
        },
        answer: {
          es: 'Si — es uno de nuestros escenarios mas frecuentes. Contactamos al manager del restaurante con anticipacion, coordinamos nuestra posicion de forma confidencial, llegamos antes que la pareja y nos sentamos en una mesa cercana como comensales regulares. Ella pasa de cena romantica a recien comprometida con galeria completa en una sola noche.',
          en: 'Yes — it is one of our most frequent setups. We contact the restaurant manager in advance, coordinate our position confidentially, arrive before the couple, and sit at a nearby table as regular guests. She goes from romantic dinner to just got engaged with a full gallery in one night.',
        },
      },
      {
        question: {
          es: 'Como coordinan en secreto sin que ella se entere?',
          en: 'How do you coordinate secretly without her finding out?',
        },
        answer: {
          es: 'Todo es por WhatsApp directamente contigo — nunca correo compartido ni redes sociales. Para propuestas en restaurantes tambien coordinamos en privado con el local. El dia de la propuesta usamos senales de WhatsApp cuando estas a 10 minutos para confirmar posicion final.',
          en: 'Everything is via WhatsApp directly with you — never shared email or social platforms. For restaurant proposals we also communicate privately with the venue. On the proposal day we use WhatsApp signals when you are 10 minutes out to confirm final position.',
        },
      },
      {
        question: {
          es: 'Cuando recibimos las fotos?',
          en: 'When do we receive the photos?',
        },
        answer: {
          es: 'Recibes una galeria de vista previa la misma noche o la manana siguiente. La galeria completa editada llega dentro de 48 horas. Si agregas album impreso se entrega en tu hotel o residencia dentro de 72 horas.',
          en: 'You receive a preview gallery the same night or early the next morning. The full edited gallery follows within 48 hours. If you add a printed album it is delivered to your hotel or home within 72 hours.',
        },
      },
      {
        question: {
          es: 'Cubren propuestas fuera de Santo Domingo y Punta Cana?',
          en: 'Do you cover proposals outside Santo Domingo and Punta Cana?',
        },
        answer: {
          es: 'Si — cubrimos toda Republica Dominicana. Cap Cana, Casa de Campo en La Romana, Playa Nueva Romana, Samana, Las Terrenas, Puerto Plata y Bayahibe. Traslado fuera de SDQ y Punta Cana se cotiza por locacion.',
          en: 'Yes — we cover all of Dominican Republic. Cap Cana, Casa de Campo in La Romana, Playa Nueva Romana, Samana, Las Terrenas, Puerto Plata, and Bayahibe. Travel outside SDQ and Punta Cana is quoted per location.',
        },
      },
      {
        question: {
          es: 'Que pasa si la locacion cambia a ultimo momento?',
          en: 'What if the proposal location changes last minute?',
        },
        answer: {
          es: 'Sin problema. Nos mantenemos en WhatsApp hasta que ocurre el momento. Si la locacion cambia, informanos y nos reubicamos. Incluimos tiempo extra en cada sesion especificamente para esto.',
          en: 'No problem. We stay on WhatsApp until the moment happens. If the location changes, let us know and we relocate. We build extra time into each session specifically for this.',
        },
      },
    ],
  internalLinks: [
      {
        href: '/proposal',
        label: { es: 'Ver todos los paquetes de propuesta', en: 'See all proposal packages' },
        description: { es: 'Modo ninja, Punta Cana y toda la RD — elige el que mejor se adapte a tu plan.', en: 'Ninja mode, Punta Cana, and all of DR — choose the one that fits your plan.' },
      },
      {
        href: '/get-quote',
        label: { es: 'Coordinar propuesta en privado', en: 'Coordinate your proposal privately' },
        description: { es: 'Solo por WhatsApp — te cotizamos según tu locación y fecha.', en: 'WhatsApp only — we quote based on your location and date.' },
      },
    ],
}
