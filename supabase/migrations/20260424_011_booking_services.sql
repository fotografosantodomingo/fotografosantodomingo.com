-- Phase 1a: booking_services and staff_members tables
-- Part of the custom booking system (Setmore Pro replacement)

BEGIN;

-- ─── booking_services table ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.booking_services (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT        NOT NULL UNIQUE,
  name_es           TEXT        NOT NULL,
  name_en           TEXT        NOT NULL,
  description_es    TEXT,
  description_en    TEXT,
  icon              TEXT        NOT NULL DEFAULT '📷',
  -- Informational category label for grouping on /prices and admin UI
  category          TEXT        NOT NULL DEFAULT 'portrait',
  duration_min      INTEGER     NOT NULL DEFAULT 60 CHECK (duration_min > 0),
  price_usd         NUMERIC(10,2) NOT NULL CHECK (price_usd >= 0),
  -- 50% deposit by design; stored per-service to allow future overrides
  deposit_percent   INTEGER     NOT NULL DEFAULT 50 CHECK (deposit_percent BETWEEN 0 AND 100),
  -- bookable=true  → appears in /book wizard
  -- bookable=false → "Get Quote" CTA only (e.g. if too complex for online booking)
  bookable          BOOLEAN     NOT NULL DEFAULT true,
  active            BOOLEAN     NOT NULL DEFAULT true,
  sort_order        INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── staff_members table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.staff_members (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  bio_es      TEXT,
  bio_en      TEXT,
  avatar_url  TEXT,
  email       TEXT,
  active      BOOLEAN     NOT NULL DEFAULT true,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Reuse / define updated_at trigger ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_services_updated_at
  BEFORE UPDATE ON public.booking_services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER staff_members_updated_at
  BEFORE UPDATE ON public.staff_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members    ENABLE ROW LEVEL SECURITY;

-- Public read of active records
CREATE POLICY "booking_services_public_read"
  ON public.booking_services FOR SELECT
  USING (active = true);

CREATE POLICY "staff_members_public_read"
  ON public.staff_members FOR SELECT
  USING (active = true);

-- service_role bypasses RLS; authenticated admin gets full access
CREATE POLICY "booking_services_service_role_all"
  ON public.booking_services FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "booking_services_admin_all"
  ON public.booking_services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "staff_members_service_role_all"
  ON public.staff_members FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "staff_members_admin_all"
  ON public.staff_members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── Seed: staff ─────────────────────────────────────────────────────────────

INSERT INTO public.staff_members (name, bio_es, bio_en, active, sort_order)
VALUES (
  'Michal Babula',
  'Fotógrafo profesional con sede en Santo Domingo, República Dominicana. Más de 10 años capturando bodas, retratos, eventos corporativos y fotografía aérea con dron en toda la isla.',
  'Professional photographer based in Santo Domingo, Dominican Republic. Over 10 years capturing weddings, portraits, corporate events, and drone aerial photography across the island.',
  true,
  1
)
ON CONFLICT DO NOTHING;

-- ─── Seed: booking_services ──────────────────────────────────────────────────
-- Prices are "starting at" / "desde" and can be updated via the admin panel.
-- sort_order determines display order within each category.

INSERT INTO public.booking_services
  (slug, name_es, name_en, description_es, description_en, icon, category, duration_min, price_usd, deposit_percent, bookable, active, sort_order)
VALUES

-- ── Celebrations / Celebraciones ─────────────────────────────────────────────
(
  'weddings',
  'Bodas', 'Wedding Photography',
  'Cobertura completa del día de tu boda con sesión de compromiso incluida. Capturamos cada momento mágico con estilo artístico.',
  'Full wedding day coverage including engagement session. We capture every magical moment with artistic style.',
  '💍', 'celebrations', 480, 2500.00, 50, true, true, 10
),
(
  'engagement-session',
  'Sesión de Compromiso', 'Engagement Session',
  'Sesión romántica para parejas comprometidas. Locaciones en Santo Domingo, Punta Cana o cualquier lugar de la isla.',
  'Romantic session for engaged couples. Locations in Santo Domingo, Punta Cana, or anywhere on the island.',
  '💑', 'celebrations', 120, 350.00, 50, true, true, 20
),
(
  'quinceaneras',
  'Quinceañeras', 'Quinceañera Photography',
  'Cobertura completa de quinceañera: ceremonia, misa, vals y celebración. Galería editada y álbum incluido.',
  'Full quinceañera coverage: ceremony, church, waltz, and celebration. Edited gallery and album included.',
  '👑', 'celebrations', 240, 800.00, 50, true, true, 30
),
(
  'baptism',
  'Bautizos', 'Baptism Photography',
  'Cobertura fotográfica de la ceremonia del bautismo y celebración posterior. Recuerdos para toda la vida.',
  'Photo coverage of the baptism ceremony and subsequent celebration. Memories for a lifetime.',
  '⛪', 'celebrations', 120, 250.00, 50, true, true, 40
),
(
  'graduation',
  'Graduación', 'Graduation Photography',
  'Sesión de graduación individual o grupal. Capturamos tu logro en locación universitaria o exterior.',
  'Individual or group graduation session. We capture your achievement at a university location or outdoors.',
  '🎓', 'celebrations', 60, 200.00, 50, true, true, 50
),
(
  'birthday-party',
  'Fiesta de Cumpleaños', 'Birthday Party Photography',
  'Cobertura fotográfica de cumpleaños infantiles y adultos. Capturamos el ambiente, los detalles y las personas.',
  'Photo coverage of children and adult birthday parties. We capture the atmosphere, details, and people.',
  '🎂', 'celebrations', 120, 300.00, 50, true, true, 60
),

-- ── Portraits & Family / Retratos y Familia ───────────────────────────────────
(
  'portrait',
  'Retratos', 'Portrait Session',
  'Sesión de retratos individual en locación o estudio. Natural, elegante y personalizado a tu estilo.',
  'Individual portrait session on location or studio. Natural, elegant, and personalized to your style.',
  '🧑‍💼', 'portraits', 60, 150.00, 50, true, true, 110
),
(
  'family-session',
  'Sesión Familiar', 'Family Session',
  'Sesión familiar natural y divertida. Hasta 10 personas en locaciones hermosas de Santo Domingo o Punta Cana.',
  'Natural and fun family photography session. Up to 10 people in beautiful locations around Santo Domingo or Punta Cana.',
  '👨‍👩‍👧‍👦', 'portraits', 120, 200.00, 50, true, true, 120
),
(
  'maternity',
  'Maternidad', 'Maternity Session',
  'Sesión fotográfica de maternidad para celebrar esta etapa única. Ambiente íntimo, natural y emotivo.',
  'Maternity photography session to celebrate this unique stage. Intimate, natural, and emotional atmosphere.',
  '🤰', 'portraits', 60, 200.00, 50, true, true, 130
),
(
  'children-session',
  'Sesiones Infantiles', 'Children''s Sessions',
  'Sesiones divertidas y naturales para niños. Capturamos su personalidad y energía en un ambiente relajado.',
  'Fun and natural sessions for children. We capture their personality and energy in a relaxed environment.',
  '🧸', 'portraits', 60, 150.00, 50, true, true, 140
),
(
  'corporate-portrait',
  'Retratos Corporativos', 'Corporate Portraits',
  'Fotografía ejecutiva para LinkedIn, sitios web y material corporativo. Entrega en 24–48 horas.',
  'Executive photography for LinkedIn, websites, and corporate materials. Delivery in 24–48 hours.',
  '📷', 'portraits', 60, 150.00, 50, true, true, 150
),

-- ── Commercial & Business / Comercial y Empresarial ──────────────────────────
(
  'corporate-event',
  'Eventos Corporativos', 'Corporate Events',
  'Documentación profesional de conferencias, lanzamientos, premiaciones y eventos empresariales.',
  'Professional documentation of conferences, launches, awards, and business events.',
  '🏢', 'commercial', 120, 300.00, 50, true, true, 210
),
(
  'commercial',
  'Fotografía Comercial', 'Commercial Photography',
  'Fotografía publicitaria para restaurantes, hoteles, productos y branding. Derechos de uso comercial incluidos.',
  'Advertising photography for restaurants, hotels, products, and branding. Commercial usage rights included.',
  '📸', 'commercial', 60, 250.00, 50, true, true, 220
),
(
  'food-and-beverage',
  'Alimentos y Bebidas', 'Food & Beverage',
  'Fotografía gastronómica profesional para menús, redes sociales y campañas de marketing.',
  'Professional gastronomic photography for menus, social media, and marketing campaigns.',
  '🍽️', 'commercial', 120, 250.00, 50, true, true, 230
),
(
  'real-estate',
  'Bienes Raíces', 'Real Estate Photography',
  'Fotografía de propiedades residenciales y comerciales. Interior, exterior y opciones con dron disponibles.',
  'Residential and commercial property photography. Interior, exterior, and drone options available.',
  '🏠', 'commercial', 120, 350.00, 50, true, true, 240
),

-- ── Specialty / Especialidades ────────────────────────────────────────────────
(
  'drone-aerial',
  'Drone Aéreo', 'Drone Aerial Photography',
  'Fotografía y video aéreo con dron. Certificación FAA. Cobertura hasta 500 acres. Video 4K incluido.',
  'Aerial drone photography and video. FAA certified. Coverage up to 500 acres. 4K video included.',
  '🚁', 'specialty', 120, 500.00, 50, true, true, 310
),
(
  'video-production',
  'Producción de Video', 'Video Production',
  'Producción de video profesional para bodas, eventos, branding y redes sociales. Edición y montaje incluidos.',
  'Professional video production for weddings, events, branding, and social media. Editing and assembly included.',
  '🎬', 'specialty', 240, 500.00, 50, true, true, 320
),
(
  'proposal-photography',
  'Fotografía de Propuesta', 'Proposal Photography',
  'Fotografía de propuesta sorpresa en modo ninja. Teleobjetivo 400–600 mm. Galería entregada esa misma noche.',
  'Surprise proposal photography in ninja mode. 400–600 mm telephoto lens. Gallery delivered that same night.',
  '🥷', 'specialty', 120, 250.00, 50, true, true, 330
)

ON CONFLICT (slug) DO NOTHING;

COMMIT;
