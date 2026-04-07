-- ============================================================
-- Image SEO Migration
-- Creates portfolio_images and reviews tables
-- ============================================================

-- Portfolio images table with full SEO metadata control
CREATE TABLE IF NOT EXISTS portfolio_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id       TEXT NOT NULL UNIQUE,          -- Cloudinary public ID (used in URL path)
  alt_text        TEXT NOT NULL DEFAULT '',      -- Descriptive alt text for accessibility + indexing
  title_attribute TEXT NOT NULL DEFAULT '',      -- HTML title attribute (hover tooltip)
  caption         TEXT NOT NULL DEFAULT '',      -- Visible caption under image (crawlable)
  title_es        TEXT NOT NULL DEFAULT '',
  title_en        TEXT NOT NULL DEFAULT '',
  description_es  TEXT NOT NULL DEFAULT '',
  description_en  TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT 'other', -- wedding | portrait | drone | event | commercial
  location        TEXT NOT NULL DEFAULT '',
  featured        BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  width           INTEGER NOT NULL DEFAULT 1200,
  height          INTEGER NOT NULL DEFAULT 800,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add a trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS portfolio_images_updated_at ON portfolio_images;
CREATE TRIGGER portfolio_images_updated_at
  BEFORE UPDATE ON portfolio_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Reviews table for AggregateRating schema
CREATE TABLE IF NOT EXISTS reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_name    TEXT NOT NULL,
  reviewer_location TEXT NOT NULL DEFAULT '',
  rating           SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text      TEXT NOT NULL DEFAULT '',
  service_type     TEXT NOT NULL DEFAULT 'photography', -- wedding | portrait | drone | general
  verified         BOOLEAN NOT NULL DEFAULT false,
  locale           TEXT NOT NULL DEFAULT 'es',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- View that returns aggregate rating stats (used by AggregateRating schema)
CREATE OR REPLACE VIEW review_stats AS
SELECT
  COUNT(*)::INTEGER                          AS review_count,
  ROUND(AVG(rating)::NUMERIC, 1)::FLOAT     AS rating_value,
  MIN(rating)                                AS min_rating,
  MAX(rating)                                AS max_rating
FROM reviews
WHERE verified = true;

-- Seed initial portfolio images (matches static data in portfolio/page.tsx)
INSERT INTO portfolio_images (public_id, alt_text, title_attribute, caption, title_es, title_en, description_es, description_en, category, location, featured, sort_order, width, height)
VALUES
  ('wedding-punta-cana-1',     'Fotografía de boda en la playa de Punta Cana al atardecer', 'Boda en Punta Cana - Fotografo Santo Domingo', 'Ceremonia íntima en la playa al atardecer, Punta Cana RD', 'Boda en Punta Cana', 'Punta Cana Wedding', 'Ceremonia íntima en la playa al atardecer', 'Intimate beach ceremony at sunset', 'wedding', 'Punta Cana, RD', true, 1, 1200, 800),
  ('executive-portrait-1',     'Retrato ejecutivo profesional en Santo Domingo', 'Retrato Corporativo - Babula Shots SD', 'Sesión corporativa para CEO de tecnología, Santo Domingo', 'Retrato Ejecutivo', 'Executive Portrait', 'Sesión corporativa para CEO de tecnología', 'Corporate session for tech CEO', 'portrait', 'Santo Domingo', false, 2, 800, 1000),
  ('drone-hotel-1',            'Fotografía aérea con dron de hotel resort en Punta Cana', 'Fotografía Aérea Punta Cana - Drone Photography RD', 'Vista aérea de hotel resort, fotografía con dron Punta Cana', 'Vista Aérea de Hotel', 'Hotel Aerial View', 'Fotografía aérea para brochure turístico', 'Aerial photography for tourism brochure', 'drone', 'Punta Cana', true, 3, 1920, 1080),
  ('birthday-party-1',         'Fotografía de fiesta de cumpleaños número 50 en Santo Domingo', 'Fotografía de Eventos - Cumpleaños Santo Domingo', 'Celebración de 50 años con amigos y familia en Santo Domingo', 'Fiesta de Cumpleaños', 'Birthday Party', 'Celebración de 50 años con amigos y familia', '50th birthday celebration with friends and family', 'event', 'Santo Domingo', false, 4, 1200, 800),
  ('family-session-1',         'Sesión fotográfica familiar en parque nacional Dominican Republic', 'Fotografía Familiar - Los Cacicazgos Santo Domingo', 'Fotografía familiar natural al aire libre en Los Cacicazgos', 'Sesión Familiar', 'Family Session', 'Fotografía natural en parque nacional', 'Natural photography in national park', 'portrait', 'Los Cacicazgos', false, 5, 1200, 800),
  ('jewelry-product-1',        'Fotografía de producto de joyería para catálogo comercial Santo Domingo', 'Fotografía Comercial Joyería - Babula Shots', 'Fotografía de producto para catálogo de joyería, estudio Santo Domingo', 'Producto de Joyería', 'Jewelry Product', 'Fotografía de producto para catálogo de joyería', 'Product photography for jewelry catalog', 'commercial', 'Studio SD', false, 6, 1200, 800),
  ('wedding-elegant-1',        'Boda elegante de gala en salón histórico Santo Domingo', 'Boda Elegante Santo Domingo - Fotografo de Bodas RD', 'Boda de gala en salón histórico, Santo Domingo República Dominicana', 'Boda Elegante', 'Elegant Wedding', 'Boda de gala en salón histórico', 'Gala wedding in historic hall', 'wedding', 'Santo Domingo', true, 7, 1200, 800),
  ('corporate-event-1',        'Fotografía de evento corporativo conferencia empresarial Santo Domingo', 'Fotografía Corporativa - Eventos Empresariales RD', 'Conferencia anual de empresa tecnológica en Centro de Convenciones', 'Evento Corporativo', 'Corporate Event', 'Conferencia anual de empresa tecnológica', 'Annual conference of tech company', 'event', 'Centro de Convenciones', false, 8, 1920, 1080),
  ('artistic-portrait-1',      'Retrato artístico con luz natural Plaza España Zona Colonial', 'Retrato Artístico - Fotografo Zona Colonial Santo Domingo', 'Retrato artístico con luz natural, Plaza España Zona Colonial', 'Retrato Artístico', 'Artistic Portrait', 'Sesión de retrato con luz natural', 'Portrait session with natural light', 'portrait', 'Plaza España', false, 9, 800, 1000),
  ('restaurant-food-1',        'Fotografía de alimentos gourmet para menú restaurante Zona Colonial', 'Fotografía Gastronómica - Restaurantes Santo Domingo', 'Fotografía de alimentos para menú digital, restaurante gourmet Zona Colonial', 'Restaurante Gourmet', 'Gourmet Restaurant', 'Fotografía de alimentos para menú digital', 'Food photography for digital menu', 'commercial', 'Zona Colonial', false, 10, 1200, 800),
  ('baptism-traditional-1',    'Fotografía de bautizo religioso ceremonia familiar Iglesia Colonial', 'Fotografía de Bautizo - Ceremonias Religiosas RD', 'Bautizo tradicional con celebración familiar, Iglesia Colonial Santo Domingo', 'Bautizo Tradicional', 'Traditional Baptism', 'Ceremonia religiosa con celebración familiar', 'Religious ceremony with family celebration', 'event', 'Iglesia Colonial', false, 11, 1200, 800),
  ('real-estate-drone-1',      'Fotografía aérea drone de villa de lujo propiedad inmobiliaria Punta Cana', 'Fotografía Drone Inmobiliaria - Luxury Villa Punta Cana', 'Fotografía aérea de villa de lujo para inmobiliaria en Punta Cana', 'Propiedad Inmobiliaria', 'Real Estate Property', 'Fotografía aérea de villa de lujo', 'Aerial photography of luxury villa', 'drone', 'Punta Cana', true, 12, 1920, 1080)
ON CONFLICT (public_id) DO NOTHING;

-- Seed sample verified reviews
INSERT INTO reviews (reviewer_name, reviewer_location, rating, review_text, service_type, verified, locale)
VALUES
  ('María González',  'Santo Domingo, RD', 5, 'Increíbles fotos de nuestra boda. Profesional, creativo y muy puntual. Totalmente recomendado.', 'wedding', true, 'es'),
  ('Carlos Reyes',    'Punta Cana, RD',    5, 'Las fotos aéreas de nuestra propiedad quedaron espectaculares. Mejor que cualquier otro fotógrafo que hemos contratado.', 'drone', true, 'es'),
  ('Ana Martínez',    'Santiago, RD',      5, 'Fotos de la quinceañera quedaron hermosas. Capturó cada momento perfectamente.', 'event', true, 'es'),
  ('Juan Pérez',      'Santo Domingo, RD', 5, 'Excelente trabajo en nuestra sesión corporativa. Profesionalismo al 100%.', 'portrait', true, 'es'),
  ('Laura Rodríguez', 'La Romana, RD',     5, 'Nuestras fotos de boda son simplemente impresionantes. Vale completamente la inversión.', 'wedding', true, 'es'),
  ('Michael Johnson', 'Miami, FL (boda en RD)', 5, 'Amazing wedding photos! Captured every beautiful moment of our destination wedding in Punta Cana.', 'wedding', true, 'en'),
  ('Sofia Torres',    'Santo Domingo, RD', 4, 'Muy buenas fotos de producto para nuestra línea de joyería. Entregas a tiempo.', 'commercial', true, 'es'),
  ('Roberto Díaz',    'Santo Domingo, RD', 5, 'Fotografía de eventos corporativos excelente. Muy profesional y con ojo artístico único.', 'event', true, 'es')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (read-only for anonymous users)
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_images_public_read" ON portfolio_images
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT TO anon, authenticated USING (verified = true);
