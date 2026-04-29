-- ============================================================
-- Migration 023: Seed beach portfolio photos
--
-- Adds 10 Cloudinary beach photos to portfolio_images with
-- category='beach' and bilingual SEO metadata. Photos are also
-- featured on the new /{locale}/beach-photo-sessions landing page.
--
-- public_id values are derived from the Cloudinary URL slug.
-- sort_order 200-209 keeps them after the existing studio photos
-- (100-107) in the public portfolio gallery.
-- ============================================================

INSERT INTO portfolio_images (
  public_id,
  alt_es, alt_en,
  caption_es, caption_en,
  title_es, title_en,
  description_es, description_en,
  category, location, featured, sort_order, width, height
) VALUES
(
  'Punta_Cana_fotografo_profesional_en_la_playa_sesion_de_fotos_q4wdyf',
  'Sesión de fotos profesional en la playa de Punta Cana, República Dominicana',
  'Professional beach photo session in Punta Cana, Dominican Republic',
  'Sesión profesional al borde del mar en Punta Cana — luz natural editorial',
  'Professional seaside session in Punta Cana — editorial natural light',
  'Punta Cana · Sesión Editorial',
  'Punta Cana · Editorial Session',
  'Retrato editorial al aire libre con dirección creativa en Bávaro, Punta Cana',
  'Editorial outdoor portrait with creative direction in Bávaro, Punta Cana',
  'beach', 'Punta Cana', true,  200, 1600,  900
),
(
  'Fotografo_en_Punta_Cana_babula_shots_awej9w',
  'Fotógrafo en Punta Cana — Babula Shots, sesión profesional en la playa',
  'Photographer in Punta Cana — Babula Shots, professional beach session',
  'Cobertura editorial en Punta Cana por Babula Shots',
  'Editorial coverage in Punta Cana by Babula Shots',
  'Punta Cana · Babula Shots',
  'Punta Cana · Babula Shots',
  'Retrato profesional en la playa de Punta Cana con composición editorial',
  'Professional beach portrait in Punta Cana with editorial composition',
  'beach', 'Punta Cana', true,  201, 1600,  900
),
(
  'Sesion_de_fotos_en_Isla_Saona_mqu1bu',
  'Sesión de fotos en Isla Saona — playa virgen, República Dominicana',
  'Photo session on Saona Island — virgin beach, Dominican Republic',
  'Sesión exclusiva en Isla Saona con arena blanca y aguas cristalinas',
  'Exclusive session on Isla Saona with white sand and crystal water',
  'Isla Saona · Sesión Exclusiva',
  'Saona Island · Exclusive Session',
  'Retrato de día completo en Isla Saona con dirección de moda',
  'Full-day portrait shoot on Saona Island with fashion direction',
  'beach', 'Isla Saona', true,  202, 1600,  900
),
(
  'Punta_Cana_fotografo_en_la_playa_retratos_en_hotel_rdxotd',
  'Fotógrafo en la playa de Punta Cana — retratos en hotel resort',
  'Photographer at Punta Cana beach — portraits at resort hotel',
  'Retratos en hotel resort de Punta Cana con vista al mar',
  'Resort hotel portraits in Punta Cana with ocean view',
  'Punta Cana · Resort',
  'Punta Cana · Resort',
  'Sesión de retratos en hotel resort de Punta Cana con luz golden hour',
  'Resort hotel portrait session in Punta Cana with golden-hour light',
  'beach', 'Punta Cana — Hotel Resort', false, 203, 1600,  900
),
(
  'Isla_saona_session_de_fotos_en_la_playa_kt9zoj',
  'Sesión de fotos en la playa de Isla Saona, República Dominicana',
  'Beach photo session on Saona Island, Dominican Republic',
  'Retrato natural en la playa de Isla Saona, RD',
  'Natural portrait on Saona Island beach, DR',
  'Isla Saona · Playa',
  'Saona Island · Beach',
  'Retrato editorial en la playa virgen de Isla Saona con dirección creativa',
  'Editorial portrait on Saona’s untouched beach with creative direction',
  'beach', 'Isla Saona', false, 204, 1600,  900
),
(
  'fotografo_en_la_playa_punta_cana_republica_dominicana_mhq0ov',
  'Fotógrafo en la playa de Punta Cana, República Dominicana',
  'Beach photographer in Punta Cana, Dominican Republic',
  'Sesión natural en la costa de Punta Cana, RD',
  'Natural session along the Punta Cana coast, DR',
  'Punta Cana · Playa',
  'Punta Cana · Beach',
  'Cobertura editorial en la costa de Punta Cana con luz natural',
  'Editorial coverage along the Punta Cana coastline with natural light',
  'beach', 'Punta Cana', false, 205, 1600,  900
),
(
  'Bayahibe_Session_de_fotos_en_la_playa_la_romana_fotograf_profesional_i0ypcf',
  'Sesión de fotos en la playa de Bayahíbe, La Romana — fotógrafo profesional',
  'Beach photo session in Bayahíbe, La Romana — professional photographer',
  'Cobertura profesional en Bayahíbe, La Romana, RD',
  'Professional coverage in Bayahíbe, La Romana, DR',
  'Bayahíbe · La Romana',
  'Bayahíbe · La Romana',
  'Retrato editorial en Bayahíbe (La Romana) con dirección de moda',
  'Editorial portrait in Bayahíbe (La Romana) with fashion direction',
  'beach', 'Bayahíbe — La Romana', true, 206, 1600,  900
),
(
  'Juan_Doolio_retratoos_en_la_playa_con_luz_natuiral_fotografo_servicio_boj11c',
  'Retratos en la playa de Juan Dolio con luz natural — fotógrafo profesional',
  'Beach portraits in Juan Dolio with natural light — professional photographer',
  'Sesión con luz natural en Juan Dolio, RD',
  'Natural-light session in Juan Dolio, DR',
  'Juan Dolio · Luz Natural',
  'Juan Dolio · Natural Light',
  'Retrato en la playa de Juan Dolio con luz natural y composición clásica',
  'Beach portrait in Juan Dolio with natural light and classic composition',
  'beach', 'Juan Dolio', false, 207, 1600,  900
),
(
  'playa_fotografo_republica_dominicana_pi8mpw',
  'Fotógrafo de playa en República Dominicana — sesiones profesionales',
  'Beach photographer in the Dominican Republic — professional sessions',
  'Cobertura de playa en RD con dirección editorial',
  'Beach coverage in DR with editorial direction',
  'Playa · República Dominicana',
  'Beach · Dominican Republic',
  'Servicio de fotografía de playa en cualquier costa de la República Dominicana',
  'Beach photography service along any Dominican Republic coast',
  'beach', 'República Dominicana', false, 208, 1600,  900
),
(
  'fotografo_profesional_fotos_en_la_playa_republica_doominicana_b97k5m',
  'Fotógrafo profesional fotos en la playa, República Dominicana',
  'Professional photographer beach photos, Dominican Republic',
  'Fotógrafo profesional en la playa de República Dominicana',
  'Professional beach photographer in the Dominican Republic',
  'Playa · Profesional RD',
  'Beach · Professional DR',
  'Sesión profesional en la playa con dirección creativa y luz controlada',
  'Professional beach session with creative direction and controlled light',
  'beach', 'República Dominicana', false, 209, 1600,  900
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
