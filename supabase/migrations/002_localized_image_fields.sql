-- ============================================================
-- Migration 002: Localized alt, title, caption columns
-- Replaces single-language alt_text / title_attribute / caption
-- with per-locale variants so each language market gets
-- keyword-rich, independent metadata.
-- ============================================================

-- Add the new locale-specific columns
ALTER TABLE portfolio_images
  ADD COLUMN IF NOT EXISTS alt_es   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS alt_en   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS caption_es TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS caption_en TEXT NOT NULL DEFAULT '';

-- Migrate existing data: copy old single-lang values into ES columns
-- (alt_text was ES-first, caption was ES-first in seed data)
UPDATE portfolio_images SET
  alt_es     = COALESCE(NULLIF(alt_es, ''),     alt_text),
  caption_es = COALESCE(NULLIF(caption_es, ''), caption)
WHERE alt_es = '' OR caption_es = '';

-- The old title_es / title_en already serve as HTML title attributes too,
-- so title_attribute column is superseded. No additional title columns needed.

-- Seed the English alt_en and caption_en for each image
UPDATE portfolio_images SET
  alt_en = 'Wedding photography on the beach at Punta Cana at sunset',
  caption_en = 'Intimate beach ceremony at sunset, Punta Cana DR'
WHERE public_id = 'wedding-punta-cana-1';

UPDATE portfolio_images SET
  alt_en = 'Professional executive portrait photography in Santo Domingo',
  caption_en = 'Corporate session for tech CEO, Santo Domingo DR'
WHERE public_id = 'executive-portrait-1';

UPDATE portfolio_images SET
  alt_en = 'Drone aerial photography of hotel resort in Punta Cana Dominican Republic',
  caption_en = 'Aerial view of luxury hotel resort, drone photography Punta Cana'
WHERE public_id = 'drone-hotel-1';

UPDATE portfolio_images SET
  alt_en = 'Birthday party photography 50th celebration in Santo Domingo',
  caption_en = '50th birthday celebration with friends and family, Santo Domingo'
WHERE public_id = 'birthday-party-1';

UPDATE portfolio_images SET
  alt_en = 'Family photography session in national park Dominican Republic',
  caption_en = 'Outdoor family photography at Los Cacicazgos, Santo Domingo'
WHERE public_id = 'family-session-1';

UPDATE portfolio_images SET
  alt_en = 'Jewelry product photography for commercial catalog Santo Domingo',
  caption_en = 'Product photography for jewelry catalog, studio Santo Domingo DR'
WHERE public_id = 'jewelry-product-1';

UPDATE portfolio_images SET
  alt_en = 'Elegant gala wedding photography in historic hall Santo Domingo',
  caption_en = 'Gala wedding in historic hall, Santo Domingo Dominican Republic'
WHERE public_id = 'wedding-elegant-1';

UPDATE portfolio_images SET
  alt_en = 'Corporate event conference photography in Santo Domingo convention center',
  caption_en = 'Annual tech company conference at the Convention Center, Santo Domingo'
WHERE public_id = 'corporate-event-1';

UPDATE portfolio_images SET
  alt_en = 'Artistic portrait with natural light Plaza España Colonial Zone',
  caption_en = 'Artistic portrait with natural light, Plaza España Colonial Zone Santo Domingo'
WHERE public_id = 'artistic-portrait-1';

UPDATE portfolio_images SET
  alt_en = 'Gourmet food photography for restaurant menu in Colonial Zone',
  caption_en = 'Food photography for digital menu, gourmet restaurant Colonial Zone'
WHERE public_id = 'restaurant-food-1';

UPDATE portfolio_images SET
  alt_en = 'Baptism religious ceremony family photography Colonial Church Santo Domingo',
  caption_en = 'Traditional baptism with family celebration, Colonial Church Santo Domingo'
WHERE public_id = 'baptism-traditional-1';

UPDATE portfolio_images SET
  alt_en = 'Aerial drone photography of luxury villa real estate Punta Cana',
  caption_en = 'Aerial photography of luxury villa for real estate, Punta Cana DR'
WHERE public_id = 'real-estate-drone-1';

-- Seed Spanish alt_es values (keyword-rich, location-specific)
UPDATE portfolio_images SET
  alt_es = 'Fotografía de boda en la playa de Punta Cana al atardecer República Dominicana'
WHERE public_id = 'wedding-punta-cana-1';

UPDATE portfolio_images SET
  alt_es = 'Fotografía de retrato ejecutivo corporativo profesional Santo Domingo RD'
WHERE public_id = 'executive-portrait-1';

UPDATE portfolio_images SET
  alt_es = 'Fotografía aérea con dron de hotel resort Punta Cana República Dominicana'
WHERE public_id = 'drone-hotel-1';

UPDATE portfolio_images SET
  alt_es = 'Fotografía de fiesta de cumpleaños 50 años Santo Domingo República Dominicana'
WHERE public_id = 'birthday-party-1';

UPDATE portfolio_images SET
  alt_es = 'Sesión fotográfica familiar al aire libre Los Cacicazgos Santo Domingo'
WHERE public_id = 'family-session-1';

UPDATE portfolio_images SET
  alt_es = 'Fotografía de producto joyería para catálogo comercial estudio Santo Domingo'
WHERE public_id = 'jewelry-product-1';

UPDATE portfolio_images SET
  alt_es = 'Fotografía de boda elegante de gala en salón histórico Santo Domingo RD'
WHERE public_id = 'wedding-elegant-1';

UPDATE portfolio_images SET
  alt_es = 'Fotografía de evento corporativo conferencia empresarial Centro Convenciones Santo Domingo'
WHERE public_id = 'corporate-event-1';

UPDATE portfolio_images SET
  alt_es = 'Retrato artístico con luz natural Plaza España Zona Colonial Santo Domingo'
WHERE public_id = 'artistic-portrait-1';

UPDATE portfolio_images SET
  alt_es = 'Fotografía gastronómica alimentos gourmet restaurante menú digital Zona Colonial'
WHERE public_id = 'restaurant-food-1';

UPDATE portfolio_images SET
  alt_es = 'Fotografía de bautizo religioso ceremonia familiar Iglesia Colonial Santo Domingo'
WHERE public_id = 'baptism-traditional-1';

UPDATE portfolio_images SET
  alt_es = 'Fotografía aérea drone villa de lujo inmobiliaria Punta Cana República Dominicana'
WHERE public_id = 'real-estate-drone-1';
