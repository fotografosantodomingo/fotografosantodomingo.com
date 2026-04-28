-- Migration 019 — Seed 5 long-tail SEO blog posts (10 entries: 5 × 2 locales)
--
-- Week 5 of the SEO plan: long-tail content velocity. Each post targets
-- one buyer query that combines a specific (family × location) pairing
-- with a niche concern (permits, photography logistics, venue-specific
-- guides). All content drafted from approved geoCoverage data in
-- src/data/service-content/<family>.ts plus project memory (drone zones,
-- venue accreditation, etc.).
--
-- Strategy B additive — only INSERTs.
--
-- Idempotency: an early DO-block guard exits silently if any of the
-- five sentinel slugs already exists. Re-running the migration is a
-- no-op once seeded. (slug_es has no UNIQUE constraint so ON CONFLICT
-- can't target it.)
--
-- Cover images intentionally left NULL — the blog template (src/app/
-- [locale]/blog/[slug]/page.tsx) falls back to /api/og dynamic OG
-- generation when cover_image_url is empty. User can replace via admin UI.

DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.blog_posts
    WHERE slug_es IN (
      'fotografo-bodas-altos-de-chavon-casa-de-campo',
      'permisos-drone-fotografia-punta-cana-puj',
      'propuesta-sorpresa-sanctuary-cap-cana-juanillo-beach',
      'fotografo-bodas-catedral-primada-zona-colonial-santo-domingo',
      'fotografo-quinceaneras-santo-domingo-locaciones-paquetes'
    )
  ) THEN
    RAISE NOTICE 'Migration 019 — SEO blog seed already applied, skipping.';
    RETURN;
  END IF;

  INSERT INTO public.blog_posts (
  slug, slug_es, slug_en,
  title_es, title_en,
  excerpt_es, excerpt_en,
  meta_description_es, meta_description_en,
  content_es, content_en,
  primary_keyword_es, primary_keyword_en,
  service_type, location, geo_city, geo_country,
  faq_es, faq_en,
  internal_links_es, internal_links_en,
  status, published_at,
  category, author
)
VALUES

-- ═══════════════════════════════════════════════════════════════════
-- POST 1 — Altos de Chavón / Casa de Campo Wedding Guide
-- Targets: "boda altos de chavón", "casa de campo wedding photographer"
-- ═══════════════════════════════════════════════════════════════════
(
  'fotografo-bodas-altos-de-chavon-casa-de-campo',
  'fotografo-bodas-altos-de-chavon-casa-de-campo',
  'altos-de-chavon-casa-de-campo-wedding-photographer-guide',

  'Fotógrafo de Bodas en Altos de Chavón y Casa de Campo: Guía Completa',
  'Wedding Photographer at Altos de Chavón & Casa de Campo: The Complete Guide',

  'Cómo se fotografía una boda en Casa de Campo: ceremonia en San Estanislao, recepción en el anfiteatro de Altos de Chavón, y por qué este es uno de los venues más cinematográficos del Caribe.',
  'How a Casa de Campo wedding is actually photographed: ceremony at St. Stanislaus, reception at the Altos de Chavón amphitheater, and why this is one of the Caribbean''s most cinematic wedding venues.',

  'Boda en Casa de Campo: ceremonia en la iglesia de San Estanislao, recepción en el anfiteatro de Altos de Chavón. Logística, timeline y locaciones fotográficas explicadas.',
  'Casa de Campo wedding guide: ceremony at St. Stanislaus Church, reception at the Altos de Chavón amphitheater. Logistics, timeline, and photographic locations explained.',

  'Casa de Campo en La Romana es uno de los pocos venues de boda en el Caribe que combina arquitectura europea del siglo XVI tallada a mano con servicio de hotel cinco estrellas y playas privadas. Para parejas que buscan una boda destino con carácter visual único, Casa de Campo entrega lo que ningún resort all-inclusive puede igualar — un escenario que se siente más editorial italiano que postal de playa.

La boda típica en Casa de Campo se estructura en tres movimientos. Primero, la ceremonia religiosa en la iglesia de San Estanislao en Altos de Chavón. Esta iglesia fue consagrada por el Papa Juan Pablo II en 1979 y mantiene su carácter litúrgico estricto: sin flash durante la consagración, posiciones fotográficas acordadas previamente con el sacerdote, y respeto absoluto por el silencio durante la liturgia. Como fotógrafos trabajamos sin disparador audible, con teleobjetivos largos desde posiciones discretas, y solo nos acercamos al altar en momentos específicos del rito.

Segundo, la sesión de pareja en el pueblo de Altos de Chavón al atardecer. El pueblo está construido sobre un acantilado del río Chavón con orientación oeste, lo que significa que entre las 5:00 y 6:30 PM (según la época del año) la luz dorada baña las plazas de piedra, los balcones de madera y la vista al cañón. En menos de una hora caminando entre la iglesia, el anfiteatro y las terrazas, hemos producido más de 30 ángulos diferentes — algo imposible en cualquier resort de playa.

Tercero, la recepción. Las opciones principales son el anfiteatro de Altos de Chavón (capacidad para 5,000 personas, ideal para bodas grandes con producción cinematográfica), villas privadas en el resort (con servicio de mayordomo y piscinas infinity), o restaurantes del resort como La Caña by Il Circo y Casa de Campo Marina. Cada opción tiene su propia logística fotográfica: el anfiteatro requiere iluminación adicional para vídeo, las villas dan luz suave al atardecer, la marina entrega yates como fondo natural.

La pieza menos discutida de una boda en Casa de Campo es la coordinación con el resort. Casa de Campo tiene un equipo de wedding planners internos que controlan los horarios, los puntos de acceso y las restricciones de drone. Como fotógrafos acreditados llegamos siempre 60 minutos antes del horario oficial, hacemos scouting de luz en cada locación, y coordinamos con el wedding planner del resort sobre tiempos de pareja, fotos grupales y logística de transporte entre la iglesia y la recepción.',

  'Casa de Campo in La Romana is one of the few Caribbean wedding venues that combines hand-carved 16th-century European architecture with five-star hotel service and private beaches. For couples seeking a destination wedding with singular visual character, Casa de Campo delivers what no all-inclusive resort can match — a setting that feels more editorial Italian than beach postcard.

The typical Casa de Campo wedding plays out in three movements. First, the religious ceremony at St. Stanislaus Church in Altos de Chavón. This church was consecrated by Pope John Paul II in 1979 and maintains a strict liturgical character: no flash during consecration, photographic positions agreed in advance with the priest, and absolute respect for liturgical silence. As photographers we work with silent shutters, long telephoto lenses from discreet positions, and only approach the altar at specific ritual moments.

Second, the couple session in the Altos de Chavón village at sunset. The village is built on a cliff above the Chavón River with west-facing orientation, meaning between 5:00 and 6:30 PM (depending on time of year) golden light bathes the stone plazas, wooden balconies, and canyon view. In under an hour of walking between the church, amphitheater, and terraces, we produce 30+ different angles — impossible in any beach resort.

Third, the reception. Main options are the Altos de Chavón amphitheater (capacity 5,000, ideal for large weddings with cinematic production), private villas in the resort (with butler service and infinity pools), or resort restaurants like La Caña by Il Circo and Casa de Campo Marina. Each has its own photographic logistics: the amphitheater needs additional lighting for video, villas offer soft sunset light, the marina delivers yachts as natural backdrop.

The least-discussed piece of a Casa de Campo wedding is resort coordination. Casa de Campo has an internal wedding-planner team controlling timelines, access points, and drone restrictions. As accredited photographers we arrive 60 minutes before the official call time, scout light in every location, and coordinate with the resort wedding planner on couple time, group photos, and transport logistics between the church and reception.',

  'fotografo bodas altos de chavón casa de campo',
  'altos de chavón casa de campo wedding photographer',

  'wedding',
  'Casa de Campo',
  'Casa de Campo / La Romana',
  'Dominican Republic',

  '[
    {"q":"¿Pueden fotografiar la ceremonia en la iglesia de San Estanislao?","a":"Sí. Trabajamos sin flash durante la consagración y con disparador silencioso durante toda la liturgia. Coordinamos previamente con el sacerdote las posiciones permitidas. Más de 50 bodas religiosas cubiertas en San Estanislao desde 2015."},
    {"q":"¿Hay restricciones de drone en Casa de Campo?","a":"Sí. El resort tiene políticas internas sobre vuelos de drone — algunos sectores cerca de la marina y zonas residenciales están restringidos. Coordinamos con el manager del resort por anticipado. La iglesia y el anfiteatro de Altos de Chavón normalmente permiten drone con vuelos cortos."},
    {"q":"¿Cuánto tiempo necesitamos para la sesión de pareja en Altos de Chavón?","a":"45-60 minutos al atardecer es ideal. En ese tiempo cubrimos la plaza principal, la vista al río Chavón, las escaleras del anfiteatro, las terrazas con vista al cañón y los rincones más fotogénicos del pueblo. Si quieres incluir la marina o Minitas Beach, planifica 90 minutos."},
    {"q":"¿Qué tan accesible es Casa de Campo desde el aeropuerto?","a":"Casa de Campo tiene su propio aeropuerto privado (LRM, La Romana) que recibe vuelos directos desde Miami, Nueva York y otros destinos del este de USA. Desde el aeropuerto al resort son 10 minutos. Desde Punta Cana (PUJ) son aproximadamente 1h40min en coche."}
  ]'::jsonb,
  '[
    {"q":"Can you photograph the ceremony at St. Stanislaus Church?","a":"Yes. We work flash-free during the consecration and with silent shutter throughout the liturgy. We coordinate allowed positions with the priest in advance. We have covered 50+ religious weddings at St. Stanislaus since 2015."},
    {"q":"Are there drone restrictions at Casa de Campo?","a":"Yes. The resort has internal drone policies — some sectors near the marina and sensitive residential zones are restricted. We coordinate with the resort manager in advance. The church and Altos de Chavón amphitheater typically allow drone with short flights."},
    {"q":"How much time do we need for the couple session in Altos de Chavón?","a":"45-60 minutes at sunset is ideal. In that window we cover the main plaza, Chavón River view, amphitheater stairs, canyon-facing terraces, and the village''s most photogenic corners. If you want to include the marina or Minitas Beach, plan 90 minutes."},
    {"q":"How accessible is Casa de Campo from the airport?","a":"Casa de Campo has its own private airport (LRM, La Romana) receiving direct flights from Miami, New York, and other US East Coast destinations. From the airport to the resort is 10 minutes. From Punta Cana (PUJ) it''s approximately 1h40min by car."}
  ]'::jsonb,

  '[
    {"label":"Bodas en República Dominicana","href":"/es/services/wedding-photography","description":"Cobertura premium de bodas en Santo Domingo, Punta Cana, Cap Cana y Casa de Campo"},
    {"label":"Página dedicada de Casa de Campo","href":"/es/fotografo-de-bodas-en-casa-de-campo","description":"Locaciones, venues y FAQ para bodas en Casa de Campo"},
    {"label":"Solicitar cotización","href":"/es/get-quote?family=wedding-photography&city=casa-de-campo&cta=blog-altos-de-chavon","description":"Propuesta personalizada en menos de 5 días"}
  ]'::jsonb,
  '[
    {"label":"Wedding Photography in Dominican Republic","href":"/en/services/wedding-photography","description":"Premium wedding coverage in Santo Domingo, Punta Cana, Cap Cana, and Casa de Campo"},
    {"label":"Casa de Campo dedicated page","href":"/en/casa-de-campo-wedding-photographer","description":"Locations, venues, and FAQ for Casa de Campo weddings"},
    {"label":"Request a quote","href":"/en/get-quote?family=wedding-photography&city=casa-de-campo&cta=blog-altos-de-chavon","description":"Custom proposal within 5 business days"}
  ]'::jsonb,

  'published',
  '2026-04-27 10:00:00+00',
  'wedding',
  'Babula Shots'
),

-- ═══════════════════════════════════════════════════════════════════
-- POST 2 — Drone Permits in Punta Cana
-- Targets: "permisos drone punta cana", "drone permits punta cana"
-- ═══════════════════════════════════════════════════════════════════
(
  'permisos-drone-fotografia-punta-cana-puj',
  'permisos-drone-fotografia-punta-cana-puj',
  'drone-permits-photography-punta-cana-puj-airport',

  'Permisos de Drone en Punta Cana: Lo Que Todo Fotógrafo (y Cliente) Debe Saber',
  'Drone Permits in Punta Cana: What Every Photographer (and Client) Should Know',

  'Las restricciones DJI alrededor del aeropuerto de Punta Cana (PUJ) explicadas: zonas restringidas, zonas de altitud limitada, áreas de vuelo libre y cómo coordinamos vuelos para fotografía inmobiliaria y bodas.',
  'DJI restrictions around Punta Cana airport (PUJ) explained: restricted zones, altitude-limited zones, free-fly areas, and how we coordinate flights for real estate and wedding photography.',

  'Guía práctica de zonas restringidas DJI alrededor del PUJ Punta Cana. Bávaro, Cabo Engaño y Punta Cana Village tienen altitud limitada; Cap Cana y Macao son vuelo libre.',
  'Practical guide to DJI restricted zones around Punta Cana airport (PUJ). Bávaro, Cabo Engaño, and Punta Cana Village are altitude-limited; Cap Cana and Macao are free-fly.',

  'El Aeropuerto Internacional de Punta Cana (PUJ) es uno de los más transitados del Caribe — y eso significa que la mayoría del territorio que un fotógrafo de drone querría volar tiene algún tipo de restricción. Como fotógrafos profesionales con pilotos certificados DJI, navegamos estas restricciones a diario, y vale la pena explicar exactamente cómo funcionan para que clientes de bienes raíces y bodas entiendan qué es posible y qué no.

DJI clasifica las zonas de vuelo en varias categorías. La más estricta es Zona Restringida: aquí el firmware del drone simplemente no permite el despegue, y volar es ilegal. La zona inmediata alrededor de la pista del PUJ es Zona Restringida — incluyendo el área del terminal y un radio cercano. Si tu propiedad o evento está dentro de esta zona, drone no es opción.

La segunda categoría es Zona de Altitud Limitada. Aquí el drone puede despegar, pero la altitud máxima está restringida — típicamente a 30 o 60 metros sobre el suelo en lugar de los 120 metros estándar. Esta zona cubre la mayor parte de Bávaro central, Los Manantiales, Cabo Engaño y Punta Cana Village. Es perfectamente fotografiable: a 30 metros se obtiene una excelente perspectiva aérea para listados inmobiliarios, y la mayoría de las tomas comerciales de hoteles operan en este rango de todas formas. Lo importante es planificar las tomas conociendo la limitación.

Fuera de las zonas restringidas y limitadas hay áreas de Vuelo Libre. Las más relevantes para nuestros clientes son: Cap Cana al sur (incluyendo Hacienda, Eden Roc, Sanctuary, Juanillo Beach, la marina y todas las residencias), Cabeza de Toro al norte de Bávaro, y Macao Beach más al norte. En estas zonas volamos hasta 120 metros sin coordinación adicional, lo que abre tomas panorámicas amplias imposibles en el centro de Bávaro.

Para casos donde el cliente necesita vuelo específico cerca del aeropuerto — por ejemplo, una propiedad comercial en zona restringida — coordinamos con el IDAC (Instituto Dominicano de Aviación Civil) que otorga permisos formales para uso comercial. Este proceso toma típicamente 2-3 semanas y aplica solo cuando el contexto comercial lo justifica. Para una sesión inmobiliaria estándar, trabajamos dentro de las zonas legales sin requerir trámite adicional.

La pregunta más común de clientes es: "¿Va a salir bien la foto si volamos a baja altura?" La respuesta práctica es sí, casi siempre. La diferencia entre 30 metros y 120 metros es relevante para tomas paisajísticas de gran escala (hoteles desde el océano, golf courses completos), pero para listados de propiedades individuales, sesiones de boda en gazebo de playa, o tomas de eventos corporativos, los 30 metros entregan exactamente la perspectiva que el material necesita.',

  'Punta Cana International Airport (PUJ) is one of the busiest in the Caribbean — which means most of the territory a drone photographer would want to fly carries some restriction. As professional photographers with DJI-certified pilots, we navigate these restrictions daily, and it''s worth explaining exactly how they work so real estate and wedding clients understand what''s possible and what isn''t.

DJI classifies flight zones into several categories. The strictest is Restricted Zone: here the drone firmware simply prevents takeoff, and flying is illegal. The immediate area around the PUJ runway is a Restricted Zone — including the terminal area and a nearby radius. If your property or event sits inside this zone, drone is not an option.

The second category is Altitude-Limited Zone. Here the drone can take off, but maximum altitude is restricted — typically 30 or 60 meters above ground instead of the standard 120 meters. This zone covers most of central Bávaro, Los Manantiales, Cabo Engaño, and Punta Cana Village. It is perfectly photographable: at 30 meters you get excellent aerial perspective for real estate listings, and most commercial hotel shots operate in this range anyway. The key is planning shots knowing the limitation.

Outside restricted and limited zones are Free-Fly areas. The most relevant for our clients: Cap Cana to the south (including Hacienda, Eden Roc, Sanctuary, Juanillo Beach, the marina, and all residences), Cabeza de Toro north of Bávaro, and Macao Beach further north. In these zones we fly up to 120 meters without additional coordination, opening wide panoramic shots impossible in central Bávaro.

For cases where a client needs specific flight near the airport — for example, a commercial property in a restricted zone — we coordinate with IDAC (Dominican Civil Aviation Institute) which grants formal permits for commercial use. This process typically takes 2-3 weeks and applies only when the commercial context justifies it. For a standard real estate session, we work within legal zones without additional paperwork.

The most common client question: "Will the shot turn out fine if we fly at low altitude?" The practical answer is yes, almost always. The difference between 30m and 120m matters for large-scale landscape shots (hotels seen from ocean, complete golf courses), but for individual property listings, beach gazebo wedding sessions, or corporate event coverage, 30 meters delivers exactly the perspective the material needs.',

  'permisos drone punta cana puj',
  'drone permits punta cana puj airport',

  'drone',
  'Punta Cana',
  'Punta Cana',
  'Dominican Republic',

  '[
    {"q":"¿Pueden volar drone en mi resort en Bávaro?","a":"Probablemente sí, pero con altitud limitada. Bávaro central está dentro de la Zona de Altitud Limitada del PUJ — vuelos hasta 30 metros aprox. Para listings inmobiliarios y tomas de hotel esto es suficiente. Confirmamos antes de la sesión la zona específica de la propiedad."},
    {"q":"¿Cap Cana tiene restricciones de drone?","a":"No por el aeropuerto — Cap Cana queda fuera del cono de vuelo del PUJ y es área de Vuelo Libre hasta 120 metros. Sin embargo, Cap Cana como gated community tiene políticas internas: algunos resorts requieren permiso del manager. Coordinamos por anticipado."},
    {"q":"¿Cuánto tarda obtener un permiso del IDAC?","a":"Para un permiso formal IDAC el proceso toma 2-3 semanas y requiere documentación del cliente comercial. Solo aplica cuando el cliente necesita volar dentro de una zona restringida. Para zonas Limitadas o Libres no requerimos trámite — operamos dentro del marco legal estándar."},
    {"q":"¿Tienen drone profesional o solo DJI consumer?","a":"Volamos DJI Mavic 3 Pro (cámara Hasselblad, video 5.1K, sensor 4/3) — la opción consumer profesional para fotografía y video de alta calidad. Para producciones especializadas (cine, estudios técnicos) coordinamos drone enterprise por proyecto."}
  ]'::jsonb,
  '[
    {"q":"Can you fly drone at my Bávaro resort?","a":"Probably yes, but at limited altitude. Central Bávaro sits inside PUJ''s Altitude-Limited Zone — flights up to roughly 30 meters. For real estate listings and hotel shots that''s sufficient. We confirm the property''s specific zone before the session."},
    {"q":"Does Cap Cana have drone restrictions?","a":"Not from the airport — Cap Cana sits outside PUJ''s flight cone and is Free-Fly area up to 120 meters. However, Cap Cana as a gated community has internal policies: some resorts require manager permission. We coordinate in advance."},
    {"q":"How long does an IDAC permit take?","a":"A formal IDAC permit takes 2-3 weeks and requires commercial client documentation. It only applies when the client needs to fly inside a restricted zone. For Limited or Free zones we don''t need a permit — we operate within the standard legal framework."},
    {"q":"Do you have professional drones or just consumer DJI?","a":"We fly the DJI Mavic 3 Pro (Hasselblad camera, 5.1K video, 4/3 sensor) — the professional consumer option for high-quality photo and video. For specialized productions (cinema, technical surveys) we coordinate enterprise drone per project."}
  ]'::jsonb,

  '[
    {"label":"Servicios de drone y fotografía aérea","href":"/es/services/real-estate-drone-photography","description":"Aéreas, twilight, Matterport y video para listados inmobiliarios"},
    {"label":"Punta Cana — fotógrafo inmobiliario","href":"/es/fotografo-inmobiliario-en-punta-cana","description":"Cobertura dedicada de Punta Cana"},
    {"label":"Cap Cana — fotógrafo inmobiliario","href":"/es/fotografo-inmobiliario-en-cap-cana","description":"Cobertura dedicada de Cap Cana"}
  ]'::jsonb,
  '[
    {"label":"Drone & Real Estate Services","href":"/en/services/real-estate-drone-photography","description":"Aerials, twilight, Matterport, and video for property listings"},
    {"label":"Punta Cana — real estate photographer","href":"/en/punta-cana-real-estate-photographer","description":"Dedicated Punta Cana coverage"},
    {"label":"Cap Cana — real estate photographer","href":"/en/cap-cana-real-estate-photographer","description":"Dedicated Cap Cana coverage"}
  ]'::jsonb,

  'published',
  '2026-04-27 10:30:00+00',
  'drone',
  'Babula Shots'
),

-- ═══════════════════════════════════════════════════════════════════
-- POST 3 — Surprise Proposal at Sanctuary Cap Cana
-- Targets: "propuesta sorpresa cap cana", "sanctuary cap cana proposal"
-- ═══════════════════════════════════════════════════════════════════
(
  'propuesta-sorpresa-sanctuary-cap-cana-juanillo-beach',
  'propuesta-sorpresa-sanctuary-cap-cana-juanillo-beach',
  'sanctuary-cap-cana-juanillo-beach-surprise-proposal',

  'Propuesta Sorpresa en Sanctuary Cap Cana y Juanillo Beach: Logística y Estrategia Fotográfica',
  'Surprise Proposal at Sanctuary Cap Cana & Juanillo Beach: Logistics and Photo Strategy',

  'Cómo se organiza realmente una propuesta sorpresa en Cap Cana — modo ninja con teleobjetivo, coordinación con seguridad del resort, y por qué Juanillo Beach al amanecer es el setting más fotográfico del Caribe.',
  'How a Cap Cana surprise proposal is actually organized — ninja-mode telephoto, coordination with resort security, and why Juanillo Beach at sunrise is the most photographic setting in the Caribbean.',

  'Propuesta sorpresa en Sanctuary Cap Cana o Juanillo Beach. Cobertura oculta con teleobjetivo 400-600mm. Acreditación con seguridad y galería esa misma noche.',
  'Surprise proposal at Sanctuary Cap Cana or Juanillo Beach. Hidden coverage with 400-600mm telephoto. Resort security accreditation and gallery same night.',

  'La propuesta sorpresa de matrimonio es el formato fotográfico más exigente que cubrimos. La pareja no debe vernos. La luz tiene que ser perfecta porque no hay ensayo. La coordinación con el resort tiene que ser invisible para que la persona que recibe la propuesta no sospeche nada. Y todo el evento — desde el "¿quieres casarte conmigo?" hasta el "sí" — dura literalmente menos de tres minutos. No hay segunda toma.

Por eso Cap Cana es uno de nuestros venues favoritos para propuestas. Específicamente Juanillo Beach (la playa pública dentro del gated community) y los gazebos privados de Sanctuary Cap Cana. Ambos venues entregan tres ventajas críticas para fotografía de propuesta. Primero, control de acceso: el gated community filtra el público, así que durante el momento de la propuesta no hay turistas casuales caminando hacia la cámara. Segundo, dimensiones: estos venues son lo suficientemente grandes para que un fotógrafo pueda posicionarse a 80-120 metros con teleobjetivo 400-600mm sin que la pareja sospeche. Tercero, la luz: orientación oeste-suroeste significa que el atardecer entre 5:30 y 6:00 PM da el golden hour más fotogénico del Caribe.

La logística que un cliente no ve funciona así. El día de la propuesta llegamos 90 minutos antes para hacer scouting de luz en el punto exacto que la pareja va a estar. Coordinamos con seguridad del resort (tenemos acreditación de fotógrafos comerciales en Cap Cana, lo que nos permite entrar al gated community sin levantar sospechas — aparecemos como cualquier otro fotógrafo del resort). Establecemos posición en una zona elevada con vista directa a la playa, montamos el teleobjetivo, y testeamos la exposición con un voluntario en el punto de la propuesta. El cliente solo necesita confirmar la hora y el lugar específico — nosotros nos encargamos del resto.

Durante el momento crítico, trabajamos en silencio total con disparador silencioso del cuerpo réflex y modo continuo a 10 fps. La galería que entregamos esa misma noche típicamente tiene 50-80 fotos del momento real (desde "él se arrodilla" hasta "ella dice sí" hasta el primer abrazo y beso), más una sesión rápida de pareja de 15 minutos después si la pareja quiere — generalmente quieren porque ese día están viviendo el momento más fotogénico de sus vidas.

Sanctuary Cap Cana específicamente ofrece algunas opciones únicas. Si la pareja se hospeda en el resort, podemos coordinar gazebo privado en la playa con flores y velas (a través del concierge del hotel — discreto, ellos lo manejan como "decoración romántica de cortesía"). Si prefieren la playa pública de Juanillo, posicionamos al fotógrafo escondido en las dunas de la entrada — perspectiva natural sin que el público interfiera.

La razón por la que repetimos este venue tantas veces es simple: las fotos que salen de una propuesta en Juanillo Beach al atardecer son objetivamente difíciles de igualar en otros lugares del Caribe. Color del agua, calidad de la arena, separación natural entre pareja y entorno. Cuando la galería se entrega al día siguiente, la reacción de los amigos y familia que la ven en Instagram es casi siempre "¿dónde fue eso?" — exactamente lo que quieren los clientes que invierten en una propuesta destino.',

  'The surprise marriage proposal is the most demanding photo format we cover. The couple cannot see us. Light has to be perfect because there is no rehearsal. Resort coordination has to be invisible so the person receiving the proposal suspects nothing. And the entire event — from "will you marry me?" to "yes" — lasts literally under three minutes. There''s no second take.

That''s why Cap Cana is one of our favorite proposal venues. Specifically Juanillo Beach (the public beach inside the gated community) and the private gazebos at Sanctuary Cap Cana. Both venues deliver three critical advantages for proposal photography. First, access control: the gated community filters the public, so during the proposal moment there are no casual tourists walking into the frame. Second, dimensions: these venues are large enough that a photographer can position at 80-120 meters with a 400-600mm telephoto without the couple suspecting. Third, light: west-southwest orientation means sunset between 5:30 and 6:00 PM gives the Caribbean''s most photogenic golden hour.

The logistics a client doesn''t see work like this. On proposal day we arrive 90 minutes early to scout light at the exact spot the couple will be. We coordinate with resort security (we hold commercial photographer accreditation at Cap Cana, which lets us enter the gated community without raising suspicion — we appear as any other resort photographer). We establish position in an elevated zone with direct beach view, mount the telephoto, and test exposure with a volunteer at the proposal point. The client just needs to confirm time and specific spot — we handle the rest.

During the critical moment, we work in total silence with the camera body''s silent shutter and continuous mode at 10 fps. The gallery we deliver that same night typically holds 50-80 photos of the real moment (from "he kneels" to "she says yes" to the first hug and kiss), plus a 15-minute quick couple session afterward if the couple wants — they usually do, because that day they''re living the most photogenic moment of their lives.

Sanctuary Cap Cana specifically offers some unique options. If the couple stays at the resort, we can coordinate a private beach gazebo with flowers and candles (through the hotel concierge — discreet, they handle it as "romantic courtesy decoration"). If they prefer the public Juanillo Beach, we position the photographer hidden in the entrance dunes — natural perspective without public interference.

The reason we shoot this venue so often is simple: the photos coming out of a Juanillo Beach proposal at sunset are objectively hard to match elsewhere in the Caribbean. Water color, sand quality, natural separation between couple and surroundings. When the gallery is delivered the next day, the reaction from friends and family seeing it on Instagram is almost always "where was that?" — exactly what clients investing in a destination proposal want.',

  'propuesta sorpresa cap cana sanctuary juanillo',
  'sanctuary cap cana surprise proposal photographer',

  'proposal',
  'Cap Cana',
  'Cap Cana',
  'Dominican Republic',

  '[
    {"q":"¿Cómo me coordino con ustedes sin que mi pareja sospeche?","a":"Toda la coordinación es por WhatsApp en mi número personal. No mando facturas hasta después del evento, no hay reservas en sistemas que ella pueda ver. Acordamos hora y locación específica con días de anticipación; tú solo confirmas en la mañana del día."},
    {"q":"¿Qué pasa si llueve o hay mal clima?","a":"En temporada baja (mayo-octubre) recomendamos confirmar la propuesta en horario de amanecer (6:30 AM) cuando las probabilidades de lluvia son menores. Si el clima cambia drásticamente, tenemos plan B en gazebo cubierto del resort. Sin reembolso por clima, pero sí reagendamos."},
    {"q":"¿Tienen acreditación para entrar a Cap Cana?","a":"Sí. Tenemos acreditación de fotógrafos comerciales con seguridad de Cap Cana — entramos al gated community sin trámite adicional. Coordinamos por anticipado el día y horario para el portón de seguridad."},
    {"q":"¿Cuándo recibo las fotos?","a":"Galería preview esa misma noche (50-80 fotos editadas) — para que puedas compartir con familia inmediatamente. Galería completa con todas las tomas en alta resolución se entrega en 7-10 días."}
  ]'::jsonb,
  '[
    {"q":"How do I coordinate with you without my partner suspecting?","a":"All coordination happens via WhatsApp on my personal number. I don''t send invoices until after the event, no system reservations she could see. We agree on time and specific location days in advance; you just confirm the morning of."},
    {"q":"What if it rains or weather goes bad?","a":"In low season (May-October) we recommend confirming the proposal at sunrise (6:30 AM) when rain probability is lower. If weather changes drastically, we have backup at a covered resort gazebo. No refund for weather, but we do reschedule."},
    {"q":"Do you have accreditation to enter Cap Cana?","a":"Yes. We hold commercial photographer accreditation with Cap Cana security — we enter the gated community without additional paperwork. We coordinate the day and time with the security gate in advance."},
    {"q":"When do I receive the photos?","a":"Preview gallery that same night (50-80 edited photos) — so you can share with family immediately. Full gallery with all shots in high resolution is delivered within 7-10 days."}
  ]'::jsonb,

  '[
    {"label":"Fotografía de propuesta de matrimonio","href":"/es/services/proposal-photography","description":"Cobertura oculta modo ninja en toda República Dominicana"},
    {"label":"Cap Cana — propuesta dedicada","href":"/es/services/proposal-photography#cap-cana","description":"Detalles de venues en Cap Cana"},
    {"label":"Cotizar propuesta sorpresa","href":"/es/get-quote?family=proposal-photography&city=cap-cana&cta=blog-sanctuary","description":"Coordinación 100% por WhatsApp"}
  ]'::jsonb,
  '[
    {"label":"Surprise Proposal Photography","href":"/en/services/proposal-photography","description":"Hidden ninja-mode coverage across the Dominican Republic"},
    {"label":"Cap Cana — proposal coverage","href":"/en/services/proposal-photography#cap-cana","description":"Cap Cana venue details"},
    {"label":"Quote a surprise proposal","href":"/en/get-quote?family=proposal-photography&city=cap-cana&cta=blog-sanctuary","description":"100% WhatsApp coordination"}
  ]'::jsonb,

  'published',
  '2026-04-27 11:00:00+00',
  'proposal',
  'Babula Shots'
),

-- ═══════════════════════════════════════════════════════════════════
-- POST 4 — Wedding at Catedral Primada de América
-- Targets: "boda catedral primada", "catedral primada wedding santo domingo"
-- ═══════════════════════════════════════════════════════════════════
(
  'fotografo-bodas-catedral-primada-zona-colonial-santo-domingo',
  'fotografo-bodas-catedral-primada-zona-colonial-santo-domingo',
  'catedral-primada-zona-colonial-santo-domingo-wedding-photographer',

  'Boda en la Catedral Primada de América: Fotografía en la Primera Catedral del Nuevo Mundo',
  'Wedding at the Catedral Primada de América: Photography at the New World''s First Cathedral',

  'Cómo se fotografía una boda en la Catedral Primada de América — protocolo litúrgico, restricciones de flash, posiciones permitidas, y por qué la Zona Colonial entrega 30+ ángulos para la sesión post-ceremonia.',
  'How a wedding is photographed at the Catedral Primada de América — liturgical protocol, flash restrictions, allowed positions, and why the Colonial Zone delivers 30+ angles for the post-ceremony session.',

  'Bodas en la Catedral Primada de América con sesión en Plaza España, Calle Las Damas y Alcázar de Colón. Protocolo litúrgico estricto, fotografía discreta sin flash.',
  'Catedral Primada de América weddings with sessions at Plaza España, Calle Las Damas, and Alcázar de Colón. Strict liturgical protocol, discreet flash-free photography.',

  'La Catedral Primada de América en la Zona Colonial de Santo Domingo es la primera catedral consagrada en el Nuevo Mundo — completada en 1540, antes que la primera catedral de Lima, México o La Habana. Casarse aquí es elegir un escenario fotográfico que ningún otro venue del Caribe puede igualar: una catedral del Renacimiento español de quinientos años, en una ciudad que entera fue el primer asentamiento permanente europeo del continente.

El protocolo fotográfico para la Catedral Primada es estricto, y entender las reglas antes de la ceremonia es la diferencia entre una galería elegante y una galería con momentos perdidos. Primera regla: sin flash durante la liturgia. Esto incluye la entrada de la novia, la lectura del evangelio, la consagración, la comunión y el rito final. Trabajamos con cámaras de sensor full frame y lentes f/1.4 a f/2.8 que permiten capturar luz natural de los vitrales y la iluminación tenue del altar sin necesidad de flash. Segunda regla: posiciones acordadas con el sacerdote antes de la ceremonia. Generalmente nos asignan el pasillo central durante la entrada, el lateral derecho durante la consagración, y el frente del altar durante el intercambio de votos.

La sesión de pareja post-ceremonia en la Zona Colonial es uno de los productos fotográficos más completos que ofrecemos en Santo Domingo. La Zona Colonial es área pública abierta — no requerimos permisos para fotografía íntima — y dentro de un radio de 500 metros de la Catedral hay más de 30 fondos arquitectónicos diferentes. Plaza España con la Catedral al fondo entrega el ángulo "histórico clásico". Calle Las Damas (la primera calle empedrada construida en América, completada en 1502) entrega un ángulo verticalmente cinematográfico. El Alcázar de Colón (palacio de Diego Colón, hijo del descubridor) entrega arquitectura militar de piedra. La Fortaleza Ozama, el Convento de los Dominicos, las ruinas del Hospital San Nicolás — cada uno con su propio carácter visual.

El timing ideal para la sesión post-ceremonia es la hora antes del atardecer, cuando la luz dorada se refleja en la piedra colonial y la mayoría de los turistas ha regresado a sus hoteles. En la práctica esto significa programar la ceremonia para terminar a las 4:30 PM (lo que ubica la sesión entre 5:00 y 6:00 PM en la mayor parte del año). Si la ceremonia es por la mañana, la sesión post-ceremonia se programa para el atardecer del mismo día, después del descanso entre eventos.

Las parejas que se casan en la Catedral Primada típicamente continúan a una recepción en hotel boutique de la Zona Colonial (Casas del XVI, Hodelpa Nicolás de Ovando) o a un hotel de Piantini (JW Marriott, Hilton Santo Domingo). Coordinamos transporte fotográfico entre venues — generalmente cubrimos el trayecto en coche para capturar momentos de tránsito que las parejas valoran después: la pareja saliendo de la catedral, los detalles del coche, la primera mirada al venue de recepción.',

  'The Catedral Primada de América in Santo Domingo''s Colonial Zone is the first cathedral consecrated in the New World — completed in 1540, before the first cathedrals of Lima, Mexico City, or Havana. Getting married here means choosing a photographic setting no other Caribbean venue can match: a 500-year-old Spanish Renaissance cathedral, in a city that was the first permanent European settlement on the continent.

The photographic protocol at the Catedral Primada is strict, and understanding the rules before the ceremony is the difference between an elegant gallery and one with missed moments. First rule: no flash during the liturgy. This includes the bride''s entrance, gospel reading, consecration, communion, and final rite. We work with full-frame cameras and f/1.4 to f/2.8 lenses that capture natural light from the stained-glass windows and the dim altar lighting without needing flash. Second rule: positions agreed with the priest before the ceremony. We are typically assigned the center aisle during the entrance, the right side during consecration, and the front of the altar during vow exchange.

The post-ceremony couple session in the Colonial Zone is one of the most complete photographic products we offer in Santo Domingo. The Colonial Zone is open public space — we don''t require permits for intimate photography — and within a 500-meter radius of the Cathedral there are 30+ different architectural backdrops. Plaza España with the Cathedral behind delivers the "classic historic" angle. Calle Las Damas (the first cobblestone street built in the Americas, completed in 1502) delivers a vertically cinematic angle. The Alcázar de Colón (Diego Columbus''s palace, the discoverer''s son) delivers military stone architecture. La Fortaleza Ozama, the Dominican Convent, the San Nicolás Hospital ruins — each with its own visual character.

Ideal timing for the post-ceremony session is the hour before sunset, when golden light reflects off colonial stone and most tourists have returned to their hotels. In practice this means scheduling the ceremony to end at 4:30 PM (placing the session between 5:00 and 6:00 PM most of the year). If the ceremony is morning, the post-ceremony session is scheduled for sunset that same day, after the rest break between events.

Couples marrying at the Catedral Primada typically continue to a reception at a Colonial Zone boutique hotel (Casas del XVI, Hodelpa Nicolás de Ovando) or a Piantini hotel (JW Marriott, Hilton Santo Domingo). We coordinate photographic transport between venues — we generally cover the car ride to capture transit moments couples value afterward: the couple leaving the cathedral, the car details, first look at the reception venue.',

  'fotografo bodas catedral primada santo domingo',
  'catedral primada santo domingo wedding photographer',

  'wedding',
  'Santo Domingo',
  'Santo Domingo',
  'Dominican Republic',

  '[
    {"q":"¿Qué reglas tiene la Catedral Primada para fotógrafos?","a":"Sin flash durante la liturgia (entrada, consagración, comunión). Posiciones acordadas previamente con el sacerdote. Disparador silencioso preferido. Trabajamos con cámaras full frame y lentes rápidos (f/1.4-f/2.8) para capturar la luz natural de los vitrales sin flash."},
    {"q":"¿Cuánto tiempo debe durar la sesión post-ceremonia en la Zona Colonial?","a":"60-90 minutos cubre los 5-6 fondos principales (Plaza España, Las Damas, Alcázar de Colón, Catedral exterior). Si quieres incluir Plaza Trinitaria y la Fortaleza Ozama, planifica 2 horas. Atardecer es ideal — entre 5:00 y 6:30 PM según la época del año."},
    {"q":"¿La Zona Colonial requiere permisos para fotografía de boda?","a":"No para sesión íntima de pareja. Es área pública abierta, no necesitamos permisos del Patrimonio Cultural. Si traen producción grande con asistentes, decoración o iluminación adicional, sí coordinamos con la oficina de Patrimonio Cultural."},
    {"q":"¿Pueden cubrir también la recepción si es en hotel de Piantini?","a":"Sí. Cubrimos el día completo: ceremonia en Catedral, sesión Zona Colonial, traslado en coche, recepción. Para bodas con ceremonia en Catedral y recepción en Piantini, recomendamos cobertura de día completo (10-12 horas)."}
  ]'::jsonb,
  '[
    {"q":"What rules does the Catedral Primada have for photographers?","a":"No flash during the liturgy (entrance, consecration, communion). Positions agreed with the priest in advance. Silent shutter preferred. We work with full-frame cameras and fast lenses (f/1.4-f/2.8) to capture stained-glass natural light without flash."},
    {"q":"How long should the post-ceremony Colonial Zone session last?","a":"60-90 minutes covers the 5-6 main backdrops (Plaza España, Las Damas, Alcázar de Colón, exterior Cathedral). If you want to include Plaza Trinitaria and Fortaleza Ozama, plan 2 hours. Sunset is ideal — between 5:00 and 6:30 PM depending on time of year."},
    {"q":"Does the Colonial Zone require permits for wedding photography?","a":"Not for an intimate couple session. It''s open public space; no Cultural Heritage permits needed. If you bring large production with assistants, decoration, or additional lighting, we do coordinate with the Cultural Heritage office."},
    {"q":"Can you also cover the reception if it''s at a Piantini hotel?","a":"Yes. We cover the full day: Cathedral ceremony, Colonial Zone session, car transit, reception. For weddings with Cathedral ceremony and Piantini reception, we recommend full-day coverage (10-12 hours)."}
  ]'::jsonb,

  '[
    {"label":"Bodas en Santo Domingo","href":"/es/fotografo-de-bodas-en-santo-domingo","description":"Cobertura dedicada de bodas en Santo Domingo"},
    {"label":"Servicio de bodas — paquetes","href":"/es/services/wedding-photography","description":"Esencial, Premium, Día Completo, Personalizada"},
    {"label":"Solicitar cotización","href":"/es/get-quote?family=wedding-photography&city=santo-domingo&cta=blog-catedral-primada","description":"Propuesta personalizada en menos de 5 días"}
  ]'::jsonb,
  '[
    {"label":"Wedding photographer in Santo Domingo","href":"/en/santo-domingo-wedding-photographer","description":"Dedicated Santo Domingo wedding coverage"},
    {"label":"Wedding service — packages","href":"/en/services/wedding-photography","description":"Essential, Premium, Full Day, Custom"},
    {"label":"Request a quote","href":"/en/get-quote?family=wedding-photography&city=santo-domingo&cta=blog-catedral-primada","description":"Custom proposal within 5 business days"}
  ]'::jsonb,

  'published',
  '2026-04-27 11:30:00+00',
  'wedding',
  'Babula Shots'
),

-- ═══════════════════════════════════════════════════════════════════
-- POST 5 — Quinceañera in Santo Domingo Locations Guide
-- Targets: "fotos quinceañera santo domingo", "quinceañera santo domingo photographer"
-- ═══════════════════════════════════════════════════════════════════
(
  'fotografo-quinceaneras-santo-domingo-locaciones-paquetes',
  'fotografo-quinceaneras-santo-domingo-locaciones-paquetes',
  'quinceanera-photographer-santo-domingo-locations-packages',

  'Fotografía de Quinceañera en Santo Domingo: Locaciones, Looks y Cómo Planificar',
  'Quinceañera Photography in Santo Domingo: Locations, Looks, and How to Plan',

  'Guía completa de quinceañera en Santo Domingo: sesión en Zona Colonial, ceremonia religiosa, recepción en hotel, looks y cambios de vestido. Cómo planificar el día y qué incluyen los paquetes profesionales.',
  'Complete quinceañera guide in Santo Domingo: Colonial Zone session, religious ceremony, hotel reception, looks and dress changes. How to plan the day and what professional packages include.',

  'Fotografía de quinceañera en Santo Domingo. Locaciones en Zona Colonial, ceremonia religiosa, looks de estudio, recepción en hotel. Paquetes desde 1h hasta día completo.',
  'Quinceañera photography in Santo Domingo. Colonial Zone locations, religious ceremony, studio looks, hotel reception. Packages from 1h to full day.',

  'La quinceañera dominicana es uno de los eventos familiares más fotografiados del país — y también uno de los que más cambia entre familias. Algunas familias prefieren una sesión de retratos elegante en estudio o en la Zona Colonial, sin ceremonia religiosa, enfocada en producir un álbum de quince. Otras hacen una ceremonia religiosa completa con misa, vals y recepción de gala. Otras combinan elementos de ambos. Como fotógrafos cubrimos todas las variantes, y vale la pena explicar cómo se estructura cada formato.

El formato más solicitado en Santo Domingo es la sesión de retratos pre-quinceañera. Esta sesión se hace típicamente 2-4 semanas antes del evento principal (para que las fotos estén impresas o digitales listas para compartir el día de la celebración). La logística estándar incluye 1.5 a 2 horas con uno o dos cambios de vestido. Las locaciones más populares son Plaza España, Calle Las Damas, el Alcázar de Colón y los patios coloniales del Convento de los Dominicos en la Zona Colonial. Para un look más editorial, alternamos a estudio con luz controlada y fondos de cyclorama para producir el álbum de quince con estilo más fashion.

El segundo formato es la cobertura del evento — generalmente 4 horas que cubren ceremonia religiosa, vals tradicional con padre y hermanos, y recepción. Las ceremonias en Santo Domingo se realizan en la Catedral Primada (formato más prestigioso, requiere coordinación con el sacerdote), capillas privadas de hoteles, o capillas familiares. La recepción típicamente ocurre en salones de hotel — JW Marriott Piantini, Hilton Santo Domingo, Renaissance Jaragua, o el clásico Embajador Hotel — con capacidad para 100-300 invitados.

El tercer formato es el más completo: día completo con sesión pre-evento (mañana), preparación de la quinceañera (tarde), ceremonia, vals y recepción (noche). Este formato requiere típicamente 10-12 horas de cobertura y se justifica para eventos grandes con producción cinematográfica completa. Para familias que invierten en una quinceañera memorable, este es el paquete que entrega el documental visual más rico.

Detalles de producción que las familias frecuentemente subestiman: maquillaje y peinado profesional debe estar listo 2 horas antes de la primera foto, no 30 minutos. La quinceañera necesita tiempo para acostumbrarse al maquillaje y revisar fotos preliminares antes de salir a locación. El vestido principal y los cambios de outfit deben estar planchados y listos en bolsa de protección. Si hay zapatos de tacón, llevamos también zapatos cómodos para los traslados — ningún plan sale como esperado si la quinceañera está incómoda durante el evento.

Para parejas que vienen de fuera de Santo Domingo (Santiago, La Vega, Puerto Plata, Punta Cana) coordinamos venues que minimicen los traslados — generalmente una sola locación que tiene capilla y salón de eventos, o hotel boutique en Zona Colonial que combina elegancia colonial con servicio de hotel cinco estrellas.',

  'The Dominican quinceañera is one of the most-photographed family events in the country — and also one of the most variable between families. Some families prefer an elegant portrait session in studio or the Colonial Zone, no religious ceremony, focused on producing a quince album. Others do a full religious ceremony with Mass, waltz, and gala reception. Others blend elements of both. As photographers we cover every variant, and it''s worth explaining how each format is structured.

The most-requested format in Santo Domingo is the pre-quinceañera portrait session. This session typically runs 2-4 weeks before the main event (so photos are printed or digitally ready to share on celebration day). Standard logistics include 1.5 to 2 hours with one or two outfit changes. The most popular locations are Plaza España, Calle Las Damas, the Alcázar de Colón, and the colonial courtyards of the Dominican Convent in the Colonial Zone. For a more editorial look, we alternate to studio with controlled light and cyclorama backdrops to produce the quince album in a fashion-forward style.

The second format is event coverage — generally 4 hours covering religious ceremony, traditional waltz with father and brothers, and reception. Santo Domingo ceremonies happen at the Catedral Primada (most prestigious format, requires priest coordination), private hotel chapels, or family chapels. The reception typically happens at hotel ballrooms — JW Marriott Piantini, Hilton Santo Domingo, Renaissance Jaragua, or the classic Embajador Hotel — with 100-300 guest capacity.

The third format is the most complete: full day with pre-event session (morning), quinceañera preparation (afternoon), ceremony, waltz, and reception (night). This format typically requires 10-12 hours of coverage and is justified for large events with full cinematic production. For families investing in a memorable quinceañera, this is the package that delivers the richest visual documentary.

Production details families frequently underestimate: professional makeup and hair must be ready 2 hours before the first photo, not 30 minutes. The quinceañera needs time to get used to the makeup and review preliminary photos before going to location. The main dress and outfit changes must be ironed and ready in protection bags. If there are heeled shoes, we also bring comfortable shoes for transit — no plan goes as expected if the quinceañera is uncomfortable during the event.

For families coming from outside Santo Domingo (Santiago, La Vega, Puerto Plata, Punta Cana) we coordinate venues that minimize transit — usually a single location that has chapel and event hall, or a Colonial Zone boutique hotel that combines colonial elegance with five-star hotel service.',

  'fotografo quinceañera santo domingo zona colonial',
  'quinceañera photographer santo domingo colonial zone',

  'quinceanera',
  'Santo Domingo',
  'Santo Domingo',
  'Dominican Republic',

  '[
    {"q":"¿Hacen sesiones de quinceañera fuera de evento?","a":"Sí. La sesión pre-quinceañera (1.5-2 horas, 2 cambios de outfit, en Zona Colonial o estudio) es el formato más popular. Se hace típicamente 2-4 semanas antes del evento principal para que las fotos estén listas para compartir el día de la celebración."},
    {"q":"¿Incluyen maquillaje y peinado en los paquetes?","a":"En paquetes Premium y VIP de quinceañera incluimos maquillaje y peinado profesional. En paquetes Esenciales el maquillaje se contrata por separado — coordinamos con makeup artists de confianza si lo prefieres."},
    {"q":"¿Cuántas fotos se entregan?","a":"Esencial 10: 10 fotos premium editadas. Esencial 15: 15 fotos. Premium VIP 20: 20 fotos. Cobertura de evento (4h): 60 fotos editadas. Día completo: 100+ fotos editadas. Galería privada online entregada en 7-14 días según paquete."},
    {"q":"¿Pueden fotografiar también la ceremonia religiosa en la Catedral Primada?","a":"Sí. Cubrimos quinceañeras religiosas en la Catedral Primada y otras iglesias de Santo Domingo. Conocemos el protocolo litúrgico (sin flash, posiciones acordadas con el sacerdote) y lo coordinamos antes del evento."}
  ]'::jsonb,
  '[
    {"q":"Do you do quinceañera sessions outside of the event?","a":"Yes. The pre-quinceañera session (1.5-2 hours, 2 outfit changes, in Colonial Zone or studio) is the most popular format. It typically happens 2-4 weeks before the main event so photos are ready to share on celebration day."},
    {"q":"Do packages include makeup and hair?","a":"Premium and VIP quinceañera packages include professional makeup and hairstyling. Essential packages have makeup contracted separately — we coordinate with trusted makeup artists if you prefer."},
    {"q":"How many photos are delivered?","a":"Essential 10: 10 premium edited photos. Essential 15: 15 photos. Premium VIP 20: 20 photos. Event coverage (4h): 60 edited photos. Full day: 100+ edited photos. Private online gallery delivered in 7-14 days depending on package."},
    {"q":"Can you also photograph the religious ceremony at the Catedral Primada?","a":"Yes. We cover religious quinceañeras at the Catedral Primada and other Santo Domingo churches. We know the liturgical protocol (no flash, positions agreed with the priest) and coordinate it before the event."}
  ]'::jsonb,

  '[
    {"label":"Cumpleaños y Quinceañeras","href":"/es/services/birthday-event-photography","description":"Cobertura premium de cumpleaños, quinceañeras, bautizos y graduaciones"},
    {"label":"Página dedicada de Santo Domingo","href":"/es/services/birthday-event-photography#santo-domingo","description":"Cobertura específica para Santo Domingo"},
    {"label":"Cotizar quinceañera","href":"/es/get-quote?family=birthday-event-photography&city=santo-domingo&cta=blog-quinceanera-sd","description":"Propuesta personalizada según tu formato"}
  ]'::jsonb,
  '[
    {"label":"Birthday & Quinceañera Photography","href":"/en/services/birthday-event-photography","description":"Premium coverage of birthdays, quinceañeras, baptisms, and graduations"},
    {"label":"Santo Domingo dedicated page","href":"/en/services/birthday-event-photography#santo-domingo","description":"Santo Domingo-specific coverage"},
    {"label":"Quote a quinceañera","href":"/en/get-quote?family=birthday-event-photography&city=santo-domingo&cta=blog-quinceanera-sd","description":"Custom proposal based on your format"}
  ]'::jsonb,

  'published',
  '2026-04-27 12:00:00+00',
  'quinceanera',
  'Babula Shots'
);

  RAISE NOTICE 'Migration 019 — Seeded 5 SEO blog posts (10 entries: 5 ES + 5 EN).';
END
$migration$;
