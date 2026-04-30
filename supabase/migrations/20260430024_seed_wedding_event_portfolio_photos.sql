-- ============================================================
-- Migration 024: Seed wedding + corporate-event portfolio photos
--
-- Adds 18 Cloudinary photos to portfolio_images with bilingual
-- SEO metadata. These are the same photos featured on the new
-- longFormGallery sections of /services/wedding-photography and
-- /services/corporate-event-photography (commits e692f41 + ded3919).
--
-- public_id values are derived from the Cloudinary URL slug.
-- sort_order 300-309 = wedding, 310-317 = corporate-event so they
-- land after the existing studio (100-107) and beach (200-209) sets
-- in the public portfolio gallery.
-- ============================================================

INSERT INTO portfolio_images (
  public_id,
  alt_es, alt_en,
  caption_es, caption_en,
  title_es, title_en,
  description_es, description_en,
  category, location, featured, sort_order, width, height
) VALUES
-- ── WEDDING (10 photos) ──────────────────────────────────────
(
  'trash-the-dress-republica-dominicana-fotografo_zccwla',
  'Sesión trash the dress en República Dominicana — fotógrafo profesional de bodas',
  'Trash the dress session in the Dominican Republic — professional wedding photographer',
  'Trash the dress en la costa dominicana — sesión post-boda editorial',
  'Trash the dress on the Dominican coast — editorial post-wedding session',
  'Trash the Dress · República Dominicana',
  'Trash the Dress · Dominican Republic',
  'Sesión trash the dress al borde del mar con dirección creativa y luz natural',
  'Trash the dress session at the seaside with creative direction and natural light',
  'wedding', 'República Dominicana', true,  300, 1600,  900
),
(
  'sesion-preboda-playas-dominicanas-fotografo_pxexhp',
  'Sesión de pre-boda en playas dominicanas — fotógrafo profesional',
  'Pre-wedding photo session on Dominican beaches — professional photographer',
  'Pre-boda en playa dominicana con dirección romántica',
  'Pre-wedding on a Dominican beach with romantic direction',
  'Pre-boda · Playas Dominicanas',
  'Pre-Wedding · Dominican Beaches',
  'Sesión de compromiso para parejas con look editorial natural y locaciones costeras',
  'Engagement session for couples with natural editorial look and coastal locations',
  'wedding', 'República Dominicana', true,  301, 1600,  900
),
(
  'sesion-de-fotos-boda-juan-dolio-rd_yb6u8a',
  'Sesión de fotos de boda en Juan Dolio, República Dominicana',
  'Wedding photo session in Juan Dolio, Dominican Republic',
  'Boda en la playa de Juan Dolio, RD',
  'Beach wedding in Juan Dolio, DR',
  'Boda · Juan Dolio',
  'Wedding · Juan Dolio',
  'Cobertura de boda en la costa de Juan Dolio con luz natural editorial',
  'Wedding coverage along the Juan Dolio coast with editorial natural light',
  'wedding', 'Juan Dolio', false, 302, 1600,  900
),
(
  'fotografo-profesional-bayahibe-boda-playa_mctgis',
  'Fotógrafo profesional de bodas en la playa de Bayahíbe, La Romana',
  'Professional beach wedding photographer in Bayahíbe, La Romana',
  'Boda en la playa de Bayahíbe, La Romana',
  'Beach wedding in Bayahíbe, La Romana',
  'Boda · Bayahíbe',
  'Wedding · Bayahíbe',
  'Cobertura de ceremonia y recepción en la playa de Bayahíbe',
  'Beach ceremony and reception coverage in Bayahíbe',
  'wedding', 'Bayahíbe — La Romana', true, 303, 1600,  900
),
(
  'fotografo-bodas-punta-cana-dominican-republic_ddvngs',
  'Fotógrafo de bodas en Punta Cana, República Dominicana',
  'Wedding photographer in Punta Cana, Dominican Republic',
  'Boda destino en Punta Cana, RD',
  'Destination wedding in Punta Cana, DR',
  'Boda · Punta Cana',
  'Wedding · Punta Cana',
  'Boda destino en resort all-inclusive de Punta Cana con cobertura completa del día',
  'Destination wedding at an all-inclusive Punta Cana resort with full-day coverage',
  'wedding', 'Punta Cana', true, 304, 1600,  900
),
(
  'fotografia-aerea-boda-playa-republica-dominicana_izspr3',
  'Fotografía aérea con drone para boda en la playa, República Dominicana',
  'Aerial drone photography for beach wedding, Dominican Republic',
  'Vista aérea de boda en la playa dominicana',
  'Aerial view of a Dominican beach wedding',
  'Boda Aérea · Drone',
  'Aerial Wedding · Drone',
  'Cobertura aérea con drone para mostrar el escenario completo de la ceremonia',
  'Aerial drone coverage to capture the full ceremony scene',
  'wedding', 'República Dominicana', false, 305, 1600,  900
),
(
  'fotografo-bodas-la-romana-casa-de-campo_bwd0s2',
  'Fotógrafo de bodas en La Romana — Casa de Campo, República Dominicana',
  'Wedding photographer in La Romana — Casa de Campo, Dominican Republic',
  'Boda exclusiva en Casa de Campo, La Romana',
  'Exclusive wedding at Casa de Campo, La Romana',
  'Boda · Casa de Campo',
  'Wedding · Casa de Campo',
  'Cobertura premium de boda en Casa de Campo con accesos a campos de golf y altos de chavón',
  'Premium wedding coverage at Casa de Campo with access to golf course and Altos de Chavón',
  'wedding', 'La Romana — Casa de Campo', true, 306, 1600,  900
),
(
  'fotografo-boda-cabarete-republica-dominicana_fnmbvz',
  'Fotógrafo de boda en Cabarete, República Dominicana',
  'Wedding photographer in Cabarete, Dominican Republic',
  'Boda costera en Cabarete, RD',
  'Coastal wedding in Cabarete, DR',
  'Boda · Cabarete',
  'Wedding · Cabarete',
  'Cobertura de boda en la costa norte (Cabarete) con vientos alisios y atardeceres dramáticos',
  'Wedding coverage on the north coast (Cabarete) with trade winds and dramatic sunsets',
  'wedding', 'Cabarete', false, 307, 1600,  900
),
(
  'wedding-photographer-cap-cana-luxury-resort_h5arx2',
  'Fotógrafo de bodas en Cap Cana — resort de lujo, República Dominicana',
  'Wedding photographer at Cap Cana luxury resort, Dominican Republic',
  'Boda de lujo en Cap Cana — comunidad cerrada',
  'Luxury wedding at Cap Cana — gated community',
  'Boda · Cap Cana',
  'Wedding · Cap Cana',
  'Boda en resort de lujo en Cap Cana con acceso a marina, golf y Juanillo Beach',
  'Luxury Cap Cana resort wedding with access to the marina, golf, and Juanillo Beach',
  'wedding', 'Cap Cana', true, 308, 1600,  900
),
(
  'sesion-fotos-playa-blanca-punta-cana_ggc81c',
  'Sesión de fotos en playa blanca de Punta Cana, República Dominicana',
  'Photo session on Punta Cana white-sand beach, Dominican Republic',
  'Sesión en la arena blanca de Punta Cana',
  'Session on Punta Cana white sand',
  'Punta Cana · Arena Blanca',
  'Punta Cana · White Sand',
  'Sesión vertical en la arena blanca de Punta Cana — encuadre mobile-first para feed editorial',
  'Vertical session on Punta Cana white sand — mobile-first framing for editorial feed',
  'wedding', 'Punta Cana', false, 309, 900,  1600
),
-- ── CORPORATE EVENT (8 photos) ───────────────────────────────
(
  'servicio_de_fotografia_de_eventos_en_hotel_en_santo_domingo_yshzed',
  'Servicio de fotografía de eventos en hotel en Santo Domingo, República Dominicana',
  'Event photography service at hotel in Santo Domingo, Dominican Republic',
  'Cobertura de evento corporativo en hotel de Santo Domingo',
  'Corporate event coverage at a Santo Domingo hotel',
  'Eventos · Hotel SD',
  'Events · SD Hotel',
  'Cobertura editorial en evento corporativo dentro de hotel de cadena en Santo Domingo',
  'Editorial coverage for a corporate event inside a chain hotel in Santo Domingo',
  'event', 'Santo Domingo', true, 310, 1600,  900
),
(
  'republica_dominicana_fotgrafo_commercial_ac8s9h',
  'Fotógrafo comercial en República Dominicana — eventos y empresas',
  'Commercial photographer in the Dominican Republic — events and corporate',
  'Fotografía comercial para empresas en RD',
  'Commercial photography for businesses in DR',
  'Comercial · República Dominicana',
  'Commercial · Dominican Republic',
  'Servicio de fotografía comercial para empresas y eventos en República Dominicana',
  'Commercial photography service for businesses and events in the Dominican Republic',
  'event', 'República Dominicana', false, 311, 1600,  900
),
(
  'fotografo_profesioanl_para_eventos_zunpvf',
  'Fotógrafo profesional para eventos en Santo Domingo',
  'Professional event photographer in Santo Domingo',
  'Cobertura de evento profesional en Santo Domingo',
  'Professional event coverage in Santo Domingo',
  'Eventos · Profesional',
  'Events · Professional',
  'Cobertura profesional de evento corporativo con dirección de luz y reportaje editorial',
  'Professional corporate event coverage with light direction and editorial reportage',
  'event', 'Santo Domingo', false, 312, 1600,  900
),
(
  'hotel_sheraton_fotografo_de_eventos_commerciales_en_santo_domingo_republica_dominicana-8_ql8rb8',
  'Fotógrafo de eventos comerciales en Hotel Sheraton, Santo Domingo, República Dominicana',
  'Commercial event photographer at Hotel Sheraton, Santo Domingo, Dominican Republic',
  'Evento corporativo en Hotel Sheraton, SD',
  'Corporate event at Hotel Sheraton, SD',
  'Eventos · Sheraton',
  'Events · Sheraton',
  'Cobertura de evento comercial en Hotel Sheraton de Santo Domingo con dirección editorial',
  'Commercial event coverage at the Sheraton Hotel in Santo Domingo with editorial direction',
  'event', 'Santo Domingo — Hotel Sheraton', true, 313, 1600,  900
),
(
  'fotografo_para_empresas_en_santo_domingo_republica_dominicana_d7brmx',
  'Fotógrafo para empresas en Santo Domingo, República Dominicana',
  'Corporate photographer for businesses in Santo Domingo, Dominican Republic',
  'Servicio de fotografía corporativa en SD',
  'Corporate photography service in SD',
  'Empresas · Santo Domingo',
  'Corporate · Santo Domingo',
  'Cobertura corporativa para empresas con cobertura editorial y entrega rápida',
  'Corporate coverage for businesses with editorial reporting and fast delivery',
  'event', 'Santo Domingo', false, 314, 1600,  900
),
(
  'fotografo_de_eventos_commerciales_en_santo_domingo_republica_dominicana-catital_wwen96',
  'Fotógrafo de eventos comerciales en Santo Domingo, República Dominicana',
  'Commercial event photographer in Santo Domingo, Dominican Republic',
  'Evento corporativo en Santo Domingo',
  'Corporate event in Santo Domingo',
  'Eventos · SD',
  'Events · SD',
  'Reportaje fotográfico para evento corporativo con foco en speakers y branding',
  'Photographic reportage for a corporate event focused on speakers and branding',
  'event', 'Santo Domingo', false, 315, 1600,  900
),
(
  'fotografo_commercial_santo_domingo_etadfe',
  'Fotógrafo comercial en Santo Domingo, República Dominicana',
  'Commercial photographer in Santo Domingo, Dominican Republic',
  'Fotografía comercial profesional en SD',
  'Professional commercial photography in SD',
  'Comercial · SD',
  'Commercial · SD',
  'Servicio de fotografía comercial profesional para marcas y eventos en Santo Domingo',
  'Professional commercial photography service for brands and events in Santo Domingo',
  'event', 'Santo Domingo', false, 316, 1600,  900
),
(
  'fotografia_de_eventos_santo_domingo_lzdjba',
  'Fotografía de eventos en Santo Domingo, República Dominicana',
  'Event photography in Santo Domingo, Dominican Republic',
  'Cobertura de evento en Santo Domingo',
  'Event coverage in Santo Domingo',
  'Eventos · Santo Domingo',
  'Events · Santo Domingo',
  'Cobertura editorial de evento corporativo con producción profesional',
  'Editorial corporate event coverage with professional production',
  'event', 'Santo Domingo', false, 317, 1600,  900
)
ON CONFLICT (public_id) DO UPDATE SET
  alt_es = EXCLUDED.alt_es,
  alt_en = EXCLUDED.alt_en,
  caption_es = EXCLUDED.caption_es,
  caption_en = EXCLUDED.caption_en,
  title_es = EXCLUDED.title_es,
  title_en = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  category = EXCLUDED.category,
  location = EXCLUDED.location,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order,
  width = EXCLUDED.width,
  height = EXCLUDED.height;
