/**
 * Rich SEO content for the proposal-photography family page.
 *
 * Recovered from the pre-A6 architecture (commit 94fdc10^).
 * Original legacy slug: 'proposal-photography'.
 * Mapped to canonical family slug: 'proposal-photography'.
 */

import type { ServiceContent } from './types'

export const proposalPhotographyContent: ServiceContent = {
  seo: {
    title: {
      es: 'Contratar Fotógrafo de Pedida de Mano en Punta Cana | Resorts y Restaurantes RD | Babula Shots',
      en: 'Hire a Surprise Proposal Photographer in Punta Cana | Resorts & Beaches DR | Babula Shots',
    },
    description: {
      es: 'Cobertura oculta de pedidas de mano sorpresa en resorts de Punta Cana y restaurantes de Santo Domingo. Discreta, editorial y con reserva online segura.',
      en: 'Hidden surprise proposal coverage at Punta Cana resorts and Santo Domingo restaurants. Discreet, editorial, and bookable online with secure deposit.',
    },
    keywords: {
      es: 'fotografo pedida de mano punta cana, fotografo propuesta santo domingo, propuesta sorpresa republica dominicana, fotografo oculto resort punta cana, propuesta playa republica dominicana, reservar fotografo propuesta rd',
      en: 'surprise proposal photographer punta cana, proposal photographer santo domingo, hidden proposal photographer dominican republic, resort proposal photography DR, beach proposal photographer punta cana, book proposal photographer DR',
    },
  },
  schemaAdditionalType: 'https://schema.org/Service',

  // ── GEO COVERAGE ────────────────────────────────────────────────────
  // 4 cities: Punta Cana, Cap Cana, Santo Domingo, Casa de Campo (Altos
  // de Chavón). Hidden / surprise proposal coverage — discreet positioning,
  // long-lens work, and same-day reveal sets are the format. Resort and
  // restaurant access protocols are central to each block.
  geoCoverage: [
    {
      citySlug: 'punta-cana',
      cityName: { es: 'Punta Cana', en: 'Punta Cana' },
      intro: {
        es: 'Punta Cana es la capital de pedidas de mano sorpresa en el Caribe. Cubrimos propuestas en gazebos de playa de Hard Rock, Iberostar, Excellence y Paradisus, en restaurantes de Tortuga Bay (La Yola), y en las playas públicas de Bávaro y Macao al amanecer o atardecer. Trabajamos modo ninja con teleobjetivo desde 70 a 200 metros para que la pareja no nos vea hasta el momento del "sí". Coordinamos con wedding planners de hotel cuando aplica y respetamos las políticas de fotógrafo externo de cada resort.',
        en: 'Punta Cana is the Caribbean\'s surprise-proposal capital. We cover proposals at Hard Rock, Iberostar, Excellence, and Paradisus beach gazebos, at Tortuga Bay restaurants (La Yola), and on the public Bávaro and Macao beaches at sunrise or sunset. We work ninja-style with telephoto from 70–200 meters so the couple doesn\'t see us until the "yes" moment. We coordinate with hotel wedding planners when applicable and respect each resort\'s outside-photographer policies.',
      },
      venues: {
        es: [
          'Hard Rock Punta Cana — gazebo de playa para propuesta privada',
          'La Yola (Tortuga Bay / Westin) — propuesta en restaurante frente al mar',
          'Iberostar Bávaro — propuesta al atardecer en gazebo de playa',
          'Excellence Punta Cana — propuesta adults-only en zona privada',
          'Bávaro Beach al amanecer — propuesta en playa pública sin multitud',
          'Macao Beach — propuesta natural en playa al norte de Bávaro',
          'Paradisus Palma Real — propuesta en gazebos privados del resort',
        ],
        en: [
          'Hard Rock Punta Cana — beach gazebo for private proposal',
          'La Yola (Tortuga Bay / Westin) — restaurant proposal facing the sea',
          'Iberostar Bávaro — sunset proposal at the beach gazebo',
          'Excellence Punta Cana — adults-only proposal in a private area',
          'Bávaro Beach at sunrise — public-beach proposal without crowds',
          'Macao Beach — natural beach proposal north of Bávaro',
          'Paradisus Palma Real — proposal at the resort\'s private gazebos',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Cómo se mantienen escondidos durante una propuesta en resort?',
            en: 'How do you stay hidden during a resort proposal?',
          },
          answer: {
            es: 'Trabajamos con teleobjetivos 70-200mm o 100-400mm desde 70-200 metros. La pareja ve un fotógrafo más en la playa — nunca a alguien apuntándoles. Llegamos antes que tú para hacer scouting de ángulos discretos.',
            en: 'We work with 70-200mm or 100-400mm telephotos from 70-200 meters away. The couple sees just another photographer on the beach — never someone pointing at them. We arrive before you to scout discreet angles.',
          },
        },
        {
          question: {
            es: '¿Los resorts cobran por fotógrafo externo en propuestas?',
            en: 'Do resorts charge fees for outside proposal photographers?',
          },
          answer: {
            es: 'Algunos sí (Hard Rock, Iberostar, Hyatt). Otros lo permiten sin cargo si la propuesta es en playa pública adyacente. Lo confirmamos antes y te damos opciones según política del resort.',
            en: 'Some do (Hard Rock, Iberostar, Hyatt). Others allow it without charge if the proposal is on the adjacent public beach. We confirm beforehand and give you options based on the resort\'s policy.',
          },
        },
      ],
      bestSeasonNote: {
        es: 'Mejor temporada: noviembre a abril (clima estable). Para propuestas al amanecer cualquier mes funciona — la luz suave del Caribe a primera hora es uno de nuestros momentos favoritos del año.',
        en: 'Best season: November–April (stable weather). For sunrise proposals any month works — the soft early-morning Caribbean light is one of our favorite moments of the year.',
      },
    },
    {
      citySlug: 'cap-cana',
      cityName: { es: 'Cap Cana', en: 'Cap Cana' },
      intro: {
        es: 'Cap Cana es la apuesta de propuesta más exclusiva del Caribe — Juanillo Beach (consistentemente rankeada entre las mejores playas del mundo) ofrece arena blanca, agua turquesa y una orientación oeste perfecta para atardeceres. Sumamos propuestas en yates de Cap Cana Marina, sets en el campo de golf Punta Espada al sunset, y propuestas en cabanas privadas de Eden Roc o Sanctuary. Tenemos acreditación de seguridad para entrar al gated community como fotógrafos comerciales.',
        en: 'Cap Cana is the Caribbean\'s most exclusive proposal play — Juanillo Beach (consistently ranked among the world\'s best beaches) offers white sand, turquoise water, and a west orientation perfect for sunsets. We add yacht proposals at Cap Cana Marina, sunset sets on the Punta Espada golf course, and proposals in Eden Roc or Sanctuary private cabanas. We hold security accreditation to enter the gated community as commercial photographers.',
      },
      venues: {
        es: [
          'Juanillo Beach — propuesta al atardecer en una de las mejores playas del Caribe',
          'Sanctuary Cap Cana — propuesta adults-only en playa privada',
          'Eden Roc Cap Cana — propuesta boutique en cabanas privadas',
          'Cap Cana Marina — propuesta sobre yate al golden hour',
          'Punta Espada Golf Course — propuesta cinematográfica al atardecer en el campo Jack Nicklaus',
          'Secrets Cap Cana — propuesta adults-only con gazebo frente al mar',
          'Hyatt Ziva / Zilara Cap Cana — propuesta en zona resort de lujo',
        ],
        en: [
          'Juanillo Beach — sunset proposal on one of the Caribbean\'s top beaches',
          'Sanctuary Cap Cana — adults-only proposal on a private beach',
          'Eden Roc Cap Cana — boutique proposal in private cabanas',
          'Cap Cana Marina — yacht-deck proposal at golden hour',
          'Punta Espada Golf Course — cinematic sunset proposal on the Jack Nicklaus course',
          'Secrets Cap Cana — adults-only proposal with oceanfront gazebo',
          'Hyatt Ziva / Zilara Cap Cana — proposal in the luxury resort zone',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Pueden organizar una propuesta privada en Juanillo Beach?',
            en: 'Can you arrange a private proposal at Juanillo Beach?',
          },
          answer: {
            es: 'Sí. Coordinamos con anticipación el horario (sunset es el más demandado) y los puntos de cobertura. Para una propuesta verdaderamente privada recomendamos amanecer, cuando la playa está prácticamente vacía. Manejamos los detalles logísticos con seguridad de Cap Cana.',
            en: 'Yes. We coordinate timing in advance (sunset is most popular) and coverage points. For a truly private proposal we recommend sunrise, when the beach is essentially empty. We handle logistics with Cap Cana security.',
          },
        },
        {
          question: {
            es: '¿Tienen acceso a los resorts cerrados de Cap Cana para propuestas sorpresa?',
            en: 'Do you have access to Cap Cana\'s gated resorts for surprise proposals?',
          },
          answer: {
            es: 'Sí. Tenemos acreditación de seguridad de Cap Cana para entrar como fotógrafos comerciales en Sanctuary, Eden Roc, Secrets y Hyatt. Coordinamos el acceso 24-48 horas antes para evitar contratiempos en el portón.',
            en: 'Yes. We hold Cap Cana security accreditation to enter Sanctuary, Eden Roc, Secrets, and Hyatt as commercial photographers. We coordinate access 24-48 hours in advance to avoid gate delays.',
          },
        },
      ],
    },
    {
      citySlug: 'santo-domingo',
      cityName: { es: 'Santo Domingo', en: 'Santo Domingo' },
      intro: {
        es: 'Santo Domingo es el escenario de propuestas urbanas y románticas con peso histórico — Plaza España con la Catedral Primada al fondo, el Alcázar de Colón, la Calle Las Damas iluminada al atardecer. Sumamos propuestas en restaurantes rooftop con vista al Malecón y Mar Caribe, y propuestas íntimas en hoteles boutique de la Zona Colonial. Para parejas dominicanas o extranjeros que prefieren ciudad sobre playa, Santo Domingo entrega lo que ningún resort puede: 500 años de historia como fondo.',
        en: 'Santo Domingo is the stage for urban, history-laden proposals — Plaza España with the Primada Cathedral behind, Alcázar de Colón, Calle Las Damas lit at sunset. We add proposals at rooftop restaurants with Malecón and Caribbean views, and intimate proposals in Colonial Zone boutique hotels. For Dominican couples or international visitors who prefer city over beach, Santo Domingo delivers what no resort can: 500 years of history as backdrop.',
      },
      venues: {
        es: [
          'Plaza España — propuesta histórica con la Catedral Primada al fondo',
          'Alcázar de Colón — propuesta frente al palacio de Diego Colón',
          'Mirador Sur — propuesta al atardecer en cliff con vista al mar',
          'Calle Las Damas iluminada — propuesta nocturna en la calle empedrada más antigua del Nuevo Mundo',
          'Adrian Tropical (Malecón) — propuesta en restaurante con vista al Caribe',
          'Casas del XVI — propuesta íntima en boutique hotel de la Zona Colonial',
          'JW Marriott rooftop — propuesta urbana con vista a Piantini',
        ],
        en: [
          'Plaza España — historic proposal with the Primada Cathedral as backdrop',
          'Alcázar de Colón — proposal in front of Diego Columbus\' palace',
          'Mirador Sur — cliff sunset proposal with sea views',
          'Calle Las Damas illuminated — nighttime proposal on the New World\'s oldest cobblestone street',
          'Adrian Tropical (Malecón) — restaurant proposal with Caribbean views',
          'Casas del XVI — intimate proposal at the Colonial Zone boutique hotel',
          'JW Marriott rooftop — urban proposal with Piantini views',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Pueden hacer una propuesta oculta en un restaurante de Santo Domingo?',
            en: 'Can you do a hidden proposal in a Santo Domingo restaurant?',
          },
          answer: {
            es: 'Sí. Coordinamos previamente con el restaurante (varios en Piantini, Naco y Zona Colonial nos conocen) para un mesero que sepa el momento, una mesa con ángulo fotográfico y nuestra ubicación discreta. La pareja nunca nos ve antes del "sí".',
            en: 'Yes. We coordinate in advance with the restaurant (several in Piantini, Naco, and the Colonial Zone know us) for a server who knows the moment, a table with the right photo angle, and our discreet position. The couple never sees us before the "yes."',
          },
        },
        {
          question: {
            es: '¿Cubren propuestas en la Zona Colonial sin coordinar con autoridades?',
            en: 'Do you cover proposals in the Colonial Zone without coordinating with authorities?',
          },
          answer: {
            es: 'Sí, en zonas públicas como Plaza España, Calle Las Damas y Alcázar de Colón. La Zona Colonial es área pública abierta — no requerimos permisos para propuesta íntima. Para ceremonias o producciones formales, sí coordinamos con la oficina del Patrimonio Cultural.',
            en: 'Yes, in public areas like Plaza España, Calle Las Damas, and Alcázar de Colón. The Colonial Zone is open public space — no permits needed for an intimate proposal. For ceremonies or formal productions, we do coordinate with the Cultural Heritage office.',
          },
        },
      ],
    },
    {
      citySlug: 'casa-de-campo',
      cityName: { es: 'Casa de Campo', en: 'Casa de Campo' },
      intro: {
        es: 'Altos de Chavón es probablemente el escenario de propuesta más cinematográfico de República Dominicana — un pueblo mediterráneo del siglo XVI tallado a mano sobre el río Chavón, con anfiteatro, plazas empedradas, restaurantes románticos y vistas al atardecer sobre el cañón. Sumamos propuestas en Minitas Beach (playa privada del resort), restaurantes de Casa de Campo Marina, y al hoyo 18 de Teeth of the Dog al sunset. Para propuestas que quieren memoria visual única, Casa de Campo entrega un escenario que ningún resort all-inclusive puede igualar.',
        en: 'Altos de Chavón is arguably the most cinematic proposal venue in the Dominican Republic — a hand-carved 16th-century Mediterranean village above the Chavón River, with amphitheater, cobblestone plazas, romantic restaurants, and sunset views over the canyon. We add proposals on Minitas Beach (the resort\'s private beach), at Casa de Campo Marina restaurants, and on Teeth of the Dog\'s 18th hole at sunset. For proposals that want a singular visual memory, Casa de Campo delivers a setting no all-inclusive resort can match.',
      },
      venues: {
        es: [
          'Altos de Chavón plaza principal — propuesta al atardecer en el pueblo mediterráneo',
          'Altos de Chavón mirador del río Chavón — propuesta en cliff con vista al cañón',
          'La Caña by Il Circo (Casa de Campo) — propuesta en restaurante boutique',
          'Minitas Beach — propuesta privada en playa del resort',
          'Casa de Campo Marina — propuesta al atardecer con yates al fondo',
          'Iglesia de San Estanislao (atrio exterior) — propuesta romántica en setting histórico',
          'Teeth of the Dog Golf hoyo 18 — propuesta cinematográfica al sunset en el campo Pete Dye',
        ],
        en: [
          'Altos de Chavón main plaza — sunset proposal in the Mediterranean village',
          'Altos de Chavón Chavón River viewpoint — cliff proposal with canyon views',
          'La Caña by Il Circo (Casa de Campo) — boutique restaurant proposal',
          'Minitas Beach — private resort-beach proposal',
          'Casa de Campo Marina — sunset proposal with yachts as backdrop',
          'St. Stanislaus Church (exterior courtyard) — romantic proposal in historic setting',
          'Teeth of the Dog Golf 18th hole — cinematic sunset proposal on the Pete Dye course',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Por qué Altos de Chavón es el escenario de propuesta más fotogénico de RD?',
            en: 'Why is Altos de Chavón the most photogenic proposal venue in DR?',
          },
          answer: {
            es: 'Porque es uno de los pocos lugares del Caribe que ofrece arquitectura europea del siglo XVI tallada a mano, con orientación oeste sobre el río Chavón. Da 30+ ángulos diferentes en menos de un kilómetro: piedra, madera, escaleras, plazas, vista al cañón al atardecer. Visualmente es irrepetible.',
            en: 'Because it\'s one of the few places in the Caribbean offering hand-carved 16th-century European architecture, oriented west over the Chavón River. It delivers 30+ different angles in under a kilometer: stone, wood, stairs, plazas, sunset canyon views. Visually it\'s unrepeatable.',
          },
        },
        {
          question: {
            es: '¿Pueden coordinar una propuesta sorpresa en restaurante de Casa de Campo?',
            en: 'Can you coordinate a surprise proposal at a Casa de Campo restaurant?',
          },
          answer: {
            es: 'Sí. Trabajamos con La Caña, La Casita y otros restaurantes del resort para coordinar la mesa, el momento y nuestro ángulo discreto. Casa de Campo facilita el flujo cuando se solicita con anticipación.',
            en: 'Yes. We work with La Caña, La Casita, and other resort restaurants to coordinate the table, the moment, and our discreet angle. Casa de Campo facilitates the flow when arranged in advance.',
          },
        },
      ],
    },
  ],

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
          es: 'El paquete estandar comienza desde $270 USD + 18% ITBIS. El precio varia segun locacion, tipo de propuesta (playa, restaurante, villa privada), necesidad de coordinacion con el venue y productos finales como album impreso. Escribenos por WhatsApp y te cotizamos segun tu plan exacto.',
          en: 'The standard package starts at $270 USD + 18% tax. Price varies by location, proposal type (beach, restaurant, private villa), venue coordination needs, and final products like a printed album. Message us on WhatsApp and we quote based on your exact plan.',
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
